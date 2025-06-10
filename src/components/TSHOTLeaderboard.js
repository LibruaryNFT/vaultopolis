import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

// Import your single COA Cadence script
// Path relative from src/components/TSHOTLeaderboard.js to src/flow/getCOA.js
import { getCOA } from "../flow/getCOA.js";

/* ——— helpers ——— */
const fmt = (n) =>
  Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(+n || 0);

// Helper to convert byte array to hex string
function bytesToHex(bytes) {
  if (!bytes || !Array.isArray(bytes)) return null;
  return "0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
  const [loadingCOAs, setLoadingCOAs] = useState(false);
  const [sortKey, setSortKey] = useState("net");
  const [sortDir, setSortDir] = useState(1);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const fetchLeaderboardData = async () => {
      try {
        const { data } = await axios.get(
          "https://api.vaultopolis.com/wallet-leaderboard",
          { params: { limit: 3000 } } // Fetching all users upfront
        );
        const initialItems = (data.items || []).map((r) => ({
          addr: r._id,
          deposits: r.NFTToTSHOTSwapCompleted || 0,
          withdrawals: r.TSHOTToNFTSwapCompleted || 0,
          net:
            r.net ??
            (r.NFTToTSHOTSwapCompleted || 0) - (r.TSHOTToNFTSwapCompleted || 0),
          coaAddr: "Loading...", // Placeholder for COA
        }));

        if (alive) {
          setRows(initialItems); // Set initial rows, COAs will be fetched next
          if (initialItems.length > 0) {
            fetchCOAsForItems(initialItems);
          } else {
            setLoading(false); // No items, so main loading is done
          }
        }
      } catch (apiError) {
        console.error("Error fetching leaderboard data:", apiError);
        if (alive) {
          setRows([]);
          setLoading(false);
        }
      }
    };

    const fetchCOAsForItems = async (currentItems) => {
      if (!alive) return;
      setLoadingCOAs(true);

      // Create an array of promises, one for each item to fetch its COA
      const coaPromises = currentItems.map(async (item) => {
        if (!item.addr) {
          return { ...item, coaAddr: "N/A" }; // Skip if address is invalid
        }
        try {
          // Call the single getCOA script for each address
          const evmAddressResult = await fcl.query({
            cadence: getCOA, // Use the imported single getCOA script
            args: (arg) => [arg(item.addr, t.Address)],
          });

          let displayCoaAddr = "N/A";
          // The script returns EVM.EVMAddress which is an object with a 'bytes' field
          if (
            evmAddressResult &&
            typeof evmAddressResult === "object" &&
            evmAddressResult.bytes &&
            Array.isArray(evmAddressResult.bytes)
          ) {
            const hexAddr = bytesToHex(evmAddressResult.bytes);
            displayCoaAddr = hexAddr || "N/A";
          } else if (evmAddressResult) {
            console.warn(
              `Unexpected COA result format for ${item.addr}:`,
              evmAddressResult
            );
            displayCoaAddr = "Invalid Format";
          }
          return { ...item, coaAddr: displayCoaAddr };
        } catch (error) {
          // This will catch errors if the getCOA script panics or if there's a network issue for this specific address
          console.error(`Error fetching COA for ${item.addr}:`, error);
          return { ...item, coaAddr: "Error" };
        }
      });

      // Wait for all COA fetch promises to settle
      const updatedItemsResults = await Promise.allSettled(coaPromises);

      if (alive) {
        const newRows = updatedItemsResults.map((result) => {
          if (result.status === "fulfilled") {
            return result.value;
          } else {
            // This case should ideally not be hit if individual errors are caught above,
            // but as a fallback:
            console.error("A COA promise was rejected:", result.reason);
            // Find the original item to mark it as error (requires matching or passing identifier)
            // For simplicity, we assume the order is maintained.
            // A more robust way would be to map back using item.addr if available in reason.
            return {
              ...currentItems[updatedItemsResults.indexOf(result)],
              coaAddr: "Error (Promise Rejected)",
            };
          }
        });
        setRows(newRows);
      }

      if (alive) {
        setLoadingCOAs(false);
        setLoading(false); // All loading finished
      }
    };

    fetchLeaderboardData();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.addr && r.addr.toLowerCase().includes(q)) ||
        (r.coaAddr &&
          typeof r.coaAddr === "string" &&
          r.coaAddr.toLowerCase().includes(q))
    );
  }, [rows, query]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        SORTS[sortKey] ? SORTS[sortKey](a, b, sortDir) : 0
      ),
    [filtered, sortKey, sortDir]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const currentPagedItems = sorted.slice((page - 1) * PAGE, page * PAGE);

  useEffect(() => setPage(1), [sortKey, sortDir, query]);

  const toggleSort = (k) => {
    if (k === sortKey) {
      setSortDir((d) => -d);
    } else {
      setSortKey(k);
      setSortDir(1);
    }
  };

  const TableBlock = () => (
    <div className="bg-brand-primary rounded-lg p-3">
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
          placeholder="Search Flow or COA address…"
          className="w-full pl-9 pr-3 py-1.5 rounded bg-brand-secondary border border-brand-border text-sm text-center focus:outline-none focus:ring-2 focus:ring-flow-light"
        />
      </label>

      {loading && rows.length === 0 ? ( // Show initial loading spinner only if no rows yet
        <p className="text-brand-text/70 text-center py-4">
          Loading leaderboard data…
        </p>
      ) : !currentPagedItems.length && !loadingCOAs ? ( // Show no data only if not loading COAs
        <p className="italic text-sm text-center py-4">
          No data{query && " for this search"}.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow border border-brand-border">
            <table className="min-w-full table-fixed bg-brand-secondary select-none">
              <colgroup>
                <col style={{ width: "40px" }} />
                <col style={{ width: "130px" }} />
                <col style={{ width: "150px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "120px" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-brand-border text-center">
                  <th className="py-1 px-2">#</th>
                  <th className="py-1 px-2 border-r border-brand-border">
                    Flow Addr
                  </th>
                  <th className="py-1 px-2 border-r border-brand-border">
                    COA Addr (EVM)
                    {loadingCOAs && (
                      <span className="ml-1 text-xs">(Updating...)</span>
                    )}
                  </th>
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
                {currentPagedItems.map((r, i) => (
                  <tr
                    key={r.addr || i}
                    className="border-b border-brand-border/30 text-center text-sm hover:bg-brand-primary/20"
                  >
                    <td className="py-2 px-2">{(page - 1) * PAGE + i + 1}</td>
                    <td className="py-2 px-2 font-mono text-xs border-r border-brand-border">
                      <Link
                        to={`/profile/${r.addr}`}
                        className="hover:underline"
                        title={r.addr}
                      >
                        {r.addr || "N/A"}
                      </Link>
                    </td>
                    <td
                      className="py-2 px-2 font-mono text-xs border-r border-brand-border"
                      title={r.coaAddr}
                    >
                      {r.coaAddr === "Loading..." ||
                      r.coaAddr === "Error" ||
                      r.coaAddr === "N/A" ||
                      r.coaAddr === "Invalid Format" ||
                      r.coaAddr === "Error (Promise Rejected)"
                        ? r.coaAddr
                        : r.coaAddr || "N/A"}
                    </td>
                    <td className="py-2 px-2 border-r border-brand-border">
                      {fmt(r.deposits)}
                    </td>
                    <td className="py-2 px-2 border-r border-brand-border">
                      {fmt(r.withdrawals)}
                    </td>
                    <td className="py-2 px-2 font-semibold">{fmt(r.net)}</td>
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
    </div>
  );

  return (
    <div className="text-brand-text py-4">
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

const Pager = ({ page, totalPages, setPage }) => (
  <div className="flex justify-center items-center mt-4 gap-1">
    <button
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      disabled={page === 1}
      className="px-3 py-1 rounded bg-brand-secondary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      &lt;
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) => {
        if (totalPages <= 7) return true;
        if (p === 1 || p === totalPages) return true;
        if (page <= 4) return p <= 5;
        if (page >= totalPages - 3) return p >= totalPages - 4;
        return Math.abs(p - page) <= 1;
      })
      .reduce((acc, p, index, arr) => {
        acc.push(p);
        if (index < arr.length - 1 && arr[index + 1] - p > 1) {
          acc.push("...");
        }
        return acc;
      }, [])
      .map((p, idx) =>
        p === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-3 py-1 text-brand-text/70"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            disabled={p === page}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded ${
              p === page
                ? "bg-flow-dark text-white"
                : "bg-brand-secondary hover:opacity-80"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {p}
          </button>
        )
      )}
    <button
      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      disabled={page === totalPages}
      className="px-3 py-1 rounded bg-brand-secondary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      &gt;
    </button>
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
      className={`py-2 px-2 cursor-pointer select-none hover:opacity-80 ${className} whitespace-nowrap`}
    >
      {label}
      {active && (
        <span className="inline-block w-3 ml-1">
          {sortDir === 1 ? "▼" : "▲"}
        </span>
      )}
    </th>
  );
};

export default TSHOTLeaderboard;
