/* src/pages/Profile.jsx
   ---------------------------------------
   /profile            – private dashboard
   /profile/:address   – public read-only
   ---------------------------------------
*/
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import * as fcl from "@onflow/fcl";
import axios from "axios";

import { UserDataContext } from "../context/UserContext";
import { getFLOWBalance } from "../flow/getFLOWBalance";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionLength";

/* ---------- helpers ---------- */
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

const tierColour = {
  common: "text-gray-400",
  fandom: "text-lime-400",
  rare: "text-blue-500",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

const validTiers = ["common", "fandom", "rare", "legendary", "ultimate"];

const calcTierBreakdown = (nfts = []) =>
  nfts.reduce((acc, n) => {
    const t = n.tier?.toLowerCase();
    if (validTiers.includes(t)) acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

const StatBox = ({ label, value, loading }) => (
  <div className="text-center">
    <p className="text-sm opacity-80 m-0">{label}</p>
    {loading ? (
      <Skeleton w="w-14" h="h-6" />
    ) : (
      <p className="text-xl font-semibold m-0">{value}</p>
    )}
  </div>
);

/* ---------- component ---------- */
function Profile() {
  const { address: paramAddr } = useParams();
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

  /* 1 ─ quick on-chain balances */
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
        if (mounted)
          setQuick({
            loading: false,
            flow: +flow,
            tshot: +tshot,
            moments: +moments,
          });
      } catch {
        if (mounted)
          setQuick({ loading: false, flow: 0, tshot: 0, moments: 0 });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [wallet]);

  /* 2 ─ vault-activity stats */
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

  /* 3 ─ private balances / children */
  const {
    flowBalance = 0,
    tshotBalance = 0,
    nftDetails = [],
    childrenData = [],
  } = isPublic ? {} : accountData;

  const aggregate = useMemo(() => {
    if (isPublic) return null;
    const out = { flow: 0, tshot: 0, nfts: 0, tiers: {} };
    const add = (fl, ts, nfts) => {
      out.flow += +fl || 0;
      out.tshot += +ts || 0;
      out.nfts += nfts.length;
      nfts.forEach((n) => {
        const t = n.tier?.toLowerCase();
        if (validTiers.includes(t)) out.tiers[t] = (out.tiers[t] || 0) + 1;
      });
    };
    add(flowBalance, tshotBalance, nftDetails);
    childrenData.forEach((c) =>
      add(c.flowBalance, c.tshotBalance, c.nftDetails)
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
        nftDetails,
      },
      ...childrenData.map((c, i) => ({
        label: childrenData.length === 1 ? "Child" : `Child ${i + 1}`,
        addr: c.addr,
        flow: c.flowBalance,
        moments: c.nftDetails.length,
        tshot: c.tshotBalance,
        nftDetails: c.nftDetails,
      })),
    ];
  }, [isPublic, wallet, flowBalance, nftDetails, tshotBalance, childrenData]);

  /* headline */
  const headline = isPublic
    ? {
        loading: quick.loading,
        flow: quick.flow,
        moments: quick.moments,
        tshot: quick.tshot,
      }
    : {
        loading: isRefreshing || isLoadingChildren,
        flow: aggregate.flow,
        moments: aggregate.nfts,
        tshot: aggregate.tshot,
      };

  const deposits = swapStats?.NFTToTSHOTSwapCompleted ?? 0;
  const withdrawals = swapStats?.TSHOTToNFTSwapCompleted ?? 0;

  /* -------- render -------- */
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
              value={headline.flow.toFixed(2)}
              loading={headline.loading}
            />
            <Tile
              title="Moments"
              value={headline.moments}
              loading={headline.loading}
            />
            <Tile
              title="TSHOT"
              value={headline.tshot.toFixed(1)}
              loading={headline.loading}
            />
          </div>

          {/* vault activity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Tile
              title="Deposits (NFT → TSHOT)"
              value={deposits}
              loading={swapLoading}
              tooltip="NFTToTSHOTSwapCompleted events"
            />
            <Tile
              title="Withdrawals (TSHOT → NFT)"
              value={withdrawals}
              loading={swapLoading}
              tooltip="TSHOTToNFTSwapCompleted events"
            />
            <Tile
              title="Net (Deposits – Withdrawals)"
              value={swapStats ? swapStats.net : "--"}
              loading={swapLoading}
            />
          </div>

          {/* note on data window */}
          <p className="text-xs text-brand-text/60 mt-2 mb-10">
            Vault-activity data is counted starting <strong>May 1 2025</strong>.
          </p>

          {/* first / last swap */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10 max-w-lg">
            <Tile
              title="First Swap"
              value={
                swapStats
                  ? new Date(swapStats.firstEvent).toLocaleString()
                  : "--"
              }
              loading={swapLoading}
            />
            <Tile
              title="Last Swap"
              value={
                swapStats
                  ? new Date(swapStats.lastEvent).toLocaleString()
                  : "--"
              }
              loading={swapLoading}
            />
          </div>

          {/* private-only sections */}
          {!isPublic && (
            <>
              {/* tiers */}
              <div className="bg-brand-primary rounded-lg shadow max-w-xs mb-12 p-4">
                <h2 className="text-lg font-semibold mb-3">
                  All-Accounts Tier Breakdown
                </h2>
                {Object.keys(aggregate.tiers).length ? (
                  Object.entries(aggregate.tiers)
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
                )}
              </div>

              {/* account cards */}
              <h2 className="text-xl font-bold mb-4">Accounts Breakdown</h2>
              <div className="space-y-6 mb-12">
                {accounts.map((acc) => {
                  const tiers = calcTierBreakdown(acc.nftDetails);
                  return (
                    <div
                      key={acc.addr}
                      className="rounded-lg shadow border-2 border-brand-primary"
                    >
                      <div className="flex justify-between bg-brand-secondary px-4 py-2 rounded-t-lg">
                        <h3 className="text-lg font-semibold m-0">
                          {acc.label}
                        </h3>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(acc.addr)
                          }
                          className="truncate max-w-[260px] text-xs hover:opacity-80"
                          title="Copy address"
                        >
                          {acc.addr}
                        </button>
                      </div>

                      <div className="flex justify-around bg-brand-primary px-4 py-3 flex-wrap gap-4">
                        <StatBox
                          label="Flow"
                          value={(+acc.flow).toFixed(2)}
                          loading={headline.loading}
                        />
                        <StatBox
                          label="Moments"
                          value={acc.moments}
                          loading={headline.loading}
                        />
                        <StatBox
                          label="TSHOT"
                          value={(+acc.tshot).toFixed(1)}
                          loading={headline.loading}
                        />
                      </div>

                      <div className="bg-brand-primary px-4 py-3 rounded-b-lg">
                        {acc.moments ? (
                          Object.keys(tiers).length ? (
                            Object.entries(tiers)
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
                            <p className="italic text-sm">No tier data.</p>
                          )
                        ) : (
                          <p className="italic text-sm">
                            No TopShot collection.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {isPublic && (
            <p className="italic text-sm">
              Read-only overview. Child accounts and detailed tiers are visible
              only to the owner.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default Profile;
