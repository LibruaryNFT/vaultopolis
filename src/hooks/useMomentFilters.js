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
  currentPage: { def: 1 },
};

export const DEFAULT_FILTER = Object.fromEntries(
  Object.entries(FILTER_SCHEMA).map(([k, v]) => [k, v.def])
);

/* guarantee “All” & uniqueness (string-compare) */
const ensureInOpts = (val, arr) => {
  const v = String(val);
  if (v === "All" || v === "") return arr;
  return arr.some((x) => String(x) === v) ? arr : [...arr, val];
};

/* ───────── main hook ──────── */
export function useMomentFilters({
  allowAllTiers = false,
  excludeIds = [],
  nftDetails = [],
  selectedNFTs = [],
}) {
  /* ----- tier list ----- */
  const tierOptions = allowAllTiers
    ? [...BASE_TIERS, ...EXTRA_TIERS]
    : BASE_TIERS;

  /* ----- reducer ----- */
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
    selectedTiers: tierOptions,
  });
  const setFilter = (p) => dispatch({ type: "SET", payload: p });

  /* ----- option arrays ----- */
  const seriesOptions = useMemo(() => {
    const s = new Set(FORCED_SERIES);
    nftDetails.forEach((n) => {
      const v = Number(n.series);
      if (!Number.isNaN(v)) s.add(v);
    });
    return [...s].sort((a, b) => a - b);
  }, [nftDetails]);

  /* auto-select series on first load */
  const boot = useRef(false);
  useEffect(() => {
    if (
      !boot.current &&
      seriesOptions.length &&
      !filter.selectedSeries.length
    ) {
      setFilter({ selectedSeries: [...seriesOptions] });
      boot.current = true;
    }
  }, [seriesOptions, filter.selectedSeries.length]);

  /* keep tier selection valid */
  useEffect(() => {
    setFilter({
      selectedTiers:
        filter.selectedTiers.filter((t) => tierOptions.includes(t)) ||
        tierOptions,
    });
  }, [tierOptions.join("")]);

  /* heavy lists – defer */
  const dFilter = useDeferredValue(filter);
  const dDetails = useDeferredValue(nftDetails);

  const buildOpts = useCallback(
    (extract, pred = () => true) => {
      const s = new Set(
        dDetails
          .filter((n) => !n.isLocked && pred(n))
          .map(extract)
          .filter(Boolean)
      );
      return [...s].sort((a, b) =>
        ("" + a).localeCompare("" + b, undefined, { numeric: true })
      );
    },
    [dDetails]
  );

  /* league / set / team / player options */
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
      (n) =>
        dFilter.selectedSeries.includes(Number(n.series)) &&
        dFilter.selectedTiers.includes((n.tier || "").toLowerCase()) &&
        (dFilter.selectedSetName === "All" ||
          n.name === dFilter.selectedSetName) &&
        (dFilter.selectedTeam === "All" ||
          n.teamAtMoment === dFilter.selectedTeam) &&
        (dFilter.selectedLeague === "All"
          ? true
          : dFilter.selectedLeague === "WNBA"
          ? WNBA_TEAMS.includes(n.teamAtMoment || "")
          : !WNBA_TEAMS.includes(n.teamAtMoment || ""))
    )
  );

  /* ---------- predicate ---------- */
  const passes = useCallback(
    (n, omit = null) => {
      if (excludeIds.includes(String(n.id)) || n.isLocked) return false;
      if (!dFilter.selectedTiers.includes((n.tier || "").toLowerCase()))
        return false;
      if (!dFilter.selectedSeries.includes(Number(n.series))) return false;

      if (omit !== "league" && dFilter.selectedLeague !== "All") {
        const isW = WNBA_TEAMS.includes(n.teamAtMoment || "");
        if (dFilter.selectedLeague === "WNBA" ? !isW : isW) return false;
      }
      if (
        omit !== "set" &&
        dFilter.selectedSetName !== "All" &&
        n.name !== dFilter.selectedSetName
      )
        return false;
      if (
        omit !== "team" &&
        dFilter.selectedTeam !== "All" &&
        n.teamAtMoment !== dFilter.selectedTeam
      )
        return false;
      if (
        omit !== "player" &&
        dFilter.selectedPlayer !== "All" &&
        n.fullName !== dFilter.selectedPlayer
      )
        return false;

      if (omit !== "subedition" && dFilter.selectedSubedition !== "All") {
        if (String(dFilter.selectedSubedition) !== String(n.subeditionID))
          return false;
      }

      const sn = Number(n.serialNumber);
      if (dFilter.excludeSpecialSerials) {
        const max = n.subeditionMaxMint
          ? Number(n.subeditionMaxMint)
          : Number(n.momentCount);
        const jersey = n.jerseyNumber ? Number(n.jerseyNumber) : null;
        if (sn === 1 || sn === max || (jersey && jersey === sn)) return false;
      }
      if (dFilter.excludeLowSerials && sn <= 4000) return false;
      if (selectedNFTs.includes(n.id)) return false;
      return true;
    },
    [dFilter, excludeIds, selectedNFTs]
  );

  /* ---------- sub-edition options ---------- */
  const subeditionOptions = ensureInOpts(
    dFilter.selectedSubedition,
    (() => {
      const tally = {};
      dDetails.forEach((n) => {
        if (!n.subeditionID) return;
        if (!passes(n, "subedition")) return; // respect upstream filters
        tally[n.subeditionID] = (tally[n.subeditionID] || 0) + 1;
      });

      return Object.keys(tally)
        .map(Number)
        .sort((a, b) => SUB_META[b].minted - SUB_META[a].minted) // desc by max-mint
        .map(String); // ensure all entries are strings → unique keys
    })()
  );

  /* ---------- derived lists ---------- */
  const eligibleMoments = useMemo(
    () =>
      dDetails
        .filter((n) => passes(n))
        .sort((a, b) => b.serialNumber - a.serialNumber),
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
  );

  /* ---------- presets ---------- */
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
  }, [filter, prefs, currentPrefKey]);

  /* ---------- expose ---------- */
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
