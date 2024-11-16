// src/components/ExchangePanel.js
import React, { useState, useContext } from "react";
import { UserContext } from "./UserContext";
import NFTToTSHOTPanel from "./NFTToTSHOTPanel";
import TSHOTToNFTPanel from "./TSHOTToNFTPanel";
import MomentSelection from "./MomentSelection";
import TransactionModal from "./TransactionModal";
import { AnimatePresence } from "framer-motion";

const ExchangePanel = () => {
  const [isNFTToTSHOT, setIsNFTToTSHOT] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});
  const { user } = useContext(UserContext);

  const handleOpenModal = (data) => {
    setTransactionData(data);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTransactionData({});
  };

  return (
    <div className="w-full mx-auto mt-1 flex flex-col items-center space-y-4">
      {/* Wrap the modal with AnimatePresence */}
      <AnimatePresence>
        {showModal && transactionData.status && (
          <TransactionModal {...transactionData} onClose={handleCloseModal} />
        )}
      </AnimatePresence>

      {/* Give/Receive Panel with responsive width */}
      <div className="w-full md:w-3/4 lg:w-1/2 bg-transparent rounded-lg shadow-xl">
        {isNFTToTSHOT ? (
          <NFTToTSHOTPanel
            isNFTToTSHOT={isNFTToTSHOT}
            setIsNFTToTSHOT={setIsNFTToTSHOT}
            onTransactionStart={handleOpenModal} // Pass modal control to child
          />
        ) : (
          <TSHOTToNFTPanel
            isNFTToTSHOT={isNFTToTSHOT}
            setIsNFTToTSHOT={setIsNFTToTSHOT}
            onTransactionStart={handleOpenModal} // Pass modal control to child
          />
        )}
      </div>

      {/* Conditionally render Moment Selection Panel with responsive width */}
      {user.loggedIn && isNFTToTSHOT && (
        <div className="w-full md:w-3/4 bg-transparent rounded-lg shadow-xl">
          <MomentSelection />
        </div>
      )}
    </div>
  );
};

export default ExchangePanel;
