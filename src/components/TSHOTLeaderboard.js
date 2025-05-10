import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

/* ——— helpers ——— */
const fmt = (n) =>
  Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(+n || 0);

const SORTS = {
  net: (a, b, dir) => dir * (b.net - a.net),
  deposits: (a, b, dir) => dir * (b.deposits - a.deposits),
  withdrawals: (a, b, dir) => dir * (b.withdrawals - a.withdrawals),
};

const PAGE = 20;

/* ——— uniform section wrapper (no extra pt/mb) ——— */
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

/* ——— component ——— */
function TSHOTLeaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState("net");
  const [sortDir, setSortDir] = useState(1);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  /* fetch */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axios.get(
          "https://api.vaultopolis.com/wallet-leaderboard",
          { params: { limit: 3000 } }
        );
        const items = (data.items || []).map((r) => ({
          addr: r._id,
          deposits: r.NFTToTSHOTSwapCompleted || 0,
          withdrawals: r.TSHOTToNFTSwapCompleted || 0,
          net:
            r.net ??
            (r.NFTToTSHOTSwapCompleted || 0) - (r.TSHOTToNFTSwapCompleted || 0),
        }));
        if (alive) setRows(items);
      } catch {
        if (alive) setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => void (alive = false);
  }, []);

  /* filter / sort / paging */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => r.addr.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => SORTS[sortKey](a, b, sortDir)),
    [filtered, sortKey, sortDir]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const current = sorted.slice((page - 1) * PAGE, page * PAGE);
  useEffect(() => setPage(1), [sortKey, sortDir, query]);

  const toggleSort = (k) => {
    if (k === sortKey) setSortDir((d) => -d);
    else {
      setSortKey(k);
      setSortDir(1);
    }
  };

  /* UI block */
  const TableBlock = () => (
    <>
      {/* ——— disclaimer note ——— */}
      <p className="text-xs text-brand-text/70 text-center sm:text-left mb-2">
        This is an <strong>experimental leaderboard</strong>. There is currently
        no guarantee of incentives or rewards, and it may be modified or removed
        at any time.
      </p>

      <label className="relative block w-full sm:w-60 mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/60"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search address…"
          className="w-full pl-9 pr-3 py-1.5 rounded bg-brand-secondary border border-brand-border text-sm text-center focus:outline-none focus:ring-2 focus:ring-flow-light"
        />
      </label>

      {loading ? (
        <p className="text-brand-text/70 text-center">Loading…</p>
      ) : !current.length ? (
        <p className="italic text-sm text-center">
          No data{query && " for this search"}.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow border border-brand-border">
            <table className="min-w-full table-fixed bg-brand-primary/10 select-none">
              <colgroup>
                <col style={{ width: "40px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "120px" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-brand-border text-center">
                  <th className="py-1">#</th>
                  <th className="py-1 border-r border-brand-border">Address</th>
                  <SortableTh
                    k="deposits"
                    label="Deposits"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onClick={toggleSort}
                    className="border-r border-brand-border"
                  />
                  <SortableTh
                    k="withdrawals"
                    label="Withdrawals"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onClick={toggleSort}
                    className="border-r border-brand-border"
                  />
                  <SortableTh
                    k="net"
                    label="Net"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onClick={toggleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {current.map((r, i) => (
                  <tr
                    key={r.addr}
                    className="border-b border-brand-border/30 text-center text-sm"
                  >
                    <td className="py-1">{(page - 1) * PAGE + i + 1}</td>
                    <td className="py-1 font-mono text-xs border-r border-brand-border">
                      <Link
                        to={`/profile/${r.addr}`}
                        className="hover:underline"
                      >
                        {r.addr}
                      </Link>
                    </td>
                    <td className="py-1 border-r border-brand-border">
                      {fmt(r.deposits)}
                    </td>
                    <td className="py-1 border-r border-brand-border">
                      {fmt(r.withdrawals)}
                    </td>
                    <td className="py-1 font-semibold">{fmt(r.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <Pager page={page} totalPages={totalPages} setPage={setPage} />
          )}
        </>
      )}
    </>
  );

  /* render */
  return (
    <div className="text-brand-text">
      <Section>
        <MobileAccordion title="Leaderboard">
          <TableBlock />
        </MobileAccordion>
      </Section>

      <Section>
        <DesktopSection title="Leaderboard">
          <TableBlock />
        </DesktopSection>
      </Section>
    </div>
  );
}

/* pager */
const Pager = ({ page, totalPages, setPage }) => (
  <div className="flex justify-center mt-4 gap-1">
    {Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) => {
        if (totalPages <= 7) return true;
        if (page <= 4) return p <= 5 || p === totalPages;
        if (page >= totalPages - 3) return p >= totalPages - 4 || p === 1;
        return [1, totalPages, page - 1, page, page + 1].includes(p);
      })
      .map((p) => (
        <button
          key={p}
          disabled={p === page}
          onClick={() => setPage(p)}
          className={`px-3 py-1 rounded ${
            p === page
              ? "bg-flow-dark text-white"
              : "bg-brand-secondary hover:opacity-80"
          }`}
        >
          {p}
        </button>
      ))}
  </div>
);

const SortableTh = ({
  label,
  k,
  sortKey,
  sortDir,
  onClick,
  className = "",
}) => {
  const active = sortKey === k;
  return (
    <th
      onClick={() => onClick(k)}
      className={`py-1 cursor-pointer select-none hover:opacity-80 ${className}`}
    >
      {label}
      {active && (
        <span className="inline-block w-3">{sortDir === 1 ? "▼" : "▲"}</span>
      )}
    </th>
  );
};

export default TSHOTLeaderboard;
