/*  src/pages/Profile.jsx
    ------------------------------------------------------------
    /profile            – owner dashboard
    /profile/:address   – public read-only view
    ------------------------------------------------------------
*/
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // ← added navigate/location
import * as fcl from "@onflow/fcl";
import axios from "axios";

import { UserDataContext } from "../context/UserContext";
import { getFLOWBalance } from "../flow/getFLOWBalance";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionLength";
import { getTopShotCollectionBatched } from "../flow/getTopShotCollectionBatched";

/* ───────── misc UI helpers ───────── */
const Skeleton = ({ w = "w-16", h = "h-7" }) => (
  <div className={`${w} ${h} rounded bg-brand-secondary animate-pulse`} />
);
const Tile = ({ title, value, loading, tooltip }) => (
  <div
    className="
      flex flex-col items-center justify-center
      w-full min-h-[90px] rounded-lg shadow
      bg-brand-primary text-brand-text px-4 py-3
    "
    title={tooltip}
  >
    <span className="text-xs opacity-80 mb-1 text-center">{title}</span>
    {loading ? (
      <Skeleton />
    ) : (
      <span className="text-lg font-semibold">{value}</span>
    )}
  </div>
);

/* ───────── tiers ───────── */
const tierColour = {
  common: "text-gray-400",
  fandom: "text-lime-400",
  rare: "text-blue-500",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};
const validTiers = ["common", "fandom", "rare", "legendary", "ultimate"];
const bump = (o, k, n = 1) => ((o[k] = (o[k] || 0) + n), o);

const calcTierBreakdown = (nfts = []) =>
  nfts.reduce((acc, n) => {
    const t = n.tier?.toLowerCase();
    if (validTiers.includes(t)) bump(acc, t);
    return acc;
  }, {});

/* ───────── helpers ───────── */
const safeFixed = (num, d = 2) =>
  isFinite(num) ? Number(num).toFixed(d) : "0";

/* ───────── compact account card ───────── */
const MiniStat = ({ label, value }) => (
  <div className="py-2 border-r border-brand-border last:border-none">
    <p className="opacity-70 m-0">{label}</p>
    <p className="font-semibold m-0">{value}</p>
  </div>
);

const AccountCard = ({ acc }) => (
  <div className="rounded-lg shadow border border-brand-primary">
    {/* header */}
    <div className="flex justify-between bg-brand-secondary px-3 py-1.5 rounded-t-lg">
      <h3 className="text-base font-semibold m-0">{acc.label}</h3>
      <button
        onClick={() => navigator.clipboard.writeText(acc.addr)}
        className="truncate max-w-[220px] text-xs hover:opacity-80"
      >
        {acc.addr}
      </button>
    </div>

    {/* compact stats row */}
    <div className="grid grid-cols-3 bg-brand-primary text-center text-xs">
      <MiniStat label="Flow" value={safeFixed(acc.flow)} />
      <MiniStat label="Moments" value={acc.moments} />
      <MiniStat label="TSHOT" value={safeFixed(acc.tshot, 1)} />
    </div>

    {/* tier breakdown */}
    <div className="bg-brand-primary px-3 py-2 rounded-b-lg">
      {Object.keys(acc.tiers).length ? (
        Object.entries(acc.tiers)
          .sort()
          .map(([t, c]) => (
            <div key={t} className="flex justify-between text-xs py-0.5">
              <span className={tierColour[t]}>
                {t[0].toUpperCase() + t.slice(1)}
              </span>
              <span>{c}</span>
            </div>
          ))
      ) : (
        <p className="italic text-xs">No TopShot collection.</p>
      )}
    </div>
  </div>
);

/* ───────── main component ───────── */
function Profile() {
  const { address: paramAddr } = useParams();
  const navigate = useNavigate(); // ← for redirect
  const location = useLocation();

  const {
    user,
    selectedAccount,
    accountData,
    isRefreshing,
    isLoadingChildren,
  } = useContext(UserDataContext);

  const ownAddr = selectedAccount || user?.addr;
  const isPublic =
    !!paramAddr && paramAddr.toLowerCase() !== (ownAddr || "").toLowerCase();
  const wallet = isPublic ? paramAddr : ownAddr;

  /* ───────── redirect bare /profile → /profile/:addr after login ───────── */
  useEffect(() => {
    if (
      ownAddr && // we now know the wallet
      !paramAddr && // URL has no :address
      location.pathname === "/profile" // still on bare page
    ) {
      navigate(`/profile/${ownAddr}`, { replace: true });
    }
  }, [ownAddr, paramAddr, location.pathname, navigate]);

  /* ---------- 1. quick balances ---------- */
  const [quick, setQuick] = useState({
    loading: true,
    flow: 0,
    tshot: 0,
    moments: 0,
  });
  useEffect(() => {
    if (!wallet) return;
    let mounted = true;
    (async () => {
      try {
        const [flow, tshot, moments] = await Promise.all([
          fcl.query({
            cadence: getFLOWBalance,
            args: (arg, t) => [arg(wallet, t.Address)],
          }),
          fcl.query({
            cadence: getTSHOTBalance,
            args: (arg, t) => [arg(wallet, t.Address)],
          }),
          fcl.query({
            cadence: getTopShotCollectionIDs,
            args: (arg, t) => [arg(wallet, t.Address)],
          }),
        ]);
        mounted &&
          setQuick({
            loading: false,
            flow: +flow,
            tshot: +tshot,
            moments: +moments,
          });
      } catch {
        mounted && setQuick({ loading: false, flow: 0, tshot: 0, moments: 0 });
      }
    })();
    return () => (mounted = false);
  }, [wallet]);

  /* ---------- 2. vault summary ---------- */
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

  /* ---------- 3. lightweight public tier load ---------- */
  const [publicTiers, setPublicTiers] = useState({});
  const [publicTierLoading, setPublicTierLoading] = useState(true);
  useEffect(() => {
    if (!isPublic || !wallet) return;
    let mounted = true;
    (async () => {
      setPublicTierLoading(true);
      try {
        const ids = await fcl.query({
          cadence: getTopShotCollectionIDs,
          args: (arg, t) => [arg(wallet, t.Address)],
        });
        if (!ids?.length) {
          mounted && setPublicTiers({});
          return;
        }
        const tiers = {};
        const BATCH = 2500;
        for (let i = 0; i < ids.length; i += BATCH) {
          const slice = ids.slice(i, i + BATCH);
          const batch = await fcl.query({
            cadence: getTopShotCollectionBatched,
            args: (arg, t) => [
              arg(wallet, t.Address),
              arg(slice, t.Array(t.UInt64)),
            ],
          });
          batch.forEach((n) => {
            const t = n.tier?.toLowerCase();
            if (validTiers.includes(t)) bump(tiers, t);
          });
        }
        mounted && setPublicTiers(tiers);
      } catch (e) {
        console.error("public tier load:", e);
        mounted && setPublicTiers({});
      } finally {
        mounted && setPublicTierLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [wallet, isPublic]);

  /* ---------- 4. swap events (paginated) ---------- */
  const PAGE_LIMIT = 20;
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
        params: { page, limit: PAGE_LIMIT, sort: "desc" },
      })
      .then((r) => {
        setEvents(r.data.items || []);
        setTotalPages(r.data.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setEventsLoading(false));
  }, [wallet, page]);

  /* ---------- 5. owner-only data ---------- */
  const {
    flowBalance = 0,
    tshotBalance = 0,
    nftDetails = [],
    childrenData = [],
  } = isPublic ? {} : accountData;

  const aggregate = useMemo(() => {
    if (isPublic) return null;
    const out = { flow: 0, tshot: 0, nfts: 0, tiers: {} };
    const bumpAll = (fl, ts, nfts) => {
      out.flow += +fl || 0;
      out.tshot += +ts || 0;
      out.nfts += nfts.length;
      nfts.forEach((n) => {
        const t = n.tier?.toLowerCase();
        if (validTiers.includes(t)) bump(out.tiers, t);
      });
    };
    bumpAll(flowBalance, tshotBalance, nftDetails);
    childrenData.forEach((c) =>
      bumpAll(c.flowBalance, c.tshotBalance, c.nftDetails)
    );
    return out;
  }, [isPublic, flowBalance, tshotBalance, nftDetails, childrenData]);

  const accounts = useMemo(() => {
    if (isPublic) return [];
    return [
      {
        label: "Parent",
        addr: wallet,
        flow: flowBalance,
        moments: nftDetails.length,
        tshot: tshotBalance,
        tiers: calcTierBreakdown(nftDetails),
      },
      ...childrenData.map((c, i) => ({
        label: childrenData.length === 1 ? "Child" : `Child ${i + 1}`,
        addr: c.addr,
        flow: c.flowBalance,
        moments: c.nftDetails.length,
        tshot: c.tshotBalance,
        tiers: calcTierBreakdown(c.nftDetails),
      })),
    ];
  }, [isPublic, wallet, flowBalance, nftDetails, tshotBalance, childrenData]);

  /* ---------- headline ---------- */
  const headline = {
    loading: isPublic ? quick.loading : isRefreshing || isLoadingChildren,
    flow: isPublic ? quick.flow : aggregate.flow,
    moments: isPublic ? quick.moments : aggregate.nfts,
    tshot: isPublic ? quick.tshot : aggregate.tshot,
  };

  const deposits = swapStats?.NFTToTSHOTSwapCompleted ?? 0;
  const withdrawals = swapStats?.TSHOTToNFTSwapCompleted ?? 0;

  /* ---------- render ---------- */
  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto text-brand-text">
      <h1 className="text-2xl font-bold mb-6">
        Profile
        {isPublic && (
          <span className="block text-sm mt-1 text-brand-accent break-all">
            {wallet}
          </span>
        )}
      </h1>

      {!wallet ? (
        <p className="mt-4">Connect your wallet to view stats.</p>
      ) : (
        <>
          {/* balances */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <Tile
              title="Flow"
              value={safeFixed(headline.flow)}
              loading={headline.loading}
            />
            <Tile
              title="Moments"
              value={headline.moments}
              loading={headline.loading}
            />
            <Tile
              title="TSHOT"
              value={safeFixed(headline.tshot, 1)}
              loading={headline.loading}
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
            Vault-activity data counted from&nbsp;
            <strong>May&nbsp;1&nbsp;2025</strong>.
          </p>

          {/* tier breakdown – always */}
          <div className="bg-brand-primary rounded-lg shadow max-w-xs mb-12 p-4">
            <h2 className="text-lg font-semibold mb-3">Tier Breakdown</h2>

            {isPublic ? (
              publicTierLoading ? (
                <p className="text-brand-text/70">Loading…</p>
              ) : Object.keys(publicTiers).length ? (
                Object.entries(publicTiers)
                  .sort()
                  .map(([t, c]) => (
                    <div
                      key={t}
                      className="flex justify-between text-sm py-0.5"
                    >
                      <span className={tierColour[t]}>
                        {t[0].toUpperCase() + t.slice(1)}
                      </span>
                      <span>{c}</span>
                    </div>
                  ))
              ) : (
                <p className="italic text-sm">No moments yet.</p>
              )
            ) : Object.keys(aggregate.tiers).length ? (
              Object.entries(aggregate.tiers)
                .sort()
                .map(([t, c]) => (
                  <div key={t} className="flex justify-between text-sm py-0.5">
                    <span className={tierColour[t]}>
                      {t[0].toUpperCase() + t.slice(1)}
                    </span>
                    <span>{c}</span>
                  </div>
                ))
            ) : (
              <p className="italic text-sm">No moments yet.</p>
            )}
          </div>

          {/* owner-only account breakdown */}
          {!isPublic && accounts.length > 0 && (
            <>
              <h2 className="text-xl font-bold mb-4">Accounts Breakdown</h2>
              <div className="space-y-6 mb-12">
                {accounts.map((acc) => (
                  <AccountCard key={acc.addr} acc={acc} />
                ))}
              </div>
            </>
          )}

          {/* swap history (after accounts) */}
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
                      <th className="py-1">Tx&nbsp;↗</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => {
                      const isDep = ev.type.includes("NFTToTSHOT");
                      return (
                        <tr
                          key={ev.transactionId}
                          className="border-b border-brand-border/30"
                        >
                          <td className="py-1 pr-2">
                            {new Date(ev.blockTimestamp).toLocaleString()}
                          </td>
                          <td className="py-1 pr-2">
                            {isDep
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
                      );
                    })}
                  </tbody>
                </table>

                {/* pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4 gap-1">
                    {(() => {
                      const btns = [];
                      if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++) btns.push(i);
                      } else if (page <= 4) {
                        btns.push(1, 2, 3, 4, 5, "...", totalPages);
                      } else if (page > totalPages - 4) {
                        btns.push(
                          1,
                          "...",
                          totalPages - 4,
                          totalPages - 3,
                          totalPages - 2,
                          totalPages - 1,
                          totalPages
                        );
                      } else {
                        btns.push(
                          1,
                          "...",
                          page - 1,
                          page,
                          page + 1,
                          "...",
                          totalPages
                        );
                      }
                      return btns.map((p, idx) => (
                        <button
                          key={idx}
                          disabled={p === "..." || p === page}
                          onClick={() => typeof p === "number" && setPage(p)}
                          className={`px-3 py-1 rounded ${
                            p === page
                              ? "bg-flow-dark text-white"
                              : p === "..."
                              ? "cursor-default bg-brand-secondary text-brand-text/50"
                              : "bg-brand-secondary hover:opacity-80"
                          }`}
                        >
                          {p}
                        </button>
                      ));
                    })()}
                  </div>
                )}
              </>
            )}
          </div>

          {isPublic && (
            <p className="italic text-sm">
              Read-only overview. Child accounts and detailed collection data
              are only visible to the owner.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default Profile;
