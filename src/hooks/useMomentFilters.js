/* eslint-disable react-hooks/exhaustive-deps */
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { SUBEDITIONS as SUB_META_BASE } from "../utils/subeditions";
import { searchParamsToFilters, filtersToSearchParams } from "../utils/urlFilters";

/* ───────── helpers ───────── */
const safeStringify = (o) =>
  JSON.stringify(o, (_, v) => (typeof v === "bigint" ? v.toString() : v));

/* ───────── constants ─────── */
export const BASE_TIERS = ["common", "fandom"];
export const EXTRA_TIERS = ["rare", "legendary", "ultimate"];

export const WNBA_TEAMS = [
  "Atlanta Dream",
  "Chicago Sky",
  "Connecticut Sun",
  "Dallas Wings",
  "Indiana Fever",
  "Las Vegas Aces",
  "Los Angeles Sparks",
  "Minnesota Lynx",
  "New York Liberty",
  "Phoenix Mercury",
  "Seattle Storm",
  "Washington Mystics",
  "Detroit Shock",
  "Houston Comets",
  "Sacramento Monarchs",
  "Team Stewart",
  "Team Wilson",
  "Golden State Valkyries",
];

export const FORCED_SERIES = [0, 2, 3, 4, 5, 6, 7];

/* master sub-edition map (id → {name, minted}) */
// Imported from utils/subeditions.js for consistency
export const SUB_META = SUB_META_BASE;

/* ───────── default filter ─── */
const FILTER_SCHEMA = {
  selectedTiers: { def: BASE_TIERS },
  selectedSeries: { def: [] },
  selectedSetName: { def: [] }, // Multi-select: array of sets (empty = "All")
  selectedLeague: { def: ["NBA", "WNBA"] }, // Multi-select: array of leagues
  selectedTeam: { def: [] }, // Multi-select: array of teams (empty = "All")
  selectedPlayer: { def: [] }, // Multi-select: array of players (empty = "All")
  selectedSubedition: { def: [] }, // Multi-select: array of subedition IDs (empty = "All")
  excludeSpecialSerials: { def: true },
  excludeLowSerials: { def: true },
  lockedStatus: { def: "All" }, // "All", "Locked", "Unlocked"
  specialSerials: { def: "All" }, // "All", "First", "Jersey", "Last", "AllSpecial"
  sortBy: { def: "lowest-serial" }, // "lowest-serial", "highest-serial"
  currentPage: { def: 1 },
};

export const DEFAULT_FILTER = Object.fromEntries(
  Object.entries(FILTER_SCHEMA).map(([k, v]) => [k, v.def])
);

/* guarantee "All" & uniqueness (string-compare) */
const ensureInOpts = (val, arr) => {
  // Handle arrays (multi-select filters)
  if (Array.isArray(val)) {
    const missing = val.filter((v) => {
      const vStr = String(v);
      return vStr !== "All" && vStr !== "" && !arr.some((x) => String(x) === vStr);
    });
    return missing.length > 0 ? [...arr, ...missing] : arr;
  }
  // Handle single values (legacy format)
  const v = String(val);
  if (v === "All" || v === "") return arr;
  return arr.some((x) => String(x) === v) ? arr : [...arr, val];
};

/* ───────── main hook ──────── */
/**
 * Custom hook for filtering NBA Top Shot moments
 * 
 * USAGE PATTERNS:
 * - NFT→TSHOT/TSHOT→NFT: allowAllTiers=false, showLockedMoments=false (default)
 * - My Collection: allowAllTiers=true, showLockedMoments=true
 * 
 * @param {Object} params
 * @param {boolean} params.allowAllTiers - If true, shows rare/legendary/ultimate tiers (My Collection only)
 * @param {boolean} params.showLockedMoments - If true, includes locked moments (My Collection only)
 * @param {Array} params.excludeIds - IDs to exclude from filtering
 * @param {Array} params.nftDetails - Array of NFT objects to filter
 * @param {Array} params.selectedNFTs - Currently selected NFT IDs
 * @param {boolean} params.disableBootEffect - Disable initial effect
 * @param {string} params.scope - Scope/namespace for localStorage isolation (default: "momentSelection")
 * @param {Object} params.defaultFilters - Override default filter values (e.g., {excludeSpecialSerials: false})
 */
export function useMomentFilters({
  allowAllTiers = false,
  disableBootEffect = false, // <-- ADDED THIS PROP
  excludeIds = [],
  nftDetails = [],
  selectedNFTs = [],
  showLockedMoments = false, // <-- ADDED THIS PROP
  forceSortOrder = null, // Force sort order regardless of other settings
  scope = "momentSelection", // Storage scope for isolation
  defaultFilters = {}, // Override default filter values
  safetyOverrides = new Set(), // Set of series numbers that override the safety filter
  syncWithURL = false, // New: Enable URL query param synchronization
  searchParams = null, // New: URLSearchParams object from useSearchParams
  setSearchParams = null, // New: setSearchParams function from useSearchParams
}) {
  /* ----- tier list ----- */
  // Only include tiers that actually have moments in the user's collection
  const tierOptions = useMemo(() => {
    const allPossibleTiers = allowAllTiers
      ? [...BASE_TIERS, ...EXTRA_TIERS]
      : BASE_TIERS;
    const tiersInCollection = new Set();
    nftDetails.forEach((n) => {
      const tier = (n.tier || "").toLowerCase();
      if (tier && allPossibleTiers.includes(tier)) {
        tiersInCollection.add(tier);
      }
    });
    // Return only tiers that exist in the collection, in the original order
    return allPossibleTiers.filter((tier) => tiersInCollection.has(tier));
  }, [nftDetails, allowAllTiers]);

  const reducer = (s, a) =>
    a.type === "SET"
      ? { ...s, ...a.payload }
      : a.type === "LOAD"
      ? { ...s, ...a.payload, currentPage: 1 }
      : a.type === "RESET"
      ? { ...DEFAULT_FILTER }
      : s;

  const [filter, dispatch] = useReducer(reducer, {
    ...DEFAULT_FILTER,
    ...defaultFilters, // Apply any overridden defaults (e.g., excludeSpecialSerials: false for MyCollection)
    selectedTiers: tierOptions.length > 0 ? tierOptions : (allowAllTiers ? [...BASE_TIERS, ...EXTRA_TIERS] : BASE_TIERS),
    selectedSeries: [], // Will be populated by useEffect
  });
  const setFilter = (p) =>
    dispatch({ type: "SET", payload: p }); /* ----- option arrays ----- */

  const seriesOptions = useMemo(() => {
    // Only include series that actually have moments in the user's collection
    const s = new Set();
    nftDetails.forEach((n) => {
      const v = Number(n.series);
      if (!Number.isNaN(v)) s.add(v);
    });
    return [...s].sort((a, b) => a - b);
  }, [nftDetails]); /* auto-select series on first load */

  // Track previous seriesOptions to detect account switches
  const prevSeriesOptionsRef = useRef([]);
  const hasInitializedRef = useRef(false);
  const loadedFromURLRef = useRef(false); // Track if we loaded from URL

  useEffect(() => {
    const prevSeriesOptions = prevSeriesOptionsRef.current;
    const seriesOptionsChanged = JSON.stringify(prevSeriesOptions) !== JSON.stringify(seriesOptions);
    
    // Skip auto-select if we loaded from URL (URL values take precedence)
    if (loadedFromURLRef.current) {
      // Only validate that URL-loaded series are still valid
      if (seriesOptions.length > 0) {
        const hasInvalidSeries = filter.selectedSeries.some(s => !seriesOptions.includes(s));
        if (hasInvalidSeries) {
          // Filter out invalid series, keep valid ones
          const validSeries = filter.selectedSeries.filter(s => seriesOptions.includes(s));
          if (validSeries.length > 0) {
            setFilter({ selectedSeries: validSeries });
          } else {
            // If all URL series are invalid, fall back to all available
            setFilter({ selectedSeries: [...seriesOptions] });
          }
        }
      }
      prevSeriesOptionsRef.current = [...seriesOptions];
      hasInitializedRef.current = true;
      return;
    }
    
    // Auto-select all series when they become available (first load only)
    if (!hasInitializedRef.current && seriesOptions.length > 0 && filter.selectedSeries.length === 0) {
      setFilter({ selectedSeries: [...seriesOptions] });
      prevSeriesOptionsRef.current = [...seriesOptions];
      hasInitializedRef.current = true;
      return;
    }
    
    // When seriesOptions changes (e.g., switching accounts), reset to all available series
    // This ensures consistency when switching between parent/child accounts
    if (seriesOptionsChanged && seriesOptions.length > 0) {
      // Check if we had "all selected" before (selectedSeries matched previous options length)
      const hadAllSelected = prevSeriesOptions.length > 0 && 
        filter.selectedSeries.length === prevSeriesOptions.length &&
        filter.selectedSeries.every(s => prevSeriesOptions.includes(s));
      
      // If we had all selected, or if current selection has invalid series, reset to all
      const hasInvalidSeries = filter.selectedSeries.some(s => !seriesOptions.includes(s));
      
      // Only auto-select if we had all selected before or have invalid series
      // Don't auto-select if user intentionally cleared (hadAllSelected will be false)
      if (hadAllSelected || hasInvalidSeries) {
        setFilter({ selectedSeries: [...seriesOptions] });
      }
    }
    
    prevSeriesOptionsRef.current = [...seriesOptions];
    hasInitializedRef.current = true;
  }, [seriesOptions, filter.selectedSeries]);

  useEffect(() => {
    // Filter selectedTiers to only include tiers that are still available
    const validTiers = filter.selectedTiers.filter((t) => tierOptions.includes(t));
    const newSelectedTiers = validTiers.length > 0 
      ? validTiers 
      : (tierOptions.length > 0 ? tierOptions : []);
    
    // Only update if the tiers actually changed to prevent infinite loops
    const tiersChanged = JSON.stringify(newSelectedTiers.sort()) !== JSON.stringify(filter.selectedTiers.sort());
    if (tiersChanged) {
      setFilter({ selectedTiers: newSelectedTiers });
    }
  }, [tierOptions.join(","), allowAllTiers, filter.selectedTiers]); /* heavy lists – defer */

  const dFilter = useDeferredValue(filter);
  const dDetails = useDeferredValue(nftDetails);
  
  // Use immediate filter for selectedTiers to avoid delay issues
  const immediateFilter = {
    ...dFilter,
    selectedTiers: filter.selectedTiers, // Use immediate value, not deferred
    selectedSeries: filter.selectedSeries, // Use immediate value, not deferred (allow empty selection)
  };

  const buildOpts = useCallback(
    (extract, pred = () => true, isPlayerOptions = false) => {
      const s = new Set(
        dDetails
          .filter((n) => {
            // For player options, only check if the moment is not locked and matches basic filters
            if (isPlayerOptions) {
              return (
                (showLockedMoments || !n.isLocked) &&
                dFilter.selectedTiers.includes((n.tier || "").toLowerCase()) &&
                dFilter.selectedSeries.includes(Number(n.series))
              );
            }
            // For other options, apply the full predicate
            return (showLockedMoments || !n.isLocked) && pred(n);
          })
          .map(extract)
          .filter(Boolean)
      );
      return [...s].sort((a, b) =>
        ("" + a).localeCompare("" + b, undefined, { numeric: true })
      );
    },
    [dDetails, dFilter.selectedTiers, dFilter.selectedSeries, showLockedMoments]
  );

  // Only include leagues that actually have moments in the user's collection
  const leagueOptions = useMemo(() => {
    const leagues = new Set();
    nftDetails.forEach((n) => {
      const team = n.teamAtMoment || "";
      if (WNBA_TEAMS.includes(team)) {
        leagues.add("WNBA");
      } else if (team) {
        leagues.add("NBA");
      }
    });
    // Return in consistent order: NBA first, then WNBA
    const result = [];
    if (leagues.has("NBA")) result.push("NBA");
    if (leagues.has("WNBA")) result.push("WNBA");
    return result;
  }, [nftDetails]);

  const setNameOptions = ensureInOpts(
    dFilter.selectedSetName,
    buildOpts(
      (n) => n.name,
      (n) =>
        dFilter.selectedSeries.includes(Number(n.series)) &&
        dFilter.selectedTiers.includes((n.tier || "").toLowerCase()) &&
        (Array.isArray(dFilter.selectedLeague)
          ? dFilter.selectedLeague.length === 0 || dFilter.selectedLeague.some(league => {
              if (league === "WNBA") return WNBA_TEAMS.includes(n.teamAtMoment || "");
              if (league === "NBA") return !WNBA_TEAMS.includes(n.teamAtMoment || "");
              return false;
            })
          : dFilter.selectedLeague === "All"
          ? true
          : dFilter.selectedLeague === "WNBA"
          ? WNBA_TEAMS.includes(n.teamAtMoment || "")
          : !WNBA_TEAMS.includes(n.teamAtMoment || ""))
    )
  );

  const teamOptions = ensureInOpts(
    dFilter.selectedTeam,
    buildOpts(
      (n) => n.teamAtMoment,
      (n) =>
        dFilter.selectedSeries.includes(Number(n.series)) &&
        dFilter.selectedTiers.includes((n.tier || "").toLowerCase()) &&
        (Array.isArray(dFilter.selectedSetName)
          ? dFilter.selectedSetName.length === 0 || dFilter.selectedSetName.includes(n.name)
          : dFilter.selectedSetName === "All" || n.name === dFilter.selectedSetName) &&
        (Array.isArray(dFilter.selectedLeague)
          ? dFilter.selectedLeague.length === 0 || dFilter.selectedLeague.some(league => {
              if (league === "WNBA") return WNBA_TEAMS.includes(n.teamAtMoment || "");
              if (league === "NBA") return !WNBA_TEAMS.includes(n.teamAtMoment || "");
              return false;
            })
          : dFilter.selectedLeague === "All"
          ? true
          : dFilter.selectedLeague === "WNBA"
          ? WNBA_TEAMS.includes(n.teamAtMoment || "")
          : !WNBA_TEAMS.includes(n.teamAtMoment || ""))
    )
  );

  const playerOptions = ensureInOpts(
    dFilter.selectedPlayer,
    buildOpts(
      (n) => n.fullName,
      (n) => true, // Don't apply any filtering for player options
      true // Mark this as player options
    )
  );

  /* ---------- predicate ---------- */
  // NFT→TSHOT/TSHOT→NFT filtering logic (restrictive)
  const passes = useCallback(
    (n, omit = null) => {
      if (excludeIds.includes(String(n.id))) return false;
      
      // Filter out locked moments if showLockedMoments is false (for count calculations)
      // This ensures counts only include unlocked moments when appropriate
      if (!showLockedMoments && n.isLocked) return false;
      
      // Series filter - skip if omit === "series"
      if (omit !== "series") {
        // If no series selected, show nothing (empty = no matches)
        if (immediateFilter.selectedSeries.length === 0) return false;
        if (!immediateFilter.selectedSeries.includes(Number(n.series))) return false;
      }
      
      // Tier filter - skip if omit === "tier"
      if (omit !== "tier") {
        const tier = (n.tier || "").toLowerCase();
        if (!immediateFilter.selectedTiers.includes(tier)) return false;
      }

      if (omit !== "league") {
        if (Array.isArray(immediateFilter.selectedLeague)) {
          if (immediateFilter.selectedLeague.length === 0) return false;
          const isW = WNBA_TEAMS.includes(n.teamAtMoment || "");
          const leagueMatch = immediateFilter.selectedLeague.some(league => {
            if (league === "WNBA") return isW;
            if (league === "NBA") return !isW;
            return false;
          });
          if (!leagueMatch) return false;
        } else if (immediateFilter.selectedLeague !== "All") {
          const isW = WNBA_TEAMS.includes(n.teamAtMoment || "");
          if (immediateFilter.selectedLeague === "WNBA" ? !isW : isW) return false;
        }
      }
      if (omit !== "set") {
        // Handle both array (new) and string (old) formats for backward compatibility
        if (Array.isArray(immediateFilter.selectedSetName)) {
          if (immediateFilter.selectedSetName.length > 0 && !immediateFilter.selectedSetName.includes(n.name)) return false;
        } else if (immediateFilter.selectedSetName !== "All" && n.name !== immediateFilter.selectedSetName) {
          return false;
        }
      }
      if (omit !== "team") {
        // Handle both array (new) and string (old) formats for backward compatibility
        if (Array.isArray(immediateFilter.selectedTeam)) {
          if (immediateFilter.selectedTeam.length > 0 && !immediateFilter.selectedTeam.includes(n.teamAtMoment)) return false;
        } else if (immediateFilter.selectedTeam !== "All" && n.teamAtMoment !== immediateFilter.selectedTeam) {
          return false;
        }
      }
      if (omit !== "player") {
        // Handle both array (new) and string (old) formats for backward compatibility
        if (Array.isArray(immediateFilter.selectedPlayer)) {
          if (immediateFilter.selectedPlayer.length > 0 && !immediateFilter.selectedPlayer.includes(n.fullName)) return false;
        } else if (immediateFilter.selectedPlayer !== "All" && n.fullName !== immediateFilter.selectedPlayer) {
          return false;
        }
      }

      if (omit !== "subedition") {
        // Handle both array (new) and string (old) formats for backward compatibility
        const effectiveSubId = (n.subeditionID === null || n.subeditionID === undefined) ? 0 : n.subeditionID;
        if (Array.isArray(immediateFilter.selectedSubedition)) {
          if (immediateFilter.selectedSubedition.length > 0 && !immediateFilter.selectedSubedition.map(String).includes(String(effectiveSubId))) return false;
        } else if (immediateFilter.selectedSubedition !== "All" && String(immediateFilter.selectedSubedition) !== String(effectiveSubId)) {
          return false;
        }
      }

      const sn = Number(n.serialNumber);
      if (immediateFilter.excludeSpecialSerials) {
        const max = n.subeditionMaxMint
          ? Number(n.subeditionMaxMint)
          : Number(n.momentCount);
        const jersey = n.jerseyNumber ? Number(n.jerseyNumber) : null;
        if (sn === 1 || sn === max || (jersey && jersey === sn)) return false;
      }
      // Check safety filter override: if series is overridden, skip the ≤4000 check
      const seriesNum = Number(n.series);
      const isSeriesOverridden = safetyOverrides.has(seriesNum);
      if (immediateFilter.excludeLowSerials && sn <= 4000 && !isSeriesOverridden) return false;
      
      // Locked status filter
      if (immediateFilter.lockedStatus !== "All") {
        if (immediateFilter.lockedStatus === "Locked" && !n.isLocked) return false;
        if (immediateFilter.lockedStatus === "Unlocked" && n.isLocked) return false;
      }
      
      // Special serials filter
      if (immediateFilter.specialSerials !== "All") {
        const sn = Number(n.serialNumber);
        const max = n.subeditionMaxMint
          ? Number(n.subeditionMaxMint)
          : Number(n.momentCount);
        const jersey = n.jerseyNumber ? Number(n.jerseyNumber) : null;
        const isFirst = sn === 1;
        const isJersey = jersey && jersey === sn;
        const isLast = sn === max;
        
        if (immediateFilter.specialSerials === "First" && !isFirst) return false;
        if (immediateFilter.specialSerials === "Jersey" && !isJersey) return false;
        if (immediateFilter.specialSerials === "Last" && !isLast) return false;
        if (immediateFilter.specialSerials === "AllSpecial" && !isFirst && !isJersey && !isLast) return false;
      }
      
      if (selectedNFTs.includes(n.id)) return false;
      return true;
    },
    [immediateFilter, excludeIds, selectedNFTs, safetyOverrides, showLockedMoments]
  ); /* ---------- sub-edition options ---------- */

  const subeditionOptions = ensureInOpts(
    immediateFilter.selectedSubedition,
    (() => {
      const tally = {};
      dDetails.forEach((n) => {
        // Treat null/undefined subeditionID as 0 (Standard) for options
        const effectiveSubId = (n.subeditionID === null || n.subeditionID === undefined) ? 0 : n.subeditionID;
        // For sub-edition options, don't filter by locked status
        // Only apply other filters (tier, series, etc.) but not locked status
        if (excludeIds.includes(String(n.id))) return;
        // Only filter by tier if tiers are selected
        if (immediateFilter.selectedTiers.length > 0 && !immediateFilter.selectedTiers.includes((n.tier || "").toLowerCase())) return;
        // Only filter by series if series are selected
        if (immediateFilter.selectedSeries.length > 0 && !immediateFilter.selectedSeries.includes(Number(n.series))) return;
        // Set filter - handle both array and string formats
        if (Array.isArray(immediateFilter.selectedSetName)) {
          if (immediateFilter.selectedSetName.length > 0 && !immediateFilter.selectedSetName.includes(n.name)) return;
        } else if (immediateFilter.selectedSetName !== "All" && n.name !== immediateFilter.selectedSetName) {
          return;
        }
        // League filter - handle both array and string formats
        if (Array.isArray(immediateFilter.selectedLeague)) {
          if (immediateFilter.selectedLeague.length === 0) return;
          const isW = WNBA_TEAMS.includes(n.teamAtMoment || "");
          const leagueMatch = immediateFilter.selectedLeague.some(league => {
            if (league === "WNBA") return isW;
            if (league === "NBA") return !isW;
            return false;
          });
          if (!leagueMatch) return;
        } else if (immediateFilter.selectedLeague !== "All") {
          const isW = WNBA_TEAMS.includes(n.teamAtMoment || "");
          if (immediateFilter.selectedLeague === "WNBA" ? !isW : isW) return;
        }
        // Team filter - handle both array and string formats
        if (Array.isArray(immediateFilter.selectedTeam)) {
          if (immediateFilter.selectedTeam.length > 0 && !immediateFilter.selectedTeam.includes(n.teamAtMoment)) return;
        } else if (immediateFilter.selectedTeam !== "All" && n.teamAtMoment !== immediateFilter.selectedTeam) {
          return;
        }
        // Player filter - handle both array and string formats
        if (Array.isArray(immediateFilter.selectedPlayer)) {
          if (immediateFilter.selectedPlayer.length > 0 && !immediateFilter.selectedPlayer.includes(n.fullName)) return;
        } else if (immediateFilter.selectedPlayer !== "All" && n.fullName !== immediateFilter.selectedPlayer) {
          return;
        }
        
        tally[effectiveSubId] = (tally[effectiveSubId] || 0) + 1;
      });

      const result = Object.keys(tally)
        .map(Number)
        .sort((a, b) => (SUB_META[b]?.minted ?? 0) - (SUB_META[a]?.minted ?? 0)) // desc by max-mint
        .map(String); // ensure all entries are strings → unique keys
      
      return result;
    })()
  ); /* ---------- derived lists ---------- */

  // Separate filtering logic for My Collection vs NFT→TSHOT flows
  const myCollectionFilter = useCallback((n) => {
    // My Collection: Apply all filters but allow all tiers (including rare/legendary/ultimate)
    
    // Early return for excluded IDs and selected NFTs
    if (excludeIds.includes(String(n.id))) return false;
    if (selectedNFTs.includes(n.id)) return false;
    
    // Filter out locked moments if showLockedMoments is false
    if (!showLockedMoments && n.isLocked) return false;
    
    // Tier filter
    const tier = (n.tier || "").toLowerCase();
    if (!immediateFilter.selectedTiers.includes(tier)) return false;
    
    // Series filter
    // If no series selected, show nothing (empty = no matches)
    if (immediateFilter.selectedSeries.length === 0) return false;
    if (!immediateFilter.selectedSeries.includes(Number(n.series))) return false;
    
    // League filter
    if (Array.isArray(immediateFilter.selectedLeague)) {
      if (immediateFilter.selectedLeague.length === 0) return false;
      const isW = WNBA_TEAMS.includes(n.teamAtMoment || "");
      const leagueMatch = immediateFilter.selectedLeague.some(league => {
        if (league === "WNBA") return isW;
        if (league === "NBA") return !isW;
        return false;
      });
      if (!leagueMatch) return false;
    } else if (immediateFilter.selectedLeague !== "All") {
      const isW = WNBA_TEAMS.includes(n.teamAtMoment || "");
      if (immediateFilter.selectedLeague === "WNBA" ? !isW : isW) return false;
    }
    
    // Set filter - handle both array (new) and string (old) formats
    if (Array.isArray(immediateFilter.selectedSetName)) {
      if (immediateFilter.selectedSetName.length > 0 && !immediateFilter.selectedSetName.includes(n.name)) return false;
    } else if (immediateFilter.selectedSetName !== "All" && n.name !== immediateFilter.selectedSetName) {
      return false;
    }
    
    // Team filter - handle both array (new) and string (old) formats
    if (Array.isArray(immediateFilter.selectedTeam)) {
      if (immediateFilter.selectedTeam.length > 0 && !immediateFilter.selectedTeam.includes(n.teamAtMoment)) return false;
    } else if (immediateFilter.selectedTeam !== "All" && n.teamAtMoment !== immediateFilter.selectedTeam) {
      return false;
    }
    
    // Player filter - handle both array (new) and string (old) formats
    if (Array.isArray(immediateFilter.selectedPlayer)) {
      if (immediateFilter.selectedPlayer.length > 0 && !immediateFilter.selectedPlayer.includes(n.fullName)) return false;
    } else if (immediateFilter.selectedPlayer !== "All" && n.fullName !== immediateFilter.selectedPlayer) {
      return false;
    }
    
    // Subedition/Parallel filter - handle both array (new) and string (old) formats
    const effectiveSubId = (n.subeditionID === null || n.subeditionID === undefined) ? 0 : n.subeditionID;
    if (Array.isArray(immediateFilter.selectedSubedition)) {
      if (immediateFilter.selectedSubedition.length > 0 && !immediateFilter.selectedSubedition.map(String).includes(String(effectiveSubId))) return false;
    } else if (immediateFilter.selectedSubedition !== "All" && String(immediateFilter.selectedSubedition) !== String(effectiveSubId)) {
      return false;
    }
    
    // Locked status filter
    if (immediateFilter.lockedStatus !== "All") {
      if (immediateFilter.lockedStatus === "Locked" && !n.isLocked) return false;
      if (immediateFilter.lockedStatus === "Unlocked" && n.isLocked) return false;
    }
    
    // Safety filters: excludeSpecialSerials and excludeLowSerials
    const sn = Number(n.serialNumber);
    if (immediateFilter.excludeSpecialSerials) {
      const max = n.subeditionMaxMint
        ? Number(n.subeditionMaxMint)
        : Number(n.momentCount);
      const jersey = n.jerseyNumber ? Number(n.jerseyNumber) : null;
      if (sn === 1 || sn === max || (jersey && jersey === sn)) return false;
    }
    // Check safety filter override: if series is overridden, skip the ≤4000 check
    const seriesNum = Number(n.series);
    const isSeriesOverridden = safetyOverrides.has(seriesNum);
    if (immediateFilter.excludeLowSerials && sn <= 4000 && !isSeriesOverridden) return false;
    
    return true;
  }, [immediateFilter, showLockedMoments, excludeIds, selectedNFTs, safetyOverrides]);

  const nftToTshotFilter = useCallback((n) => {
    // NFT→TSHOT/TSHOT→NFT: Apply all restrictive filters
    if (!passes(n)) return false;
    if (!showLockedMoments && n.isLocked) return false;
    
    const tier = (n.tier || "").toLowerCase();
    if (tier !== "common" && tier !== "fandom") return false;

    return true;
  }, [passes, showLockedMoments]);

  const eligibleMoments = useMemo(
    () => {
      const result = dDetails
        .filter((n) => {
          // Use appropriate filter based on context
          return allowAllTiers ? myCollectionFilter(n) : nftToTshotFilter(n);
        });
      
      // Apply different sorting based on context
      result.sort((a, b) => {
        const serialA = Number(a.serialNumber);
        const serialB = Number(b.serialNumber);
        
        // If forceSortOrder is set, use it regardless of other settings
        if (forceSortOrder === "highest-serial") {
          return serialB - serialA; // Highest first
        }
        if (forceSortOrder === "lowest-serial") {
          return serialA - serialB; // Lowest first
        }
        
        if (allowAllTiers) {
          // My Collection: Sort by user's preference
          if (immediateFilter.sortBy === "highest-serial") {
            return serialB - serialA; // Highest first
          } else {
            return serialA - serialB; // Lowest first (default)
          }
        } else {
          // NFT→TSHOT/TSHOT→NFT: Always sort highest serial first (descending)
          return serialB - serialA;
        }
      });
      
      return result;
    },
    [dDetails, allowAllTiers, myCollectionFilter, nftToTshotFilter, immediateFilter.sortBy, forceSortOrder]
  );

  const baseNoSeries = useMemo(
    () => dDetails.filter((n) => passes(n, "series")),
    [dDetails, passes]
  );
  const baseNoTier = useMemo(
    () => dDetails.filter((n) => passes(n, "tier")),
    [dDetails, passes]
  );
  const baseNoSub = useMemo(
    () => dDetails.filter((n) => passes(n, "subedition")),
    [dDetails, passes]
  );
  const baseNoLeague = useMemo(
    () => dDetails.filter((n) => passes(n, "league")),
    [dDetails, passes]
  );
  const baseNoSet = useMemo(
    () => dDetails.filter((n) => passes(n, "set")),
    [dDetails, passes]
  );
  const baseNoTeam = useMemo(
    () => dDetails.filter((n) => passes(n, "team")),
    [dDetails, passes]
  );
  const baseNoPlayer = useMemo(
    () => dDetails.filter((n) => passes(n, "player")),
    [dDetails, passes]
  ); /* ---------- presets ---------- */

  const PREF_KEY = `momentSelectionFilterPrefs:${scope}`;
  const [prefs, setPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [currentPrefKey, setCurrentPrefKey] = useState("");

  const savePref = (key) => {
    try {
      const blob = { version: 1, data: filter };
      const next = { ...prefs, [key]: blob };
      localStorage.setItem(PREF_KEY, safeStringify(next));
      setPrefs(next);
      setCurrentPrefKey(key);
      return true;
    } catch (e) {
      console.error("[prefs/save]", e);
      return false;
    }
  };

  const applyPref = (key) => {
    const pref = prefs[key];
    if (!pref) return;
    const data = pref.version === 1 ? pref.data : DEFAULT_FILTER;
    
    // Migrate old string format to array format for Team, Player, Set, and Parallel
    const migrated = { ...data };
    if (typeof migrated.selectedTeam === "string") {
      migrated.selectedTeam = migrated.selectedTeam === "All" ? [] : [migrated.selectedTeam];
    }
    if (typeof migrated.selectedPlayer === "string") {
      migrated.selectedPlayer = migrated.selectedPlayer === "All" ? [] : [migrated.selectedPlayer];
    }
    if (typeof migrated.selectedSetName === "string") {
      migrated.selectedSetName = migrated.selectedSetName === "All" ? [] : [migrated.selectedSetName];
    }
    if (typeof migrated.selectedSubedition === "string") {
      migrated.selectedSubedition = migrated.selectedSubedition === "All" ? [] : [migrated.selectedSubedition];
    }
    
    dispatch({ type: "LOAD", payload: migrated });
    setCurrentPrefKey(key);
  };

  const deletePref = (key) => {
    const { [key]: _, ...rest } = prefs;
    try {
      localStorage.setItem(PREF_KEY, safeStringify(rest));
    } catch (e) {
      console.error("[prefs/del]", e);
    }
    setPrefs(rest);
    if (currentPrefKey === key) setCurrentPrefKey("");
  };

  useEffect(() => {
    if (!currentPrefKey) return;
    const pref = prefs[currentPrefKey];
    if (!pref) {
      setCurrentPrefKey("");
      return;
    }
    const saved = pref.version === 1 ? pref.data : DEFAULT_FILTER;
    if (JSON.stringify(saved) !== JSON.stringify(filter)) setCurrentPrefKey("");
  }, [filter, prefs, currentPrefKey]);

  /* ---------- URL sync ---------- */
  // Load from URL on mount if URL params exist
  const hasInitializedFromURL = useRef(false);
  const lastURLParamsRef = useRef(null);
  
  useEffect(() => {
    if (!syncWithURL || !searchParams || hasInitializedFromURL.current) return;
    
    const hasURLParams = Array.from(searchParams.keys()).length > 0;
    if (hasURLParams) {
      // URL takes precedence - load from URL
      const urlFilter = searchParamsToFilters(searchParams, DEFAULT_FILTER);
      loadedFromURLRef.current = true; // Mark that we loaded from URL
      dispatch({ type: "LOAD", payload: urlFilter });
      // Store the URL params we just loaded to prevent re-triggering
      lastURLParamsRef.current = searchParams.toString();
    }
    // Always mark as initialized (even if no URL params) so we can update URL on filter changes
    hasInitializedFromURL.current = true;
  }, [syncWithURL, searchParams]); // Only run once on mount

  // Update URL when filter changes (but not on initial load)
  useEffect(() => {
    if (!syncWithURL || !setSearchParams || !hasInitializedFromURL.current) return;
    
    // Build effective default filter based on current context
    // For tiers: if allowAllTiers=true, default is all available tiers, otherwise ["common", "fandom"]
    const effectiveDefaultFilter = {
      ...DEFAULT_FILTER,
      selectedTiers: allowAllTiers && tierOptions.length > 0 
        ? [...tierOptions] // All available tiers when allowAllTiers=true
        : DEFAULT_FILTER.selectedTiers, // ["common", "fandom"] otherwise
    };
    
    const params = filtersToSearchParams(filter, effectiveDefaultFilter, seriesOptions);
    const paramsString = params.toString();
    
    // Only update URL if it's different from what's currently in the URL
    // This prevents infinite loops when URL changes trigger filter changes
    if (paramsString !== lastURLParamsRef.current) {
      setSearchParams(params, { replace: true }); // replace=true prevents history spam
      lastURLParamsRef.current = paramsString;
    }
  }, [filter, syncWithURL, setSearchParams, seriesOptions, allowAllTiers, tierOptions]); /* ---------- expose ---------- */

  return {
    filter,
    setFilter,

    tierOptions,
    seriesOptions,
    leagueOptions,
    setNameOptions,
    teamOptions,
    playerOptions,
    subeditionOptions,

    eligibleMoments,
    base: { baseNoSeries, baseNoTier, baseNoSub, baseNoLeague, baseNoSet, baseNoTeam, baseNoPlayer },

    subMeta: SUB_META,

    prefs,
    currentPrefKey,
    savePref,
    applyPref,
    deletePref,
  };
}
