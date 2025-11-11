import React, { useEffect, useState, useContext } from "react";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import MomentCard, { tierStyles } from "./MomentCard";
import { UserDataContext } from "../context/UserContext";
import { getSeriesFilterLabel } from "../utils/seriesNames";
import { SUBEDITIONS, getParallelIconUrl } from "../utils/subeditions";

/* ---------- constants ---------- */
const TIER_OPTIONS = [
  { label: "Common", value: "common" },
  { label: "Fandom", value: "fandom" },
];
const ALL_SERIES_OPTIONS = [0, 2, 3, 4, 5, 6, 7, 8];
const PAGE_SIZE = 50;

/* ---------- layout wrappers (unchanged) ---------- */
const Section = ({ children }) => (
  <section className="px-2 md:px-3">{children}</section>
);

/* ---------- stat tile (unchanged) ---------- */
const Stat = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="opacity-70">{label}</span>
    <span className="font-semibold">{value?.toLocaleString?.() ?? "--"}</span>
  </div>
);

/* ---------- reusable dropdown (unchanged) ---------- */
const Dropdown = ({ opts, value, onChange, title, width = "w-40" }) => (
  <select
    value={value}
    onChange={onChange}
    disabled={!opts}
    title={title}
    className={`${width} bg-brand-primary text-brand-text rounded px-1 py-0.5 disabled:opacity-40 text-xs`}
  >
    <option value="All">All ({opts?.length ?? 0})</option>
    {opts?.map((o) => (
      <option key={o} value={o}>
        {o}
      </option>
    ))}
  </select>
);

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
  const [selectedLeague, setSelectedLeague] = useState("All");
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
      if (selectedLeague !== "All") params.set("league", selectedLeague);
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

  const toggleArrayFilter = (setter, fullOptionsArray, value) => {
    setPage(1);
    setter((prev) => {
      const isAllSelected = prev.length === fullOptionsArray.length;
      const isValueSelected = prev.includes(value);
      
      if (isAllSelected) {
        // "All" is selected: uncheck "All" and select just this value
        return [value];
      } else if (isValueSelected) {
        // Deselecting this value
        const next = prev.filter((x) => x !== value);
        // If nothing left, select all
        return next.length === 0 ? fullOptionsArray : next;
      } else {
        // Selecting this value
        const next = [...prev, value];
        // If all selected, return full array
        return next.length === fullOptionsArray.length ? fullOptionsArray : next;
      }
    });
  };

  const retryFetch = () => {
    setRetry((r) => r + 1);
    setErrorMsg("");
  };

  const anyLoading = loading.moments || loading.filters;

  /* ---------- RENDER ---------- */
  const VaultBlock = () => (
    <div className="bg-brand-primary text-brand-text p-2 rounded w-full">
      {summary && (
        <div className="bg-brand-secondary p-3 rounded mb-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1">
            <Stat label="Total in vault" value={summary.totalInVault} />
            <Stat label="Common" value={summary.totalCommon} />
            <Stat label="Fandom" value={summary.totalFandom} />
            <Stat label="#1 Mints" value={summary.totalFirstMints} />
            <Stat label="Jersey Matches" value={summary.totalJerseyMatches} />
            <Stat label="Last Mints" value={summary.totalLastMints} />
            <Stat label={getSeriesFilterLabel(0, 'topshot')} value={summary.totalSeries0} />
          </div>
          <p className="italic text-xs text-brand-text/60 mt-2">
            Data refreshes every 10 minutes on the hour.
          </p>
        </div>
      )}

      {errorMsg && !anyLoading && (
        <div className="flex items-center gap-2 bg-red-900/20 p-3 rounded mb-3">
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

      <div className="flex flex-col gap-3 text-sm bg-brand-secondary p-2 rounded mb-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Tiers:</span>
            {TIER_OPTIONS.map((t) => (
              <label key={t.value} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedTiers.includes(t.value)}
                  onChange={() =>
                    toggleArrayFilter(
                      setSelectedTiers,
                      TIER_OPTIONS.map((opt) => opt.value),
                      t.value
                    )
                  }
                />
                <span className={tierStyles[t.value]}>{t.label}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">Series:</span>
            <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedSeries.length === ALL_SERIES_OPTIONS.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Check "All" - select all series
                      handleFilterChange(setSelectedSeries, ALL_SERIES_OPTIONS);
                    } else {
                      // Uncheck "All" - but prevent deselecting all, so select just the first series
                      if (ALL_SERIES_OPTIONS.length > 0) {
                        handleFilterChange(setSelectedSeries, [ALL_SERIES_OPTIONS[0]]);
                      }
                    }
                  }}
                  disabled={loading.moments}
                />
                All
              </label>
              {ALL_SERIES_OPTIONS.map((s) => {
                const isAllSelected = selectedSeries.length === ALL_SERIES_OPTIONS.length;
                const isSeriesSelected = selectedSeries.includes(s);
                // When "All" is selected, show individual boxes as unchecked (visual state)
                const visualChecked = isAllSelected ? false : isSeriesSelected;
                
                return (
                  <label key={s} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={visualChecked}
                      onChange={() =>
                        toggleArrayFilter(setSelectedSeries, ALL_SERIES_OPTIONS, s)
                      }
                      disabled={loading.moments}
                    />
                    {getSeriesFilterLabel(s, 'topshot')}
                  </label>
                );
              })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-brand-primary">
          <div className="flex items-center gap-2">
            <span className="font-semibold">League:</span>
            <Dropdown
              opts={filterOptions?.allLeagues}
              value={selectedLeague}
              onChange={(e) =>
                handleFilterChange(setSelectedLeague, e.target.value)
              }
              title="Filter by league"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Set:</span>
            <Dropdown
              opts={filterOptions?.allSets}
              value={selectedSet}
              onChange={(e) =>
                handleFilterChange(setSelectedSet, e.target.value)
              }
              title="Filter by set"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Team:</span>
            <Dropdown
              opts={filterOptions?.allTeams}
              value={selectedTeam}
              onChange={(e) =>
                handleFilterChange(setSelectedTeam, e.target.value)
              }
              title="Filter by team"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Player:</span>
            <Dropdown
              opts={filterOptions?.allPlayers}
              value={selectedPlayer}
              onChange={(e) =>
                handleFilterChange(setSelectedPlayer, e.target.value)
              }
              title="Filter by player"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Parallel:</span>
            <select
                value={selectedSubedition}
                onChange={(e) =>
                  handleFilterChange(setSelectedSubedition, e.target.value)
                }
              className="w-40 bg-brand-primary text-brand-text rounded px-1 py-0.5 disabled:opacity-40 text-xs"
              title="Filter by parallel/subedition"
              disabled={loading.moments}
            >
                <option value="All">All</option>
                {subeditionOptions.map((subId) => {
                  const id = Number(subId);
                  const sub = SUBEDITIONS[id];
                  if (!sub) {
                    return (
                      <option key={subId} value={subId}>
                        Subedition {id}
                      </option>
                    );
                  }
                  const minted = sub.minted || 0;
                  return (
                    <option key={subId} value={subId}>
                      {sub.name} /{minted}
                    </option>
                  );
                })}
              </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-brand-primary">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={onlySpecial}
              onChange={() => {
                setOnlySpecial((v) => !v);
                setPage(1);
              }}
            />
            <span>#1 / Jersey / Last Mint</span>
          </label>
        </div>
      </div>

      {!anyLoading && vaultData.length > 0 && (
        <div className="flex justify-between items-center mb-2 text-sm text-brand-text/70">
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
        <div className="flex flex-col items-center justify-center py-12">
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
          <div className="flex justify-center items-center gap-3 mt-4">
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
