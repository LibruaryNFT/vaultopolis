import React, { useState, useEffect, useContext } from "react";
import { UserDataContext } from "../context/UserContext";
import * as fcl from "@onflow/fcl";
import { getChildren } from "../flow/getChildren";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";

import Dropdown, { FROM_OPTIONS } from "../components/Dropdown";
import NFTToTSHOTPanel from "../components/NFTToTSHOTPanel";
import TSHOTToNFTPanel from "../components/TSHOTToNFTPanel";
import MomentSelection from "../components/MomentSelection";
import AccountSelection from "../components/AccountSelection";
import TransactionModal from "../components/TransactionModal";
import { AnimatePresence } from "framer-motion";
import MomentCard from "../components/MomentCard";
import { Helmet } from "react-helmet-async";
import { ChevronDown } from "lucide-react";

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

  const [benefitsOpen, setBenefitsOpen] = useState(false);

  const [childAddresses, setChildAddresses] = useState([]);
  const [accountCollections, setAccountCollections] = useState({});

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

  // Load child addresses and check collections independently for step 2
  useEffect(() => {
    if (tshotReceiptAmount && accountData?.parentAddress) {
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
  }, [tshotReceiptAmount, accountData?.parentAddress]);

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
          />
          {/* If we have a deposit receipt, let user choose which account receives minted NFTs */}
          {hasReceipt && (
            <div className="mt-2 bg-brand-primary p-2 rounded-lg">
              <div className="text-center">
                <h3 className="text-brand-text text-sm font-bold mb-2">
                  Select Receiving Account
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {/* Parent Account */}
                  {accountData?.parentAddress && (
                    <div
                      onClick={() =>
                        handleSelectAccount(accountData.parentAddress)
                      }
                      className={`
                        p-2 rounded-lg border-2 transition-all
                        ${
                          selectedAccount === accountData.parentAddress
                            ? "border-opolis"
                            : "border-brand-border"
                        }
                        ${
                          accountCollections[accountData.parentAddress] ===
                          false
                            ? "opacity-50 cursor-not-allowed"
                            : "bg-brand-secondary hover:bg-brand-blue cursor-pointer"
                        }
                      `}
                      title={
                        accountCollections[accountData.parentAddress] === false
                          ? "This account has no TopShot collection"
                          : ""
                      }
                    >
                      <h4
                        className={`text-sm font-semibold ${
                          selectedAccount === accountData.parentAddress
                            ? "text-opolis"
                            : "text-brand-text"
                        }`}
                      >
                        Parent Account
                      </h4>
                      <p className="text-[11px] leading-snug text-brand-text/70 break-all">
                        {accountData.parentAddress}
                      </p>
                    </div>
                  )}

                  {/* Child Accounts */}
                  {childAddresses.map((childAddr) => (
                    <div
                      key={childAddr}
                      onClick={() =>
                        accountCollections[childAddr] !== false &&
                        handleSelectAccount(childAddr)
                      }
                      className={`
                        p-2 rounded-lg border-2 transition-all
                        ${
                          selectedAccount === childAddr
                            ? "border-opolis"
                            : "border-brand-border"
                        }
                        ${
                          accountCollections[childAddr] === false
                            ? "opacity-50 cursor-not-allowed"
                            : "bg-brand-secondary hover:bg-brand-blue cursor-pointer"
                        }
                      `}
                      title={
                        accountCollections[childAddr] === false
                          ? "This account has no TopShot collection"
                          : ""
                      }
                    >
                      <h4
                        className={`text-sm font-semibold ${
                          selectedAccount === childAddr
                            ? "text-opolis"
                            : "text-brand-text"
                        }`}
                      >
                        Child Account
                      </h4>
                      <p className="text-[11px] leading-snug text-brand-text/70 break-all">
                        {childAddr}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
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
        <title>Vaultopolis | Swap TSHOT Tokens</title>
        <meta
          name="description"
          content="Swap Top Shot Moments for TSHOT or redeem TSHOT for new Moments instantly on the Flow blockchain."
        />
        <link rel="canonical" href="https://vaultopolis.com/swap" />
      </Helmet>

      {/* Transaction Modal */}
      <AnimatePresence>
        {showModal && transactionData.status && (
          <TransactionModal {...transactionData} onClose={handleCloseModal} />
        )}
      </AnimatePresence>

      {/* Desktop grid wrapper */}
      <div className="md:grid md:grid-cols-[minmax(0,1fr)_260px_minmax(auto,640px)_260px_minmax(0,1fr)] md:gap-6">
        {/* col-1 : left spacer */}
        <div className="hidden md:block" />

        {/* col-2 : left ghost */}
        <div className="hidden md:block" />

        {/* col-3 : swap panel */}
        <div className="max-w-md mx-auto mt-2 space-y-2 md:justify-self-center w-[400px] mb-2">
          {/* Outer container => brand-primary with shadow */}
          <div className="p-2 rounded-lg bg-brand-primary shadow-md shadow-black/30">
            {/* FROM BOX => brand-secondary */}
            <div
              className="
                bg-brand-secondary
                p-2
                rounded-lg
                mb-2
                flex
                items-start
                justify-between
                min-h-[120px]
              "
            >
              <div className="mr-2 flex flex-col">
                <label className="block text-sm text-brand-text mb-1">
                  From
                </label>
                <Dropdown
                  options={FROM_OPTIONS}
                  selectedValue={fromAsset}
                  onChange={(val) => setFromAsset(val)}
                  excludeSelected={true}
                />
                {renderFromBalance()}
              </div>

              <div className="flex flex-col w-[80px] ml-2">
                <label className="block text-sm text-brand-text mb-1">
                  Amount
                </label>
                <input
                  autoFocus
                  type="text"
                  value={fromInput}
                  onKeyDown={handleFromKeyDown}
                  onChange={handleFromInputChange}
                  placeholder="0"
                  maxLength={3}
                  className={`w-full bg-brand-secondary text-brand-text px-1 py-2 rounded text-3xl text-center ${
                    isOverMax || isOverNFTLimit ? "border-2 border-red-400" : ""
                  }`}
                  readOnly={isNFTMode}
                />
                {isOverMax && fromAsset === "TSHOT" && (
                  <div className="text-red-400 text-xs mt-1">Max 50 TSHOT</div>
                )}
                {isOverNFTLimit && (
                  <div className="text-red-400 text-xs mt-1">Max 200 NFTs</div>
                )}
              </div>
            </div>

            {/* Exchange Icon + horizontal line => brand-primary button */}
            <div className="relative my-2 flex items-center justify-center">
              <hr className="absolute inset-x-0 border-t border-brand-text/50 opacity-30 top-1/2 -translate-y-1/2" />
              <button
                onClick={toggleAssets}
                className="
                  z-10
                  w-10
                  h-10
                  rounded-full
                  border
                  border-brand-text/30
                  bg-brand-primary
                  text-2xl
                  text-brand-text
                  flex
                  items-center
                  justify-center
                "
              >
                ⇅
              </button>
            </div>

            {/* TO BOX => brand-secondary */}
            <div
              className="
                bg-brand-secondary
                p-2
                rounded-lg
                flex
                items-start
                justify-between
                min-h-[120px]
              "
            >
              <div className="mr-2 flex flex-col">
                <label className="block text-sm text-brand-text mb-1">To</label>
                <div
                  className="
                    bg-brand-primary
                    text-brand-text
                    px-3
                    py-2
                    rounded-lg
                    text-base
                    w-60 sm:w-72
                    h-14
                    flex
                    items-center
                  "
                >
                  {toAsset === "TSHOT" ? (
                    <div className="flex items-center gap-2">
                      <img
                        src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                        alt="TSHOT"
                        width="36"
                        height="36"
                        className="w-9 h-9"
                      />
                      <span>TSHOT</span>
                    </div>
                  ) : (
                    // partial coloring for Common / Fandom
                    <span>
                      TopShot <span className="text-gray-400">Common</span> /{" "}
                      <span className="text-lime-400">Fandom</span>
                    </span>
                  )}
                </div>
                {renderToBalance()}
              </div>

              <div className="flex flex-col w-[80px] ml-2">
                <label className="block text-sm text-brand-text mb-1">
                  Amount
                </label>
                <input
                  type="text"
                  value={toInput}
                  onKeyDown={handleToKeyDown}
                  onChange={handleToInputChange}
                  placeholder="0"
                  maxLength={3}
                  className="w-full bg-brand-secondary text-brand-text px-1 py-2 rounded text-3xl text-center"
                  readOnly={
                    dashboardMode === "TSHOT_TO_NFT" ||
                    dashboardMode === "NFT_TO_TSHOT"
                  }
                />
              </div>
            </div>
          </div>

          {/* ========== SWAP ACTION PANEL ========== */}
          <div>{renderSwapPanel()}</div>

          {/* Mobile TSHOT Benefits */}
          <details
            onToggle={(e) => setBenefitsOpen(e.target.open)}
            className="lg:hidden bg-brand-primary rounded-lg p-2 shadow-md shadow-black/30 mb-4"
          >
            <summary className="flex items-center justify-center cursor-pointer text-sm font-semibold text-brand mb-2">
              <ChevronDown
                className={`
                  w-4 h-4
                  transform transition-transform duration-200
                  ${benefitsOpen ? "rotate-180" : ""}
                `}
              />
              <img
                src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                alt="TSHOT"
                width="24"
                height="24"
                className="w-6 h-6 mx-2"
              />
              <span>TSHOT Benefits</span>
              <ChevronDown
                className={`
                  w-4 h-4
                  transform transition-transform duration-200
                  ${benefitsOpen ? "rotate-180" : ""}
                `}
              />
            </summary>

            <p className="text-xs text-brand-text/90 mb-3">
              TSHOT is a fungible token backed 1-for-1 by NBA Top Shot Moments.
            </p>

            <ul className="space-y-2 text-xs text-brand-text/90 leading-snug">
              <li className="flex items-start">
                <span className="text-brand mr-1">•</span>
                <div>
                  <strong>Trade Anywhere</strong> — Swap TSHOT ↔ FLOW instantly
                  on&nbsp;
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
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-brand mr-1">•</span>
                <div>
                  <strong>Bulk Trading</strong> — Convert multiple Moments to
                  TSHOT in one transaction
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-brand mr-1">•</span>
                <div>
                  <strong>Earn Rewards</strong> — Provide liquidity to earn
                  trading fees on&nbsp;
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
                </div>
              </li>
            </ul>

            <a
              href="/tshot"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-xs text-brand hover:text-flow-light text-center font-medium"
            >
              For more info, see the TSHOT info page →
            </a>
          </details>
        </div>

        {/* col-4 : benefits sidebar */}
        <aside className="hidden lg:block w-[260px] sticky top-4 mt-2">
          <div className="bg-brand-primary rounded-lg p-2 shadow-md shadow-black/30">
            <h3 className="flex items-center justify-center text-sm font-semibold text-brand mb-2">
              <img
                src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                alt="TSHOT"
                width="24"
                height="24"
                className="w-6 h-6 mr-2"
              />
              <span>TSHOT Benefits</span>
            </h3>

            <p className="text-xs text-brand-text/90 mb-3">
              TSHOT is a fungible token backed 1-for-1 by NBA Top Shot Moments.
            </p>

            <ul className="space-y-2 text-xs text-brand-text/90 leading-snug">
              <li className="flex items-start">
                <span className="text-brand mr-1">•</span>
                <div>
                  <strong>Trade Anywhere</strong> — Swap TSHOT ↔ FLOW instantly
                  on&nbsp;
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
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-brand mr-1">•</span>
                <div>
                  <strong>Bulk Trading</strong> — Convert multiple Moments to
                  TSHOT in one transaction
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-brand mr-1">•</span>
                <div>
                  <strong>Earn Rewards</strong> — Provide liquidity to earn
                  trading fees on&nbsp;
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
                </div>
              </li>
            </ul>

            <a
              href="/tshot"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-xs text-brand hover:text-flow-light text-center font-medium"
            >
              For more info, see the TSHOT info page →
            </a>
          </div>
        </aside>

        {/* col-5 : right spacer */}
        <div className="hidden md:block" />
      </div>

      {fromAsset === "TopShot Common / Fandom" &&
        isLoggedIn &&
        accountData?.parentAddress && (
          <div className="w-full p-0 space-y-2 mb-2">
            {/* Selected Moments (full width) */}
            <div className="bg-brand-primary shadow-md p-2 rounded w-full">
              <h4 className="text-brand-text text-sm mb-2">
                Selected Moments:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedNFTs.length > 0 ? (
                  selectedNFTs.map((momentId) => {
                    const activeAcc =
                      (accountData.childrenData || []).find(
                        (c) => c.addr === selectedAccount
                      ) || accountData;
                    const nft = (activeAcc.nftDetails || []).find(
                      (item) => Number(item.id) === Number(momentId)
                    );
                    return (
                      <MomentCard
                        key={momentId}
                        nft={nft}
                        handleNFTSelection={() =>
                          dispatch({
                            type: "SET_SELECTED_NFTS",
                            payload: momentId,
                          })
                        }
                        isSelected={true}
                      />
                    );
                  })
                ) : (
                  <span className="text-brand-text/70">
                    No moments selected
                  </span>
                )}
              </div>
            </div>

            {/* Account Selection (left-aligned, not full width) */}
            <div className="bg-brand-primary shadow-md px-1 py-2 rounded flex flex-wrap gap-2 w-full">
              <AccountSelection
                parentAccount={{
                  addr: accountData.parentAddress || user?.addr,
                  ...accountData,
                }}
                childrenAddresses={accountData.childrenAddresses || []}
                childrenAccounts={accountData.childrenData || []}
                selectedAccount={selectedAccount}
                onSelectAccount={handleSelectAccount}
                isLoadingChildren={isLoadingChildren}
              />
            </div>

            {/* Moment Selection (full width) */}
            <div className="bg-brand-primary shadow-md p-2 rounded-lg w-full">
              <MomentSelection excludeIds={excludedNftIds} />
            </div>
          </div>
        )}
    </>
  );
};

export default Swap;
