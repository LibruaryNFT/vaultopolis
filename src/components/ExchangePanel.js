import React, { useState, useContext } from "react";
import { UserContext } from "./UserContext";
import NFTToTSHOTPanel from "./NFTToTSHOTPanel"; // Now, Moments → $TSHOT
import TSHOTToNFTPanel from "./TSHOTToNFTPanel"; // Now, $TSHOT → Moments
import NFTToFLOWPanel from "./NFTToFLOWPanel"; // Now, Moments → $FLOW
import MomentSelection from "./MomentSelection";
import TransactionModal from "./TransactionModal";
import { AnimatePresence } from "framer-motion";

const ExchangePanel = () => {
  // Define swap modes with updated labels.
  const swapModes = [
    { key: "MOMENTS_TO_TSHOT", label: "Moments → $TSHOT" },
    { key: "TSHOT_TO_MOMENTS", label: "$TSHOT → Moments" },
    { key: "MOMENTS_TO_FLOW", label: "Moments → $FLOW" },
  ];

  const [selectedMode, setSelectedMode] = useState(swapModes[0].key);
  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});
  const { user, selectedAccount } = useContext(UserContext);
  const isLoggedIn = Boolean(user?.loggedIn);

  const handleOpenModal = (data) => {
    setTransactionData(data);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTransactionData({});
  };

  // Render the appropriate panel based on selected mode.
  const renderPanel = () => {
    switch (selectedMode) {
      case "MOMENTS_TO_TSHOT":
        return (
          <>
            <NFTToTSHOTPanel
              isNFTToTSHOT={true}
              setIsNFTToTSHOT={() => {}}
              onTransactionStart={handleOpenModal}
            />
            {isLoggedIn && <MomentSelection />}
          </>
        );
      case "TSHOT_TO_MOMENTS":
        return (
          <TSHOTToNFTPanel
            isNFTToTSHOT={false}
            setIsNFTToTSHOT={() => {}}
            onTransactionStart={handleOpenModal}
          />
        );
      case "MOMENTS_TO_FLOW":
        return <NFTToFLOWPanel onTransactionStart={handleOpenModal} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto mt-4 flex flex-col items-center space-y-4">
      {/* Transaction Modal */}
      <AnimatePresence>
        {showModal && transactionData.status && (
          <TransactionModal {...transactionData} onClose={handleCloseModal} />
        )}
      </AnimatePresence>

      {/* Mode Selector */}
      <div className="w-full md:w-3/4 flex justify-center space-x-4 bg-gray-800 p-4 rounded-lg">
        {swapModes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => setSelectedMode(mode.key)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedMode === mode.key
                ? "bg-flow-dark text-white"
                : "bg-gray-600 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Swap Panel */}
      <div className="w-full md:w-3/4 bg-transparent rounded-lg shadow-xl">
        {renderPanel()}
      </div>
    </div>
  );
};

export default ExchangePanel;
