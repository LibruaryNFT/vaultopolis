// src/utils/statsCache.js
import localforage from "localforage";
import * as fcl from "@onflow/fcl";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionIDs";
import { getAllDayCollectionIDs } from "../flow/getAllDayCollectionIDs";

/**
 * IndexedDB-backed store for homepage stats (vault summary and analytics).
 * Uses localforage which automatically falls back to WebSQL or localStorage.
 */
export const statsStore = localforage.createInstance({
  name: "vaultopolis",
  storeName: "homepageStats",
  description: "Cached homepage stats (vault count, total swaps, etc.)",
});

const STATS_CACHE_KEY = "homepageStats_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const TREASURY_ADDRESS = "0xd69b6ce48815d4ad";

// Average values for treasury calculation
const TOPSHOT_AVERAGE_VALUE = 700;
const ALLDAY_AVERAGE_VALUE = 400;

/**
 * Fetches treasury grails counts and calculates treasury value
 */
async function fetchTreasuryValue() {
  try {
    const [topshotIds, alldayIds] = await Promise.all([
      fcl.query({
        cadence: getTopShotCollectionIDs,
        args: (arg, t) => [arg(TREASURY_ADDRESS, t.Address)],
      }),
      fcl.query({
        cadence: getAllDayCollectionIDs,
        args: (arg, t) => [arg(TREASURY_ADDRESS, t.Address)],
      }),
    ]);

    const topshotCount = Array.isArray(topshotIds) 
      ? topshotIds.map((x) => Number(x)).filter((n) => Number.isFinite(n)).length 
      : 0;
    const alldayCount = Array.isArray(alldayIds)
      ? alldayIds.map((x) => Number(x)).filter((n) => Number.isFinite(n)).length
      : 0;

    const treasuryValue = (topshotCount * TOPSHOT_AVERAGE_VALUE) + (alldayCount * ALLDAY_AVERAGE_VALUE);

    return {
      topshotCount,
      alldayCount,
      treasuryValue,
      totalGrails: topshotCount + alldayCount
    };
  } catch (error) {
    console.error("[statsCache] Error fetching treasury value:", error);
    // Return zeros on error so stats still load
    return {
      topshotCount: 0,
      alldayCount: 0,
      treasuryValue: 0,
      totalGrails: 0
    };
  }
}

/**
 * Fetches homepage stats from API
 */
async function fetchStats() {
  const [vaultResponse, analyticsResponse, treasuryData] = await Promise.all([
    fetch("https://api.vaultopolis.com/tshot-vault"),
    fetch("https://api.vaultopolis.com/wallet-leaderboard?limit=3000"),
    fetchTreasuryValue()
  ]);
  
  if (!vaultResponse.ok) {
    throw new Error(`Vault API error! status: ${vaultResponse.status}`);
  }
  if (!analyticsResponse.ok) {
    throw new Error(`Analytics API error! status: ${analyticsResponse.status}`);
  }
  
  const vaultData = await vaultResponse.json();
  const leaderboardData = await analyticsResponse.json();
  
  // Process analytics data
  const items = leaderboardData.items || [];
  const totalDeposits = items.reduce((sum, user) => sum + (user.NFTToTSHOTSwapCompleted || 0), 0);
  const totalWithdrawals = items.reduce((sum, user) => sum + (user.TSHOTToNFTSwapCompleted || 0), 0);
  const totalMomentsExchanged = totalDeposits + totalWithdrawals;
  const totalUniqueWallets = items.length;
  
  const processedAnalyticsData = {
    totalMomentsExchanged,
    totalUniqueWallets,
    totalDeposits,
    totalWithdrawals
  };
  
  return {
    vaultSummary: vaultData,
    analyticsData: processedAnalyticsData,
    treasuryValue: treasuryData.treasuryValue,
    treasuryData: treasuryData,
    timestamp: Date.now()
  };
}

/**
 * Gets cached stats if they exist and are still fresh
 */
export async function getCachedStats() {
  try {
    const cached = await statsStore.getItem(STATS_CACHE_KEY);
    if (cached && cached.timestamp && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
      return {
        vaultSummary: cached.vaultSummary,
        analyticsData: cached.analyticsData,
        treasuryValue: cached.treasuryValue || 0,
        treasuryData: cached.treasuryData || null,
        isCached: true
      };
    }
    return null;
  } catch (error) {
    console.error("[statsCache] Error reading cache:", error);
    return null;
  }
}

/**
 * Fetches fresh stats and updates cache
 */
export async function fetchAndCacheStats() {
  try {
    const stats = await fetchStats();
    await statsStore.setItem(STATS_CACHE_KEY, stats);
    return {
      vaultSummary: stats.vaultSummary,
      analyticsData: stats.analyticsData,
      treasuryValue: stats.treasuryValue,
      treasuryData: stats.treasuryData,
      isCached: false
    };
  } catch (error) {
    console.error("[statsCache] Error fetching stats:", error);
    throw error;
  }
}

/**
 * Gets stats - returns cached if available and fresh, otherwise fetches new
 * @param {boolean} forceRefresh - If true, bypasses cache and fetches fresh data
 */
export async function getStats(forceRefresh = false) {
  if (forceRefresh) {
    return fetchAndCacheStats();
  }
  
  const cached = await getCachedStats();
  if (cached) {
    // Return cached data immediately, but also refresh in background
    fetchAndCacheStats().catch(err => {
      console.warn("[statsCache] Background refresh failed:", err);
    });
    return cached;
  }
  
  // No cache or stale cache - fetch fresh
  return fetchAndCacheStats();
}

