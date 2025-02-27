// src/components/ExchangePanel.js
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import NFTToTSHOTPanel from "./NFTToTSHOTPanel";
import NFTToFLOWPanel from "./NFTToFLOWPanel";
import TSHOTToNFTPanel from "./TSHOTToNFTPanel";
import MomentSelection from "./MomentSelection";
import AccountSelection from "./AccountSelection";
import TransactionModal from "./TransactionModal";
import ExchangeDashboard from "./ExchangeDashboard";
import MomentCard from "./MomentCard";
import { AnimatePresence } from "framer-motion";

const sellOptions = ["TopShot Moments", "TSHOT"];
const buyOptionsMap = {
  "TopShot Moments": ["TSHOT", "FLOW"],
  TSHOT: ["TopShot Moments"],
};

const ExchangePanel = () => {
  // States for sell/buy amounts
  const [sellInput, setSellInput] = useState("");
  const [buyInput, setBuyInput] = useState("");

  // Transaction modal
  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});

  // Keep track of NFTs to exclude from selection once they're in-flight
  const [excludedNftIds, setExcludedNftIds] = useState([]);

  // From context
  const {
    user,
    accountData,
    selectedAccount,
    loadAllUserData,
    isRefreshing,
    isLoadingChildren,
    selectedNFTs,
    flowPricePerNFT,
    dispatch,
  } = useContext(UserContext);

  const isLoggedIn = Boolean(user?.loggedIn);

  // Helper to choose the selected account (parent or child)
  const setSelectedAccount = (address) => {
    const isChild = accountData.childrenAddresses.includes(address);
    dispatch({
      type: "SET_SELECTED_ACCOUNT",
      payload: { address, type: isChild ? "child" : "parent" },
    });
  };

  // Assets (Sell & Buy)
  const [sellAsset, setSellAsset] = useState("TopShot Moments");
  const [buyAsset, setBuyAsset] = useState("TSHOT");

  // Determine which “mode” we’re in for the dashboard
  const getDashboardMode = () => {
    if (sellAsset === "TopShot Moments" && buyAsset === "TSHOT") {
      return "NFT_TO_TSHOT";
    }
    if (sellAsset === "TSHOT" && buyAsset === "TopShot Moments") {
      return "TSHOT_TO_NFT";
    }
    if (sellAsset === "TopShot Moments" && buyAsset === "FLOW") {
      return "NFT_TO_FLOW";
    }
    return null;
  };
  const dashboardMode = getDashboardMode();

  /************************************************************
   *                 Sync Sell/Buy Inputs
   ************************************************************/
  // 1) If we’re selling TSHOT or buying TSHOT, keep them in sync
  useEffect(() => {
    if (sellAsset !== "TopShot Moments") {
      setBuyInput(sellInput);
    }
  }, [sellInput, sellAsset]);

  // 2) If user changes the sell asset, ensure buy asset is valid
  useEffect(() => {
    if (!buyOptionsMap[sellAsset].includes(buyAsset)) {
      setBuyAsset(buyOptionsMap[sellAsset][0]);
    }
  }, [sellAsset, buyAsset]);

  // 3) If we’re selling Moments, the “sellInput” should match how many NFTs are selected
  useEffect(() => {
    if (sellAsset === "TopShot Moments") {
      setSellInput(selectedNFTs.length.toString());
    }
  }, [selectedNFTs, sellAsset]);

  // 4) If selling Moments, recalc the “buyInput” automatically
  useEffect(() => {
    if (sellAsset === "TopShot Moments") {
      const newBuy =
        buyAsset === "FLOW"
          ? (selectedNFTs.length * (flowPricePerNFT || 1)).toFixed(1)
          : selectedNFTs.length.toString();
      setBuyInput(newBuy);
    }
  }, [selectedNFTs, sellAsset, buyAsset, flowPricePerNFT]);

  // 5) If user has TSHOT receipt, override the input
  useEffect(() => {
    if (
      sellAsset === "TSHOT" &&
      accountData?.hasReceipt &&
      accountData.receiptDetails?.betAmount
    ) {
      const amt = Number(accountData.receiptDetails.betAmount).toFixed(1);
      setSellInput(amt);
      setBuyInput(amt);
    }
  }, [accountData.hasReceipt, accountData.receiptDetails, sellAsset]);

  // 6) If we’re selling TSHOT => ensure selectedAccount has a TSHOT collection
  useEffect(() => {
    if (sellAsset === "TSHOT") {
      if (accountData?.hasCollection) {
        // Force to parent if parent has TSHOT collection
        if (selectedAccount !== accountData.parentAddress) {
          setSelectedAccount(accountData.parentAddress);
        }
      } else if (accountData?.childrenData) {
        // Otherwise find a child that has TSHOT collection
        const validChild = accountData.childrenData.find(
          (child) => child.hasCollection
        );
        if (validChild && selectedAccount !== validChild.addr) {
          setSelectedAccount(validChild.addr);
        }
      }
    }
  }, [sellAsset, accountData, selectedAccount]);

  /************************************************************
   *         Compute numeric amounts & format them
   ************************************************************/
  const tshotReceiptAmount =
    accountData?.hasReceipt && accountData.receiptDetails
      ? accountData.receiptDetails.betAmount
      : null;

  const computedSellAmount =
    sellAsset === "TopShot Moments" && selectedNFTs.length > 0
      ? selectedNFTs.length
      : sellAsset === "TSHOT" && accountData?.hasReceipt
      ? tshotReceiptAmount
      : sellInput === ""
      ? 0
      : Number(sellInput);

  const computedBuyAmount =
    sellAsset === "TopShot Moments"
      ? buyAsset === "FLOW"
        ? computedSellAmount * (flowPricePerNFT || 1)
        : computedSellAmount
      : sellAsset === "TSHOT" && accountData?.hasReceipt
      ? tshotReceiptAmount
      : buyInput === ""
      ? 0
      : Number(buyInput);

  const formattedSellValue = Number(computedSellAmount).toFixed(1);
  const formattedBuyValue = Number(computedBuyAmount).toFixed(1);

  /************************************************************
   *             Transaction Modal Handling
   ************************************************************/
  const handleTransactionStart = (txData) => {
    // We always get a plain object now, so just store it
    setTransactionData(txData);
    setShowModal(true);

    // If it's an NFT-based swap, exclude those NFTs
    if (
      (txData.swapType === "NFT_TO_TSHOT" ||
        txData.swapType === "NFT_TO_FLOW") &&
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

  /************************************************************
   *         Render the appropriate swap panel
   ************************************************************/
  const renderSwapPanel = () => {
    if (sellAsset === "TopShot Moments" && buyAsset === "TSHOT") {
      return (
        <NFTToTSHOTPanel
          nftIds={selectedNFTs}
          buyAmount={formattedBuyValue}
          onTransactionStart={(txData) => handleTransactionStart(txData)}
        />
      );
    } else if (sellAsset === "TopShot Moments" && buyAsset === "FLOW") {
      return (
        <NFTToFLOWPanel
          nftIds={selectedNFTs}
          buyAmount={formattedBuyValue}
          onTransactionStart={(txData) => handleTransactionStart(txData)}
        />
      );
    } else if (sellAsset === "TSHOT" && buyAsset === "TopShot Moments") {
      return (
        <TSHOTToNFTPanel
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
      {/* If there's a recognized dashboard mode, show it */}
      {dashboardMode && (
        <div className="mb-4">
          <ExchangeDashboard mode={dashboardMode} />
        </div>
      )}

      {/* Container for Sell & Buy boxes */}
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
                  onChange={(e) => {
                    // Prevent user input if TSHOT is locked to the bet receipt
                    if (!(sellAsset === "TSHOT" && accountData?.hasReceipt)) {
                      let val = e.target.value;
                      if (val.startsWith("0") && val.length > 1) {
                        val = val.replace(/^0+/, "");
                      }
                      setSellInput(val);
                    }
                  }}
                  placeholder="0"
                  className="w-32 bg-gray-600 text-white p-2 rounded mt-1 text-3xl"
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
                {sellAsset === "TSHOT" &&
                  typeof accountData.tshotBalance !== "undefined" && (
                    <p className="mt-1 text-xs text-gray-300">
                      Balance: {Math.floor(accountData.tshotBalance)} TSHOT
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Down arrow */}
          <div className="flex justify-center mb-2">
            <span className="text-2xl text-white">↓</span>
          </div>

          {/* BUY BOX */}
          <div className="bg-gray-600 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-grow relative">
                <label className="block text-sm text-white">Buy</label>
                <input
                  type="text"
                  value={isLoggedIn ? buyInput : ""}
                  onChange={(e) => {
                    // Prevent user input if TSHOT is locked to the bet receipt
                    if (!(sellAsset === "TSHOT" && accountData?.hasReceipt)) {
                      let val = e.target.value;
                      if (val.startsWith("0") && val.length > 1) {
                        val = val.replace(/^0+/, "");
                      }
                      setBuyInput(val);
                    }
                  }}
                  placeholder="0"
                  className="w-32 bg-gray-600 text-white p-2 rounded mt-1 text-3xl"
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

        {/* Panel that triggers the swap transaction */}
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
              {/* If any Moments are selected, show them */}
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

              {/* AccountSelection */}
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

              {/* Pass excluded IDs to MomentSelection */}
              <MomentSelection excludeIds={excludedNftIds} />
            </div>
          </div>
        )}
    </>
  );
};

export default ExchangePanel;
