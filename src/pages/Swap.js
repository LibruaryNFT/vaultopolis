import React, { useState, useEffect, useContext } from "react";
import { UserDataContext } from "../context/UserContext";
import { useAnnouncement } from "../context/AnnouncementContext";
import * as fcl from "@onflow/fcl";
import { getChildren } from "../flow/getChildren";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import NFTToTSHOTPanel from "../components/NFTToTSHOTPanel";
import TSHOTToNFTPanel from "../components/TSHOTToNFTPanel";
import TransactionModal from "../components/TransactionModal";
import AccountSelection from "../components/AccountSelection";
import { AnimatePresence } from "framer-motion";

import { Helmet } from "react-helmet-async";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import TSHOTInfo from "../components/TSHOTInfo";
import SwapApplication from "../components/SwapApplication";

/** Utility to get total TSHOT balance across parent + child. */
function getTotalTSHOTBalance(accountData) {
  if (!accountData) return 0;
  let total = parseFloat(accountData.tshotBalance || 0) || 0;
  if (Array.isArray(accountData.childrenData)) {
    for (const child of accountData.childrenData) {
      let cBal = parseFloat(child.tshotBalance || 0);
      if (isNaN(cBal)) cBal = 0;
      total += cBal;
    }
  }
  return total;
}

/** Utility to get total Common & Fandom counts across parent + child. */
function getTotalNFTCounts(accountData) {
  if (!accountData) return { common: 0, fandom: 0 };
  let common = 0;
  let fandom = 0;

  const tally = (arr) => {
    if (!Array.isArray(arr)) return;
    for (const nft of arr) {
      const tier = (nft.tier || "").toLowerCase();
      if (tier === "common") common++;
      if (tier === "fandom") fandom++;
    }
  };

  tally(accountData.nftDetails);
  if (Array.isArray(accountData.childrenData)) {
    for (const child of accountData.childrenData) {
      tally(child.nftDetails);
    }
  }
  return { common, fandom };
}

/** If from=TSHOT => to=NFT, else from=NFT => to=TSHOT. */
function getOppositeAsset(asset) {
  return asset === "TSHOT" ? "TopShot Common / Fandom" : "TSHOT";
}

const Swap = () => {
  const {
    user,
    accountData,
    selectedAccount,
    selectedNFTs,
    dispatch,
    isLoadingChildren,
  } = useContext(UserDataContext);

  const isLoggedIn = Boolean(user?.loggedIn);
  
  // Announcement context
  const { featuredAnnouncement, shouldShowFeaturedBanner, dismissBanner } = useAnnouncement();

  // Initial direction: from NFT => TSHOT
  const [fromAsset, setFromAsset] = useState("TopShot Common / Fandom");
  const [toAsset, setToAsset] = useState("TSHOT");

  // Text input for amounts
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [lastFocus, setLastFocus] = useState(null);

  // Transaction modal
  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});

  // Excluded NFT IDs (committed for TSHOT, so we don't see them again)
  const [excludedNftIds, setExcludedNftIds] = useState([]);

  const [showInfoModal, setShowInfoModal] = useState(false);

  const [childAddresses, setChildAddresses] = useState([]);

  // TSHOTInfo data fetching state
  const [vaultSummary, setVaultSummary] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [tshotLoading, setTshotLoading] = useState(true);
  const [tshotError, setTshotError] = useState(null);
  const [accountCollections, setAccountCollections] = useState({});

  // Wallet connection function
  const handleConnectWallet = async () => {
    try {
      await fcl.authenticate();
      // After successful authentication, the user will be redirected to the app automatically
      // due to the isLoggedIn state change in the conditional rendering
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  // Whenever fromAsset changes, auto-switch toAsset
  useEffect(() => {
    setToAsset(getOppositeAsset(fromAsset));
  }, [fromAsset]);

  // If from=NFT, then fromInput & toInput = selectedNFTs.length
  const isNFTMode = fromAsset === "TopShot Common / Fandom";
  useEffect(() => {
    if (isNFTMode) {
      setFromInput(String(selectedNFTs.length));
      setToInput(String(selectedNFTs.length));
    }
  }, [selectedNFTs, isNFTMode]);

  // If TSHOT deposit is pending (receipt)
  const tshotReceiptAmount =
    accountData?.hasReceipt && accountData.receiptDetails
      ? Number(accountData.receiptDetails.betAmount)
      : null;

  // If from=TSHOT => set fromInput & toInput to tshotReceiptAmount
  useEffect(() => {
    if (
      fromAsset === "TSHOT" &&
      tshotReceiptAmount !== null &&
      !isNaN(tshotReceiptAmount)
    ) {
      setFromInput(tshotReceiptAmount.toString());
      setToInput(tshotReceiptAmount.toString());
    }
  }, [fromAsset, tshotReceiptAmount]);

  // Fetch TSHOTInfo data for logged-out users
  useEffect(() => {
    if (!isLoggedIn) {
      const fetchTshotData = async () => {
        try {
          setTshotLoading(true);
          const [vaultResponse, analyticsResponse] = await Promise.all([
            fetch("https://api.vaultopolis.com/tshot-vault"),
            fetch("https://api.vaultopolis.com/wallet-leaderboard?limit=3000")
          ]);
          
          if (!vaultResponse.ok) {
            throw new Error(`Vault API error! status: ${vaultResponse.status}`);
          }
          if (!analyticsResponse.ok) {
            throw new Error(`Analytics API error! status: ${analyticsResponse.status}`);
          }
          
          const vaultData = await vaultResponse.json();
          const leaderboardData = await analyticsResponse.json();
          
          // Process analytics data similar to TSHOTAnalytics component
          const items = leaderboardData.items || [];
          const totalDeposits = items.reduce((sum, user) => sum + (user.NFTToTSHOTSwapCompleted || 0), 0);
          const totalWithdrawals = items.reduce((sum, user) => sum + (user.TSHOTToNFTSwapCompleted || 0), 0);
          const totalMomentsExchanged = totalDeposits + totalWithdrawals;
          const totalUniqueWallets = items.length;
          
          const processedAnalyticsData = {
            totalMomentsExchanged,
            totalUniqueWallets,
            totalDeposits,
            totalWithdrawals
          };
          
          setVaultSummary(vaultData);
          setAnalyticsData(processedAnalyticsData);
        } catch (err) {
          console.error("Failed to fetch TSHOT data:", err);
          setTshotError(err.message);
        } finally {
          setTshotLoading(false);
        }
      };

      fetchTshotData();
    }
  }, [isLoggedIn]);

  // Load child addresses and check collections independently for step 2
  useEffect(() => {
    if (accountData?.parentAddress) {
      // First check parent collection
      fcl
        .query({
          cadence: verifyTopShotCollection,
          args: (arg, t) => [arg(accountData.parentAddress, t.Address)],
        })
        .then((hasCollection) => {
          setAccountCollections((prev) => ({
            ...prev,
            [accountData.parentAddress]: hasCollection,
          }));
        })
        .catch(console.error);

      // Then get and check child addresses
      fcl
        .query({
          cadence: getChildren,
          args: (arg, t) => [arg(accountData.parentAddress, t.Address)],
        })
        .then(async (addrs) => {
          setChildAddresses(addrs || []);
          // Check collections for each child
          for (const addr of addrs) {
            try {
              const hasCollection = await fcl.query({
                cadence: verifyTopShotCollection,
                args: (arg, t) => [arg(addr, t.Address)],
              });
              setAccountCollections((prev) => ({
                ...prev,
                [addr]: hasCollection,
              }));
            } catch (err) {
              console.error(`Error checking collection for ${addr}:`, err);
            }
          }
        })
        .catch(console.error);
    }
  }, [accountData?.parentAddress]);

  // Decide if we show NFT->TSHOT or TSHOT->NFT swap panel
  function getDashboardMode() {
    if (fromAsset === "TopShot Common / Fandom" && toAsset === "TSHOT") {
      return "NFT_TO_TSHOT";
    }
    if (fromAsset === "TSHOT" && toAsset === "TopShot Common / Fandom") {
      return "TSHOT_TO_NFT";
    }
    return null;
  }
  const dashboardMode = getDashboardMode();

  // If TSHOT->NFT => fromInput & toInput must match
  useEffect(() => {
    if (dashboardMode === "TSHOT_TO_NFT") {
      if (lastFocus === "from" && toInput !== fromInput) {
        setToInput(fromInput);
      } else if (lastFocus === "to" && fromInput !== toInput) {
        setFromInput(toInput);
      }
    }
  }, [dashboardMode, fromInput, toInput, lastFocus]);

  /** Safe parse integer from a string. */
  function safeNumberParse(str) {
    if (!str) return 0;
    const val = Number(str);
    return isNaN(val) ? 0 : val;
  }

  // Compute from & to
  let rawFrom;
  if (isNFTMode) {
    rawFrom = selectedNFTs.length;
  } else if (fromAsset === "TSHOT" && tshotReceiptAmount != null) {
    rawFrom = tshotReceiptAmount;
  } else {
    rawFrom = safeNumberParse(fromInput);
  }
  const computedFrom = isNaN(rawFrom) ? 0 : rawFrom;
  const formattedFrom = computedFrom.toFixed(1);
  const isOverMax = computedFrom > 50;
  const isOverNFTLimit = isNFTMode && selectedNFTs.length > 200;

  let rawTo;
  if (isNFTMode) {
    rawTo = selectedNFTs.length;
  } else if (toAsset === "TSHOT" && tshotReceiptAmount != null) {
    rawTo = tshotReceiptAmount;
  } else {
    rawTo = safeNumberParse(toInput);
  }
  const computedTo = isNaN(rawTo) ? 0 : rawTo;
  const formattedTo = computedTo.toFixed(1);

  // Render balances for the From/To boxes
  const renderFromBalance = () => {
    if (!isLoggedIn) return null;
    if (fromAsset === "TSHOT") {
      const totalTSHOT = getTotalTSHOTBalance(accountData);
      return (
        <div className="text-xs text-brand-text/70 mt-1">
          Balance: {Math.floor(totalTSHOT)} TSHOT
        </div>
      );
    }
    if (isNFTMode) {
      const { common, fandom } = getTotalNFTCounts(accountData);
      return (
        <div className="text-xs text-brand-text/70 mt-1">
          Balance: {common} Common / {fandom} Fandom
        </div>
      );
    }
    return null;
  };

  const renderToBalance = () => {
    if (!isLoggedIn) return null;
    if (toAsset === "TSHOT") {
      const totalTSHOT = getTotalTSHOTBalance(accountData);
      return (
        <div className="text-xs text-brand-text/70 mt-1">
          Balance: {Math.floor(totalTSHOT)} TSHOT
        </div>
      );
    }
    if (toAsset === "TopShot Common / Fandom") {
      const { common, fandom } = getTotalNFTCounts(accountData);
      return (
        <div className="text-xs text-brand-text/70 mt-1">
          Balance: {common} Common / {fandom} Fandom
        </div>
      );
    }
    return null;
  };

  /** Called whenever a transaction starts or updates. */
  const handleTransactionStart = (txData) => {
    setTransactionData(txData);
    setShowModal(true);

    // If NFT->TSHOT => exclude these NFT IDs from selection
    if (
      txData.swapType === "NFT_TO_TSHOT" &&
      Array.isArray(txData.nftIds) &&
      txData.nftIds.length > 0
    ) {
      setExcludedNftIds((prev) => [...prev, ...txData.nftIds.map(String)]);
    }
  };

  const handleCloseModal = () => {
    setTransactionData({});
    setShowModal(false);
  };

  /** Prevent typed input in from=NFT or TSHOT w/ receipt mode. */
  const handleFromKeyDown = (e) => {
    if (isNFTMode || (fromAsset === "TSHOT" && accountData?.hasReceipt)) {
      e.preventDefault();
      return;
    }
    const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"];
    if (!allowed.includes(e.key) && !(e.key >= "0" && e.key <= "9")) {
      e.preventDefault();
    }
  };

  /** For TSHOT->NFT => fromInput & toInput must match, so also block typed input in 'to'. */
  const handleToKeyDown = (e) => {
    if (dashboardMode === "TSHOT_TO_NFT") {
      e.preventDefault();
      return;
    }
    const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"];
    if (!allowed.includes(e.key) && !(e.key >= "0" && e.key <= "9")) {
      e.preventDefault();
    }
  };

  /** fromInput changing, if from=TSHOT/no receipt. */
  const handleFromInputChange = (e) => {
    if (isNFTMode || (fromAsset === "TSHOT" && accountData?.hasReceipt)) {
      return;
    }
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("0") && val.length > 1) {
      val = val.replace(/^0+/, "");
    }
    setFromInput(val);
    setLastFocus("from");
  };

  /** toInput changing, if TSHOT->NFT is not the scenario. */
  const handleToInputChange = (e) => {
    if (dashboardMode === "TSHOT_TO_NFT") {
      e.preventDefault();
      return;
    }
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("0") && val.length > 1) {
      val = val.replace(/^0+/, "");
    }
    setToInput(val);
    setLastFocus("to");
  };

  const toggleAssets = () => {
    const newFrom = toAsset;
    const newTo = fromAsset;
    setFromAsset(newFrom);
    setToAsset(newTo);

    // Reset input values when switching from NFT->TSHOT to TSHOT->NFT
    if (fromAsset === "TopShot Common / Fandom") {
      setFromInput("");
      setToInput("");
    }
  };

  /** Called when user selects parent or child. */
  const handleSelectAccount = (addr) => {
    if (!accountData) return;
    const isChild = (accountData.childrenAddresses || []).includes(addr);
    dispatch({
      type: "SET_SELECTED_ACCOUNT",
      payload: { address: addr, type: isChild ? "child" : "parent" },
    });
  };

  function renderSwapPanel() {
    if (dashboardMode === "NFT_TO_TSHOT") {
      return (
        <NFTToTSHOTPanel
          key="NFT_TO_TSHOT"
          nftIds={selectedNFTs}
          buyAmount={formattedTo}
          onTransactionStart={handleTransactionStart}
        />
      );
    }

    if (dashboardMode === "TSHOT_TO_NFT") {
      const hasReceipt = !!accountData?.hasReceipt;
      return (
        <>
          <TSHOTToNFTPanel
            key="TSHOT_TO_NFT"
            sellAmount={formattedFrom}
            depositDisabled={false}
            onTransactionStart={handleTransactionStart}
            onTransactionComplete={() => {
              setFromInput("");
              setToInput("");
            }}
          />
          {/* If we have a deposit receipt, let user choose which account receives minted NFTs */}
          {hasReceipt && (
            <div className="mt-2">
              <AccountSelection
                parentAccount={{
                  addr: accountData?.parentAddress,
                  hasCollection: accountCollections[accountData?.parentAddress],
                }}
                childrenAddresses={childAddresses}
                childrenAccounts={accountData?.childrenData || []}
                selectedAccount={selectedAccount}
                onSelectAccount={handleSelectAccount}
                isLoadingChildren={isLoadingChildren}
                requireCollection={true}
                title="Select Receiving Account"
              />
            </div>
          )}
        </>
      );
    }

    // If invalid fromAsset/toAsset
    return (
      <div className="p-4 text-brand-text/70">Please select a valid pair.</div>
    );
  }

  return (
    <>
      {/* ────────────── SEO HEAD (new) ────────────── */}
      <Helmet>
        <title>Vaultopolis | Swap NBA Top Shot Moments for TSHOT Tokens on Flow</title>
        <meta
          name="description"
          content="Vaultopolis is a decentralized protocol on Flow blockchain for swapping NBA Top Shot Moments and TSHOT tokens. Mint, burn, or swap TSHOT instantly with 1:1 backing by Top Shot Moments."
        />
        <meta name="keywords" content="vaultopolis, tshot, nba top shot, flow blockchain, nft swap, tokenized moments, flow crypto" />
        <link rel="canonical" href="https://vaultopolis.com" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Vaultopolis | Swap NBA Top Shot Moments for TSHOT Tokens" />
        <meta property="og:description" content="Decentralized protocol for swapping NBA Top Shot Moments and TSHOT tokens on Flow blockchain. 1:1 backed tokenized liquidity." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com" />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png" />
        <meta property="og:site_name" content="Vaultopolis" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Vaultopolis | Swap NBA Top Shot Moments for TSHOT Tokens" />
        <meta name="twitter:description" content="Decentralized protocol for swapping NBA Top Shot Moments and TSHOT tokens on Flow blockchain." />
        <meta name="twitter:image" content="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png" />
        <meta name="twitter:site" content="@vaultopolis" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Vaultopolis",
            "url": "https://vaultopolis.com",
            "logo": "https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png",
            "description": "Decentralized protocol for swapping NBA Top Shot Moments and TSHOT tokens on Flow blockchain",
            "sameAs": ["https://x.com/vaultopolis"]
          })}
        </script>
      </Helmet>

      {/* Transaction Modal */}
      <AnimatePresence>
        {showModal && transactionData.status && (
          <TransactionModal {...transactionData} onClose={handleCloseModal} />
        )}
      </AnimatePresence>

      {/* TSHOT Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-primary rounded-lg p-4 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                    alt="TSHOT"
                    width="24"
                    height="24"
                    className="w-5 h-5"
                  />
                  <h3 className="text-lg font-semibold text-brand-text">
                    TSHOT Info
                  </h3>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-1 hover:bg-brand-secondary rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={20} className="text-brand-text/70" />
                </button>
              </div>
              <div className="text-sm text-brand-text/90 space-y-3">
                <p className="text-brand-text/90">
                  TSHOT is a fungible token backed 1-for-1 by NBA Top Shot
                  Moments.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-brand mr-1">•</span>
                    <div className="space-y-1">
                      <strong>Trade Anywhere</strong>
                      <p className="text-brand-text/80">
                        Swap TSHOT ↔ FLOW instantly on&nbsp;
                        <a
                          href="https://app.increment.fi/swap?in=A.05b67ba314000b2d.TSHOT&out=A.1654653399040a61.FlowToken"
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-flow-light"
                        >
                          Increment.fi
                        </a>
                        &nbsp;or&nbsp;
                        <a
                          href="https://swap.kittypunch.xyz/?tokens=0xc618a7356fcf601f694c51578cd94144deaee690-0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e"
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-flow-light"
                        >
                          PunchSwap
                        </a>
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand mr-1">•</span>
                    <div className="space-y-1">
                      <strong>Bulk Trading</strong>
                      <p className="text-brand-text/80">
                        Convert multiple Moments to TSHOT in one transaction
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand mr-1">•</span>
                    <div className="space-y-1">
                      <strong>Earn Rewards</strong>
                      <p className="text-brand-text/80">
                        Provide liquidity to earn trading fees on&nbsp;
                        <a
                          href="https://app.increment.fi/liquidity/add"
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-flow-light"
                        >
                          Increment.fi
                        </a>
                        &nbsp;or&nbsp;
                        <a
                          href="https://swap.kittypunch.xyz/?tab=liquidity&mode=add&token0=0xC618a7356FcF601f694C51578CD94144Deaee690&token1=0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e"
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-flow-light"
                        >
                          PunchSwap
                        </a>
                      </p>
                    </div>
                  </li>
                </ul>
                <div className="flex gap-3 mt-4">
                  <a
                    href="/tshot"
                    className="flex-1 text-sm text-brand hover:text-flow-light text-center font-medium bg-brand-secondary py-2 px-4 rounded hover:bg-opolis hover:text-white transition-colors"
                  >
                    More Info →
                  </a>
                  <a
                    href="/tshot#rewards"
                    className="flex-1 text-sm text-yellow-500 hover:text-yellow-400 text-center font-medium bg-yellow-500/10 hover:bg-yellow-500/20 py-2 px-4 rounded border border-yellow-500/30 transition-colors"
                  >
                    💰 Rewards
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Announcement Banner */}
      {shouldShowFeaturedBanner && featuredAnnouncement && (
        <div className="w-full bg-gradient-to-r from-brand-accent to-brand-blue text-white py-3 px-4 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xl">{featuredAnnouncement.title.split(' ')[0]}</span>
              <p className="text-sm sm:text-base font-medium flex-1">
                {featuredAnnouncement.snippet}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={featuredAnnouncement.link}
                className="px-4 py-2 bg-white text-brand-accent font-semibold rounded-lg hover:bg-white/90 transition-colors text-sm whitespace-nowrap"
              >
                View Details
              </a>
              <button
                onClick={() => dismissBanner(featuredAnnouncement.id)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Conditional Rendering */}
      {isLoggedIn ? (
        <SwapApplication
          fromAsset={fromAsset}
          toAsset={toAsset}
          fromInput={fromInput}
          toInput={toInput}
          isOverMax={isOverMax}
          isOverNFTLimit={isOverNFTLimit}
          isNFTMode={isNFTMode}
          dashboardMode={dashboardMode}
          setFromAsset={setFromAsset}
          setShowInfoModal={setShowInfoModal}
          handleFromKeyDown={handleFromKeyDown}
          handleFromInputChange={handleFromInputChange}
          toggleAssets={toggleAssets}
          handleToKeyDown={handleToKeyDown}
          handleToInputChange={handleToInputChange}
          renderFromBalance={renderFromBalance}
          renderToBalance={renderToBalance}
          renderSwapPanel={renderSwapPanel}
          accountData={accountData}
          selectedNFTs={selectedNFTs}
          selectedAccount={selectedAccount}
          childAddresses={childAddresses}
          accountCollections={accountCollections}
          isLoadingChildren={isLoadingChildren}
          excludedNftIds={excludedNftIds}
          handleSelectAccount={handleSelectAccount}
          setAccountCollections={setAccountCollections}
          dispatch={dispatch}
        />
      ) : (
        <TSHOTInfo 
          vaultSummary={vaultSummary} 
          analyticsData={analyticsData} 
          loading={tshotLoading} 
          error={tshotError}
          onConnectWallet={handleConnectWallet}
        />
      )}
    </>
  );
};

export default Swap;
