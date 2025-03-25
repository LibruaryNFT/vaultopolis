import React, { useEffect, useState } from "react";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import MomentCard, { tierStyles } from "./MomentCard";

// Hard-coded tiers: show "Common" & "Fandom" in the UI, send them lowercase to the server
const TIER_OPTIONS = [
  { label: "Common", value: "common" },
  { label: "Fandom", value: "fandom" },
];

// Hard-coded series
const ALL_SERIES_OPTIONS = [0, 2, 3, 4, 5, 6, 7];

function TSHOTVault() {
  // ---------- Data from server ----------
  const [vaultData, setVaultData] = useState([]); // items for the current page
  const [totalCount, setTotalCount] = useState(0); // total matching docs in DB

  // ---------- Loading & error ----------
  const [loadingVault, setLoadingVault] = useState(false);
  const [filterError, setFilterError] = useState(false);
  const [vaultError, setVaultError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // ---------- Filter states ----------
  const [selectedTiers, setSelectedTiers] = useState(
    TIER_OPTIONS.map((t) => t.value) // by default: ["common","fandom"]
  );
  const [selectedSeries, setSelectedSeries] = useState(ALL_SERIES_OPTIONS);

  // If user checks "special serials," we pass specialSerials=true to server
  const [onlySpecialSerials, setOnlySpecialSerials] = useState(false);

  // ---------- Dynamic filters (optional) ----------
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [sets, setSets] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedSet, setSelectedSet] = useState("");

  // ---------- Pagination ----------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [maxPages, setMaxPages] = useState(1);

  // --------------------------------------------------
  // 1) Fetch dynamic filters once on component mount
  // --------------------------------------------------
  useEffect(() => {
    async function fetchFilters() {
      try {
        const resp = await fetch(
          "https://api.vaultopolis.com/tshot-vault/filters"
        );

        if (!resp.ok) {
          // If filters fail, we can still use the vault with basic filters
          setFilterError(true);
          console.error("Failed to load filters:", resp.status);
          return;
        }

        const data = await resp.json();

        // Only set filters if we have arrays returned
        if (Array.isArray(data.allPlayers)) {
          setPlayers(data.allPlayers);
        }

        if (Array.isArray(data.allTeams)) {
          setTeams(data.allTeams);
        }

        if (Array.isArray(data.allSets)) {
          setSets(data.allSets);
        }

        setFilterError(false);
      } catch (err) {
        console.error("Error fetching filters:", err);
        setFilterError(true);
      }
    }

    fetchFilters();
  }, []);

  // --------------------------------------------------
  // 2) Fetch vault data whenever filters or page changes
  // --------------------------------------------------
  useEffect(() => {
    // If user unchecks all series => no results
    if (selectedSeries.length === 0) {
      setVaultData([]);
      setTotalCount(0);
      setLoadingVault(false);
      setVaultError("");
      return;
    }

    fetchVaultPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedTiers,
    selectedSeries,
    onlySpecialSerials,
    currentPage,
    selectedPlayer,
    selectedTeam,
    selectedSet,
    retryCount,
  ]);

  // Main data fetching function
  async function fetchVaultPage() {
    try {
      setLoadingVault(true);
      setVaultError("");

      // Build query string
      const params = new URLSearchParams();

      // Tiers => e.g. tier=common,fandom
      if (selectedTiers.length > 0) {
        params.set("tier", selectedTiers.join(","));
      }

      // Series => e.g. series=0,2,3,4,5,6,7
      if (selectedSeries.length > 0) {
        params.set("series", selectedSeries.join(","));
      }

      // Additional filters (only if selected)
      if (selectedPlayer) {
        params.set("player", selectedPlayer);
      }

      if (selectedTeam) {
        params.set("team", selectedTeam);
      }

      if (selectedSet && selectedSet !== "all") {
        params.set("setName", selectedSet);
      }

      // specialSerials => pass if user checked
      if (onlySpecialSerials) {
        params.set("specialSerials", "true");
      }

      // Pagination
      params.set("page", currentPage);
      params.set("pageSize", itemsPerPage);

      console.log(
        "Fetching:",
        `https://api.vaultopolis.com/tshot-vault?${params.toString()}`
      );
      const resp = await fetch(
        `https://api.vaultopolis.com/tshot-vault?${params.toString()}`
      );

      if (!resp.ok) {
        throw new Error(`Vault fetch error: ${resp.status}`);
      }

      const json = await resp.json();

      setTotalCount(json.total || 0);
      setVaultData(json.data || []);

      // Calculate max pages based on total
      const newMax =
        Math.ceil((json.total || 0) / (json.pageSize || itemsPerPage)) || 1;
      setMaxPages(newMax);

      // If server returned a page number and it's different, update our state
      if (json.page && json.page !== currentPage) {
        setCurrentPage(json.page);
      }
    } catch (err) {
      console.error("TSHOTVault error:", err);
      setVaultError(err.message || "Failed to fetch vault data");
      setVaultData([]);
      setTotalCount(0);
    } finally {
      setLoadingVault(false);
    }
  }

  // --------------------------------------------------
  // 3) Prevent going past max pages
  // --------------------------------------------------
  useEffect(() => {
    if (currentPage > maxPages && maxPages > 0) {
      setCurrentPage(maxPages);
    }
  }, [maxPages, currentPage]);

  // --------------------------------------------------
  // 4) Helper to handle page navigation
  // --------------------------------------------------
  function goToPage(pageNum) {
    // Ensure we stay in valid range and convert to number
    const page = Math.max(1, Math.min(parseInt(pageNum, 10) || 1, maxPages));
    setCurrentPage(page);
  }

  // --------------------------------------------------
  // 5) Render pagination controls
  // --------------------------------------------------
  function renderPaginationButtons() {
    if (maxPages <= 1) return null;

    // Create an array of visible page numbers
    const pages = [];

    if (maxPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= maxPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 4) {
      // Near start: show first 5, ellipsis, last
      pages.push(1, 2, 3, 4, 5, "...", maxPages);
    } else if (currentPage >= maxPages - 3) {
      // Near end: show first, ellipsis, last 5
      pages.push(
        1,
        "...",
        maxPages - 4,
        maxPages - 3,
        maxPages - 2,
        maxPages - 1,
        maxPages
      );
    } else {
      // Middle: show first, ellipsis, current-1, current, current+1, ellipsis, last
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        maxPages
      );
    }

    return (
      <div className="flex flex-wrap justify-center mt-4 gap-2">
        {/* First & Previous buttons */}
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
        >
          First
        </button>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
        >
          Prev
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) => (
          <button
            key={`page-${idx}`}
            onClick={() => p !== "..." && goToPage(p)}
            className={`px-3 py-1 rounded ${
              p === currentPage
                ? "bg-brand-secondary text-brand-text"
                : "bg-brand-primary text-brand-text/80"
            } ${p === "..." ? "pointer-events-none" : "hover:opacity-80"}`}
          >
            {p}
          </button>
        ))}

        {/* Next & Last buttons */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === maxPages}
          className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
        >
          Next
        </button>
        <button
          onClick={() => goToPage(maxPages)}
          disabled={currentPage === maxPages}
          className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
        >
          Last
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // 6) Filter toggle handlers
  // --------------------------------------------------
  function toggleTier(tierVal) {
    setSelectedTiers((prev) =>
      prev.includes(tierVal)
        ? prev.filter((t) => t !== tierVal)
        : [...prev, tierVal]
    );
    setCurrentPage(1);
  }

  function toggleSeries(val) {
    setSelectedSeries((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
    setCurrentPage(1);
  }

  function handleAllSeriesToggle(checked) {
    if (checked) {
      setSelectedSeries(ALL_SERIES_OPTIONS);
    } else {
      setSelectedSeries([]);
    }
    setCurrentPage(1);
  }

  function handlePlayerChange(e) {
    setSelectedPlayer(e.target.value);
    setCurrentPage(1);
  }

  function handleTeamChange(e) {
    setSelectedTeam(e.target.value);
    setCurrentPage(1);
  }

  function handleSetChange(e) {
    setSelectedSet(e.target.value);
    setCurrentPage(1);
  }

  function retryFetch() {
    setRetryCount((prev) => prev + 1);
  }

  // --------------------------------------------------
  // 7) Main render
  // --------------------------------------------------
  return (
    <div className="bg-brand-primary text-brand-text p-3 rounded-lg">
      <h3 className="text-lg font-bold mb-2">TSHOT Vault</h3>

      {loadingVault && selectedSeries.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-sm text-brand-text/70">Loading vault data...</p>
        </div>
      )}

      {vaultError && (
        <div className="flex items-center gap-2 bg-red-900/20 p-3 rounded mb-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-red-400 flex-1">{vaultError}</p>
          <button
            onClick={retryFetch}
            className="px-2 py-1 bg-brand-secondary rounded hover:opacity-80 flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {/* FILTER UI - Basic Filters */}
      <div className="flex flex-wrap items-center gap-4 text-sm bg-brand-secondary p-2 rounded mb-2">
        {/* Tiers */}
        <div className="flex items-center gap-2">
          <span className="font-semibold">Tiers:</span>
          {TIER_OPTIONS.map((opt) => {
            const checked = selectedTiers.includes(opt.value);
            const textClass = tierStyles[opt.value] || "text-brand-text";
            return (
              <label key={opt.value} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTier(opt.value)}
                />
                <span className={textClass}>{opt.label}</span>
              </label>
            );
          })}
        </div>

        {/* Series */}
        <div className="flex items-center gap-2">
          <span className="font-semibold">Series:</span>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={selectedSeries.length === ALL_SERIES_OPTIONS.length}
              onChange={(e) => handleAllSeriesToggle(e.target.checked)}
            />
            All
          </label>
          {ALL_SERIES_OPTIONS.map((val) => (
            <label key={val} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedSeries.includes(val)}
                onChange={() => toggleSeries(val)}
              />
              {val}
            </label>
          ))}
        </div>

        {/* Special Serials */}
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={onlySpecialSerials}
            onChange={() => {
              setOnlySpecialSerials((prev) => !prev);
              setCurrentPage(1);
            }}
          />
          <span>#1 / Jersey / Last Mint</span>
        </label>
      </div>

      {/* Advanced filters - only show if we have data */}
      {(players.length > 0 || teams.length > 0 || sets.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
          {/* Player filter */}
          {players.length > 0 && (
            <div>
              <label className="block text-sm mb-1">Player:</label>
              <select
                value={selectedPlayer}
                onChange={handlePlayerChange}
                className="w-full bg-brand-secondary text-brand-text p-2 rounded"
              >
                <option value="">All Players</option>
                {players.map((player) => (
                  <option key={player} value={player}>
                    {player}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Team filter */}
          {teams.length > 0 && (
            <div>
              <label className="block text-sm mb-1">Team:</label>
              <select
                value={selectedTeam}
                onChange={handleTeamChange}
                className="w-full bg-brand-secondary text-brand-text p-2 rounded"
              >
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Set filter */}
          {sets.length > 0 && (
            <div>
              <label className="block text-sm mb-1">Set:</label>
              <select
                value={selectedSet}
                onChange={handleSetChange}
                className="w-full bg-brand-secondary text-brand-text p-2 rounded"
              >
                <option value="">All Sets</option>
                {sets.map((set) => (
                  <option key={set} value={set}>
                    {set}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Results display */}
      {selectedSeries.length === 0 ? (
        <p className="text-sm text-brand-text/70">
          Please select at least one series to view results.
        </p>
      ) : !loadingVault && !vaultError ? (
        <>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-brand-text/70">
              Showing {vaultData.length} of {totalCount.toLocaleString()} total
              items
            </p>
            {maxPages > 1 && (
              <p className="text-sm text-brand-text/70">
                Page {currentPage} of {maxPages}
              </p>
            )}
          </div>

          {vaultData.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                {vaultData.map((nft) => (
                  <MomentCard key={nft.id || nft._id} nft={nft} isVault />
                ))}
              </div>
              {renderPaginationButtons()}
            </>
          ) : (
            <p className="text-sm text-brand-text/70">
              No moments match your filters.
            </p>
          )}
        </>
      ) : null}
    </div>
  );
}

export default TSHOTVault;
