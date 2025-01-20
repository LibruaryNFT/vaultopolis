import React, { useState, useContext } from "react";
import { UserContext } from "./UserContext";
import NFTToFLOWPanel from "./NFTToFLOWPanel";
import MomentSelection from "./MomentSelection";
import TransactionModal from "./TransactionModal";
import { AnimatePresence } from "framer-motion";

const SellPanel = () => {
  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});

  const { user, selectedAccount } = useContext(UserContext);
  const activeAccountAddr = selectedAccount || user?.addr;
  const isLoggedIn = Boolean(user?.loggedIn);

  // Opens the transaction modal with data
  const handleOpenModal = (data) => {
    setTransactionData(data);
    setShowModal(true);
  };

  // Closes the transaction modal
  const handleCloseModal = () => {
    setShowModal(false);
    setTransactionData({});
  };

  return (
    <div className="w-full mx-auto mt-1 flex flex-col items-center space-y-4">
      {/* AnimatePresence to smoothly mount/unmount the modal */}
      <AnimatePresence>
        {showModal && transactionData.status && (
          <TransactionModal {...transactionData} onClose={handleCloseModal} />
        )}
      </AnimatePresence>

      {/* Main Panel: NFT -> FLOW */}
      <div className="w-full md:w-3/4 bg-transparent rounded-lg">
        <NFTToFLOWPanel onTransactionStart={handleOpenModal} />
      </div>

      {/* Moment Selection: only displayed if user is logged in */}
      {isLoggedIn && (
        <div className="w-full md:w-3/4 bg-transparent rounded-lg">
          <MomentSelection />
        </div>
      )}
    </div>
  );
};

export default SellPanel;
