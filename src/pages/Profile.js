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

const AccountCard = ({ acc, idx, hasCollProp, userContextData }) => {
  const hasCollectionStatus = hasCollProp;
  const isParent = idx === 0;
  const isChild = idx > 0;
  
  // Get display name for child accounts
  const displayName = isChild && userContextData?.accountData?.childrenData?.find(
    (c) => c.addr === acc.addr
  )?.displayName;

  const primaryText = isParent ? null : (displayName || `Child ${idx}`);
  const hasPrimary = !!primaryText;

  return (
    <div className="shadow border border-brand-primary">
      <div className="bg-brand-secondary px-3 py-2 relative">
        {/* Single line: role badge + wallet icon + address/username */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-brand-primary/60 text-brand-text font-semibold whitespace-nowrap border border-brand-border/50">
              {isParent ? "PARENT" : "CHILD"}
            </span>
            <div className="flex items-center space-x-1 min-w-0 flex-1">
              {isParent ? (
                <img
                  src="https://cdn.prod.website-files.com/68d31a12d30c3ba3a0928e1d/68d31a12d30c3ba3a092902a_Group%2047467.png"
                  alt="Flow Wallet"
                  className="w-3 h-3 shrink-0"
                />
              ) : (displayName ? (
                <svg fill="none" viewBox="0 0 53 54" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0" aria-label="Dapper Wallet">
                  <g fill="none" fillRule="evenodd" transform="translate(.197 .704)">
                    <path fill="#F5E3F7" d="M52.803 26.982C52.803 12.412 40.983.6 26.4.6 11.82.6 0 12.41 0 26.982v13.789c0 6.462 5.291 11.75 11.758 11.75h29.287c6.466 0 11.758-5.288 11.758-11.75V26.982z"></path>
                    <g>
                      <path fill="#FF5A9D" d="M45.92 22.847c0-4.049-1.191-19.768-16.434-22.15-13.545-2.116-24.77 2.144-27.628 15.72-2.859 13.576-.239 26.199 9.765 27.39 10.004 1.19 12.861.714 23.341.238 10.48-.477 10.956-17.149 10.956-21.198" transform="translate(3.2 5.333)"></path>
                      <path fill="#FFF" d="M32.763 11.307c-4.457 0-8.255 2.82-9.709 6.772-1.453-3.953-5.252-6.772-9.709-6.772-5.712 0-10.342 4.63-10.342 10.342 0 5.712 4.63 10.342 10.342 10.342 4.457 0 8.256-2.82 9.71-6.772 1.453 3.952 5.251 6.772 9.708 6.772 5.712 0 10.342-4.63 10.342-10.342 0-5.712-4.63-10.342-10.342-10.342" transform="translate(3.2 5.333)"></path>
                      <path fill="#7320D3" d="M13.556 14.364c-3.73 0-6.753 3.023-6.753 6.754 0 3.73 3.023 6.753 6.753 6.753s6.754-3.023 6.754-6.753-3.023-6.754-6.754-6.754M32.552 14.364c-3.73 0-6.754 3.023-6.754 6.754 0 3.73 3.024 6.753 6.754 6.753 3.73 0 6.754-3.023 6.754-6.753s-3.024-6.754-6.754-6.754" transform="translate(3.2 5.333)"></path>
                      <path fill="#FFF" d="M19.427 16.27c0 1.64-1.33 2.968-2.969 2.968-1.639 0-2.968-1.329-2.968-2.968s1.33-2.968 2.968-2.968c1.64 0 2.969 1.33 2.969 2.968M39.214 16.27c0 1.64-1.33 2.968-2.968 2.968-1.64 0-2.968-1.329-2.968-2.968s1.328-2.968 2.968-2.968c1.638 0 2.968 1.33 2.968 2.968" transform="translate(3.2 5.333)"></path>
                    </g>
                  </g>
                </svg>
              ) : (
                <img
                  src="https://cdn.prod.website-files.com/68d31a12d30c3ba3a0928e1d/68d31a12d30c3ba3a092902a_Group%2047467.png"
                  alt="Flow Wallet"
                  className="w-3 h-3 shrink-0"
                />
              ))}
              <span className="text-[11px] leading-snug text-brand-text/80 font-mono break-all select-none truncate">
                {isChild && displayName ? displayName : acc.addr}
              </span>
      </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 bg-brand-primary text-center text-xs">
        <MiniStat label="Flow" value={fixed(acc.flow)} />
        <MiniStat label="Moments" value={acc.moments} />
        <MiniStat label="TSHOT" value={fixed(acc.tshot, 1)} />
      </div>
      <div className="bg-brand-primary px-3 py-2">
        {hasCollectionStatus === false ? (
          <p className="italic text-xs">No TopShot collection.</p>
        ) : TIER_ORDER.some((t) => acc.tiers && acc.tiers[t]) ? (
          <div className="space-y-1">
            {TIER_ORDER.map(
            (t) =>
              acc.tiers[t] && (
                  <div key={t} className="flex items-center text-xs">
                    <span className={tierColour[t]} style={{ minWidth: '60px' }}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </span>
                    <span className="ml-2">{acc.tiers[t]}</span>
                </div>
              )
            )}
          </div>
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

      <div className="p-4 sm:p-6 max-w-7xl mx-auto text-brand-text">

        {/* Handle cases where walletAddr is not yet determined or user needs to connect */}
        {!walletAddr && renderPreContent()}

        {/* Always render the main structure if walletAddr is present, sections handle their own loading */}
        {walletAddr && (
          <>
            {/* Portfolio Summary Table */}
            <div className="rounded-lg shadow border border-brand-primary mb-6">
              <div className="bg-brand-secondary px-3 py-2 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold m-0 text-brand-text">Portfolio Summary</h3>
                  <div className="flex items-center space-x-2 text-[11px] leading-snug text-brand-text/80">
                    {/* Parent Account */}
                    <div className="flex items-center space-x-1">
                      <img 
                        src="https://cdn.prod.website-files.com/68d31a12d30c3ba3a0928e1d/68d31a12d30c3ba3a092902a_Group%2047467.png" 
                        alt="Flow" 
                        className="w-3 h-3"
                      />
                      <span className="text-brand-text/80 font-mono break-all select-none">
                        {walletAddr || '--'}
                      </span>
                    </div>
                    {/* Plus Sign */}
                    <span className="text-brand-text/60 font-bold">+</span>
                    {/* Child Account */}
                    {userDataCtx?.accountData?.childrenData?.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {userDataCtx.accountData.childrenData[0].displayName ? (
                          <svg fill="none" viewBox="0 0 53 54" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" aria-label="Dapper Wallet">
                            <g fill="none" fillRule="evenodd" transform="translate(.197 .704)">
                              <path fill="#F5E3F7" d="M52.803 26.982C52.803 12.412 40.983.6 26.4.6 11.82.6 0 12.41 0 26.982v13.789c0 6.462 5.291 11.75 11.758 11.75h29.287c6.466 0 11.758-5.288 11.758-11.75V26.982z"></path>
                              <g>
                                <path fill="#FF5A9D" d="M45.92 22.847c0-4.049-1.191-19.768-16.434-22.15-13.545-2.116-24.77 2.144-27.628 15.72-2.859 13.576-.239 26.199 9.765 27.39 10.004 1.19 12.861.714 23.341.238 10.48-.477 10.956-17.149 10.956-21.198" transform="translate(3.2 5.333)"></path>
                                <path fill="#FFF" d="M32.763 11.307c-4.457 0-8.255 2.82-9.709 6.772-1.453-3.953-5.252-6.772-9.709-6.772-5.712 0-10.342 4.63-10.342 10.342 0 5.712 4.63 10.342 10.342 10.342 4.457 0 8.256-2.82 9.71-6.772 1.453 3.952 5.251 6.772 9.708 6.772 5.712 0 10.342-4.63 10.342-10.342 0-5.712-4.63-10.342-10.342-10.342" transform="translate(3.2 5.333)"></path>
                                <path fill="#7320D3" d="M13.556 14.364c-3.73 0-6.753 3.023-6.753 6.754 0 3.73 3.023 6.753 6.753 6.753s6.754-3.023 6.754-6.753-3.023-6.754-6.754-6.754M32.552 14.364c-3.73 0-6.754 3.023-6.754 6.754 0 3.73 3.024 6.753 6.754 6.753 3.73 0 6.754-3.023 6.754-6.753s-3.024-6.754-6.754-6.754" transform="translate(3.2 5.333)"></path>
                              </g>
                            </g>
                          </svg>
                        ) : (
                          <img 
                            src="https://cdn.prod.website-files.com/68d31a12d30c3ba3a0928e1d/68d31a12d30c3ba3a092902a_Group%2047467.png" 
                            alt="Flow" 
                            className="w-3 h-3"
                          />
                        )}
                        <span className="text-brand-text/80 font-mono break-all select-none">
                          {userDataCtx.accountData.childrenData[0].displayName || userDataCtx.accountData.childrenData[0].addr}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-brand-primary rounded-b-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-brand-text/60 mb-1">Total Flow</div>
                    <div className="text-sm font-semibold">
                      {loadingProfile ? (
                        <div className="w-12 h-4 bg-brand-secondary animate-pulse rounded mx-auto" />
                      ) : (
                        fixed(aggregate.flow)
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-brand-text/60 mb-1">Total Moments</div>
                    <div className="text-sm font-semibold">
                      {loadingProfile ? (
                        <div className="w-12 h-4 bg-brand-secondary animate-pulse rounded mx-auto" />
                      ) : (
                        aggregate.moments
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-brand-text/60 mb-1">Total TSHOT</div>
                    <div className="text-sm font-semibold">
                      {loadingProfile ? (
                        <div className="w-12 h-4 bg-brand-secondary animate-pulse rounded mx-auto" />
                      ) : (
                        fixed(aggregate.tshot, 1)
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-brand-text/60 mb-1">Deposits (NFT → TSHOT)</div>
                    <div className="text-sm font-semibold">
                      {swapLoading ? (
                        <div className="w-12 h-4 bg-brand-secondary animate-pulse rounded mx-auto" />
                      ) : (
                        swapStats?.NFTToTSHOTSwapCompleted ?? 0
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-brand-text/60 mb-1">Withdrawals (TSHOT → NFT)</div>
                    <div className="text-sm font-semibold">
                      {swapLoading ? (
                        <div className="w-12 h-4 bg-brand-secondary animate-pulse rounded mx-auto" />
                      ) : (
                        swapStats?.TSHOTToNFTSwapCompleted ?? 0
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-brand-text/60 mb-1">Net (Deposits – Withdrawals)</div>
                    <div className="text-sm font-semibold">
                      {swapLoading ? (
                        <div className="w-12 h-4 bg-brand-secondary animate-pulse rounded mx-auto" />
                      ) : (
                        swapStats?.net ?? "--"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accounts Breakdown: Conditional on loadingProfile and accountsData */}
            {loadingProfile && (
              <p className="text-brand-text/70 mb-4">
                Loading account details...
              </p>
            )}
            {!loadingProfile && accountsData.length > 0 && (
              <div className="rounded-lg shadow border border-brand-primary mb-6">
                <div className="bg-brand-secondary px-3 py-2 rounded-t-lg">
                  <h3 className="text-sm font-semibold m-0 text-brand-text">Accounts Breakdown</h3>
                </div>
                <div className="bg-brand-primary rounded-b-lg overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Parent Account */}
                    {accountsData[0] && (
                      <div className="border-r border-brand-border">
                    <AccountCard
                          key={accountsData[0].addr}
                          acc={accountsData[0]}
                          idx={0}
                          hasCollProp={accountsData[0].hasCollection}
                          userContextData={userDataCtx}
                        />
                </div>
                    )}
                    {/* Child Account */}
                    {accountsData[1] && (
                      <div>
                        <AccountCard
                          key={accountsData[1].addr}
                          acc={accountsData[1]}
                          idx={1}
                          hasCollProp={accountsData[1].hasCollection}
                          userContextData={userDataCtx}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {!loadingProfile && accountsData.length === 0 && walletAddr && (
              <p className="mb-6">
                No account data or child accounts found for this profile.
              </p>
            )}

            {/* User Activity: Swap History */}
            <div className="rounded-lg shadow border border-brand-primary mb-6">
              <div className="bg-brand-secondary px-3 py-2 rounded-t-lg">
                <h3 className="text-sm font-semibold m-0 text-brand-text">User Activity</h3>
            </div>
                <div className="bg-brand-primary rounded-b-lg p-4">
                  <p className="text-xs text-brand-text/60 mb-4">
              Vault-activity data counted from{" "}
              <strong>May&nbsp;1&nbsp;2025</strong>.
            </p>

                  {/* Swap History */}
                  <div className="mb-6">
              {eventsLoading ? (
                      <p className="text-brand-text/70 mb-8">Loading events…</p>
              ) : !events.length ? (
                      <p className="italic text-sm mb-8">No swap events.</p>
              ) : (
                <>
                        <div className="overflow-x-auto mb-8">
                          <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="text-left border-b border-brand-border">
                                <th className="py-2 pr-2">When</th>
                                <th className="py-2 pr-2">Type</th>
                                <th className="py-2 pr-2"># NFTs/TSHOT</th>
                                <th className="py-2">Tx ↗</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev) => (
                        <tr
                          key={ev.transactionId}
                          className="border-b border-brand-border/30"
                        >
                                  <td className="py-2 pr-2">
                            {new Date(ev.blockTimestamp).toLocaleString()}
                          </td>
                          <td className="py-2 pr-2">
                            {ev.type.includes("NFTToTSHOT")
                              ? "Deposit (NFT → TSHOT)"
                              : "Withdrawal (TSHOT → NFT)"}
                          </td>
                          <td className="py-2 pr-2">
                            {ev.data?.numNFTs ??
                              parseFloat(ev.data?.betAmount || 0).toFixed(1) ??
                              ""}
                          </td>
                          <td className="py-2">
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
                      </div>
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
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Profile;
