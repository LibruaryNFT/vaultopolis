import React, { useEffect, useState } from "react";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import MomentCard, { tierStyles } from "./MomentCard";

/* ---------- constants ---------- */
const TIER_OPTIONS = [
  { label: "Common", value: "common" },
  { label: "Fandom", value: "fandom" },
];
const ALL_SERIES_OPTIONS = [0, 2, 3, 4, 5, 6, 7];
const PAGE_SIZE = 50;

/* ---------- layout wrappers ---------- */
const Section = ({ children }) => (
  <section className="px-2 md:px-3">{children}</section>
);

const MobileAccordion = ({ title, children }) => (
  <details className="md:hidden group border border-brand-border rounded">
    <summary className="cursor-pointer select-none flex items-center justify-between bg-brand-primary px-2 py-1 font-semibold text-base text-brand-text rounded">
      {title}
      <span className="transition-transform group-open:rotate-180">▼</span>
    </summary>
    <div className="mt-2">{children}</div>
  </details>
);

const DesktopSection = ({ title, children }) => (
  <div className="hidden md:block">
    <div className="max-w-6xl mx-auto grid md:grid-cols-[160px_1fr] gap-2">
      <div className="text-right mt-[0.75rem]">
        <span className="inline-block bg-brand-primary text-brand-text px-2 py-1 rounded">
          {title}
        </span>
      </div>
      <div>{children}</div>
    </div>
  </div>
);

/* ---------- stat tile ---------- */
const Stat = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="opacity-70">{label}</span>
    <span className="font-semibold">{value?.toLocaleString?.() ?? "--"}</span>
  </div>
);

/* ---------- main component ---------- */
function TSHOTVault() {
  /* server / ui state */
  const [vaultData, setVaultData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [retry, setRetry] = useState(0);

  /* filters & paging */
  const [selectedTiers, setSelectedTiers] = useState(
    TIER_OPTIONS.map((t) => t.value)
  );
  const [selectedSeries, setSelectedSeries] = useState(ALL_SERIES_OPTIONS);
  const [onlySpecial, setOnlySpecial] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);

  /* ---------- fetch ---------- */
  useEffect(() => {
    if (!selectedSeries.length) {
      setVaultData([]);
      setTotalCount(0);
      setSummary(null);
      setMaxPages(1);
      return;
    }
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTiers, selectedSeries, onlySpecial, page, retry]);

  async function fetchPage() {
    try {
      setLoading(true);
      setErrorMsg("");

      const params = new URLSearchParams();
      params.set("tier", selectedTiers.join(","));
      params.set("series", selectedSeries.join(","));
      if (onlySpecial) params.set("specialSerials", "true");
      params.set("page", page);
      params.set("pageSize", PAGE_SIZE);

      const url = `https://api.vaultopolis.com/tshot-vault?${params.toString()}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      const json = await resp.json();

      setVaultData(json.data || []);
      setTotalCount(json.total || 0);
      setSummary(json.summary || null);

      const m = Math.max(1, Math.ceil((json.total || 0) / PAGE_SIZE));
      setMaxPages(m);
      if (json.page && json.page !== page) setPage(json.page);
    } catch (e) {
      setErrorMsg(e.message || "Fetch failed");
      setVaultData([]);
      setTotalCount(0);
      setSummary(null);
      setMaxPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (page > maxPages) setPage(maxPages);
  }, [maxPages, page]);

  /* ---------- helpers ---------- */
  const toggleTier = (v) =>
    setSelectedTiers((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  const toggleSeries = (v) =>
    setSelectedSeries((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  const setAllSeries = (c) => setSelectedSeries(c ? ALL_SERIES_OPTIONS : []);
  const retryFetch = () => setRetry((r) => r + 1);

  const Pager = () =>
    maxPages > 1 && (
      <div className="flex justify-center gap-3 mt-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-brand-text/70">
          Page {page} of {maxPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === maxPages}
          className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );

  /* ---------- block ---------- */
  const VaultBlock = () => (
    <div className="bg-brand-primary text-brand-text p-3 rounded-lg">
      {/* SUMMARY */}
      {summary && (
        <div className="bg-brand-secondary p-3 rounded mb-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1">
            <Stat label="Total in vault" value={summary.totalInVault} />
            <Stat label="Common" value={summary.totalCommon} />
            <Stat label="Fandom" value={summary.totalFandom} />
            <Stat label="#1 Mints" value={summary.totalFirstMints} />
            <Stat label="Jersey Matches" value={summary.totalJerseyMatches} />
            <Stat label="Last Mints" value={summary.totalLastMints} />
            <Stat label="Series 0" value={summary.totalSeries0} />
          </div>
          <p className="italic text-xs text-brand-text/60 mt-2">
            Data refreshes every&nbsp;4&nbsp;hours.
          </p>
        </div>
      )}

      {/* LOADER / ERROR */}
      {loading && (
        <div className="flex items-center gap-2 mb-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-sm text-brand-text/70">Loading vault data…</p>
        </div>
      )}
      {errorMsg && (
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

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-4 text-sm bg-brand-secondary p-2 rounded mb-2">
        {/* tiers */}
        <div className="flex items-center gap-2">
          <span className="font-semibold">Tiers:</span>
          {TIER_OPTIONS.map((t) => (
            <label key={t.value} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedTiers.includes(t.value)}
                onChange={() => {
                  toggleTier(t.value);
                  setPage(1);
                }}
              />
              <span className={tierStyles[t.value]}>{t.label}</span>
            </label>
          ))}
        </div>

        {/* series */}
        <div className="flex items-center gap-2">
          <span className="font-semibold">Series:</span>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={selectedSeries.length === ALL_SERIES_OPTIONS.length}
              onChange={(e) => {
                setAllSeries(e.target.checked);
                setPage(1);
              }}
            />
            All
          </label>
          {ALL_SERIES_OPTIONS.map((s) => (
            <label key={s} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedSeries.includes(s)}
                onChange={() => {
                  toggleSeries(s);
                  setPage(1);
                }}
              />
              {s}
            </label>
          ))}
        </div>

        {/* special */}
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

      {/* META */}
      {!loading && !errorMsg && (
        <div className="flex justify-between items-center mb-2 text-sm text-brand-text/70">
          <p>
            Showing {vaultData.length} of {totalCount.toLocaleString()} items
          </p>
          {maxPages > 1 && (
            <p>
              Page {page} of {maxPages}
            </p>
          )}
        </div>
      )}

      {/* CARDS */}
      {selectedSeries.length === 0 ? (
        <p className="text-sm text-brand-text/70">
          Please select at least one series.
        </p>
      ) : vaultData.length ? (
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
          <Pager />
        </>
      ) : !loading && !errorMsg ? (
        <p className="text-sm text-brand-text/70">
          No moments match your filters.
        </p>
      ) : null}
    </div>
  );

  /* ---------- render ---------- */
  return (
    <div className="text-brand-text">
      <Section>
        <MobileAccordion title="Vault">
          <VaultBlock />
        </MobileAccordion>
      </Section>

      <Section>
        <DesktopSection title="Vault">
          <VaultBlock />
        </DesktopSection>
      </Section>
    </div>
  );
}

export default TSHOTVault;
