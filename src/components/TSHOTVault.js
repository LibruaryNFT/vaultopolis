import React, { useEffect, useState } from "react";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import MomentCard, { tierStyles } from "./MomentCard";

// Hard-coded tiers
const TIER_OPTIONS = [
  { label: "Common", value: "common" },
  { label: "Fandom", value: "fandom" },
];

// Hard-coded series
const ALL_SERIES_OPTIONS = [0, 2, 3, 4, 5, 6, 7];

function TSHOTVault() {
  // ---------- Data from server ----------
  const [vaultData, setVaultData] = useState([]); // items for the current page
  const [totalCount, setTotalCount] = useState(0); // total matching docs
  const [summary, setSummary] = useState(null); // entire vault summary

  // ---------- Loading & error ----------
  const [loadingVault, setLoadingVault] = useState(false);
  const [vaultError, setVaultError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // ---------- Filter states ----------
  const [selectedTiers, setSelectedTiers] = useState(
    TIER_OPTIONS.map((t) => t.value)
  );
  const [selectedSeries, setSelectedSeries] = useState(ALL_SERIES_OPTIONS);
  const [onlySpecialSerials, setOnlySpecialSerials] = useState(false);

  // ---------- Pagination ----------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [maxPages, setMaxPages] = useState(1);

  // --------------------------------------------------
  // 1) Fetch vault data whenever filters or page changes
  // --------------------------------------------------
  useEffect(() => {
    if (selectedSeries.length === 0) {
      // No series selected => no results
      setVaultData([]);
      setTotalCount(0);
      setLoadingVault(false);
      setVaultError("");
      setMaxPages(1);
      return;
    }

    fetchVaultPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedTiers,
    selectedSeries,
    onlySpecialSerials,
    currentPage,
    retryCount,
  ]);

  async function fetchVaultPage() {
    try {
      setLoadingVault(true);
      setVaultError("");

      // Build query string
      const params = new URLSearchParams();
      if (selectedTiers.length > 0) {
        params.set("tier", selectedTiers.join(","));
      }
      if (selectedSeries.length > 0) {
        params.set("series", selectedSeries.join(","));
      }
      if (onlySpecialSerials) {
        params.set("specialSerials", "true");
      }
      params.set("page", currentPage);
      params.set("pageSize", itemsPerPage);

      const url = `https://api.vaultopolis.com/tshot-vault?${params.toString()}`;
      console.log("Fetching:", url);

      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Vault fetch error: ${resp.status}`);
      }

      const json = await resp.json();

      // Set states from response
      setVaultData(json.data || []);
      setTotalCount(json.total || 0);

      // If the server includes a "summary" object, capture it
      if (json.summary) {
        setSummary(json.summary);
      }

      // Calculate max pages
      const newMax =
        Math.ceil((json.total || 0) / (json.pageSize || itemsPerPage)) || 1;
      setMaxPages(newMax);

      // In case server overrides the page
      if (json.page && json.page !== currentPage) {
        setCurrentPage(json.page);
      }
    } catch (err) {
      console.error("TSHOTVault error:", err);
      setVaultError(err.message || "Failed to fetch vault data");
      setVaultData([]);
      setTotalCount(0);
      setSummary(null);
      setMaxPages(1);
    } finally {
      setLoadingVault(false);
    }
  }

  // --------------------------------------------------
  // 2) Prevent going past max pages
  // --------------------------------------------------
  useEffect(() => {
    if (currentPage > maxPages && maxPages > 0) {
      setCurrentPage(maxPages);
    }
  }, [maxPages, currentPage]);

  // --------------------------------------------------
  // 3) Page navigation (just Prev/Next)
  // --------------------------------------------------
  function goToPage(pageNum) {
    const page = Math.max(1, Math.min(pageNum, maxPages));
    setCurrentPage(page);
  }

  // --------------------------------------------------
  // 4) Render simpler pagination controls
  // --------------------------------------------------
  function renderPaginationControls() {
    if (maxPages <= 1) return null;

    return (
      <div className="flex justify-center gap-3 mt-4">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-brand-text/80">
          Page {currentPage} of {maxPages}
        </span>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === maxPages}
          className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // 5) Filter toggle handlers
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

  function retryFetch() {
    setRetryCount((prev) => prev + 1);
  }

  // --------------------------------------------------
  // 6) Main render
  // --------------------------------------------------
  return (
    <div className="bg-brand-primary text-brand-text p-3 rounded-lg">
      <h3 className="text-lg font-bold mb-2">TSHOT Vault</h3>

      {/* Optional: Display a vault-level summary if available */}
      {summary && (
        <div className="bg-brand-secondary p-2 rounded mb-3 text-sm">
          <p className="mb-1 text-brand-text/80 font-semibold">
            Overall Vault Summary
          </p>
          <p>Total in vault: {summary.totalInVault?.toLocaleString()}</p>
          <p>Common: {summary.totalCommon?.toLocaleString()}</p>
          <p>Fandom: {summary.totalFandom?.toLocaleString()}</p>
          <p>#1 Mints: {summary.totalFirstMints?.toLocaleString()}</p>
          <p>Jersey Matches: {summary.totalJerseyMatches?.toLocaleString()}</p>
          <p>Last Mints: {summary.totalLastMints?.toLocaleString()}</p>
          <p>Series 0: {summary.totalSeries0?.toLocaleString()}</p>
        </div>
      )}

      {/* Loading & Error */}
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

      {/* FILTER UI */}
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

      {/* Main Results */}
      {selectedSeries.length === 0 ? (
        <p className="text-sm text-brand-text/70">
          Please select at least one series to view results.
        </p>
      ) : !loadingVault && !vaultError ? (
        <>
          {/* Show how many found + which page */}
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-brand-text/70">
              Showing {vaultData.length} of {totalCount.toLocaleString()} items
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
                  <MomentCard
                    key={nft.id || nft._id}
                    nft={nft}
                    isVault
                    disableHover
                  />
                ))}
              </div>
              {renderPaginationControls()}
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
