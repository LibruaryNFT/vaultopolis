import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getAllDayCollectionIDs } from '../flow/getAllDayCollectionIDs';
import { getAllDayCollectionBatched } from '../flow/getAllDayCollectionBatched';
import { fclQueryWithRetry } from '../utils/fclUtils';
import pLimit from 'p-limit';

const AllDayContext = createContext();

// Batching constants (same as TopShot)
const LIMIT_FCL = pLimit(10);
const BATCH_SIZE_FCL = 250;

export const AllDayProvider = ({ children }) => {
  const [allDayMetadataCache, setAllDayMetadataCache] = useState({});
  const [allDayCollectionData, setAllDayCollectionData] = useState({});
  const [allDayTreasuryData, setAllDayTreasuryData] = useState({});
  const [loadingAllDayMeta, setLoadingAllDayMeta] = useState(false);
  const [allDayMetaError, setAllDayMetaError] = useState(null);
  const [isRefreshingAllDay, setIsRefreshingAllDay] = useState(false);

  // AllDay-specific metadata loading
  const loadAllDayMeta = useCallback(async () => {
    if (loadingAllDayMeta) return allDayMetadataCache;
    
    setLoadingAllDayMeta(true);
    setAllDayMetaError(null);
    
        try {
          const res = await fetch("https://api.vaultopolis.com/allday-data");
          if (!res.ok) throw new Error(`AllDay meta fetch failed: ${res.status}`);

          const data = await res.json();
          
          const map = data.reduce((m, r) => {
            // Use FullName directly from the API response
            const playerName = r.FullName || 'Unknown Player';
            
            m[r.editionID] = {
              tier: r.tier,
              playerName: playerName,
              teamName: r.TeamAtMoment || 'Unknown Team',
              series: r.seriesID,
              setName: r.name,
              maxMintSize: r.maxMintSize,
              numMinted: r.numMinted,
              parallel: r.parallel,
              // Map to TopShot-compatible structure for consistency
              FullName: playerName,
              name: r.name,
              TeamAtMoment: r.TeamAtMoment,
              setID: r.setID,
              playID: r.playID,
            };
            return m;
          }, {});
      
      setAllDayMetadataCache(map);
      return map;
    } catch (error) {
      console.error('Failed to load AllDay metadata:', error);
      setAllDayMetaError(error.message);
      return {};
    } finally {
      setLoadingAllDayMeta(false);
    }
  }, [loadingAllDayMeta, allDayMetadataCache]);

  // Enrichment function for AllDay NFTs (similar to TopShot's enrichNFTData)
  const enrichAllDayNFTData = (list, metadataCache) => {
    return list.map((n) => {
      const k = n.editionID; // Use editionID as key for metadata lookup
      const m = metadataCache[k];
      const out = { ...n };
      if (m) {
        out.tier = m.tier || n.tier; // Use metadata tier if available, otherwise blockchain tier
        out.playerName = m.playerName || "Unknown Player";
        out.series = m.series ?? n.seriesID; // Use metadata series, fallback to blockchain seriesID
        out.setName = m.setName || "Unknown Set";
        out.maxMintSize = m.maxMintSize || "?";
        out.teamName = m.teamName || "Unknown Team";
        out.FullName = m.FullName || m.playerName || "Unknown Player";
        out.name = m.name || m.setName || "Unknown Set";
        out.TeamAtMoment = m.TeamAtMoment || m.teamName || "Unknown Team";
      }
      return out;
    });
  };

  // AllDay treasury functions
  const treasuryFetchInProgressRef = useRef(false);
  const treasuryCacheRef = useRef(null);
  const treasuryCacheTimestampRef = useRef(0);
  const TREASURY_CACHE_TTL = 60000; // Cache for 60 seconds

  const fetchAllDayTreasury = useCallback(async () => {
    const TREASURY_ADDRESS = "0xd69b6ce48815d4ad"; // Same address as TopShot
    
    // Return cached data if still valid
    const now = Date.now();
    if (treasuryCacheRef.current && (now - treasuryCacheTimestampRef.current) < TREASURY_CACHE_TTL) {
      return treasuryCacheRef.current;
    }
    
    // Prevent concurrent fetches
    if (treasuryFetchInProgressRef.current) {
      // Wait for the in-progress fetch to complete
      while (treasuryFetchInProgressRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // Return cached result after waiting
      if (treasuryCacheRef.current) {
        return treasuryCacheRef.current;
      }
    }
    
    treasuryFetchInProgressRef.current = true;
    try {
      const ids = await fclQueryWithRetry({
        cadence: getAllDayCollectionIDs,
        args: (arg, t) => [arg(TREASURY_ADDRESS, t.Address)],
      }, 3, 2000); // 3 retries, 2 second initial delay
      
      const result = Array.isArray(ids) ? ids.map((x) => Number(x)).filter((n) => Number.isFinite(n)) : [];
      
      // Cache the result
      treasuryCacheRef.current = result;
      treasuryCacheTimestampRef.current = Date.now();
      
      return result;
    } catch (error) {
      console.error('Failed to fetch AllDay treasury:', error);
      // Return cached data if available, even if expired
      if (treasuryCacheRef.current) {
        return treasuryCacheRef.current;
      }
      return [];
    } finally {
      treasuryFetchInProgressRef.current = false;
    }
  }, []); // Empty deps - function doesn't depend on any state/props

  // AllDay collection fetching (exact same pattern as TopShot)
  const fetchAllDayCollection = async (address) => {
    try {

      // Get IDs using the same pattern as TopShot
      let currentIdsOnChain = [];
      try {
        currentIdsOnChain = await fclQueryWithRetry({
          cadence: getAllDayCollectionIDs,
          args: (arg, t) => [arg(address, t.Address)],
        });
        currentIdsOnChain.sort((a, b) => String(a).localeCompare(String(b)));
      } catch (error) {
        console.error(`[AllDay] Failed to get collection IDs for ${address}:`, error);
        return [];
      }

      if (currentIdsOnChain.length === 0) {
        return [];
      }

      // Create batches exactly like TopShot
      const batches = [];
      for (let i = 0; i < currentIdsOnChain.length; i += BATCH_SIZE_FCL) {
        batches.push(currentIdsOnChain.slice(i, i + BATCH_SIZE_FCL));
      }


      // Return the IDs (not details) - details are fetched separately
      return currentIdsOnChain.map((x) => Number(x)).filter((n) => Number.isFinite(n));
    } catch (error) {
      console.error(`[AllDay] Failed to fetch collection for ${address}:`, error);
      return [];
    }
  };

  // AllDay collection details fetching (exact same pattern as TopShot)
  const fetchAllDayCollectionDetails = async (address, targetIDs) => {
    try {
      if (!targetIDs || targetIDs.length === 0) {
        return [];
      }

      // Ensure metadata is loaded before enrichment (like TopShot)
      if (!allDayMetadataCache || Object.keys(allDayMetadataCache).length === 0) {
        await loadAllDayMeta();
      }

      // Create batches exactly like TopShot
      const batches = [];
      for (let i = 0; i < targetIDs.length; i += BATCH_SIZE_FCL) {
        batches.push(targetIDs.slice(i, i + BATCH_SIZE_FCL));
      }

      let allFetchedNFTsRaw = [];
      try {
        const chunkPromises = batches.map((batchIds) =>
          LIMIT_FCL(() =>
            fclQueryWithRetry({
              cadence: getAllDayCollectionBatched,
              args: (arg, t) => [
                arg(address, t.Address),
                arg(batchIds.map((id) => String(id)), t.Array(t.UInt64))
              ],
            })
          )
        );
        const fetchedChunks = await Promise.all(chunkPromises);
        allFetchedNFTsRaw = fetchedChunks.flat().filter((item) => item != null);
      } catch (error) {
        console.error(`[AllDay] Error fetching NFT details:`, error);
        return [];
      }

      // Enrich the raw blockchain data with metadata cache
      const enrichedNFTs = enrichAllDayNFTData(allFetchedNFTsRaw, allDayMetadataCache);
      
      return enrichedNFTs;
    } catch (error) {
      console.error(`[AllDay] Failed to fetch collection details:`, error);
      return [];
    }
  };

  // AllDay-specific refresh function
  const refreshAllDayData = useCallback(async () => {
    setIsRefreshingAllDay(true);
    try {
      // Force refresh metadata
      setAllDayMetadataCache({});
      await loadAllDayMeta();
      
      // Clear collection data to force refresh
      setAllDayCollectionData({});
      setAllDayTreasuryData({});
      
    } catch (error) {
      console.error('[AllDayContext] Refresh error:', error);
    } finally {
      setIsRefreshingAllDay(false);
    }
  }, [loadAllDayMeta]);

  // Initialize AllDay metadata on mount
  useEffect(() => {
    loadAllDayMeta();
  }, [loadAllDayMeta]);

  const value = {
    allDayMetadataCache,
    allDayCollectionData,
    allDayTreasuryData,
    loadingAllDayMeta,
    allDayMetaError,
    isRefreshingAllDay,
    loadAllDayMeta,
    refreshAllDayData,
    fetchAllDayTreasury,
    fetchAllDayCollection,
    fetchAllDayCollectionDetails,
    setAllDayCollectionData,
    setAllDayTreasuryData,
  };

  return (
    <AllDayContext.Provider value={value}>
      {children}
    </AllDayContext.Provider>
  );
};

export const useAllDayContext = () => {
  const context = useContext(AllDayContext);
  if (!context) {
    throw new Error('useAllDayContext must be used within AllDayProvider');
  }
  return context;
};
