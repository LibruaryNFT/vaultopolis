/*  src/pages/Profile.jsx
    ------------------------------------------------------------
      /profile            – redirects:
                             • wallet connected  → /profile/<addr>
                             • not connected     → /
      /profile/:address   – read-only or owner view
    ------------------------------------------------------------ */

import React, { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import * as fcl from "@onflow/fcl";
import axios from "axios";
import pLimit from "p-limit";
import { metaStore } from "../utils/metaStore";

/* ───────── cadence scripts ───────── */
import { getFLOWBalance } from "../flow/getFLOWBalance";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
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

const LIMIT = pLimit(30); // RPC concurrency guard
const BATCH = 2500; // Same batch size as UserContext
const FIVE_MIN = 5 * 60_000;
const SNAP = (addr) => `collSnap:${addr.toLowerCase()}`;

/* ───────── helpers ───────── */
const bump = (obj, key, inc = 1) => {
  obj[key] = (obj[key] || 0) + inc;
  return obj;
};
const fixed = (n, d = 2) => (Number.isFinite(+n) ? (+n).toFixed(d) : "0");

/* ───────── minimal UI helpers ───────── */
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

/* ───────── tier-only metadata cache via metaStore ───────── */
let topshotMeta = null;
async function loadTopShotMeta() {
  if (topshotMeta) return topshotMeta;
  const KEY = "topshotTier_v1";

  /* try IndexedDB first */
  const cached = await metaStore.getItem(KEY);
  if (cached) return (topshotMeta = cached);

  /* legacy localStorage migration (one-off) */
  try {
    const ls = localStorage.getItem(KEY);
    if (ls) {
      const parsed = JSON.parse(ls);
      await metaStore.setItem(KEY, parsed);
      localStorage.removeItem(KEY);
      return (topshotMeta = parsed);
    }
  } catch (_) {
    /* ignore */
  }

  /* fallback – download trimmed metadata */
  const resp = await fetch("https://api.vaultopolis.com/topshot-data");
  const arr = await resp.json();
  topshotMeta = arr.reduce((acc, r) => {
    acc[`${r.setID}-${r.playID}`] = r.tier?.toLowerCase?.() || null;
    return acc;
  }, {});
  metaStore.setItem(KEY, topshotMeta).catch(() => {});
  return topshotMeta;
}

/* ───────── cheap balance fetches ───────── */
const fetchFlowFast = async (addr) => {
  try {
    return await fcl.query({
      cadence: getFLOWBalance,
      args: (arg, t) => [arg(addr, t.Address)],
    });
  } catch {
    return 0;
  }
};
const fetchTshotFast = async (addr) => {
  try {
    return await fcl.query({
      cadence: getTSHOTBalance,
      args: (arg, t) => [arg(addr, t.Address)],
    });
  } catch {
    return 0;
  }
};

/* ───────── Account fetch using shared snapshots ───────── */
async function fetchAccount(addr) {
  /* 0️⃣ snapshot shortcut */
  const snap = await metaStore.getItem(SNAP(addr));
  if (snap && Date.now() - snap.ts < FIVE_MIN) {
    return {
      addr,
      flow: +(await fetchFlowFast(addr)),
      tshot: +(await fetchTshotFast(addr)),
      moments: snap.ids.length,
      tiers: snap.tiers,
    };
  }

  /* 1️⃣ verify collection – quick exit if none */
  const hasColl = await fcl.query({
    cadence: verifyTopShotCollection,
    args: (arg, t) => [arg(addr, t.Address)],
  });
  if (!hasColl) {
    return {
      addr,
      flow: +(await fetchFlowFast(addr)),
      tshot: +(await fetchTshotFast(addr)),
      moments: 0,
      tiers: {},
    };
  }

  /* 2️⃣ get fresh IDs (strings) */
  const ids = await fcl.query({
    cadence: getTopShotCollectionIDs,
    args: (arg, t) => [arg(addr, t.Address)],
  });
  const idArr = Array.from(ids || []).map(String);

  /* 3️⃣ tier counts */
  const tiers = {};
  const meta = await loadTopShotMeta();

  const batches = [];
  for (let i = 0; i < idArr.length; i += BATCH) {
    batches.push(idArr.slice(i, i + BATCH));
  }

  await Promise.all(
    batches.map((chunk) =>
      LIMIT(async () => {
        const details = await fcl.query({
          cadence: getTopShotCollectionBatched,
          args: (arg, t) => [
            arg(addr, t.Address),
            arg(chunk, t.Array(t.UInt64)),
          ],
        });
        details.forEach((nft) => {
          const tier = meta[`${nft.setID}-${nft.playID}`];
          if (tier) bump(tiers, tier);
        });
      })
    )
  );

  /* 4️⃣ cache snapshot for next visit */
  await metaStore.setItem(SNAP(addr), {
    ts: Date.now(),
    ids: idArr,
    tiers,
  });

  /* 5️⃣ final payload */
  const [flow, tshot] = await Promise.all([
    fetchFlowFast(addr),
    fetchTshotFast(addr),
  ]);

  return { addr, flow: +flow, tshot: +tshot, moments: idArr.length, tiers };
}

async function loadFamily(addr) {
  const parent = await fetchAccount(addr);
  let kids = [];
  try {
    const hasKids = await fcl.query({
      cadence: hasChildrenCadence,
      args: (arg, t) => [arg(addr, t.Address)],
    });
    if (hasKids) {
      const kidAddrs = await fcl.query({
        cadence: getChildren,
        args: (arg, t) => [arg(addr, t.Address)],
      });
      kids = await Promise.all(kidAddrs.map(fetchAccount));
    }
  } catch (e) {
    console.error("[loadFamily-children]", e);
  }
  return [parent, ...kids];
}

/* ───────── small UI components ───────── */
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

  /* wallet subscription */
  const [viewer, setViewer] = useState(null);
  const [viewerReady, setViewerReady] = useState(false);
  useEffect(
    () =>
      fcl.currentUser().subscribe((u) => {
        setViewer(u);
        setViewerReady(true);
      }),
    []
  );

  /* address */
  const walletAddr = paramAddr ? paramAddr.toLowerCase() : null;

  /* family load */
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!walletAddr) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const fam = await loadFamily(walletAddr);
        if (alive) setAccounts(fam);
      } catch (e) {
        console.error("[profile-load]", e);
        if (alive) setAccounts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => void (alive = false);
  }, [walletAddr]);

  /* aggregates */
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

  /* swap stats & events */
  const [swapStats, setSwapStats] = useState(null);
  const [swapLoading, setSwapLoading] = useState(true);
  useEffect(() => {
    if (!walletAddr) return;
    setSwapLoading(true);
    axios
      .get(`https://api.vaultopolis.com/wallet-stats/${walletAddr}`)
      .then((r) => setSwapStats(r.data.items?.[0] || null))
      .catch(console.error)
      .finally(() => setSwapLoading(false));
  }, [walletAddr]);

  const PAGE = 20;
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => setPage(1), [walletAddr]);
  useEffect(() => {
    if (!walletAddr) return;
    setEventsLoading(true);
    axios
      .get(`https://api.vaultopolis.com/wallet-events/${walletAddr}`, {
        params: { page, limit: PAGE, sort: "desc" },
      })
      .then((r) => {
        setEvents(r.data.items || []);
        setTotalPages(r.data.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setEventsLoading(false));
  }, [walletAddr, page]);

  /* redirect */
  let redirectTarget = null;
  if (!paramAddr && viewerReady) {
    redirectTarget = viewer?.addr ? `/profile/${viewer.addr}` : "/";
  }

  /* ───────── SEO meta & JSON-LD ───────── */
  const canonicalUrl = walletAddr
    ? `https://vaultopolis.com/profile/${walletAddr}`
    : "https://vaultopolis.com/profile";

  const metaTitle = walletAddr
    ? `Vaultopolis | Profile ${walletAddr}`
    : "Vaultopolis | Profile";

  const metaDesc = walletAddr
    ? `View Flow, TSHOT and NBA Top Shot holdings plus swap history for wallet ${walletAddr}.`
    : "Connect your Flow wallet to view any Vaultopolis NFT profile.";

  const jsonLd =
    walletAddr &&
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      identifier: walletAddr,
      url: canonicalUrl,
      name: walletAddr,
    });

  /* ───────── render ───────── */
  return redirectTarget ? (
    <Navigate to={redirectTarget} replace />
  ) : (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index,follow" />
        {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
      </Helmet>

      <div className="p-6 sm:p-10 max-w-7xl mx-auto text-brand-text">
        <h1 className="text-2xl font-bold mb-6">
          Profile
          {walletAddr && (
            <span className="block text-sm mt-1 text-brand-accent break-all">
              {walletAddr}
            </span>
          )}
        </h1>

        {!walletAddr ? (
          <p className="mt-4">Connect your Flow wallet to view any profile.</p>
        ) : (
          <>
            {/* headline tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <Tile
                title="Flow"
                value={fixed(aggregate.flow)}
                loading={loading}
              />
              <Tile
                title="Moments"
                value={aggregate.moments}
                loading={loading}
              />
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
                value={swapStats?.NFTToTSHOTSwapCompleted ?? 0}
                loading={swapLoading}
              />
              <Tile
                title="Withdrawals (TSHOT → NFT)"
                value={swapStats?.TSHOTToNFTSwapCompleted ?? 0}
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

            {/* swap history */}
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
    </>
  );
}

export default Profile;
