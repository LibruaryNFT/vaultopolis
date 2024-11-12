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
    <div className="w-full mx-auto mt-1 flex flex-col items-center space-y-4">
      {showModal && <TransactionModal />}

      {/* Give/Receive Panel with responsive width */}
      <div className="w-full md:w-3/4 lg:w-1/2 p-2 bg-transparent rounded-lg shadow-xl">
        {isNFTToTSHOT ? (
          <NFTToTSHOTPanel
            isNFTToTSHOT={isNFTToTSHOT}
            setIsNFTToTSHOT={setIsNFTToTSHOT}
          />
        ) : (
          <TSHOTToNFTPanel setIsNFTToTSHOT={setIsNFTToTSHOT} />
        )}
      </div>

      {/* Conditionally render Moment Selection Panel with responsive width */}
      {user.loggedIn && isNFTToTSHOT && (
        <div className="w-full md:w-3/4 p-2 bg-transparent rounded-lg shadow-xl">
          <MomentSelection />
        </div>
      )}
    </div>
  );
};

export default ExchangePanel;
