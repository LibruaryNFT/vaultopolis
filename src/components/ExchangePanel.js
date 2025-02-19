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
  const [sellInput, setSellInput] = useState("");
  const [buyInput, setBuyInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});

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

  // If your context doesn't provide setSelectedAccount, define locally:
  const setSelectedAccount = (address) => {
    const isChild = accountData.childrenAddresses.includes(address);
    dispatch({
      type: "SET_SELECTED_ACCOUNT",
      payload: { address, type: isChild ? "child" : "parent" },
    });
  };

  const isLoggedIn = Boolean(user?.loggedIn);

  const [sellAsset, setSellAsset] = useState("TopShot Moments");
  const [buyAsset, setBuyAsset] = useState("TSHOT");

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

  // Input logic
  useEffect(() => {
    if (sellAsset !== "TopShot Moments") {
      setBuyInput(sellInput);
    }
  }, [sellInput, sellAsset]);

  useEffect(() => {
    if (!buyOptionsMap[sellAsset].includes(buyAsset)) {
      setBuyAsset(buyOptionsMap[sellAsset][0]);
    }
  }, [sellAsset, buyAsset]);

  useEffect(() => {
    if (sellAsset === "TopShot Moments") {
      setSellInput(selectedNFTs.length.toString());
    }
  }, [selectedNFTs, sellAsset]);

  useEffect(() => {
    if (sellAsset === "TopShot Moments") {
      const newBuy =
        buyAsset === "FLOW"
          ? (selectedNFTs.length * (flowPricePerNFT || 1)).toString()
          : selectedNFTs.length.toString();
      setBuyInput(newBuy);
    }
  }, [selectedNFTs, sellAsset, buyAsset, flowPricePerNFT]);

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

  // If selling TSHOT => ensure the selected account has TS collection
  useEffect(() => {
    if (sellAsset === "TSHOT") {
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
  }, [sellAsset, accountData, selectedAccount]);

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

  // Transaction modal
  const handleOpenModal = (data) => {
    setTransactionData(data);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setTransactionData({});
    setShowModal(false);
  };

  const renderSwapPanel = () => {
    if (sellAsset === "TopShot Moments" && buyAsset === "TSHOT") {
      return (
        <NFTToTSHOTPanel
          nftIds={selectedNFTs}
          buyAmount={formattedBuyValue}
          onTransactionStart={handleOpenModal}
        />
      );
    } else if (sellAsset === "TopShot Moments" && buyAsset === "FLOW") {
      return (
        <NFTToFLOWPanel
          nftIds={selectedNFTs}
          buyAmount={formattedBuyValue}
          onTransactionStart={handleOpenModal}
        />
      );
    } else if (sellAsset === "TSHOT" && buyAsset === "TopShot Moments") {
      return (
        <TSHOTToNFTPanel
          sellAmount={formattedSellValue}
          depositDisabled={false}
          onTransactionStart={handleOpenModal}
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
      {dashboardMode && (
        <div className="mb-4">
          <ExchangeDashboard mode={dashboardMode} />
        </div>
      )}

      <div className="max-w-md mx-auto p-4 space-y-4">
        <AnimatePresence>
          {showModal && transactionData.status && (
            <TransactionModal {...transactionData} onClose={handleCloseModal} />
          )}
        </AnimatePresence>

        {/* Sell & Buy */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="bg-gray-600 p-4 rounded-lg mb-2">
            <div className="flex items-center">
              <div className="flex-grow relative">
                <label className="block text-sm text-white">Sell</label>
                <input
                  autoFocus
                  type="text"
                  value={isLoggedIn ? sellInput : ""}
                  onChange={(e) => {
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

          <div className="flex justify-center mb-2">
            <span className="text-2xl text-white">↓</span>
          </div>

          <div className="bg-gray-600 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-grow relative">
                <label className="block text-sm text-white">Buy</label>
                <input
                  type="text"
                  value={isLoggedIn ? buyInput : ""}
                  onChange={(e) => {
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

        {/* Swap Panel */}
        <div className="bg-gray-700 p-2 rounded-lg shadow-md">
          {renderSwapPanel()}
        </div>
      </div>

      {/* If selling Moments, show AccountSelection + MomentSelection */}
      {sellAsset === "TopShot Moments" &&
        isLoggedIn &&
        accountData.parentAddress && (
          <div className="w-full p-4">
            <div className="max-w-screen-lg mx-auto bg-gray-700 p-4 rounded-lg space-y-4">
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

              <AccountSelection
                parentAccount={{
                  addr: accountData.parentAddress || user?.addr,
                  ...accountData,
                }}
                childrenAddresses={accountData.childrenAddresses || []}
                childrenAccounts={accountData.childrenData || []}
                selectedAccount={selectedAccount}
                onSelectAccount={setSelectedAccount}
                // Always reload the parent environment
                onRefresh={() => loadAllUserData(accountData.parentAddress)}
                isRefreshing={isRefreshing}
                isLoadingChildren={isLoadingChildren}
              />

              <MomentSelection />
            </div>
          </div>
        )}
    </>
  );
};

export default ExchangePanel;
