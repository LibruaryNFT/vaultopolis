import React, { useEffect, useState, useContext, useRef } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import MomentCard from "./MomentCard";
import { UserDataContext } from "../context/UserContext";
import { getSeriesFilterLabel } from "../utils/seriesNames";
import { SUBEDITIONS, getParallelIconUrl } from "../utils/subeditions";
import MultiSelectFilterPopover from "./MultiSelectFilterPopover";
import PageInput from "./PageInput";
import MomentCardSkeleton from "./MomentCardSkeleton";
import { X } from "lucide-react";

/* ---------- constants ---------- */
const TIER_OPTIONS = [
  { label: "Common", value: "common" },
  { label: "Fandom", value: "fandom" },
];
const ALL_SERIES_OPTIONS = [0, 2, 3, 4, 5, 6, 7, 8];
const PAGE_SIZE = 50;

/* ---------- layout wrappers (unchanged) ---------- */
const Section = ({ children }) => (
  <section>{children}</section>
);

/* ---------- stat tile (unchanged) ---------- */
const Stat = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="opacity-70">{label}</span>
    <span className="font-semibold">{value?.toLocaleString?.() ?? "--"}</span>
  </div>
);

/* ---------- reusable dropdown - deprecated, use FilterDropdown instead ---------- */

/* ---------- main component ---------- */

function TSHOTVault({ onSummaryUpdate }) {
  const { flowPricePerNFT } = useContext(UserDataContext);
  
  /* Server/API Data */
  const [vaultData, setVaultData] = useState([]);
  const [queryTotal, setQueryTotal] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState({ moments: true, filters: true });
  const [errorMsg, setErrorMsg] = useState("");
  const [retry, setRetry] = useState(0);

  /* Paging */
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);

  /* Filters */
  const [selectedTiers, setSelectedTiers] = useState(() =>
    TIER_OPTIONS.map((t) => t.value)
  );
  const [selectedSeries, setSelectedSeries] = useState(
    () => ALL_SERIES_OPTIONS
  );
  const [selectedLeague, setSelectedLeague] = useState(["NBA", "WNBA"]);
  const [selectedSet, setSelectedSet] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState([]);
  const [selectedSubedition, setSelectedSubedition] = useState([]);
  const [onlySpecial, setOnlySpecial] = useState(false);

  // State to hold all possible filter options, fetched once from the backend
  const [filterOptions, setFilterOptions] = useState(null);
  
  // Get all possible subedition options (all known parallels, not just from current page)
  const subeditionOptions = React.useMemo(() => {
    // Return all known subedition IDs from SUBEDITIONS
    const allIds = Object.keys(SUBEDITIONS)
      .map(Number)
      .filter(id => id !== 0) // Remove Standard (0) from the list
      .sort((a, b) => (SUBEDITIONS[b]?.minted ?? 0) - (SUBEDITIONS[a]?.minted ?? 0));
    
    // Put Standard (0) first, then the rest sorted by minted count
    return ["0", ...allIds.map(String)];
  }, []);

  /* ---------- DATA FETCHING ---------- */

  // Fetch the list of all possible filter options once on component mount
  useEffect(() => {
    async function fetchOptions() {
      setLoading((prev) => ({ ...prev, filters: true }));
      try {
        const url = `https://api.vaultopolis.com/tshot-vault/filters`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Error fetching filters: ${resp.status}`);
        const json = await resp.json();
        setFilterOptions(json);
      } catch (e) {
        console.error("Could not fetch vault filters:", e);
        setErrorMsg(`Failed to load filter options: ${e.message}`);
        setFilterOptions({
          allLeagues: [],
          allTeams: [],
          allPlayers: [],
          allSets: [],
        });
      } finally {
        setLoading((prev) => ({ ...prev, filters: false }));
      }
    }
    fetchOptions();
  }, []);

  // Track previous page to detect page changes (not filter changes)
  const prevPageRef = useRef(page);
  const prevFiltersRef = useRef(JSON.stringify({
    selectedTiers,
    selectedSeries,
    selectedLeague,
    selectedSet,
    selectedTeam,
    selectedPlayer,
    selectedSubedition,
    onlySpecial,
  }));
  
  // Fetch the moments themselves whenever a filter changes
  useEffect(() => {
    if (selectedSeries.length === 0) {
      setVaultData([]);
      setQueryTotal(0);
      prevPageRef.current = page;
      prevFiltersRef.current = JSON.stringify({
        selectedTiers,
        selectedSeries,
        selectedLeague,
        selectedSet,
        selectedTeam,
        selectedPlayer,
        selectedSubedition,
        onlySpecial,
      });
      return;
    }
    
    // Check if this is a page change (not a filter change)
    const currentFilters = JSON.stringify({
      selectedTiers,
      selectedSeries,
      selectedLeague,
      selectedSet,
      selectedTeam,
      selectedPlayer,
      selectedSubedition,
      onlySpecial,
    });
    const isPageChange = prevPageRef.current !== page && prevFiltersRef.current === currentFilters;
    
    // If page changed (not filter change), set loading immediately
    // We keep the old vaultData so the grid stays the same size, and show skeletons in place
    if (isPageChange) {
      setLoading((prev) => ({ ...prev, moments: true }));
      // Don't clear vaultData - keep it so grid size stays consistent
    }
    
    prevPageRef.current = page;
    prevFiltersRef.current = currentFilters;
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    retry,
    selectedTiers,
    selectedSeries,
    selectedLeague,
    selectedSet,
    selectedTeam,
    selectedPlayer,
    selectedSubedition,
    onlySpecial,
  ]);

  async function fetchPage() {
    try {
      setLoading((prev) => ({ ...prev, moments: true }));
      setErrorMsg("");

      const params = new URLSearchParams();
      params.set("page", page);
      params.set("pageSize", PAGE_SIZE);
      params.set("tier", selectedTiers.join(","));
      params.set("series", selectedSeries.join(","));

      // Add all other filters to the query if they are not empty (empty = "All")
      if (Array.isArray(selectedLeague) && selectedLeague.length > 0 && selectedLeague.length < 2) {
        // If only one league selected, send it as a string
        params.set("league", selectedLeague[0]);
      } else if (!Array.isArray(selectedLeague) && selectedLeague !== "All") {
        params.set("league", selectedLeague);
      }
      if (Array.isArray(selectedSet) && selectedSet.length > 0) {
        params.set("setName", selectedSet.join(","));
      } else if (!Array.isArray(selectedSet) && selectedSet !== "All") {
        params.set("setName", selectedSet);
      }
      if (Array.isArray(selectedTeam) && selectedTeam.length > 0) {
        params.set("team", selectedTeam.join(","));
      } else if (!Array.isArray(selectedTeam) && selectedTeam !== "All") {
        params.set("team", selectedTeam);
      }
      if (Array.isArray(selectedPlayer) && selectedPlayer.length > 0) {
        params.set("player", selectedPlayer.join(","));
      } else if (!Array.isArray(selectedPlayer) && selectedPlayer !== "All") {
        params.set("player", selectedPlayer);
      }
      if (Array.isArray(selectedSubedition) && selectedSubedition.length > 0) {
        params.set("subedition", selectedSubedition.join(","));
      } else if (!Array.isArray(selectedSubedition) && selectedSubedition !== "All") {
        params.set("subedition", selectedSubedition);
      }
      if (onlySpecial) {
        params.set("specialSerials", "true");
      }

      const url = `https://api.vaultopolis.com/tshot-vault?${params.toString()}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      const json = await resp.json();

      // Enrich vault data with parallel info for display
      const enrichedData = (json.data || []).map((nft) => {
        const effectiveSubId = (nft.subeditionID === null || nft.subeditionID === undefined) ? 0 : nft.subeditionID;
        if (SUBEDITIONS[effectiveSubId]) {
          const sub = SUBEDITIONS[effectiveSubId];
          return {
            ...nft,
            subeditionName: sub.name,
            subeditionMaxMint: sub.minted,
            subeditionIcon: getParallelIconUrl(effectiveSubId),
          };
        }
        return nft;
      });
      setVaultData(enrichedData);
      setQueryTotal(json.total || 0);
      if (page === 1) {
        setSummary(json.summary || null);
        onSummaryUpdate?.(json.summary || null);
      }

      setMaxPages(json.maxPages || 1);
      if (page > (json.maxPages || 1) && (json.maxPages || 1) > 0) {
        setPage(json.maxPages);
      }
    } catch (e) {
      setErrorMsg(e.message || "Fetch failed");
      setVaultData([]);
      setQueryTotal(0);
      setMaxPages(1);
    } finally {
      setLoading((prev) => ({ ...prev, moments: false }));
    }
  }

  /* ---------- EVENT HANDLERS ---------- */
  const handleFilterChange = (setter, value) => {
    setPage(1); // Any filter change should reset to page 1
    setter(value);
  };


  const retryFetch = () => {
    setRetry((r) => r + 1);
    setErrorMsg("");
  };

  const anyLoading = loading.moments || loading.filters;

  /* ---------- RENDER ---------- */
  const VaultBlock = () => {
    return (
      <div className="text-brand-text w-full space-y-2">
        {summary && (
          <div className="bg-brand-secondary p-2 sm:p-3 rounded px-3 sm:px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1">
              <Stat label="Total in vault" value={summary.totalInVault} />
              <Stat label="Common" value={summary.totalCommon} />
              <Stat label="Fandom" value={summary.totalFandom} />
              <Stat label="#1 Mints" value={summary.totalFirstMints} />
              <Stat label="Jersey Matches" value={summary.totalJerseyMatches} />
              <Stat label="Last Mints" value={summary.totalLastMints} />
            </div>
            <p className="italic text-xs text-brand-text/60 mt-2">
              Data refreshes every 10 minutes on the hour.
            </p>
          </div>
        )}

        {errorMsg && !anyLoading && (
          <div className="flex items-center gap-2 bg-red-900/20 p-2 sm:p-3 rounded">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="flex-1 text-red-400">{errorMsg}</p>
            <button
              onClick={retryFetch}
              className="px-2 py-1 bg-brand-secondary rounded hover:opacity-80 flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        )}

        {/* Filters + results container - match Swap dark panel + light results band */}
        <div className="bg-brand-primary rounded pt-1.5 pb-0 px-1 -mx-1">
          <div className="text-brand-text pt-2 pl-3 pr-3 w-full space-y-2">
            {/* Filter Sections */}
            <div className="space-y-2">
              {/* Row 1: Safety Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-xs sm:text-sm mr-1 whitespace-nowrap">
                  Special Filters:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOnlySpecial((v) => !v);
                    setPage(1);
                  }}
                  disabled={loading.moments}
                  className={`
                  inline-flex items-center gap-1.5 rounded-md border text-xs sm:text-sm px-3 py-1.5
                  transition-all shadow-sm whitespace-nowrap flex-shrink-0
                  bg-brand-secondary text-brand-text hover:border-opolis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opolis
                  ${onlySpecial
                    ? 'border-2 border-opolis'
                    : 'border border-brand-border'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                >
                  Show only #1 / Jersey / Last Mint
                </button>
              </div>

              {/* Unified filter row */}
              <div className="pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <MultiSelectFilterPopover
                    label="Series"
                    selectedValues={selectedSeries}
                    options={ALL_SERIES_OPTIONS}
                    placeholder="Search series..."
                    onChange={(values) =>
                      handleFilterChange(setSelectedSeries, values.map(Number))
                    }
                    formatOption={(series) =>
                      getSeriesFilterLabel(Number(series), "topshot")
                    }
                    disabled={loading.moments}
                  />
                  <MultiSelectFilterPopover
                    label="Tier"
                    selectedValues={selectedTiers}
                    options={TIER_OPTIONS.map((t) => t.value)}
                    placeholder="Search tiers..."
                    onChange={(values) => {
                      const next =
                        values.length || !TIER_OPTIONS.length
                          ? values
                          : [TIER_OPTIONS[0].value];
                      setPage(1);
                      setSelectedTiers(next);
                    }}
                    formatOption={(tier) => {
                      const tierObj = TIER_OPTIONS.find(
                        (t) => t.value === tier
                      );
                      return tierObj ? tierObj.label : tier;
                    }}
                    minSelection={1}
                    disabled={loading.moments}
                  />
                  <MultiSelectFilterPopover
                    label="League"
                    selectedValues={
                      Array.isArray(selectedLeague)
                        ? selectedLeague
                        : selectedLeague === "All"
                        ? ["NBA", "WNBA"]
                        : [selectedLeague]
                    }
                    options={["NBA", "WNBA"]}
                    placeholder="Search leagues..."
                    onChange={(values) => {
                      const sanitized = values.length ? values : ["NBA", "WNBA"];
                      handleFilterChange(setSelectedLeague, sanitized);
                    }}
                    minSelection={1}
                    disabled={loading.moments}
                  />
                  <MultiSelectFilterPopover
                    label="Set"
                    selectedValues={
                      Array.isArray(selectedSet)
                        ? selectedSet
                        : selectedSet === "All"
                        ? []
                        : [selectedSet]
                    }
                    options={filterOptions?.allSets || []}
                    placeholder="Search sets..."
                    onChange={(values) =>
                      handleFilterChange(setSelectedSet, values)
                    }
                    formatOption={(setName) => setName}
                    emptyMeansAll={true}
                    disabled={loading.moments || !filterOptions?.allSets}
                  />
                  <MultiSelectFilterPopover
                    label="Team"
                    selectedValues={
                      Array.isArray(selectedTeam)
                        ? selectedTeam
                        : selectedTeam === "All"
                        ? []
                        : [selectedTeam]
                    }
                    options={filterOptions?.allTeams || []}
                    placeholder="Search teams..."
                    onChange={(values) =>
                      handleFilterChange(setSelectedTeam, values)
                    }
                    formatOption={(team) => team}
                    emptyMeansAll={true}
                    disabled={loading.moments || !filterOptions?.allTeams}
                  />
                  <MultiSelectFilterPopover
                    label="Player"
                    selectedValues={
                      Array.isArray(selectedPlayer)
                        ? selectedPlayer
                        : selectedPlayer === "All"
                        ? []
                        : [selectedPlayer]
                    }
                    options={React.useMemo(() => {
                      const players = filterOptions?.allPlayers || [];
                      // Sort alphabetically by formatted name (so "Invalid Value" sorts correctly)
                      return [...players].sort((a, b) => {
                        const formatA = a === "<invalid Value>" ? "Invalid Value" : a;
                        const formatB = b === "<invalid Value>" ? "Invalid Value" : b;
                        return formatA.localeCompare(formatB, undefined, { numeric: true, sensitivity: 'base' });
                      });
                      // eslint-disable-next-line react-hooks/exhaustive-deps
                    }, [filterOptions])}
                    placeholder="Search players..."
                    onChange={(values) =>
                      handleFilterChange(setSelectedPlayer, values)
                    }
                    formatOption={(player) => {
                      if (player === "<invalid Value>") return "Invalid Value";
                      return player;
                    }}
                    emptyMeansAll={true}
                    disabled={loading.moments || !filterOptions?.allPlayers}
                  />
                  <MultiSelectFilterPopover
                    label="Parallel"
                    selectedValues={
                      Array.isArray(selectedSubedition)
                        ? selectedSubedition.map(String)
                        : selectedSubedition === "All"
                        ? []
                        : [String(selectedSubedition)]
                    }
                    options={subeditionOptions}
                    placeholder="Search parallels..."
                    onChange={(values) =>
                      handleFilterChange(setSelectedSubedition, values)
                    }
                    formatOption={(subId) => {
                      if (subId === "All") return "All";
                      const id = Number(subId);
                      const sub = SUBEDITIONS[id];
                      if (!sub) {
                        return `Subedition ${id}`;
                      }
                      // For Standard (id 0), use space prefix to ensure it sorts first (spaces sort before letters)
                      if (id === 0) {
                        return ` ${sub.name}`; // Leading space ensures it sorts first
                      }
                      const minted = sub.minted || 0;
                      return `${sub.name} /${minted}`;
                    }}
                    emptyMeansAll={true}
                    disabled={loading.moments}
                  />
                  {/* Reset Filters - on same row as filters */}
                  <button
                    onClick={() => {
                      setSelectedSeries(ALL_SERIES_OPTIONS);
                      setSelectedTiers(TIER_OPTIONS.map((t) => t.value));
                      setSelectedLeague(["NBA", "WNBA"]);
                      setSelectedSet([]);
                      setSelectedTeam([]);
                      setSelectedPlayer([]);
                      setSelectedSubedition([]);
                      setOnlySpecial(false);
                      setPage(1);
                    }}
                    disabled={loading.moments}
                    className="inline-flex items-center gap-1 rounded bg-brand-primary px-2 py-1.5 text-xs font-medium text-brand-text/80 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-opolis transition h-[28px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={13} />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination + Moments block - match Swap light-grey band (no extra divider line) */}
          <div className="bg-brand-secondary mt-1.5 pt-1.5 pb-1.5 -mx-3">
            {/* Top pagination - "Showing X of Y" on same row as controls */}
            {maxPages > 1 && (
              <div className="flex flex-row justify-between items-center gap-2 sm:gap-3 mb-1.5 px-3">
                {/* "Showing X of Y items" text - hide "Showing" on mobile */}
                {queryTotal > 0 && (
                  <p className="text-sm text-brand-text/70 whitespace-nowrap">
                    <span className="hidden sm:inline">Showing </span>
                    {vaultData.length > 0 ? vaultData.length : PAGE_SIZE} of{" "}
                    {queryTotal.toLocaleString()}
                    <span className="hidden sm:inline"> items</span>
                  </p>
                )}

                {/* Mobile: Simple Prev/Next with compact indicator */}
                <div className="flex items-center gap-2 sm:hidden">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1 || anyLoading}
                    className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-brand-text/70 px-2">
                    {page}/{maxPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === maxPages || anyLoading}
                    className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
                  >
                    Next
                  </button>
                </div>

                {/* Desktop: Full pagination with PageInput */}
                <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1 || anyLoading}
                      className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-sm text-brand-text/70 min-w-[100px] text-center">
                      Page {page} of {maxPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === maxPages || anyLoading}
                      className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="h-[1px] w-8 bg-brand-primary/30" />
                  <PageInput
                    maxPages={maxPages}
                    currentPage={page}
                    onPageChange={setPage}
                    disabled={anyLoading}
                  />
                </div>
              </div>
            )}

            {/* Show skeletons in place of cards during loading to prevent layout shift */}
            <div className="px-3 sm:px-4">
              {loading.moments && vaultData.length > 0 ? (
                // Show skeletons in same positions as existing cards
                <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-1.5 justify-items-center">
                  {vaultData.map((_, i) => (
                    <MomentCardSkeleton key={`skeleton-${i}`} />
                  ))}
                </div>
              ) : loading.moments && vaultData.length === 0 ? (
                // Initial load - show standard skeleton count
                <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-1.5 justify-items-center">
                  {[...Array(20)].map((_, i) => (
                    <MomentCardSkeleton key={`skeleton-${i}`} />
                  ))}
                </div>
              ) : vaultData.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-1.5 justify-items-center">
                  {vaultData.map((nft) => (
                    <MomentCard
                      key={nft.id || nft._id}
                      nft={nft}
                      isVault
                      disableHover
                      flowPricePerNFT={flowPricePerNFT}
                    />
                  ))}
                </div>
              ) : !anyLoading ? (
                <p className="text-sm text-brand-text/70">
                  {selectedSeries.length > 0
                    ? "No moments match your filters."
                    : "Please select at least one series."}
                </p>
              ) : null}
            </div>

            {/* Bottom pagination - "Showing X of Y" on same row as controls */}
            {maxPages > 1 && (
              <div className="flex flex-row justify-between items-center gap-2 sm:gap-3 mt-1.5 px-3">
                {/* "Showing X of Y items" text - hide "Showing" on mobile */}
                {queryTotal > 0 && (
                  <p className="text-sm text-brand-text/70 whitespace-nowrap">
                    <span className="hidden sm:inline">Showing </span>
                    {vaultData.length > 0 ? vaultData.length : PAGE_SIZE} of{" "}
                    {queryTotal.toLocaleString()}
                    <span className="hidden sm:inline"> items</span>
                  </p>
                )}

                {/* Mobile: Simple Prev/Next with compact indicator */}
                <div className="flex items-center gap-2 sm:hidden">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1 || anyLoading}
                    className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-brand-text/70 px-2">
                    {page}/{maxPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === maxPages || anyLoading}
                    className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
                  >
                    Next
                  </button>
                </div>

                {/* Desktop: Full pagination with PageInput */}
                <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1 || anyLoading}
                      className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-sm text-brand-text/70 min-w-[100px] text-center">
                      Page {page} of {maxPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === maxPages || anyLoading}
                      className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="h-[1px] w-8 bg-brand-primary/30" />
                  <PageInput
                    maxPages={maxPages}
                    currentPage={page}
                    onPageChange={setPage}
                    disabled={anyLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="text-brand-text pb-8">
      <Section>
        <VaultBlock />
      </Section>
    </div>
  );
}

export default TSHOTVault;
