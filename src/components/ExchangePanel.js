import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext";
import NFTToTSHOTPanel from "./NFTToTSHOTPanel";
import NFTToFLOWPanel from "./NFTToFLOWPanel";
import TSHOTToNFTPanel from "./TSHOTToNFTPanel";
import MomentSelection from "./MomentSelection";
import AccountSelection from "./AccountSelection";
import TransactionModal from "./TransactionModal";
import MomentCard from "./MomentCard";
import { AnimatePresence } from "framer-motion";

const ExchangePanel = () => {
  // Define asset options
  const sellOptions = ["TopShot Moments", "TSHOT"];
  const buyOptionsMap = {
    "TopShot Moments": ["TSHOT", "FLOW"],
    TSHOT: ["TopShot Moments"],
  };

  // Use string states for sell and buy inputs.
  const [sellInput, setSellInput] = useState("");
  const [buyInput, setBuyInput] = useState("");

  // Transaction modal state
  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});

  const handleOpenModal = (data) => {
    setTransactionData(data);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setTransactionData({});
    setShowModal(false);
  };

  // Get user and account info from context.
  const {
    user,
    accountData,
    selectedAccount,
    setSelectedAccount,
    refreshBalances,
    isRefreshing,
    isLoadingChildren,
    selectedNFTs,
    flowPricePerNFT,
    dispatch,
  } = useContext(UserContext);
  const isLoggedIn = Boolean(user?.loggedIn);

  // Local state for asset selection (sell/buy types)
  const [sellAsset, setSellAsset] = useState("TopShot Moments");
  const [buyAsset, setBuyAsset] = useState("TSHOT");

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
    if (sellAsset !== "TopShot Moments") {
      dispatch({ type: "RESET_SELECTED_NFTS" });
    }
  }, [sellAsset, dispatch]);

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

  const formattedSellValue = Math.floor(computedSellAmount);
  const formattedBuyValue = Math.floor(computedBuyAmount);

  const handleNFTSelection = (momentId) => {
    dispatch({ type: "SET_SELECTED_NFTS", payload: momentId });
  };

  const activeAccountForNFTs =
    accountData.childrenData?.find((child) => child.addr === selectedAccount) ||
    accountData;

  const parentAccount = {
    addr: accountData.parentAddress || user?.addr,
    flowBalance: accountData.flowBalance,
    tshotBalance: accountData.tshotBalance,
    nftDetails: accountData.nftDetails,
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
          onDeposit={handleOpenModal} // deposit handler for TSHOT deposits
          depositDisabled={false} // adjust as needed
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
        <AnimatePresence>
          {showModal && transactionData.status && (
            <TransactionModal {...transactionData} onClose={handleCloseModal} />
          )}
        </AnimatePresence>

        {/* Sell & Buy Section */}
        <div className="bg-gray-700 p-4 rounded-lg">
          {/* Sell Section */}
          <div className="bg-gray-600 p-4 rounded-lg mb-2">
            <div className="flex items-center">
              <div className="flex-grow relative">
                <label className="block text-sm text-white">Sell</label>
                <input
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
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
                  className="w-32 bg-gray-600 text-white p-2 rounded mt-1 text-3xl text-left focus:outline-none"
                  style={{
                    WebkitAppearance: "none",
                    MozAppearance: "textfield",
                    appearance: "none",
                  }}
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
                  parentAccount.tshotBalance !== undefined && (
                    <p className="mt-1 text-xs text-gray-300">
                      Balance: {Math.floor(parentAccount.tshotBalance)} TSHOT
                    </p>
                  )}
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-2">
            <span className="text-2xl text-white">↓</span>
          </div>

          {/* Buy Section */}
          <div className="bg-gray-600 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-grow relative">
                <label className="block text-sm text-white">Buy</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
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
                  className="w-32 bg-gray-600 text-white p-2 rounded mt-1 text-3xl text-left focus:outline-none"
                  style={{
                    WebkitAppearance: "none",
                    MozAppearance: "textfield",
                    appearance: "none",
                  }}
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

        {/* Swap Panel Section */}
        <div className="bg-gray-700 p-2 rounded-lg shadow-md">
          {renderSwapPanel()}
        </div>
      </div>

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
                      const nft =
                        (activeAccountForNFTs.nftDetails || []).find(
                          (item) => Number(item.id) === Number(momentId)
                        ) || {};
                      return (
                        <MomentCard
                          key={momentId}
                          nft={nft}
                          handleNFTSelection={handleNFTSelection}
                          isSelected={true}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <AccountSelection
                parentAccount={parentAccount}
                childrenAccounts={accountData.childrenData || []}
                selectedAccount={selectedAccount}
                onSelectAccount={setSelectedAccount}
                onRefresh={() => refreshBalances(user.addr)}
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
