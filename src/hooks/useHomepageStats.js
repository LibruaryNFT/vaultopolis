// src/hooks/useHomepageStats.js
import { useState, useEffect } from 'react';
import { getStats } from '../utils/statsCache';

/**
 * Custom hook for fetching and caching homepage stats.
 * Returns cached data immediately if available, then refreshes in background.
 * 
 * @param {boolean} forceRefresh - Force a fresh fetch, bypassing cache
 * @returns {Object} { vaultSummary, analyticsData, treasuryValue, loading, error }
 */
export function useHomepageStats(forceRefresh = false) {
  const [vaultSummary, setVaultSummary] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [treasuryValue, setTreasuryValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getStats(forceRefresh);
        
        if (isMounted) {
          setVaultSummary(result.vaultSummary);
          setAnalyticsData(result.analyticsData);
          setTreasuryValue(result.treasuryValue || 0);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch homepage stats:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [forceRefresh]);

  return { vaultSummary, analyticsData, treasuryValue, loading, error };
}

