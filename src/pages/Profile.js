/* src/pages/Profile.jsx
    ------------------------------------------------------------
      /profile             – redirects:
                               • wallet connected  → /profile/<addr>
                               • not connected     → /
      /profile/:address   – read-only or owner view
    ------------------------------------------------------------ */

import React, { useEffect, useMemo, useState, useContext } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import * as fcl from "@onflow/fcl";
import axios from "axios";
import pLimit from "p-limit";
import { metaStore } from "../utils/metaStore";
import { UserDataContext } from "../context/UserContext";
import { fclQueryWithRetry } from "../utils/fclUtils";

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

const LIMIT_PROFILE_FETCH = pLimit(10);
const BATCH_PROFILE_FETCH = 1000;
const FIVE_MIN = 5 * 60_000;
const PROFILE_PAGE_SNAP_KEY = (addr) => `profileViewSnap:${addr.toLowerCase()}`;

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

/* ───────── tier-only metadata cache for Profile page ───────── */
let profilePageTopshotMeta = null;
async function loadProfilePageTopShotMeta() {
  if (profilePageTopshotMeta) return profilePageTopshotMeta;
  const KEY = "profilePage_topshotTier_v1";

  try {
    const cached = await metaStore.getItem(KEY);
    if (cached) {
      profilePageTopshotMeta = cached;
      return cached;
    }
  } catch (e) {
    console.warn(
      "[Profile.jsx - meta] IDB read failed for profile tier meta:",
      e
    );
  }

  try {
    const ls = localStorage.getItem(KEY);
    if (ls) {
      const parsed = JSON.parse(ls);
      await metaStore.setItem(KEY, parsed);
      localStorage.removeItem(KEY);
      profilePageTopshotMeta = parsed;
      return parsed;
    }
  } catch (_) {
    /* ignore */
  }

  try {
    console.log(
      "[Profile.jsx - meta] Fetching fresh tier metadata for profile page..."
    );
    const resp = await fetch("https://api.vaultopolis.com/topshot-data");
    if (!resp.ok)
      throw new Error(`Vaultopolis API for tiers failed: ${resp.status}`);
    const arr = await resp.json();
    profilePageTopshotMeta = arr.reduce((acc, r) => {
      acc[`${r.setID}-${r.playID}`] = r.tier?.toLowerCase?.() || null;
      return acc;
    }, {});
    await metaStore.setItem(KEY, profilePageTopshotMeta);
    console.log("[Profile.jsx - meta] Fresh tier metadata fetched and cached.");
    return profilePageTopshotMeta;
  } catch (err) {
    console.error("[Profile.jsx - meta] Fetching tier metadata failed:", err);
    return {};
  }
}

/* ───────── cheap balance fetches (now using retry) ───────── */
const fetchFlowFast = async (addr) => {
  try {
    return await fclQueryWithRetry(
      {
        cadence: getFLOWBalance,
        args: (arg, t) => [arg(addr, t.Address)],
      },
      2,
      500
    );
  } catch (e) {
    console.warn(`[Profile.jsx - fetchFlowFast] Failed for ${addr}:`, e);
    return 0;
  }
};
const fetchTshotFast = async (addr) => {
  try {
    return await fclQueryWithRetry(
      {
        cadence: getTSHOTBalance,
        args: (arg, t) => [arg(addr, t.Address)],
      },
      2,
      500
    );
  } catch (e) {
    console.warn(`[Profile.jsx - fetchTshotFast] Failed for ${addr}:`, e);
    return 0;
  }
};

/* ───────── Account fetch for Profile page ───────── */
async function fetchProfileAccountData(addr, userContextData) {
  const isCurrentUserParent =
    userContextData?.accountData?.parentAddress === addr;
  const currentUserChildData = userContextData?.accountData?.childrenData?.find(
    (c) => c.addr === addr
  );

  if (
    isCurrentUserParent &&
    userContextData.accountData.nftDetails &&
    typeof userContextData.accountData.tierCounts === "object"
  ) {
    console.log(`[Profile.jsx] Using UserContext data for parent: ${addr}`);
    return {
      addr,
      flow: parseFloat(userContextData.accountData.flowBalance || 0),
      tshot: parseFloat(userContextData.accountData.tshotBalance || 0),
      moments: userContextData.accountData.nftDetails.length,
      tiers: userContextData.accountData.tierCounts,
      hasCollection: userContextData.accountData.hasCollection,
    };
  }
  if (
    currentUserChildData &&
    currentUserChildData.nftDetails &&
    typeof currentUserChildData.tierCounts === "object"
  ) {
    console.log(`[Profile.jsx] Using UserContext data for child: ${addr}`);
    return {
      addr,
      flow: parseFloat(currentUserChildData.flowBalance || 0),
      tshot: parseFloat(currentUserChildData.tshotBalance || 0),
      moments: currentUserChildData.nftDetails.length,
      tiers: currentUserChildData.tierCounts,
      hasCollection: currentUserChildData.hasCollection,
    };
  }

  console.log(
    `[Profile.jsx] Performing independent fetch for profile: ${addr}`
  );
  const snapKey = PROFILE_PAGE_SNAP_KEY(addr);
  let snap = null;
  try {
    snap = await metaStore.getItem(snapKey);
  } catch (e) {
    console.warn(
      `[Profile.jsx] Failed to read profile snapshot for ${addr}:`,
      e
    );
  }

  const [flow, tshot] = await Promise.all([
    fetchFlowFast(addr),
    fetchTshotFast(addr),
  ]);

  if (snap && Date.now() - snap.ts < FIVE_MIN) {
    console.log(`[Profile.jsx] Using own profile snapshot for ${addr}`);
    return {
      addr,
      flow: +flow,
      tshot: +tshot,
      moments: snap.ids?.length || 0,
      tiers: snap.tiers || {},
      hasCollection: snap.hasOwnProperty("hasCollection")
        ? snap.hasCollection
        : (snap.ids?.length || 0) > 0 ||
          (snap.ids && snap.ids.length === 0 && snap.hasOwnProperty("ts")),
    };
  }

  let hasColl = false;
  try {
    hasColl = await fclQueryWithRetry({
      cadence: verifyTopShotCollection,
      args: (arg, t) => [arg(addr, t.Address)],
    });
  } catch (e) {
    console.error(
      `[Profile.jsx] verifyTopShotCollection failed for ${addr}`,
      e
    );
  }

  if (!hasColl) {
    await metaStore.setItem(snapKey, {
      ts: Date.now(),
      ids: [],
      tiers: {},
      hasCollection: false,
    });
    return {
      addr,
      flow: +flow,
      tshot: +tshot,
      moments: 0,
      tiers: {},
      hasCollection: false,
    };
  }

  let idArr = [];
  try {
    const ids = await fclQueryWithRetry({
      cadence: getTopShotCollectionIDs,
      args: (arg, t) => [arg(addr, t.Address)],
    });
    idArr = Array.from(ids || []).map(String);
  } catch (e) {
    console.error(
      `[Profile.jsx] getTopShotCollectionIDs failed for ${addr}`,
      e
    );
    await metaStore.setItem(snapKey, {
      ts: Date.now(),
      ids: [],
      tiers: {},
      hasCollection: true,
    });
    return {
      addr,
      flow: +flow,
      tshot: +tshot,
      moments: 0,
      tiers: {},
      hasCollection: true,
    };
  }

  const tiers = {};
  if (idArr.length > 0) {
    const meta = await loadProfilePageTopShotMeta();
    const batches = [];
    for (let i = 0; i < idArr.length; i += BATCH_PROFILE_FETCH) {
      batches.push(idArr.slice(i, i + BATCH_PROFILE_FETCH));
    }
    try {
      await Promise.all(
        batches.map((chunk) =>
          LIMIT_PROFILE_FETCH(async () => {
            const details = await fclQueryWithRetry({
              cadence: getTopShotCollectionBatched,
              args: (arg, t) => [
                arg(addr, t.Address),
                arg(
                  chunk.map((id) => String(id)),
                  t.Array(t.UInt64)
                ),
              ],
            });
            (details || []).forEach((nft) => {
              const tier = meta[`${nft.setID}-${nft.playID}`];
              if (tier) bump(tiers, tier);
            });
          })
        )
      );
    } catch (e) {
      console.error(
        `[Profile.jsx] Error fetching batched details for tier calculation for ${addr}:`,
        e
      );
    }
  }

  await metaStore.setItem(snapKey, {
    ts: Date.now(),
    ids: idArr,
    tiers,
    hasCollection: true,
  });
  return {
    addr,
    flow: +flow,
    tshot: +tshot,
    moments: idArr.length,
    tiers,
    hasCollection: true,
  };
}

async function loadFamily(profileAddr, userContextData) {
  const parent = await fetchProfileAccountData(profileAddr, userContextData);
  let kidsData = [];
  let childrenAddressesToFetch = [];

  if (
    userContextData?.accountData?.parentAddress === profileAddr &&
    userContextData.accountData.hasChildren
  ) {
    childrenAddressesToFetch =
      userContextData.accountData.childrenAddresses || [];
    console.log(
      `[Profile.jsx] Using UserContext children addresses for ${profileAddr}`
    );
  } else if (
    parent.hasCollection !== false ||
    typeof parent.hasCollection === "undefined"
  ) {
    try {
      const hasKids = await fclQueryWithRetry({
        cadence: hasChildrenCadence,
        args: (arg, t) => [arg(profileAddr, t.Address)],
      });
      if (hasKids) {
        childrenAddressesToFetch = await fclQueryWithRetry({
          cadence: getChildren,
          args: (arg, t) => [arg(profileAddr, t.Address)],
        });
      }
    } catch (e) {
      console.error(
        `[Profile.jsx - loadFamily-children check] for ${profileAddr}:`,
        e
      );
    }
  }

  if (childrenAddressesToFetch.length > 0) {
    kidsData = await Promise.all(
      childrenAddressesToFetch.map((kidAddr) =>
        fetchProfileAccountData(kidAddr, userContextData)
      )
    );
  }

  return [parent, ...kidsData];
}

// MiniStat is defined before AccountCard
const MiniStat = ({ label, value }) => (
  <div className="py-2 border-r border-brand-border last:border-none">
    <p className="opacity-70 m-0 text-xs">{label}</p>
    <p className="font-semibold m-0">{value}</p>
  </div>
);

const AccountCard = ({ acc, idx, hasCollProp }) => {
  const hasCollectionStatus = hasCollProp;

  return (
    <div className="rounded-lg shadow border border-brand-primary">
      <div className="flex justify-between bg-brand-secondary px-3 py-1.5 rounded-t-lg">
        <h3 className="text-sm font-semibold m-0">
          {idx === 0 ? "Parent" : `Child ${idx}`}
        </h3>
        <button
          onClick={() => navigator.clipboard.writeText(acc.addr)}
          className="truncate max-w-[200px] text-xs hover:opacity-80 select-none"
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
        {hasCollectionStatus === false ? (
          <p className="italic text-xs">No TopShot collection.</p>
        ) : TIER_ORDER.some((t) => acc.tiers && acc.tiers[t]) ? (
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
          <p className="italic text-xs">
            Collection has no moments or tiers with available data.
          </p>
        )}
      </div>
    </div>
  );
};

function Profile() {
  const { address: paramAddr } = useParams();
  const userDataCtx = useContext(UserDataContext);

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

  const walletAddr = paramAddr ? paramAddr.toLowerCase() : null;

  const [accountsData, setAccountsData] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true); // For primary account data (balances, moment counts, tiers)

  useEffect(() => {
    if (!walletAddr) {
      setLoadingProfile(false);
      setAccountsData([]);
      return;
    }
    let alive = true;
    (async () => {
      setLoadingProfile(true);
      try {
        const fam = await loadFamily(walletAddr, userDataCtx);
        if (alive) setAccountsData(fam);
      } catch (e) {
        console.error("[profile-load]", e);
        if (alive) setAccountsData([]);
      } finally {
        if (alive) setLoadingProfile(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [walletAddr, userDataCtx]);

  const aggregate = useMemo(() => {
    const out = { flow: 0, tshot: 0, moments: 0, tiers: {} };
    (accountsData || []).forEach((a) => {
      out.flow += +(a?.flow || 0);
      out.tshot += +(a?.tshot || 0);
      out.moments += a?.moments || 0;
      if (a?.tiers) {
        Object.entries(a.tiers).forEach(([t, c]) => bump(out.tiers, t, c));
      }
    });
    return out;
  }, [accountsData]);

  // Separate loading states for async data not tied to main profile load
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

  const PAGE_HISTORY = 20;
  const [currentPageHistory, setCurrentPageHistory] = useState(1);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [totalPagesHistory, setTotalPagesHistory] = useState(1);
  useEffect(() => setCurrentPageHistory(1), [walletAddr]); // Reset page on address change
  useEffect(() => {
    if (!walletAddr) return;
    setEventsLoading(true);
    axios
      .get(`https://api.vaultopolis.com/wallet-events/${walletAddr}`, {
        params: { page: currentPageHistory, limit: PAGE_HISTORY, sort: "desc" },
      })
      .then((r) => {
        setEvents(r.data.items || []);
        setTotalPagesHistory(r.data.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setEventsLoading(false));
  }, [walletAddr, currentPageHistory]);

  let redirectTarget = null;
  if (!paramAddr && viewerReady) {
    redirectTarget = viewer?.addr
      ? `/profile/${viewer.addr.toLowerCase()}`
      : "/";
  }

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

  // Redirect if necessary
  if (redirectTarget) {
    return <Navigate to={redirectTarget} replace />;
  }

  // Content to show if no walletAddr but viewer is being determined or not logged in
  const renderPreContent = () => {
    if (!walletAddr && viewerReady && !viewer?.addr) {
      return (
        <p className="mt-4">Connect your Flow wallet to view any profile.</p>
      );
    }
    if (!walletAddr && !viewerReady) {
      return <p className="mt-4">Loading profile viewer state...</p>;
    }
    return null; // Should not happen if walletAddr is set or redirect occurs
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta name="keywords" content="vaultopolis profile, flow wallet profile, nba top shot portfolio, tshot balance, flow blockchain wallet" />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index,follow" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDesc} />
        
        {/* Enhanced Structured Data */}
        {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "name": "Vaultopolis Profile",
            "description": "View your NBA Top Shot Moments, TSHOT balance, and transaction history",
            "url": canonicalUrl
          })}
        </script>
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

        {/* Handle cases where walletAddr is not yet determined or user needs to connect */}
        {!walletAddr && renderPreContent()}

        {/* Always render the main structure if walletAddr is present, sections handle their own loading */}
        {walletAddr && (
          <>
            {/* Headline Tiles: Uses loadingProfile state */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <Tile
                title="Total Flow"
                value={fixed(aggregate.flow)}
                loading={loadingProfile}
              />
              <Tile
                title="Total Moments"
                value={aggregate.moments}
                loading={loadingProfile}
              />
              <Tile
                title="Total TSHOT"
                value={fixed(aggregate.tshot, 1)}
                loading={loadingProfile}
              />
            </div>

            {/* Accounts Breakdown: Conditional on loadingProfile and accountsData */}
            {loadingProfile && (
              <p className="text-brand-text/70 my-8">
                Loading account details...
              </p>
            )}
            {!loadingProfile && accountsData.length > 0 && (
              <>
                <h2 className="text-xl font-bold mt-10 mb-4">
                  Accounts Breakdown
                </h2>
                <div className="space-y-6 mb-12">
                  {accountsData.map((a, i) => (
                    <AccountCard
                      key={a.addr}
                      acc={a}
                      idx={i}
                      hasCollProp={a.hasCollection}
                    />
                  ))}
                </div>
              </>
            )}
            {!loadingProfile && accountsData.length === 0 && walletAddr && (
              <p className="my-8">
                No account data or child accounts found for this profile.
              </p>
            )}

            {/* Vault Activity: Uses swapLoading state */}
            <h2 className="text-xl font-bold mt-10 mb-4">Vault Activity</h2>
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
                value={swapStats?.net ?? "--"}
                loading={swapLoading}
              />
            </div>
            <p className="text-xs text-brand-text/60 mt-2 mb-8">
              Vault-activity data counted from{" "}
              <strong>May&nbsp;1&nbsp;2025</strong>.
            </p>

            {/* Swap History: Uses eventsLoading state */}
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
                        <th className="py-1 pr-2"># NFTs/TSHOT</th>
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
                          <td className="py-1 pr-2">
                            {ev.data?.numNFTs ??
                              parseFloat(ev.data?.betAmount || 0).toFixed(1) ??
                              ""}
                          </td>
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
                  {totalPagesHistory > 1 && (
                    <div className="flex justify-center mt-4 gap-1">
                      {Array.from(
                        { length: totalPagesHistory },
                        (_, i) => i + 1
                      )
                        .filter((p) => {
                          if (totalPagesHistory <= 7) return true;
                          if (currentPageHistory <= 4)
                            return p <= 5 || p === totalPagesHistory;
                          if (currentPageHistory >= totalPagesHistory - 3)
                            return p >= totalPagesHistory - 4 || p === 1;
                          return [
                            1,
                            totalPagesHistory,
                            currentPageHistory - 1,
                            currentPageHistory,
                            currentPageHistory + 1,
                          ].includes(p);
                        })
                        .map((p) => (
                          <button
                            key={p}
                            disabled={p === currentPageHistory}
                            onClick={() => setCurrentPageHistory(p)}
                            className={`px-3 py-1 rounded select-none ${
                              p === currentPageHistory
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
