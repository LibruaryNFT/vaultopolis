// TransactionModal.js
import React, { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

const TransactionModal = () => {
  const { transactionInfo, showModal, setShowModal } = useContext(UserContext);

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 flex items-end justify-center z-50"
      aria-live="polite"
      role="alert"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={() => setShowModal(false)}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-gray-800 text-white p-4 w-full max-w-lg mx-auto rounded-t-lg shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Transaction Status</h2>
          <button
            onClick={() => setShowModal(false)}
            aria-label="Close transaction modal"
            className="text-white text-xl"
          >
            &times;
          </button>
        </div>
        <pre className="mt-2 whitespace-pre-wrap">{transactionInfo}</pre>
      </div>
    </div>
  );
};

export default TransactionModal;
