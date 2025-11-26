import React, { useEffect, useState, useContext } from "react";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import MomentCard from "./MomentCard";
import { UserDataContext } from "../context/UserContext";
import { getSeriesFilterLabel } from "../utils/seriesNames";
import { SUBEDITIONS, getParallelIconUrl } from "../utils/subeditions";
import FilterPopover from "./FilterPopover";
import MultiSelectFilterPopover from "./MultiSelectFilterPopover";
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
const PageInput = ({ maxPages, currentPage, onPageChange, disabled }) => {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleSubmit = () => {
    const newPage = parseInt(inputValue, 10);
    if (
      newPage &&
      newPage >= 1 &&
      newPage <= maxPages &&
      newPage !== currentPage
    ) {
      onPageChange(newPage);
    }
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Page #"
          className="w-16 px-2 py-1 rounded bg-brand-primary text-brand-text/80 text-sm"
          disabled={disabled}
        />
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled}
        className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm"
      >
        Go
      </button>
    </div>
  );
};

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
  const [selectedSet, setSelectedSet] = useState("All");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState("All");
  const [selectedSubedition, setSelectedSubedition] = useState("All");
  const [onlySpecial, setOnlySpecial] = useState(false);

  // State to hold all possible filter options, fetched once from the backend
  const [filterOptions, setFilterOptions] = useState(null);
  
  // Get all possible subedition options (all known parallels, not just from current page)
  const subeditionOptions = React.useMemo(() => {
    // Return all known subedition IDs from SUBEDITIONS
    return Object.keys(SUBEDITIONS)
      .map(Number)
      .sort((a, b) => (SUBEDITIONS[b]?.minted ?? 0) - (SUBEDITIONS[a]?.minted ?? 0))
      .map(String);
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

  // Fetch the moments themselves whenever a filter changes
  useEffect(() => {
    if (selectedSeries.length === 0) {
      setVaultData([]);
      setQueryTotal(0);
      return;
    }
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

      // Add all other filters to the query if they are not "All"
      if (Array.isArray(selectedLeague) && selectedLeague.length > 0 && selectedLeague.length < 2) {
        // If only one league selected, send it as a string
        params.set("league", selectedLeague[0]);
      } else if (!Array.isArray(selectedLeague) && selectedLeague !== "All") {
        params.set("league", selectedLeague);
      }
      if (selectedSet !== "All") params.set("setName", selectedSet);
      if (selectedTeam !== "All") params.set("team", selectedTeam);
      if (selectedPlayer !== "All") params.set("player", selectedPlayer);
      if (selectedSubedition !== "All") params.set("subedition", selectedSubedition);
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
  const VaultBlock = () => (
    <div className="bg-brand-primary text-brand-text rounded w-full space-y-2">
      {summary && (
        <div className="bg-brand-secondary p-2 sm:p-3 rounded">
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

      <div className="bg-brand-primary text-brand-text rounded-lg w-full space-y-2">
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
                  px-2.5 py-1.5 rounded-md text-[10px] sm:text-xs font-medium leading-tight
                  transition-all duration-200 whitespace-normal shadow-sm h-[28px]
                  ${onlySpecial
                    ? 'bg-brand-secondary border-2 border-opolis text-opolis'
                    : 'bg-brand-secondary border border-brand-border text-brand-text hover:border-opolis hover:opacity-90'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                Show only #1 / Jersey / Last Mint
              </button>
            </div>

            {/* Unified filter row */}
            <div className="pt-2 border-t border-brand-border/30">
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
                  getCount={() => vaultData.length}
                  disabled={loading.moments}
                />
                <MultiSelectFilterPopover
                  label="Tier"
                  selectedValues={selectedTiers}
                  options={TIER_OPTIONS.map(t => t.value)}
                  placeholder="Search tiers..."
                  onChange={(values) => {
                    const next = values.length || !TIER_OPTIONS.length
                      ? values
                      : [TIER_OPTIONS[0].value];
                    setPage(1);
                    setSelectedTiers(next);
                  }}
                  formatOption={(tier) => {
                    const tierObj = TIER_OPTIONS.find(t => t.value === tier);
                    return tierObj ? tierObj.label : tier;
                  }}
                  getCount={() => vaultData.length}
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
                  getCount={() => vaultData.length}
                  minSelection={1}
                  disabled={loading.moments}
                />
                <FilterPopover
                  label="Set"
                  selectedValue={selectedSet}
                  options={filterOptions?.allSets || []}
                  placeholder="Search sets..."
                  onChange={(value) =>
                    handleFilterChange(setSelectedSet, value)
                  }
                  getCount={() => vaultData.length}
                  disabled={loading.moments || !filterOptions?.allSets}
                />
                <FilterPopover
                  label="Team"
                  selectedValue={selectedTeam}
                  options={filterOptions?.allTeams || []}
                  placeholder="Search teams..."
                  onChange={(value) =>
                    handleFilterChange(setSelectedTeam, value)
                  }
                  getCount={() => vaultData.length}
                  disabled={loading.moments || !filterOptions?.allTeams}
                />
                <FilterPopover
                  label="Player"
                  selectedValue={selectedPlayer}
                  options={filterOptions?.allPlayers || []}
                  placeholder="Search players..."
                  onChange={(value) =>
                    handleFilterChange(setSelectedPlayer, value)
                  }
                  getCount={() => vaultData.length}
                  disabled={loading.moments || !filterOptions?.allPlayers}
                />
                <FilterPopover
                  label="Parallel"
                  selectedValue={selectedSubedition}
                  options={subeditionOptions}
                  placeholder="Search parallels..."
                  onChange={(value) =>
                    handleFilterChange(setSelectedSubedition, value)
                  }
                  formatOption={(subId) => {
                    if (subId === "All") return "All";
                    const id = Number(subId);
                    const sub = SUBEDITIONS[id];
                    if (!sub) {
                      return `Subedition ${id}`;
                    }
                    const minted = sub.minted || 0;
                    return `${sub.name} /${minted}`;
                  }}
                  getCount={() => vaultData.length}
                  disabled={loading.moments}
                />
              </div>
            </div>

            {/* Reset Filters */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border/30">
              <button
                onClick={() => {
                  setSelectedSeries(ALL_SERIES_OPTIONS);
                  setSelectedTiers(TIER_OPTIONS.map(t => t.value));
                  setSelectedLeague(["NBA", "WNBA"]);
                  setSelectedSet("All");
                  setSelectedTeam("All");
                  setSelectedPlayer("All");
                  setSelectedSubedition("All");
                  setOnlySpecial(false);
                  setPage(1);
                }}
                disabled={loading.moments}
                className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-secondary px-3 py-1.5 text-xs sm:text-sm font-medium text-brand-text hover:border-opolis focus-visible:ring-2 focus-visible:ring-opolis transition h-[28px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={13} />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

      {!anyLoading && vaultData.length > 0 && (
        <div className="flex justify-between items-center text-sm text-brand-text/70">
          <p>
            Showing {vaultData.length} of{" "}
            {queryTotal > 0 ? queryTotal.toLocaleString() : "..."} items
          </p>
          {maxPages > 1 && (
            <p>
              Page {page} of {maxPages}
            </p>
          )}
        </div>
      )}

      {loading.moments ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-text/70 mb-4" />
          <p className="text-sm text-brand-text/70">
            {vaultData.length === 0 ? "Loading vault data…" : "Loading moments…"}
          </p>
        </div>
      ) : vaultData.length > 0 ? (
        <>
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
          <div className="flex justify-center items-center gap-3 mt-2 sm:mt-4">
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
        </>
      ) : !anyLoading ? (
        <p className="text-sm text-brand-text/70">
          {selectedSeries.length > 0
            ? "No moments match your filters."
            : "Please select at least one series."}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="text-brand-text">
      <Section>
        <VaultBlock />
      </Section>
    </div>
  );
}

export default TSHOTVault;
