import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext";
import NFTToTSHOTPanel from "./NFTToTSHOTPanel";
import NFTToFLOWPanel from "./NFTToFLOWPanel";
import TSHOTToNFTPanel from "./TSHOTToNFTPanel";
import MomentSelection from "./MomentSelection";
import AccountSelection from "./AccountSelection";
import TransactionModal from "./TransactionModal";
import MomentCard from "./MomentCard"; // Displays NFT details
import { AnimatePresence } from "framer-motion";

const ExchangePanel = () => {
  // Define asset options
  const sellOptions = ["TopShot Moments", "TSHOT"];
  const buyOptionsMap = {
    "TopShot Moments": ["TSHOT", "FLOW"],
    TSHOT: ["TopShot Moments"],
  };

  // Local state for manual input (used when not selling moments)
  const [sellAmount, setSellAmount] = useState(0);
  const [buyAmount, setBuyAmount] = useState(0);

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

  // Get user and account info from context
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

  // When not selling TopShot Moments, use manual input for buyAmount (1:1 conversion)
  useEffect(() => {
    if (sellAsset !== "TopShot Moments") {
      setBuyAmount(sellAmount);
    }
  }, [sellAmount, sellAsset, buyAsset]);

  // Ensure the selected buy asset is valid for the chosen sell asset
  useEffect(() => {
    if (!buyOptionsMap[sellAsset].includes(buyAsset)) {
      setBuyAsset(buyOptionsMap[sellAsset][0]);
    }
  }, [sellAsset, buyAsset]);

  // When switching away from "TopShot Moments," clear selected NFTs.
  useEffect(() => {
    if (sellAsset !== "TopShot Moments") {
      dispatch({ type: "RESET_SELECTED_NFTS" });
    }
  }, [sellAsset, dispatch]);

  // Compute amounts:
  // For TopShot Moments, use the number of selected NFTs;
  // Otherwise, use the manual input.
  const computedSellAmount =
    sellAsset === "TopShot Moments" && selectedNFTs.length > 0
      ? selectedNFTs.length
      : sellAmount;
  const computedBuyAmount =
    sellAsset === "TopShot Moments"
      ? buyAsset === "FLOW"
        ? computedSellAmount * (flowPricePerNFT || 1)
        : computedSellAmount
      : buyAmount;

  // Render the appropriate swap panel.
  // For moments (sellAsset === "TopShot Moments"), pass the NFT IDs.
  // For TSHOT-to-Moments, use manual input values.
  const renderSwapPanel = () => {
    if (sellAsset === "TopShot Moments" && buyAsset === "TSHOT") {
      return (
        <NFTToTSHOTPanel
          nftIds={selectedNFTs}
          buyAmount={computedBuyAmount}
          onTransactionStart={handleOpenModal}
        />
      );
    } else if (sellAsset === "TopShot Moments" && buyAsset === "FLOW") {
      return (
        <NFTToFLOWPanel
          nftIds={selectedNFTs}
          buyAmount={computedBuyAmount}
          onTransactionStart={handleOpenModal}
        />
      );
    } else if (sellAsset === "TSHOT" && buyAsset === "TopShot Moments") {
      return (
        <TSHOTToNFTPanel
          sellAmount={computedSellAmount}
          buyAmount={computedBuyAmount}
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

  // Determine active account for NFT details:
  // If a child account is selected, use its data; otherwise, use the parent's.
  const activeAccountForNFTs =
    accountData.childrenData?.find((child) => child.addr === selectedAccount) ||
    accountData;

  // Build parent account object (for AccountSelection)
  const parentAccount = {
    addr: accountData.parentAddress || user?.addr,
    flowBalance: accountData.flowBalance,
    tshotBalance: accountData.tshotBalance,
    nftDetails: accountData.nftDetails,
  };

  return (
    <>
      {/* Fixed-width Exchange Panel (Sell/Buy/Swap) */}
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
              <div className="flex-grow">
                <label className="block text-sm text-white">Sell</label>
                <input
                  type="number"
                  min="0"
                  value={isLoggedIn ? computedSellAmount : 0}
                  onChange={(e) => setSellAmount(Number(e.target.value))}
                  className="w-32 bg-gray-600 text-white p-2 rounded mt-1 text-3xl"
                  placeholder="0"
                  readOnly={sellAsset === "TopShot Moments"}
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
              </div>
            </div>
          </div>

          {/* Down Arrow */}
          <div className="flex justify-center mb-2">
            <span className="text-2xl text-white">↓</span>
          </div>

          {/* Buy Section */}
          <div className="bg-gray-600 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-grow">
                <label className="block text-sm text-white">Buy</label>
                <input
                  type="number"
                  readOnly
                  value={isLoggedIn ? computedBuyAmount : 0}
                  className="w-32 bg-gray-600 text-white p-2 rounded mt-1 text-3xl"
                  placeholder="0"
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

      {/* Extra Section: Account & Moment Selection (Fluid Width)
          Only for TopShot Moments mode. For TSHOT-to-Moments, we rely solely on the sell input. */}
      {sellAsset === "TopShot Moments" &&
        isLoggedIn &&
        accountData.parentAddress && (
          <div className="w-full p-4">
            <div className="max-w-screen-lg mx-auto bg-gray-700 p-4 rounded-lg space-y-4">
              {/* Display Selected Moments (if any) above the Account Selection */}
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
