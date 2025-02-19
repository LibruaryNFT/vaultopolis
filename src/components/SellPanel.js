import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import NFTToFLOWPanel from "./NFTToFLOWPanel";
import MomentSelection from "./MomentSelection";
import TransactionModal from "./TransactionModal";
import { AnimatePresence } from "framer-motion";
import SellDashboard from "./SellDashboard";

const SellPanel = () => {
  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});

  const { user, selectedAccount } = useContext(UserContext);
  const activeAccountAddr = selectedAccount || user?.addr;
  const isLoggedIn = Boolean(user?.loggedIn);

  // Open the transaction modal with data.
  const handleOpenModal = (data) => {
    setTransactionData(data);
    setShowModal(true);
  };

  // Close the transaction modal.
  const handleCloseModal = () => {
    setShowModal(false);
    setTransactionData({});
  };

  return (
    <div className="w-full mx-auto mt-1 flex flex-col items-center space-y-4">
      <SellDashboard />
      <AnimatePresence>
        {showModal && transactionData.status && (
          <TransactionModal {...transactionData} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
      <div className="w-full md:w-3/4 bg-transparent rounded-lg">
        <NFTToFLOWPanel onTransactionStart={handleOpenModal} />
      </div>
      {isLoggedIn && (
        <div className="w-full md:w-3/4 bg-transparent rounded-lg">
          <MomentSelection />
        </div>
      )}
    </div>
  );
};

export default SellPanel;
