// src/components/Swap.js
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import NFTToTSHOTPanel from "./NFTToTSHOTPanel";
import TSHOTToNFTPanel from "./TSHOTToNFTPanel";
import MomentSelection from "./MomentSelection";
import AccountSelection from "./AccountSelection";
import TransactionModal from "./TransactionModal";
import { AnimatePresence } from "framer-motion";
import MomentCard from "./MomentCard";

const sellOptions = ["TopShot Moments", "TSHOT"];
const buyOptionsMap = {
  "TopShot Moments": ["TSHOT"],
  TSHOT: ["TopShot Moments"],
};

const Swap = () => {
  const {
    user,
    accountData,
    selectedAccount,
    loadAllUserData,
    isRefreshing,
    isLoadingChildren,
    selectedNFTs,
    dispatch,
  } = useContext(UserContext);

  const isLoggedIn = Boolean(user?.loggedIn);

  // Sell/Buy inputs
  const [sellInput, setSellInput] = useState("");
  const [buyInput, setBuyInput] = useState("");

  // Track which field was last changed (for 2-way sync in TSHOT→NFT)
  const [lastFocus, setLastFocus] = useState(null);

  // Transaction modal
  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});

  // Excluded NFT IDs once in-flight
  const [excludedNftIds, setExcludedNftIds] = useState([]);

  // Helper to set the selected account
  const setSelectedAccount = (address) => {
    const isChild = accountData.childrenAddresses.includes(address);
    dispatch({
      type: "SET_SELECTED_ACCOUNT",
      payload: { address, type: isChild ? "child" : "parent" },
    });
  };

  // Sell/Buy assets
  const [sellAsset, setSellAsset] = useState("TopShot Moments");
  const [buyAsset, setBuyAsset] = useState("TSHOT");

  // Toggle assets
  const toggleAssets = () => {
    if (sellAsset === "TSHOT" && buyAsset === "TopShot Moments") {
      setSellAsset("TopShot Moments");
      setBuyAsset("TSHOT");
    } else {
      setSellAsset("TSHOT");
      setBuyAsset("TopShot Moments");
    }
  };

  // Determine which panel to show
  const getDashboardMode = () => {
    if (sellAsset === "TopShot Moments" && buyAsset === "TSHOT") {
      return "NFT_TO_TSHOT";
    }
    if (sellAsset === "TSHOT" && buyAsset === "TopShot Moments") {
      return "TSHOT_TO_NFT";
    }
    return null;
  };
  const dashboardMode = getDashboardMode();

  const isNFTMode = sellAsset === "TopShot Moments";

  /********************************************************************
   * Keep Sell/Buy inputs in sync (basic logic)
   ********************************************************************/
  // 1) If selling Moments => automatically set Sell/Buy to # of selected NFTs
  useEffect(() => {
    if (isNFTMode) {
      setSellInput(selectedNFTs.length.toString());
      setBuyInput(selectedNFTs.length.toString());
    }
  }, [selectedNFTs, isNFTMode]);

  // 2) If selling TSHOT => buyInput = sellInput (original logic)
  //    But now we do more advanced 2-way sync below.
  //    We'll keep the older logic commented out to avoid confusion:
  // useEffect(() => {
  //   if (!isNFTMode) {
  //     setBuyInput(sellInput);
  //   }
  // }, [sellInput, isNFTMode]);

  // 3) If user changes the sell asset => ensure the buy asset is valid
  useEffect(() => {
    if (!buyOptionsMap[sellAsset].includes(buyAsset)) {
      setBuyAsset(buyOptionsMap[sellAsset][0]);
    }
  }, [sellAsset, buyAsset]);

  // 4) If user has TSHOT receipt, show it as integer
  useEffect(() => {
    if (
      !isNFTMode &&
      accountData?.hasReceipt &&
      accountData.receiptDetails?.betAmount
    ) {
      const amtInt = parseInt(accountData.receiptDetails.betAmount, 10);
      setSellInput(amtInt.toString());
      setBuyInput(amtInt.toString());
    }
  }, [accountData.hasReceipt, accountData.receiptDetails, isNFTMode]);

  // 5) If selling TSHOT => ensure selectedAccount has TSHOT
  useEffect(() => {
    if (!isNFTMode) {
      if (accountData?.hasCollection) {
        if (selectedAccount !== accountData.parentAddress) {
          setSelectedAccount(accountData.parentAddress);
        }
      } else if (accountData?.childrenData) {
        const validChild = accountData.childrenData.find(
          (child) => child.hasCollection
        );
        if (validChild && selectedAccount !== validChild.addr) {
          setSelectedAccount(validChild.addr);
        }
      }
    }
  }, [isNFTMode, accountData, selectedAccount]);

  /********************************************************************
   * 2-Way Sync (TSHOT → NFT) if user wants to edit either field
   ********************************************************************/
  useEffect(() => {
    // Only do 2-way sync if TSHOT->NFT
    if (sellAsset === "TSHOT" && buyAsset === "TopShot Moments") {
      if (lastFocus === "sell" && buyInput !== sellInput) {
        setBuyInput(sellInput);
      } else if (lastFocus === "buy" && buyInput !== sellInput) {
        setSellInput(buyInput);
      }
    }
  }, [sellInput, buyInput, lastFocus, sellAsset, buyAsset]);

  /********************************************************************
   * Compute amounts (for internal display or transaction passing)
   ********************************************************************/
  const tshotReceiptAmount =
    accountData?.hasReceipt && accountData.receiptDetails
      ? accountData.receiptDetails.betAmount
      : null;

  const computedSellAmount =
    isNFTMode && selectedNFTs.length > 0
      ? selectedNFTs.length
      : !isNFTMode && accountData?.hasReceipt
      ? tshotReceiptAmount
      : sellInput === ""
      ? 0
      : Number(sellInput);

  const computedBuyAmount = isNFTMode
    ? computedSellAmount
    : !isNFTMode && accountData?.hasReceipt
    ? tshotReceiptAmount
    : buyInput === ""
    ? 0
    : Number(buyInput);

  // Convert to decimal strings if you want. Or parseInt if you only want integer
  const formattedSellValue = Number(computedSellAmount).toFixed(1);
  const formattedBuyValue = Number(computedBuyAmount).toFixed(1);

  /********************************************************************
   * Transaction modal
   ********************************************************************/
  const handleTransactionStart = (txData) => {
    setTransactionData(txData);
    setShowModal(true);

    // If it's NFT->TSHOT, exclude those NFT IDs
    if (
      txData.swapType === "NFT_TO_TSHOT" &&
      txData.nftIds &&
      txData.nftIds.length > 0
    ) {
      setExcludedNftIds((prev) => [...prev, ...txData.nftIds.map(String)]);
    }
  };

  const handleCloseModal = () => {
    setTransactionData({});
    setShowModal(false);
  };

  /********************************************************************
   * onKeyDown for Sell & Buy
   ********************************************************************/
  const handleSellKeyDown = (e) => {
    // If selling NFT => block typing
    if (isNFTMode) {
      e.preventDefault();
      return;
    }
    // If TSHOT locked to receipt => block
    if (!isNFTMode && accountData?.hasReceipt) {
      e.preventDefault();
      return;
    }
    // Allow digits, backspace, etc.
    const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"];
    if (!allowed.includes(e.key) && !(e.key >= "0" && e.key <= "9")) {
      e.preventDefault();
    }
  };

  const handleBuyKeyDown = (e) => {
    if (isNFTMode) {
      e.preventDefault();
      return;
    }
    if (!isNFTMode && accountData?.hasReceipt) {
      e.preventDefault();
      return;
    }
    const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"];
    if (!allowed.includes(e.key) && !(e.key >= "0" && e.key <= "9")) {
      e.preventDefault();
    }
  };

  /********************************************************************
   * onChange for Sell/Buy
   ********************************************************************/
  const handleSellInputChange = (e) => {
    // If selling NFT => readOnly
    if (isNFTMode || (!isNFTMode && accountData?.hasReceipt)) return;

    let val = e.target.value.replace(/\D/g, ""); // remove non-digits
    if (val.startsWith("0") && val.length > 1) {
      val = val.replace(/^0+/, "");
    }
    setSellInput(val);
    setLastFocus("sell");
  };

  const handleBuyInputChange = (e) => {
    // If selling NFT => readOnly
    if (isNFTMode || (!isNFTMode && accountData?.hasReceipt)) return;

    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("0") && val.length > 1) {
      val = val.replace(/^0+/, "");
    }
    setBuyInput(val);
    setLastFocus("buy");
  };

  /********************************************************************
   * Render the correct swap panel
   ********************************************************************/
  const renderSwapPanel = () => {
    if (sellAsset === "TopShot Moments" && buyAsset === "TSHOT") {
      return (
        <NFTToTSHOTPanel
          key="NFT_TO_TSHOT"
          nftIds={selectedNFTs}
          buyAmount={formattedBuyValue}
          onTransactionStart={handleTransactionStart}
        />
      );
    } else if (sellAsset === "TSHOT" && buyAsset === "TopShot Moments") {
      return (
        <TSHOTToNFTPanel
          key="TSHOT_TO_NFT"
          sellAmount={formattedSellValue}
          depositDisabled={false}
          onTransactionStart={handleTransactionStart}
        />
      );
    } else {
      return (
        <div className="p-4 text-gray-300">
          Please select a valid asset pair.
        </div>
      );
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Transaction Modal */}
        <AnimatePresence>
          {showModal && transactionData.status && (
            <TransactionModal {...transactionData} onClose={handleCloseModal} />
          )}
        </AnimatePresence>

        {/* SELL & BUY UI */}
        <div className="bg-gray-700 p-4 rounded-lg">
          {/* SELL BOX */}
          <div className="bg-gray-600 p-4 rounded-lg mb-2">
            <div className="flex items-center">
              <div className="flex-grow relative">
                <label className="block text-sm text-white">Sell</label>
                <input
                  autoFocus
                  type="text"
                  value={isLoggedIn ? sellInput : ""}
                  onKeyDown={handleSellKeyDown}
                  onChange={handleSellInputChange}
                  placeholder="0"
                  className="w-32 bg-gray-600 text-white p-2 rounded mt-1 text-3xl"
                  readOnly={isNFTMode} // cannot type if selling NFT
                />
              </div>
              <div className="ml-2">
                <select
                  value={sellAsset}
                  onChange={(e) => setSellAsset(e.target.value)}
                  className="bg-gray-700 text-white p-2 rounded-lg text-xl"
                >
                  {sellOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {/* If TSHOT is selected, show TSHOT balance */}
                {sellAsset === "TSHOT" &&
                  typeof accountData.tshotBalance !== "undefined" && (
                    <p className="mt-1 text-xs text-gray-300">
                      Balance: {Math.floor(accountData.tshotBalance)} TSHOT
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Toggle button */}
          <div className="flex justify-center mb-2">
            <button onClick={toggleAssets}>
              <span className="text-2xl text-white cursor-pointer">⇅</span>
            </button>
          </div>

          {/* BUY BOX */}
          <div className="bg-gray-600 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-grow relative">
                <label className="block text-sm text-white">Buy</label>
                <input
                  type="text"
                  value={isLoggedIn ? buyInput : ""}
                  onKeyDown={handleBuyKeyDown}
                  onChange={handleBuyInputChange}
                  placeholder="0"
                  className="w-32 bg-gray-600 text-white p-2 rounded mt-1 text-3xl"
                  readOnly={isNFTMode} // cannot type if selling NFT
                />
              </div>
              <div className="ml-2">
                <select
                  value={buyAsset}
                  onChange={(e) => setBuyAsset(e.target.value)}
                  className="bg-gray-700 text-white p-2 rounded-lg text-xl"
                >
                  {buyOptionsMap[sellAsset].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* The Swap Panel */}
        <div className="bg-gray-700 p-2 rounded-lg shadow-md">
          {renderSwapPanel()}
        </div>
      </div>

      {/* If we're selling Moments => show the big Moment UI */}
      {sellAsset === "TopShot Moments" &&
        isLoggedIn &&
        accountData.parentAddress && (
          <div className="w-full p-4">
            <div className="max-w-screen-lg mx-auto bg-gray-700 p-4 rounded-lg space-y-4">
              {/* Display selected NFTs */}
              {selectedNFTs.length > 0 && (
                <div className="bg-gray-600 p-2 rounded">
                  <h4 className="text-white text-sm mb-2">Selected Moments:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNFTs.map((momentId) => {
                      const activeAccountForNFTs =
                        accountData.childrenData?.find(
                          (child) => child.addr === selectedAccount
                        ) || accountData;
                      const nft =
                        (activeAccountForNFTs.nftDetails || []).find(
                          (item) => Number(item.id) === Number(momentId)
                        ) || {};

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
                    })}
                  </div>
                </div>
              )}

              {/* Account Selection */}
              <AccountSelection
                parentAccount={{
                  addr: accountData.parentAddress || user?.addr,
                  ...accountData,
                }}
                childrenAddresses={accountData.childrenAddresses || []}
                childrenAccounts={accountData.childrenData || []}
                selectedAccount={selectedAccount}
                onSelectAccount={setSelectedAccount}
                onRefresh={() => loadAllUserData(accountData.parentAddress)}
                isRefreshing={isRefreshing}
                isLoadingChildren={isLoadingChildren}
              />

              {/* The Moment list, excluding in-flight NFTs */}
              <MomentSelection excludeIds={excludedNftIds} />
            </div>
          </div>
        )}
    </>
  );
};

export default Swap;
