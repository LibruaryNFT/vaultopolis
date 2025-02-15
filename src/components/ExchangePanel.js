import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext";
import NFTToTSHOTPanel from "./NFTToTSHOTPanel";
import NFTToFLOWPanel from "./NFTToFLOWPanel";
import TSHOTToNFTPanel from "./TSHOTToNFTPanel";
import TransactionModal from "./TransactionModal";
import { AnimatePresence } from "framer-motion";

const ExchangePanel = () => {
  // Define asset options.
  const sellOptions = ["TopShot Moments", "TSHOT"];
  const buyOptionsMap = {
    "TopShot Moments": ["TSHOT", "FLOW"],
    TSHOT: ["TopShot Moments"],
  };

  // State for asset selections.
  const [sellAsset, setSellAsset] = useState("TopShot Moments");
  const [buyAsset, setBuyAsset] = useState("TSHOT");

  // State for input amounts.
  const [sellAmount, setSellAmount] = useState(0);
  const [buyAmount, setBuyAmount] = useState(0);

  // Update buyAmount when sellAmount changes.
  useEffect(() => {
    setBuyAmount(sellAmount);
  }, [sellAmount, sellAsset, buyAsset]);

  // Ensure the buy asset is valid for the chosen sell asset.
  useEffect(() => {
    if (!buyOptionsMap[sellAsset].includes(buyAsset)) {
      setBuyAsset(buyOptionsMap[sellAsset][0]);
    }
  }, [sellAsset, buyAsset]);

  // Transaction modal state.
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

  // Get login state.
  const { user } = useContext(UserContext);
  const isLoggedIn = Boolean(user?.loggedIn);

  // Render the appropriate swap panel.
  const renderSwapPanel = () => {
    if (sellAsset === "TopShot Moments" && buyAsset === "TSHOT") {
      return (
        <NFTToTSHOTPanel
          sellAmount={sellAmount}
          buyAmount={buyAmount}
          onTransactionStart={handleOpenModal}
        />
      );
    } else if (sellAsset === "TopShot Moments" && buyAsset === "FLOW") {
      return (
        <NFTToFLOWPanel
          sellAmount={sellAmount}
          buyAmount={buyAmount}
          onTransactionStart={handleOpenModal}
        />
      );
    } else if (sellAsset === "TSHOT" && buyAsset === "TopShot Moments") {
      return (
        <TSHOTToNFTPanel
          sellAmount={sellAmount}
          buyAmount={buyAmount}
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
    <div className="max-w-md mx-auto p-4 bg-gray-700 rounded-lg">
      <AnimatePresence>
        {showModal && transactionData.status && (
          <TransactionModal {...transactionData} onClose={handleCloseModal} />
        )}
      </AnimatePresence>

      {/* Sell Section */}
      <div className="bg-gray-600 p-4 rounded-lg mb-4">
        <div className="flex items-center">
          <div className="flex-grow">
            <label className="block text-sm text-white">Sell</label>
            <input
              type="number"
              min="0"
              value={isLoggedIn ? sellAmount : 0}
              onChange={(e) => setSellAmount(Number(e.target.value))}
              className="w-32 bg-gray-600 text-white p-2 rounded mt-1 text-3xl"
              placeholder="0"
              style={{
                WebkitAppearance: "none",
                MozAppearance: "textfield",
                appearance: "none",
                overflow: "hidden",
              }}
            />
          </div>
          <div className="ml-2">
            <select
              value={sellAsset}
              onChange={(e) => setSellAsset(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded-lg border border-gray-200 text-xl custom-select"
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
      <div className="flex justify-center mb-4">
        <span className="text-2xl text-white">↓</span>
      </div>

      {/* Buy Section */}
      <div className="bg-gray-600 p-4 rounded-lg mb-4">
        <div className="flex items-center">
          <div className="flex-grow">
            <label className="block text-sm text-white">Buy</label>
            <input
              type="number"
              readOnly
              value={isLoggedIn ? buyAmount : 0}
              className="w-32 bg-gray-600 text-white p-2 rounded mt-1 text-3xl"
              placeholder="0"
              style={{
                WebkitAppearance: "none",
                MozAppearance: "textfield",
                appearance: "none",
                overflow: "hidden",
              }}
            />
          </div>
          <div className="ml-2">
            <select
              value={buyAsset}
              onChange={(e) => setBuyAsset(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded-lg border border-gray-200 text-xl custom-select"
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

      {/* Swap Panel Section */}
      <div className="bg-gray-700 p-4 rounded-lg">{renderSwapPanel()}</div>

      {/* Global styles for custom select arrow */}
      <style jsx global>{`
        .custom-select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6l4 4 4-4H4z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
          background-size: 1.5em;
          padding-right: 2.5rem;
        }
      `}</style>
    </div>
  );
};

export default ExchangePanel;
