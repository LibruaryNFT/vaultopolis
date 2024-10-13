// TransactionModal.js
import React, { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

const TransactionModal = () => {
  const { transactionInfo, showModal, setShowModal } = useContext(UserContext);

  if (!showModal) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 text-center"
      style={{ width: "100%", zIndex: 1000 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Transaction Status</h2>
        <button
          onClick={() => setShowModal(false)}
          className="text-white text-xl"
        >
          &times;
        </button>
      </div>
      <pre className="mt-2 whitespace-pre-wrap">{transactionInfo}</pre>
    </div>
  );
};

export default TransactionModal;
