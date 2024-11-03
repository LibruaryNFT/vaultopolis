// src/components/ExchangePanel.js
import React, { useState, useContext } from "react";
import { UserContext } from "./UserContext";
import NFTToTSHOTPanel from "./NFTToTSHOTPanel";
import TSHOTToNFTPanel from "./TSHOTToNFTPanel";
import TransactionModal from "./TransactionModal"; // Import TransactionModal

const ExchangePanel = () => {
  const [isNFTToTSHOT, setIsNFTToTSHOT] = useState(true);
  const { showModal } = useContext(UserContext);

  return (
    <div className="w-full mx-auto p-6 rounded-lg shadow-xl font-inter max-w-screen-lg mt-12 bg-gray-800">
      {showModal && <TransactionModal />}

      <div className="bg-gray-700 p-6 rounded-lg text-center text-white mb-6">
        {/* Mode Toggle with Label */}
        <div className="text-gray-400 mb-2">Select Swap Mode</div>
        <div className="flex items-center justify-center mb-6 space-x-4">
          <button
            onClick={() => setIsNFTToTSHOT(true)}
            className={`px-6 py-2 font-bold rounded-lg border-2 ${
              isNFTToTSHOT
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-700 text-gray-400 border-gray-600"
            }`}
          >
            Moments to $TSHOT
          </button>
          <button
            onClick={() => setIsNFTToTSHOT(false)}
            className={`px-6 py-2 font-bold rounded-lg border-2 ${
              !isNFTToTSHOT
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-700 text-gray-400 border-gray-600"
            }`}
          >
            $TSHOT to Moments
          </button>
        </div>

        {/* Render Mode-Specific Panels */}
        {isNFTToTSHOT ? <NFTToTSHOTPanel /> : <TSHOTToNFTPanel />}
      </div>
    </div>
  );
};

export default ExchangePanel;
