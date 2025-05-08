/*  src/pages/Profile.jsx
    ------------------------------------------------------------
      /profile            – prompts to connect a wallet
      /profile/:address   – read-only or owner view (identical)
    ------------------------------------------------------------
*/
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import * as fcl from "@onflow/fcl";
import axios from "axios";
import pLimit from "p-limit";

/* ───────── cadence scripts ───────── */
import { getFLOWBalance } from "../flow/getFLOWBalance";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionIDs";
import { getTopShotCollectionBatched } from "../flow/getTopShotCollectionBatched";
import { hasChildren as hasChildrenCadence } from "../flow/hasChildren";
import { getChildren } from "../flow/getChildren";

/* ───────── constants ───────── */
const TIER_ORDER = ["common", "fandom", "rare", "legendary", "ultimate"];
const tierColour = {
  common: "text-gray-400",
  fandom: "text-lime-400",
  rare: "text-blue-500",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};
const LIMIT = pLimit(10); // max 10 concurrent cadence queries
const BATCH = 4000; // ids per cadence call (was 2500)

/* ───────── tiny helpers ───────── */
const bump = (o, k, n = 1) => {
  o[k] = (o[k] || 0) + n;
  return o;
};
const fixed = (n, d = 2) => (Number.isFinite(+n) ? (+n).toFixed(d) : "0");

const Skeleton = ({ w = "w-16", h = "h-7" }) => (
  <div className={`${w} ${h} rounded bg-brand-secondary animate-pulse`} />
);
const Tile = ({ title, value, loading }) => (
  <div className="flex flex-col items-center justify-center w-full min-h-[90px] rounded-lg shadow bg-brand-primary text-brand-text px-4 py-3">
    <span className="text-xs opacity-80 mb-1 text-center">{title}</span>
    {loading ? (
      <Skeleton />
    ) : (
      <span className="text-lg font-semibold">{value}</span>
    )}
  </div>
);

/* ───────── metadata cache ───────── */
let topshotMeta = null;
async function loadTopShotMeta() {
  if (topshotMeta) return topshotMeta;

  const KEY = "topshotMeta_v1";
  try {
    const cached = localStorage.getItem(KEY);
    if (cached) {
      topshotMeta = JSON.parse(cached);
      return topshotMeta;
    }
  } catch (_) {}

  const resp = await fetch("https://api.vaultopolis.com/topshot-data");
  const arr = await resp.json();
  topshotMeta = arr.reduce((acc, r) => {
    acc[`${r.setID}-${r.playID}`] = r.tier?.toLowerCase?.() || null;
    return acc;
  }, {});
  try {
    localStorage.setItem(KEY, JSON.stringify(topshotMeta));
  } catch (_) {}
  return topshotMeta;
}

/* ───────── account fetch ───────── */
async function fetchAccount(addr) {
  const meta = await loadTopShotMeta();

  const [flow, tshot, ids] = await Promise.all([
    fcl.query({
      cadence: getFLOWBalance,
      args: (arg, t) => [arg(addr, t.Address)],
    }),
    fcl.query({
      cadence: getTSHOTBalance,
      args: (arg, t) => [arg(addr, t.Address)],
    }),
    fcl.query({
      cadence: getTopShotCollectionIDs,
      args: (arg, t) => [arg(addr, t.Address)],
    }),
  ]);

  const tiers = {};
  const idArr = Array.from(ids || []).map(String);

  /* fan out all batched calls concurrently (limit 10) */
  const batchCalls = [];
  for (let i = 0; i < idArr.length; i += BATCH) {
    const slice = idArr.slice(i, i + BATCH);
    batchCalls.push(
      LIMIT(() =>
        fcl.query({
          cadence: getTopShotCollectionBatched,
          args: (arg, t) => [
            arg(addr, t.Address),
            arg(slice, t.Array(t.UInt64)),
          ],
        })
      )
    );
  }

  const chunks = await Promise.all(batchCalls);
  chunks.flat().forEach((nft) => {
    const tier = meta[`${nft.setID}-${nft.playID}`];
    if (tier) bump(tiers, tier);
  });

  return { addr, flow: +flow, tshot: +tshot, moments: idArr.length, tiers };
}

async function loadFamily(addr) {
  const parent = await fetchAccount(addr);

  const hasKids = await fcl.query({
    cadence: hasChildrenCadence,
    args: (arg, t) => [arg(addr, t.Address)],
  });
  if (!hasKids) return [parent];

  const kidAddrs = await fcl.query({
    cadence: getChildren,
    args: (arg, t) => [arg(addr, t.Address)],
  });
  const kids = await Promise.all(kidAddrs.map(fetchAccount));
  return [parent, ...kids];
}

/* ───────── UI fragments ───────── */
const MiniStat = ({ label, value }) => (
  <div className="py-2 border-r border-brand-border last:border-none">
    <p className="opacity-70 m-0 text-xs">{label}</p>
    <p className="font-semibold m-0">{value}</p>
  </div>
);

const AccountCard = ({ acc, idx }) => (
  <div className="rounded-lg shadow border border-brand-primary">
    <div className="flex justify-between bg-brand-secondary px-3 py-1.5 rounded-t-lg">
      <h3 className="text-sm font-semibold m-0">
        {idx === 0 ? "Parent" : `Child ${idx}`}
      </h3>
      <button
        onClick={() => navigator.clipboard.writeText(acc.addr)}
        className="truncate max-w-[200px] text-xs hover:opacity-80"
      >
        {acc.addr}
      </button>
    </div>
    <div className="grid grid-cols-3 bg-brand-primary text-center text-xs">
      <MiniStat label="Flow" value={fixed(acc.flow)} />
      <MiniStat label="Moments" value={acc.moments} />
      <MiniStat label="TSHOT" value={fixed(acc.tshot, 1)} />
    </div>
    <div className="bg-brand-primary px-3 py-2 rounded-b-lg">
      {TIER_ORDER.some((t) => acc.tiers[t]) ? (
        TIER_ORDER.map(
          (t) =>
            acc.tiers[t] && (
              <div key={t} className="flex justify-between text-xs py-0.5">
                <span className={tierColour[t]}>
                  {t[0].toUpperCase() + t.slice(1)}
                </span>
                <span>{acc.tiers[t]}</span>
              </div>
            )
        )
      ) : (
        <p className="italic text-xs">No TopShot collection.</p>
      )}
    </div>
  </div>
);

/* ───────── main component ───────── */
function Profile() {
  const { address: paramAddr } = useParams();
  const [viewer, setViewer] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => fcl.currentUser().subscribe(setViewer), []);
  const wallet = paramAddr || viewer?.addr || null;

  useEffect(() => {
    if (!wallet) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const fam = await loadFamily(wallet);
        if (alive) setAccounts(fam);
      } catch (e) {
        console.error("[profile-load]", e);
        if (alive) setAccounts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => void (alive = false);
  }, [wallet]);

  const aggregate = useMemo(() => {
    const out = { flow: 0, tshot: 0, moments: 0, tiers: {} };
    accounts.forEach((a) => {
      out.flow += a.flow;
      out.tshot += a.tshot;
      out.moments += a.moments;
      Object.entries(a.tiers).forEach(([t, c]) => bump(out.tiers, t, c));
    });
    return out;
  }, [accounts]);

  /* ── swap stats & history (unchanged) ───────────────────── */
  const [swapStats, setSwapStats] = useState(null);
  const [swapLoading, setSwapLoading] = useState(true);
  useEffect(() => {
    if (!wallet) return;
    setSwapLoading(true);
    axios
      .get(`https://api.vaultopolis.com/wallet-stats/${wallet}`)
      .then((r) => setSwapStats(r.data.items?.[0] || null))
      .catch(console.error)
      .finally(() => setSwapLoading(false));
  }, [wallet]);
  const deposits = swapStats?.NFTToTSHOTSwapCompleted ?? 0;
  const withdrawals = swapStats?.TSHOTToNFTSwapCompleted ?? 0;

  const PAGE = 20;
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => setPage(1), [wallet]);
  useEffect(() => {
    if (!wallet) return;
    setEventsLoading(true);
    axios
      .get(`https://api.vaultopolis.com/wallet-events/${wallet}`, {
        params: { page, limit: PAGE, sort: "desc" },
      })
      .then((r) => {
        setEvents(r.data.items || []);
        setTotalPages(r.data.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setEventsLoading(false));
  }, [wallet, page]);

  /* ───────── render ───────── */
  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto text-brand-text">
      <h1 className="text-2xl font-bold mb-6">
        Profile
        {wallet && (
          <span className="block text-sm mt-1 text-brand-accent break-all">
            {wallet}
          </span>
        )}
      </h1>

      {!wallet ? (
        <p className="mt-4">Connect your Flow wallet to view any profile.</p>
      ) : (
        <>
          {/* headline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <Tile
              title="Flow"
              value={fixed(aggregate.flow)}
              loading={loading}
            />
            <Tile title="Moments" value={aggregate.moments} loading={loading} />
            <Tile
              title="TSHOT"
              value={fixed(aggregate.tshot, 1)}
              loading={loading}
            />
          </div>

          {/* vault summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Tile
              title="Deposits (NFT → TSHOT)"
              value={deposits}
              loading={swapLoading}
            />
            <Tile
              title="Withdrawals (TSHOT → NFT)"
              value={withdrawals}
              loading={swapLoading}
            />
            <Tile
              title="Net (Deposits – Withdrawals)"
              value={swapStats ? swapStats.net : "--"}
              loading={swapLoading}
            />
          </div>
          <p className="text-xs text-brand-text/60 mt-2 mb-8">
            Vault-activity data counted from{" "}
            <strong>May&nbsp;1&nbsp;2025</strong>.
          </p>

          {/* tier breakdown */}
          <div className="bg-brand-primary rounded-lg shadow max-w-xs mb-12 p-4">
            <h2 className="text-lg font-semibold mb-3">Tier Breakdown</h2>
            {loading ? (
              <p className="text-brand-text/70">Loading…</p>
            ) : TIER_ORDER.some((t) => aggregate.tiers[t]) ? (
              TIER_ORDER.map(
                (t) =>
                  aggregate.tiers[t] && (
                    <div
                      key={t}
                      className="flex justify-between text-sm py-0.5"
                    >
                      <span className={tierColour[t]}>
                        {t[0].toUpperCase() + t.slice(1)}
                      </span>
                      <span>{aggregate.tiers[t]}</span>
                    </div>
                  )
              )
            ) : (
              <p className="italic text-sm">No moments yet.</p>
            )}
          </div>

          {/* accounts list */}
          {accounts.length > 0 && (
            <>
              <h2 className="text-xl font-bold mb-4">Accounts Breakdown</h2>
              <div className="space-y-6 mb-12">
                {accounts.map((a, i) => (
                  <AccountCard key={a.addr} acc={a} idx={i} />
                ))}
              </div>
            </>
          )}

          {/* swap history (unchanged UI) */}
          <div className="mb-12">
            <h2 className="text-lg font-semibold mb-3">Swap History</h2>
            {eventsLoading ? (
              <p className="text-brand-text/70">Loading events…</p>
            ) : !events.length ? (
              <p className="italic text-sm">No swap events.</p>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-brand-border">
                      <th className="py-1 pr-2">When</th>
                      <th className="py-1 pr-2">Type</th>
                      <th className="py-1 pr-2"># NFTs</th>
                      <th className="py-1">Tx ↗</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr
                        key={ev.transactionId}
                        className="border-b border-brand-border/30"
                      >
                        <td className="py-1 pr-2">
                          {new Date(ev.blockTimestamp).toLocaleString()}
                        </td>
                        <td className="py-1 pr-2">
                          {ev.type.includes("NFTToTSHOT")
                            ? "Deposit (NFT → TSHOT)"
                            : "Withdrawal (TSHOT → NFT)"}
                        </td>
                        <td className="py-1 pr-2">{ev.data?.numNFTs}</td>
                        <td className="py-1">
                          <a
                            href={`https://flowscan.io/transaction/${ev.transactionId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-accent hover:underline"
                          >
                            view
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-4 gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (totalPages <= 7) return true;
                        if (page <= 4) return p <= 5 || p === totalPages;
                        if (page >= totalPages - 3)
                          return p >= totalPages - 4 || p === 1;
                        return [
                          1,
                          totalPages,
                          page - 1,
                          page,
                          page + 1,
                        ].includes(p);
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
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
