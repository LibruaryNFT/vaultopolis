// src/components/Swap.js
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";

import Dropdown, { FROM_OPTIONS } from "../components/Dropdown";
import NFTToTSHOTPanel from "../components/NFTToTSHOTPanel";
import TSHOTToNFTPanel from "../components/TSHOTToNFTPanel";
import MomentSelection from "../components/MomentSelection";
import AccountSelection from "../components/AccountSelection";
import TransactionModal from "../components/TransactionModal";
import { AnimatePresence } from "framer-motion";
import MomentCard from "../components/MomentCard";

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
    // Removed unused: loadAllUserData, isRefreshing
    isLoadingChildren,
  } = useContext(UserContext);

  const isLoggedIn = Boolean(user?.loggedIn);
  const [fromAsset, setFromAsset] = useState("TopShot Common / Fandom");
  const [toAsset, setToAsset] = useState("TSHOT");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [lastFocus, setLastFocus] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});
  const [excludedNftIds, setExcludedNftIds] = useState([]);

  useEffect(() => {
    setToAsset(getOppositeAsset(fromAsset));
  }, [fromAsset]);

  // If from=NFT => fromInput & toInput = selectedNFTs.length
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

  function safeNumberParse(str) {
    if (!str) return 0;
    const val = Number(str);
    return isNaN(val) ? 0 : val;
  }

  // computedFrom
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

  // computedTo
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

  // Render total balances across all accounts
  const renderFromBalance = () => {
    if (!isLoggedIn) return null;

    if (fromAsset === "TSHOT") {
      const totalTSHOT = getTotalTSHOTBalance(accountData);
      return (
        <div className="text-xs text-gray-300 mt-1">
          Balance: {Math.floor(totalTSHOT)} TSHOT
        </div>
      );
    }
    if (isNFTMode) {
      const { common, fandom } = getTotalNFTCounts(accountData);
      return (
        <div className="text-xs text-gray-300 mt-1">
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
        <div className="text-xs text-gray-300 mt-1">
          Balance: {Math.floor(totalTSHOT)} TSHOT
        </div>
      );
    }
    if (toAsset === "TopShot Common / Fandom") {
      const { common, fandom } = getTotalNFTCounts(accountData);
      return (
        <div className="text-xs text-gray-300 mt-1">
          Balance: {common} Common / {fandom} Fandom
        </div>
      );
    }
    return null;
  };

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
  };

  // We'll pass only the accounts that have a TopShot collection to <AccountSelection>
  const filterAccountsWithCollection = () => {
    if (!accountData) return { parent: null, children: [] };

    const parentHasCollection = !!accountData.hasCollection;
    const parentAccount = parentHasCollection
      ? {
          addr: accountData.parentAddress || user?.addr,
          ...accountData,
        }
      : null;

    const validChildren = (accountData.childrenData || []).filter(
      (c) => c.hasCollection
    );

    return {
      parent: parentAccount,
      children: validChildren,
    };
  };

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
      // Step 2 => hasReceipt => show separate account selection box
      const hasReceipt = !!accountData?.hasReceipt;
      return (
        <>
          {/* Step 1 or 2 => TSHOTToNFTPanel */}
          <TSHOTToNFTPanel
            key="TSHOT_TO_NFT"
            sellAmount={formattedFrom}
            depositDisabled={false}
            onTransactionStart={handleTransactionStart}
          />

          {hasReceipt && (
            <div className="mt-2 bg-gray-700 p-2 rounded-lg">
              {(() => {
                const { parent, children } = filterAccountsWithCollection();
                // If there's no parent with a collection and no children with a collection,
                // you could show an error or just pass empty arrays.
                const parentAccount = parent;
                const childAccounts = children;

                return (
                  <AccountSelection
                    parentAccount={parentAccount}
                    childrenAddresses={childAccounts.map((c) => c.addr)}
                    childrenAccounts={childAccounts}
                    selectedAccount={selectedAccount}
                    onSelectAccount={handleSelectAccount}
                    isLoadingChildren={isLoadingChildren}
                  />
                );
              })()}
            </div>
          )}
        </>
      );
    }

    return (
      <div className="p-4 text-gray-300">Please select a valid asset pair.</div>
    );
  }

  return (
    <>
      <div className="max-w-md mx-auto mt-2 space-y-2">
        <AnimatePresence>
          {showModal && transactionData.status && (
            <TransactionModal {...transactionData} onClose={handleCloseModal} />
          )}
        </AnimatePresence>

        {/* SWAP BOX (FROM/TO) */}
        <div className="bg-gray-700 p-2 rounded-lg">
          {/* FROM BOX */}
          <div
            className="
              bg-gray-600 p-2 rounded-lg mb-2
              flex items-start justify-between
              min-h-[120px]
            "
          >
            <div className="mr-4 flex flex-col">
              <label className="block text-sm text-white mb-1">From</label>
              <Dropdown
                options={FROM_OPTIONS}
                selectedValue={fromAsset}
                onChange={(val) => setFromAsset(val)}
                excludeSelected={true}
              />
              {renderFromBalance()}
            </div>

            <div className="flex flex-col">
              <label className="block text-sm text-white mb-1">Amount</label>
              <input
                autoFocus
                type="text"
                value={fromInput}
                onKeyDown={handleFromKeyDown}
                onChange={handleFromInputChange}
                placeholder="0"
                maxLength={3}
                className="
                  w-16 bg-gray-600 text-white
                  p-2 rounded text-3xl text-center
                "
                readOnly={isNFTMode}
              />
            </div>
          </div>

          {/* Exchange icon & horizontal line */}
          <div className="relative my-2 flex items-center justify-center">
            <hr className="absolute inset-x-0 border-t border-gray-500 opacity-30 top-1/2 -translate-y-1/2" />
            <button
              onClick={toggleAssets}
              className="
                z-10
                w-10 h-10
                rounded-full border border-gray-400
                bg-gray-700
                text-2xl text-white
                flex items-center justify-center
              "
            >
              ⇅
            </button>
          </div>

          {/* TO BOX */}
          <div
            className="
              bg-gray-600 p-2 rounded-lg
              flex items-start justify-between
              min-h-[120px]
            "
          >
            <div className="mr-4 flex flex-col">
              <label className="block text-sm text-white mb-1">To</label>
              <div
                className="
                  bg-gray-700 text-white
                  px-3 py-2
                  rounded-lg text-base
                  w-72 h-14
                  flex items-center
                "
              >
                {toAsset === "TSHOT" ? (
                  <div className="flex items-center gap-2">
                    <img
                      src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                      alt="TSHOT"
                      className="w-9 h-9"
                    />
                    <span>TSHOT</span>
                  </div>
                ) : (
                  <span>
                    TopShot <span className="text-gray-400">Common</span> /{" "}
                    <span className="text-lime-400">Fandom</span>
                  </span>
                )}
              </div>
              {renderToBalance()}
            </div>

            <div className="flex flex-col">
              <label className="block text-sm text-white mb-1">Amount</label>
              <input
                type="text"
                value={toInput}
                onKeyDown={handleToKeyDown}
                onChange={handleToInputChange}
                placeholder="0"
                maxLength={3}
                className="
                  w-16 bg-gray-600 text-white
                  p-2 rounded text-3xl text-center
                "
                readOnly={
                  dashboardMode === "TSHOT_TO_NFT" ||
                  dashboardMode === "NFT_TO_TSHOT"
                }
              />
            </div>
          </div>
        </div>

        {/* SWAP ACTION PANEL */}
        <div className="space-y-2">{renderSwapPanel()}</div>

        {/* If from=TopShot => show container to select which account sends NFT */}
        {fromAsset === "TopShot Common / Fandom" &&
          isLoggedIn &&
          accountData?.parentAddress && (
            <div className="bg-gray-700 p-2 rounded-lg shadow-md">
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
          )}
      </div>

      {/* If from=TopShot => show MomentSelection + Selected Moments */}
      {fromAsset === "TopShot Common / Fandom" &&
        isLoggedIn &&
        accountData?.parentAddress && (
          <div className="w-full p-4">
            <div className="max-w-screen-lg mx-auto space-y-4">
              <div className="bg-gray-700 p-2 rounded">
                <h4 className="text-white text-sm mb-2">Selected Moments:</h4>
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
                    <span className="text-gray-400">No moments selected</span>
                  )}
                </div>
              </div>

              <div className="bg-gray-700 p-2 rounded-lg">
                <MomentSelection excludeIds={excludedNftIds} />
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default Swap;
