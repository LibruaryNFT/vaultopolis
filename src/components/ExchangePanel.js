// src/components/ExchangePanel.js
import React, { useState, useContext } from "react";
import { UserContext } from "./UserContext";
import NFTToTSHOTPanel from "./NFTToTSHOTPanel";
import TSHOTToNFTPanel from "./TSHOTToNFTPanel";
import MomentSelection from "./MomentSelection";
import TransactionModal from "./TransactionModal";

const ExchangePanel = () => {
  const [isNFTToTSHOT, setIsNFTToTSHOT] = useState(true);
  const { showModal, user } = useContext(UserContext);

  return (
    <div className="w-full mx-auto mt-24 flex flex-col items-center space-y-4">
      {showModal && <TransactionModal />}

      {/* Give/Receive Panel (50% Width) */}
      <div className="w-1/2 p-2 bg-gray-800 rounded-lg shadow-xl">
        {isNFTToTSHOT ? (
          <NFTToTSHOTPanel
            isNFTToTSHOT={isNFTToTSHOT}
            setIsNFTToTSHOT={setIsNFTToTSHOT}
          />
        ) : (
          <TSHOTToNFTPanel setIsNFTToTSHOT={setIsNFTToTSHOT} />
        )}
      </div>

      {/* Conditionally render Moment Selection Panel (75% Width) */}
      {user.loggedIn && isNFTToTSHOT && (
        <div className="w-3/4 p-2 bg-gray-800 rounded-lg shadow-xl">
          <MomentSelection />
        </div>
      )}
    </div>
  );
};

export default ExchangePanel;
