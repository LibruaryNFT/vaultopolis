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
export const SUB_META = {
  1: { name: "Explosion", minted: 500 },
  2: { name: "Torn", minted: 1000 },
  3: { name: "Vortex", minted: 2500 },
  4: { name: "Rippled", minted: 4000 },
  5: { name: "Coded", minted: 25 },
  6: { name: "Halftone", minted: 100 },
  7: { name: "Bubbled", minted: 250 },
  8: { name: "Diced", minted: 10 },
  9: { name: "Bit", minted: 50 },
  10: { name: "Vibe", minted: 5 },
  11: { name: "Astra", minted: 75 },
};

/* ───────── default filter ─── */
const FILTER_SCHEMA = {
  selectedTiers: { def: BASE_TIERS },
  selectedSeries: { def: [] },
  selectedSetName: { def: "All" },
  selectedLeague: { def: "All" },
  selectedTeam: { def: "All" },
  selectedPlayer: { def: "All" },
  selectedSubedition: { def: "All" }, // id (string) | "All"
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
 */
export function useMomentFilters({
  allowAllTiers = false,
  disableBootEffect = false, // <-- ADDED THIS PROP
  excludeIds = [],
  nftDetails = [],
  selectedNFTs = [],
  showLockedMoments = false, // <-- ADDED THIS PROP
  forceSortOrder = null, // Force sort order regardless of other settings
}) {
  /* ----- tier list ----- */
  const tierOptions = allowAllTiers
    ? [...BASE_TIERS, ...EXTRA_TIERS]
    : BASE_TIERS; /* ----- reducer ----- */

  const reducer = (s, a) =>
    a.type === "SET"
      ? { ...s, ...a.payload }
      : a.type === "LOAD"
      ? { ...s, ...a.payload, currentPage: 1 }
      : a.type === "RESET"
      ? { ...DEFAULT_FILTER, selectedTiers: tierOptions }
      : s;

  const [filter, dispatch] = useReducer(reducer, {
    ...DEFAULT_FILTER,
    selectedTiers: allowAllTiers ? [...BASE_TIERS, ...EXTRA_TIERS] : BASE_TIERS,
    selectedSeries: [], // Will be populated by useEffect
  });
  const setFilter = (p) =>
    dispatch({ type: "SET", payload: p }); /* ----- option arrays ----- */

  const seriesOptions = useMemo(() => {
    const s = new Set(FORCED_SERIES);
    nftDetails.forEach((n) => {
      const v = Number(n.series);
      if (!Number.isNaN(v)) s.add(v);
    });
    return [...s].sort((a, b) => a - b);
  }, [nftDetails]); /* auto-select series on first load */

  // Track previous seriesOptions to detect account switches
  const prevSeriesOptionsRef = useRef([]);

  useEffect(() => {
    const prevSeriesOptions = prevSeriesOptionsRef.current;
    const seriesOptionsChanged = JSON.stringify(prevSeriesOptions) !== JSON.stringify(seriesOptions);
    
    // Auto-select all series when they become available (first load)
    if (seriesOptions.length > 0 && filter.selectedSeries.length === 0) {
      setFilter({ selectedSeries: [...seriesOptions] });
      prevSeriesOptionsRef.current = [...seriesOptions];
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
      
      if (hadAllSelected || hasInvalidSeries || filter.selectedSeries.length === 0) {
        setFilter({ selectedSeries: [...seriesOptions] });
      }
    }
    
    prevSeriesOptionsRef.current = [...seriesOptions];
  }, [seriesOptions, filter.selectedSeries]);

  useEffect(() => {
    const newSelectedTiers = allowAllTiers 
      ? tierOptions // When allowAllTiers is true, always select all tiers
      : filter.selectedTiers.filter((t) => tierOptions.includes(t)) || tierOptions;
    
    // Only update if the tiers actually changed to prevent infinite loops
    const tiersChanged = JSON.stringify(newSelectedTiers.sort()) !== JSON.stringify(filter.selectedTiers.sort());
    if (tiersChanged) {
      setFilter({ selectedTiers: newSelectedTiers });
    }
  }, [tierOptions.join(","), allowAllTiers]); /* heavy lists – defer */

  const dFilter = useDeferredValue(filter);
  const dDetails = useDeferredValue(nftDetails);
  
  // Use immediate filter for selectedTiers to avoid delay issues
  const immediateFilter = {
    ...dFilter,
    selectedTiers: filter.selectedTiers, // Use immediate value, not deferred
    selectedSeries: seriesOptions.length > 0 && filter.selectedSeries.length === 0 
      ? [...seriesOptions] // Force all series if none selected
      : filter.selectedSeries, // Use immediate value, not deferred
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

  const leagueOptions = buildOpts(
    (n) => (WNBA_TEAMS.includes(n.teamAtMoment || "") ? "WNBA" : "NBA"),
    (n) =>
      dFilter.selectedSeries.includes(Number(n.series)) &&
      dFilter.selectedTiers.includes((n.tier || "").toLowerCase())
  );

  const setNameOptions = ensureInOpts(
    dFilter.selectedSetName,
    buildOpts(
      (n) => n.name,
      (n) =>
        dFilter.selectedSeries.includes(Number(n.series)) &&
        dFilter.selectedTiers.includes((n.tier || "").toLowerCase()) &&
        (dFilter.selectedLeague === "All"
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
        (dFilter.selectedSetName === "All" ||
          n.name === dFilter.selectedSetName) &&
        (dFilter.selectedLeague === "All"
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
      
      const tier = (n.tier || "").toLowerCase();
      const tierPasses = immediateFilter.selectedTiers.includes(tier);
      
      if (!tierPasses) return false;
      
      // Apply all restrictive filters for NFT→TSHOT/TSHOT→NFT flows
      if (!immediateFilter.selectedSeries.includes(Number(n.series))) return false;

      if (omit !== "league" && immediateFilter.selectedLeague !== "All") {
        const isW = WNBA_TEAMS.includes(n.teamAtMoment || "");
        if (immediateFilter.selectedLeague === "WNBA" ? !isW : isW) return false;
      }
      if (
        omit !== "set" &&
        immediateFilter.selectedSetName !== "All" &&
        n.name !== immediateFilter.selectedSetName
      )
        return false;
      if (
        omit !== "team" &&
        immediateFilter.selectedTeam !== "All" &&
        n.teamAtMoment !== immediateFilter.selectedTeam
      )
        return false;
      if (
        omit !== "player" &&
        immediateFilter.selectedPlayer !== "All" &&
        n.fullName !== immediateFilter.selectedPlayer
      )
        return false;

      if (omit !== "subedition" && immediateFilter.selectedSubedition !== "All") {
        if (String(immediateFilter.selectedSubedition) !== String(n.subeditionID))
          return false;
      }

      const sn = Number(n.serialNumber);
      if (immediateFilter.excludeSpecialSerials) {
        const max = n.subeditionMaxMint
          ? Number(n.subeditionMaxMint)
          : Number(n.momentCount);
        const jersey = n.jerseyNumber ? Number(n.jerseyNumber) : null;
        if (sn === 1 || sn === max || (jersey && jersey === sn)) return false;
      }
      if (immediateFilter.excludeLowSerials && sn <= 4000) return false;
      
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
    [immediateFilter, excludeIds, selectedNFTs]
  ); /* ---------- sub-edition options ---------- */

  const subeditionOptions = ensureInOpts(
    immediateFilter.selectedSubedition,
    (() => {
      const tally = {};
      dDetails.forEach((n) => {
        if (!n.subeditionID) return;
        // For sub-edition options, don't filter by locked status
        // Only apply other filters (tier, series, etc.) but not locked status
        if (excludeIds.includes(String(n.id))) return;
        if (!immediateFilter.selectedTiers.includes((n.tier || "").toLowerCase())) return;
        if (!immediateFilter.selectedSeries.includes(String(n.series))) return;
        if (immediateFilter.selectedSetName !== "All" && n.name !== immediateFilter.selectedSetName) return;
        if (immediateFilter.selectedLeague !== "All" && n.league !== immediateFilter.selectedLeague) return;
        if (immediateFilter.selectedTeam !== "All" && n.teamAtMoment !== immediateFilter.selectedTeam) return;
        if (immediateFilter.selectedPlayer !== "All" && n.fullName !== immediateFilter.selectedPlayer) return;
        
        tally[n.subeditionID] = (tally[n.subeditionID] || 0) + 1;
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
    if (!immediateFilter.selectedSeries.includes(Number(n.series))) return false;
    
    // League filter
    if (immediateFilter.selectedLeague !== "All") {
      const isW = WNBA_TEAMS.includes(n.teamAtMoment || "");
      if (immediateFilter.selectedLeague === "WNBA" ? !isW : isW) return false;
    }
    
    // Set filter
    if (immediateFilter.selectedSetName !== "All" && n.name !== immediateFilter.selectedSetName) return false;
    
    // Team filter
    if (immediateFilter.selectedTeam !== "All" && n.teamAtMoment !== immediateFilter.selectedTeam) return false;
    
    // Player filter
    if (immediateFilter.selectedPlayer !== "All" && n.fullName !== immediateFilter.selectedPlayer) return false;
    
    // Locked status filter
    if (immediateFilter.lockedStatus !== "All") {
      if (immediateFilter.lockedStatus === "Locked" && !n.isLocked) return false;
      if (immediateFilter.lockedStatus === "Unlocked" && n.isLocked) return false;
    }
    
    return true;
  }, [immediateFilter, showLockedMoments, excludeIds, selectedNFTs]);

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

  const PREF_KEY = "momentSelectionFilterPrefs";
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
    dispatch({ type: "LOAD", payload: data });
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
  }, [filter, prefs, currentPrefKey]); /* ---------- expose ---------- */

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
    base: { baseNoSub, baseNoLeague, baseNoSet, baseNoTeam, baseNoPlayer },

    subMeta: SUB_META,

    prefs,
    currentPrefKey,
    savePref,
    applyPref,
    deletePref,
  };
}
