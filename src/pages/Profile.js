/* src/pages/Profile.jsx
    ------------------------------------------------------------
      /profile             – redirects:
                               • wallet connected  → /profile/<addr>
                               • not connected     → /
      /profile/:address   – read-only or owner view
    ------------------------------------------------------------ */

import React, { useEffect, useMemo, useState, useContext } from "react";
import { useParams, Navigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import * as fcl from "@onflow/fcl";
import { getFLOWBalance } from "../flow/getFLOWBalance";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionIDs";
import { getAllDayCollectionIDs } from "../flow/getAllDayCollectionIDs";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import { useAllDayContext } from "../context/AllDayContext";
import MyCollection from "./MyCollection";


/* ───────── constants ───────── */
const TIER_ORDER = ["common", "fandom", "rare", "legendary", "ultimate"];
const tierColour = {
  common: "text-gray-400",
  fandom: "text-lime-400",
  rare: "text-blue-500",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};


/* ───────── helpers ───────── */
const fixed = (n, d = 2) => (Number.isFinite(+n) ? (+n).toFixed(d) : "0");

// Calculate tier breakdown from NFT details
const calculateTierBreakdown = (nftDetails) => {
  const breakdown = {
    common: 0,
    fandom: 0,
    rare: 0,
    legendary: 0,
    ultimate: 0
  };
  
  if (nftDetails && Array.isArray(nftDetails)) {
    nftDetails.forEach(nft => {
      const tier = (nft.tier || "").toLowerCase();
      if (breakdown.hasOwnProperty(tier)) {
        breakdown[tier]++;
      }
    });
  }
  
  return breakdown;
};

// Calculate AllDay tier breakdown from NFT details
const calculateAllDayTierBreakdown = (nftDetails) => {
  const breakdown = {
    common: 0,
    uncommon: 0,
    rare: 0,
    legendary: 0,
    ultimate: 0
  };
  
  if (nftDetails && Array.isArray(nftDetails)) {
    nftDetails.forEach(nft => {
      const tier = (nft.tier || "").toLowerCase();
      if (breakdown.hasOwnProperty(tier)) {
        breakdown[tier]++;
      }
    });
  }
  
  return breakdown;
};

/* ───────── minimal UI helpers ───────── */






// MiniStat is defined before AccountCard
const MiniStat = ({ label, value, icon }) => (
  <div className="py-2 border-r border-brand-border last:border-none">
    <div className="flex items-center justify-center gap-1 opacity-70">
      {icon && <img src={icon} alt={label} className="w-4 h-4" />}
      <p className="m-0 text-xs">{label}</p>
    </div>
    <p className="font-semibold m-0">{value}</p>
  </div>
);

const AccountCard = ({ acc, idx, hasCollProp, userContextData, allDayData }) => {
  const hasCollectionStatus = hasCollProp;
  const isParent = idx === 0;
  const isChild = idx > 0;
  
  // Get display name for child accounts
  const displayName = isChild && (acc.displayName || userContextData?.accountData?.childrenData?.find(
    (c) => c.addr === acc.addr
  )?.displayName);
  
  // Determine if this is a Dapper wallet (child accounts with display names are Dapper)
  const isDapperWallet = isChild && !!displayName;

  return (
    <div className="shadow border border-brand-primary">
      <div className="bg-brand-secondary px-3 py-2 relative">
        {/* Single line: role badge + wallet icon + address/username */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="flex items-center space-x-1 min-w-0 flex-1">
              {isParent ? (
                <img
                  src="https://cdn.prod.website-files.com/68d31a12d30c3ba3a0928e1d/68d31a12d30c3ba3a092902a_Group%2047467.png"
                  alt="Flow Wallet"
                  className="w-5 h-5 shrink-0"
                />
              ) : (displayName ? (
                <svg fill="none" viewBox="0 0 53 54" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" aria-label="Dapper Wallet">
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
                  className="w-5 h-5 shrink-0"
                />
              ))}
              <div className="min-w-0 flex-1">
                <div className="flex flex-col">
                  {displayName && isChild ? (
                    <span className="text-[11px] leading-snug text-brand-text font-semibold truncate">
                      {displayName}
                    </span>
                  ) : (
                    <span className="text-[11px] leading-snug text-brand-text/80 font-semibold truncate opacity-0">
                      {/* Placeholder to maintain alignment */}
                      &nbsp;
                    </span>
                  )}
                  <span className={`text-[10px] leading-snug font-mono break-all select-none truncate ${displayName && isChild ? 'text-brand-text/60' : 'text-brand-text/80'}`}>
                    {acc.addr}
                  </span>
                </div>
              </div>
      </div>
          </div>
        </div>
      </div>
      
      <div className={`grid ${isParent ? 'grid-cols-4' : (isDapperWallet ? 'grid-cols-3' : 'grid-cols-4')} bg-brand-primary text-center text-xs`}>
        {!isDapperWallet && <MiniStat label="Flow" value={fixed(acc.flow)} icon="https://storage.googleapis.com/vaultopolis/FLOW.png" />}
        {isParent && <MiniStat label="TSHOT" value={fixed(acc.tshot, 1)} icon="https://storage.googleapis.com/vaultopolis/TSHOT.png" />}
        <MiniStat label="Moments" value={acc.moments + (allDayData?.moments || 0)} />
        <MiniStat label="Top Shot" value={acc.moments} />
        <MiniStat label="All Day" value={allDayData?.moments || 0} />
      </div>
      <div className="bg-brand-primary px-3 py-2">
        {hasCollectionStatus === false && !allDayData?.moments ? (
          <p className="italic text-xs">No collections found.</p>
        ) : (
          <div className="space-y-1">
            {/* Combined Tier Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              {/* TopShot Column */}
              <div>
                <h4 className="text-xs font-semibold text-brand-text/80 mb-1">Top Shot</h4>
                <div className="space-y-1">
                  {TIER_ORDER.map((t) => (
                    <div key={t} className="flex items-center text-xs">
                      <span className={tierColour[t]} style={{ minWidth: '60px' }}>
                        {t[0].toUpperCase() + t.slice(1)}
                      </span>
                      <span className="ml-2">{acc.tiers[t] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* AllDay Column */}
              <div>
                <h4 className="text-xs font-semibold text-brand-text/80 mb-1">All Day</h4>
                <div className="space-y-1">
                  {['common', 'uncommon', 'rare', 'legendary', 'ultimate'].map((t) => (
                    <div key={t} className="flex items-center text-xs">
                      <span className={tierColour[t] || (t === 'uncommon' ? tierColour.fandom : tierColour[t])} style={{ minWidth: '60px' }}>
                        {t[0].toUpperCase() + t.slice(1)}
                      </span>
                      <span className="ml-2">{allDayData?.tiers[t] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function Profile() {
  const { address: paramAddr } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const userDataCtx = useContext(UserDataContext);
  const { accountData, isRefreshing } = userDataCtx;
  
  // AllDay context
  const { 
    allDayCollectionData, 
    fetchAllDayCollection, 
    fetchAllDayCollectionDetails,
    setAllDayCollectionData 
  } = useAllDayContext();

  const [viewer, setViewer] = useState(null);
  const [viewerReady, setViewerReady] = useState(false);
  
  // Tab state from URL
  const activeTab = searchParams.get('tab') || 'portfolio';
  const sourceParam = searchParams.get('source');
  const collectionSource = sourceParam === 'allday' ? 'allday' : 'topshot';
  
  // Check if viewing own profile
  const walletAddr = paramAddr ? paramAddr.toLowerCase() : null;
  const isOwnProfile = walletAddr && accountData?.parentAddress?.toLowerCase() === walletAddr?.toLowerCase();
  
  useEffect(
    () =>
      fcl.currentUser().subscribe((u) => {
        setViewer(u);
        setViewerReady(true);
      }),
    []
  );

  // Public aggregate for when UserContext data is unavailable (incognito/public view)
  const [publicAggregate, setPublicAggregate] = useState({ flow: 0, tshot: 0, topshotMoments: 0, alldayMoments: 0 });

  useEffect(() => {
    if (!walletAddr) return;
    // Fetch public balances and counts
    (async () => {
      try {
        const [flowBal, tshotBal, tsIds, adIds] = await Promise.all([
          fcl.query({ cadence: getFLOWBalance, args: (arg, t) => [arg(walletAddr, t.Address)] }),
          fcl.query({ cadence: getTSHOTBalance, args: (arg, t) => [arg(walletAddr, t.Address)] }),
          fcl.query({ cadence: getTopShotCollectionIDs, args: (arg, t) => [arg(walletAddr, t.Address)] }),
          fcl.query({ cadence: getAllDayCollectionIDs, args: (arg, t) => [arg(walletAddr, t.Address)] }),
        ]);
        setPublicAggregate({
          flow: Number(flowBal || 0),
          tshot: Number(tshotBal || 0),
          topshotMoments: Array.isArray(tsIds) ? tsIds.length : 0,
          alldayMoments: Array.isArray(adIds) ? adIds.length : 0,
        });
      } catch (e) {
        // Fail silently for public view; leave zeros
        console.warn("Public profile fetch failed", e);
      }
    })();
  }, [walletAddr]);

  // Prevent locked tab from activating in URL when not owner
  useEffect(() => {
    if (!isOwnProfile && activeTab === "collection") {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", "portfolio");
      setSearchParams(newParams);
    }
  }, [activeTab, isOwnProfile, searchParams, setSearchParams]);

  const handleCollectionSourceChange = (nextSource) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('source', nextSource === 'allday' ? 'allday' : 'topshot');
    setSearchParams(newParams);
  };

  // Load AllDay collection data for all accounts (parent + children)
  useEffect(() => {
    if (!accountData?.parentAddress) return;
    
    const loadAllDayForAccount = async (addr) => {
      // Skip if already has data
      if (allDayCollectionData[addr]) return;
      
      try {
        const ids = await fetchAllDayCollection(addr);
        if (ids.length > 0) {
          const details = await fetchAllDayCollectionDetails(addr, ids);
          setAllDayCollectionData(prev => ({
            ...prev,
            [addr]: {
              nftDetails: details,
              isLoading: false,
              error: null
            }
          }));
        } else {
          setAllDayCollectionData(prev => ({
            ...prev,
            [addr]: {
              nftDetails: [],
              isLoading: false,
              error: null
            }
          }));
        }
      } catch (error) {
        console.error(`Error loading AllDay collection for ${addr}:`, error);
        setAllDayCollectionData(prev => ({
          ...prev,
          [addr]: {
            nftDetails: [],
            isLoading: false,
            error: error.message
          }
        }));
      }
    };
    
    // Load AllDay for parent account
    loadAllDayForAccount(accountData.parentAddress);
    
    // Load AllDay for all child accounts
    if (Array.isArray(accountData.childrenAddresses)) {
      accountData.childrenAddresses.forEach(childAddr => {
        loadAllDayForAccount(childAddr);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountData?.parentAddress, accountData?.childrenAddresses]);

  // Profile data is automatically loaded by UserContext when user logs in
  // No need for additional useEffect here

  const aggregate = useMemo(() => {
    const out = { flow: 0, tshot: 0, moments: 0, topshotMoments: 0, alldayMoments: 0, tiers: {} };
    
    // Add parent data
    if (accountData?.parentAddress) {
      out.flow += +(accountData.flowBalance || 0);
      out.tshot += +(accountData.tshotBalance || 0);
      const parentTopShotMoments = Array.isArray(accountData.nftDetails) ? accountData.nftDetails.length : 0;
      const parentAllDayMoments = allDayCollectionData[accountData.parentAddress]?.nftDetails?.length || 0;
      out.topshotMoments += parentTopShotMoments;
      out.alldayMoments += parentAllDayMoments;
      out.moments += parentTopShotMoments + parentAllDayMoments;
      Object.entries(accountData.tierCounts || {}).forEach(([tier, count]) => {
        out.tiers[tier] = (out.tiers[tier] || 0) + count;
      });
    }
    
    // Add children data
    if (Array.isArray(accountData?.childrenData)) {
      accountData.childrenData.forEach((child) => {
        out.flow += +(child.flowBalance || 0);
        // Note: Dapper wallets can't hold TSHOT, so we don't aggregate TSHOT from children
        const childTopShotMoments = Array.isArray(child.nftDetails) ? child.nftDetails.length : 0;
        const childAllDayMoments = allDayCollectionData[child.addr]?.nftDetails?.length || 0;
        out.topshotMoments += childTopShotMoments;
        out.alldayMoments += childAllDayMoments;
        out.moments += childTopShotMoments + childAllDayMoments;
        Object.entries(child.tierCounts || {}).forEach(([tier, count]) => {
          out.tiers[tier] = (out.tiers[tier] || 0) + count;
        });
      });
    }
    
    return out;
  }, [accountData, allDayCollectionData]);

  const displayAgg = accountData?.parentAddress ? aggregate : publicAggregate;

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
    if (viewer?.addr) {
      const tabParam = searchParams.get('tab');
      redirectTarget = tabParam 
        ? `/profile/${viewer.addr.toLowerCase()}?tab=${tabParam}`
        : `/profile/${viewer.addr.toLowerCase()}`;
    } else {
      redirectTarget = "/";
    }
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

  // Public profiles: do not redirect when not logged in

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

      <div className="w-full text-brand-text">

        {/* Handle cases where walletAddr is not yet determined or user needs to connect */}
        {!walletAddr && renderPreContent()}

        {/* Always render the main structure if walletAddr is present, sections handle their own loading */}
        {walletAddr && (
          <>
            {/* Show locked info message if trying to access collection on someone else's profile */}
            {!isOwnProfile && activeTab === "collection" && (
              <div className="max-w-6xl mx-auto px-3 sm:px-4 mt-3 mb-4">
                <div className="rounded-lg border border-brand-accent/50 bg-brand-secondary/20 p-3 shadow">
                  <div className="flex items-start gap-3">
                    <div className="text-xl text-brand-accent">🔒</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-brand-text m-0">
                        Private Collection View
                      </p>
                      <p className="text-xs text-brand-text/70 mt-1 mb-2">
                        To browse a collection you must be logged in and viewing your own profile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'portfolio' && (
              <div className="max-w-6xl mx-auto px-1 sm:px-4 mt-4">
            {/* Portfolio Summary Table */}
            <div className="rounded-lg shadow border border-brand-primary mb-6">
              <div className="">
              <div className="bg-brand-secondary px-3 py-2 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold m-0 text-brand-text">Portfolio Summary</h3>
                  <div className="flex items-center space-x-2 text-[11px] leading-snug text-brand-text/80">
                    {/* Parent Account */}
                    <div className="flex items-center space-x-1">
                      <img 
                        src="https://cdn.prod.website-files.com/68d31a12d30c3ba3a0928e1d/68d31a12d30c3ba3a092902a_Group%2047467.png" 
                        alt="Flow" 
                        className="w-5 h-5"
                      />
                      <span className="text-brand-text/80 font-mono break-all select-none">
                        {walletAddr || '--'}
                      </span>
                      {isOwnProfile && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] uppercase tracking-wide font-semibold text-brand-accent border border-brand-accent/60 rounded">
                          You
                        </span>
                      )}
                    </div>
                    {/* Plus Sign and Child Account - only show for own profile */}
                    {accountData?.parentAddress?.toLowerCase() === walletAddr?.toLowerCase() && userDataCtx?.accountData?.childrenData?.length > 0 && (
                      <>
                        <span className="text-brand-text/60 font-bold">+</span>
                        <div className="flex items-center space-x-1">
                          {userDataCtx.accountData.childrenData[0].displayName ? (
                            <svg fill="none" viewBox="0 0 53 54" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" aria-label="Dapper Wallet">
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
                              className="w-5 h-5"
                            />
                          )}
                          <span className="text-brand-text/80 font-mono break-all select-none">
                            {userDataCtx.accountData.childrenData[0].displayName || userDataCtx.accountData.childrenData[0].addr}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-brand-primary rounded-b-lg p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 md:gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-brand-text/60 mb-1">
                      <img src="https://storage.googleapis.com/vaultopolis/FLOW.png" alt="FLOW" className="w-5 h-5" />
                      Flow
                    </div>
                    <div className="text-sm font-semibold">
                      {isRefreshing ? (
                        <div className="w-12 h-4 bg-brand-secondary animate-pulse rounded mx-auto" />
                      ) : (
                        fixed(displayAgg.flow)
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-brand-text/60 mb-1">
                      <img src="https://storage.googleapis.com/vaultopolis/TSHOT.png" alt="TSHOT" className="w-5 h-5" />
                      TSHOT
                    </div>
                    <div className="text-sm font-semibold">
                      {isRefreshing ? (
                        <div className="w-12 h-4 bg-brand-secondary animate-pulse rounded mx-auto" />
                      ) : (
                        fixed(displayAgg.tshot, 1)
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-brand-text/60 mb-1">Top Shot</div>
                    <div className="text-sm font-semibold">
                      {isRefreshing ? (
                        <div className="w-12 h-4 bg-brand-secondary animate-pulse rounded mx-auto" />
                      ) : (
                        displayAgg.topshotMoments
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-brand-text/60 mb-1">All Day</div>
                    <div className="text-sm font-semibold">
                      {isRefreshing ? (
                        <div className="w-12 h-4 bg-brand-secondary animate-pulse rounded mx-auto" />
                      ) : (
                        displayAgg.alldayMoments
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-brand-text/60 mb-1">Mint TSHOT ← NFTs</div>
                    <div className="text-sm font-semibold">
                      {swapLoading ? (
                        <div className="w-12 h-4 bg-brand-secondary animate-pulse rounded mx-auto" />
                      ) : (
                        swapStats?.NFTToTSHOTSwapCompleted ?? 0
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-brand-text/60 mb-1">Burn TSHOT → NFTs</div>
                    <div className="text-sm font-semibold">
                      {swapLoading ? (
                        <div className="w-12 h-4 bg-brand-secondary animate-pulse rounded mx-auto" />
                      ) : (
                        swapStats?.TSHOTToNFTSwapCompleted ?? 0
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-brand-text/60 mb-1">Net (Mint − Burn)</div>
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
            </div>

            {/* Accounts Breakdown: Only show for own profile (logged in and viewing own address) */}
            {isRefreshing && accountData?.parentAddress?.toLowerCase() === walletAddr?.toLowerCase() && (
              <p className="text-brand-text/70 mb-4">
                Loading account details...
              </p>
            )}
            {!isRefreshing && accountData?.parentAddress?.toLowerCase() === walletAddr?.toLowerCase() && (
              <div className="max-w-6xl mx-auto px-1 sm:px-4">
              <div className="rounded-lg shadow border border-brand-primary mb-6">
                <div className="">
                <div className="bg-brand-secondary px-3 py-2 rounded-t-lg">
                  <h3 className="text-sm font-semibold m-0 text-brand-text">Accounts Breakdown</h3>
                </div>
                <div className="bg-brand-primary rounded-b-lg overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Parent Account */}
                    <div className="border-r border-brand-border">
                      <AccountCard
                        key={accountData.parentAddress}
                        acc={{
                          addr: accountData.parentAddress,
                          flow: accountData.flowBalance,
                          tshot: accountData.tshotBalance,
                          moments: Array.isArray(accountData.nftDetails) ? accountData.nftDetails.length : 0,
                          tiers: calculateTierBreakdown(accountData.nftDetails || []),
                          hasCollection: accountData.hasCollection,
                        }}
                        idx={0}
                        hasCollProp={accountData.hasCollection}
                        userContextData={userDataCtx}
                        allDayData={{
                          moments: allDayCollectionData[accountData.parentAddress]?.nftDetails?.length || 0,
                          tiers: calculateAllDayTierBreakdown(allDayCollectionData[accountData.parentAddress]?.nftDetails || [])
                        }}
                      />
                    </div>
                    {/* Child Account */}
                    {accountData.childrenData?.[0] && (
                      <div>
                        <AccountCard
                          key={accountData.childrenData[0].addr}
                          acc={{
                            addr: accountData.childrenData[0].addr,
                            flow: accountData.childrenData[0].flowBalance,
                            tshot: 0, // Dapper wallets can't hold TSHOT
                            moments: Array.isArray(accountData.childrenData[0].nftDetails) ? accountData.childrenData[0].nftDetails.length : 0,
                            tiers: calculateTierBreakdown(accountData.childrenData[0].nftDetails || []),
                            hasCollection: accountData.childrenData[0].hasCollection,
                            displayName: accountData.childrenData[0].displayName,
                          }}
                          idx={1}
                          hasCollProp={accountData.childrenData[0].hasCollection}
                          userContextData={userDataCtx}
                          allDayData={{
                            moments: allDayCollectionData[accountData.childrenData[0].addr]?.nftDetails?.length || 0,
                            tiers: calculateAllDayTierBreakdown(allDayCollectionData[accountData.childrenData[0].addr]?.nftDetails || [])
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>
                </div>
            )}
            {/* Hide missing data note for public profiles; only show when viewing own profile */}
            {!isRefreshing && accountData?.parentAddress?.toLowerCase() === walletAddr?.toLowerCase() && !accountData?.parentAddress && walletAddr && (
              <p className="mb-6">
                No account data or child accounts found for this profile.
              </p>
            )}
            {/* Show note for public profiles that Accounts Breakdown is only available when logged in */}
            {!isRefreshing && accountData?.parentAddress?.toLowerCase() !== walletAddr?.toLowerCase() && walletAddr && (
              <div className="rounded-lg shadow border border-brand-primary mb-6">
                <div className="bg-brand-secondary px-3 py-2 rounded-t-lg">
                  <h3 className="text-sm font-semibold m-0 text-brand-text">Accounts Breakdown</h3>
                </div>
                <div className="bg-brand-primary rounded-b-lg p-4">
                  <p className="text-sm text-brand-text/70 text-center m-0">
                    This section is only available when you are logged in and viewing your own profile.
                  </p>
                </div>
              </div>
            )}

            {/* User Activity: Swap History */}
            <div className="max-w-6xl mx-auto px-1 sm:px-4">
            <div className="rounded-lg shadow border border-brand-primary mb-6">
              <div className="">
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
                          <table className="w-full text-xs sm:text-sm min-w-[500px]">
                    <thead>
                      <tr className="text-left border-b border-brand-border">
                                <th className="py-2 pr-1 sm:pr-2">When</th>
                                <th className="py-2 pr-1 sm:pr-2">Type</th>
                                <th className="py-2 pr-1 sm:pr-2">Received</th>
                                <th className="py-2">Tx ↗</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev) => (
                        <tr
                          key={ev.transactionId}
                          className="border-b border-brand-border/30"
                        >
                                  <td className="py-2 pr-1 sm:pr-2 text-xs">
                            {new Date(ev.blockTimestamp).toLocaleDateString()}
                          </td>
                          <td className="py-2 pr-1 sm:pr-2 text-xs whitespace-nowrap">
                            {ev.type.includes("NFTToTSHOT")
                              ? "Mint TSHOT ← NFTs"
                              : "Burn TSHOT → NFTs"}
                          </td>
                          <td className="py-2 pr-1 sm:pr-2 text-xs whitespace-nowrap">
                            {ev.type.includes("NFTToTSHOT") ? (
                              // 1:1 mapping – treat NFT count as TSHOT minted and show TSHOT icon
                              (() => {
                                const raw = ev?.data?.numNFTs ?? ev?.data?.nftCount ?? ev?.data?.count ?? ev?.data?.value ?? 0;
                                const num = Number(raw);
                                const val = Number.isFinite(num) ? num : 0;
                                return (
                                  <span className="inline-flex items-center gap-1">
                                    <img src="https://storage.googleapis.com/vaultopolis/TSHOT.png" alt="TSHOT" className="w-4 h-4" />
                                    <span>{val.toLocaleString()}</span>
                                  </span>
                                );
                              })()
                            ) : (
                              // Single value: show NFTs received
                              (() => {
                                const nftRaw = ev?.data?.numNFTs ?? ev?.data?.nftCount ?? ev?.data?.count ?? ev?.data?.value ?? 0;
                                const nftNum = Number(nftRaw);
                                const nftVal = Number.isFinite(nftNum) ? nftNum : 0;
                                return (
                                  <span className="inline-flex items-center gap-1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2zm0 2.2L6 7v9l6 3.4 6-3.4V7l-6-2.8zm0 1.9L16.5 8 12 10.2 7.5 8 12 6.1z" /></svg>
                                    <span>{nftVal.toLocaleString()}</span>
                                  </span>
                                );
                              })()
                            )}
                          </td>
                          <td className="py-2">
                            <a
                              href={`https://flowscan.io/transaction/${ev.transactionId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-accent hover:text-brand-accent/80 underline text-xs"
                            >
                              {ev.transactionId.slice(0, 6)}...
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                      </div>
                  {totalPagesHistory > 1 && (
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPageHistory((p) => Math.max(1, p - 1))}
                          disabled={currentPageHistory === 1}
                          className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <span className="text-sm text-brand-text/70 min-w-[100px] text-center">
                          Page {currentPageHistory} of {totalPagesHistory}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPageHistory((p) =>
                              Math.min(totalPagesHistory, p + 1)
                            )
                          }
                          disabled={currentPageHistory === totalPagesHistory}
                          className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                      <div className="h-[1px] w-8 bg-brand-primary/30" />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={totalPagesHistory}
                          value={currentPageHistory}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (!Number.isNaN(val) && val >= 1 && val <= totalPagesHistory) {
                              setCurrentPageHistory(val);
                            }
                          }}
                          className="w-16 px-2 py-1 rounded bg-brand-primary text-brand-text/80 text-sm border border-brand-border focus:outline-none focus:ring-2 focus:ring-opolis"
                        />
                      </div>
                    </div>
                  )}
                </> 
              )}
                </div>
              </div>
              </div>
            </div>
            </div>
            </div>
            )}

            {/* Collection Tab Content - Only shown when viewing own profile */}
            {activeTab === 'collection' && isOwnProfile && (
              <MyCollection
                isOwnProfile={isOwnProfile}
                source={collectionSource}
                onSourceChange={handleCollectionSourceChange}
              />
            )}

            {/* Show message if trying to access collection tab but not own profile */}
          </>
        )}
      </div>
    </>
  );
}

export default Profile;
