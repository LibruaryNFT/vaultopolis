import React, { useContext } from "react";
import { UserContext } from "./UserContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa"; // Added for completion icon

const TransactionModal = () => {
  const { transactionInfo, showModal, dispatch } = useContext(UserContext);

  if (!showModal) return null;

  // Determine if the transaction is in progress
  const isTransactionInProgress =
    transactionInfo.includes("Processing") ||
    transactionInfo.includes("Revealing") ||
    transactionInfo.includes("Submitting") ||
    transactionInfo.includes("Transaction submitted");

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      aria-live="polite"
      role="alert"
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-70 transition-opacity"
        onClick={() => dispatch({ type: "TOGGLE_MODAL", payload: false })}
      ></div>

      <div className="relative bg-gray-900 text-white p-6 w-full max-w-lg mx-auto rounded-lg shadow-lg transform transition-all duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Transaction Status</h2>
          <button
            onClick={() => dispatch({ type: "TOGGLE_MODAL", payload: false })}
            aria-label="Close transaction modal"
            className="text-white text-xl"
          >
            &times;
          </button>
        </div>
        <div className="flex items-center justify-center my-4">
          {isTransactionInProgress ? (
            <AiOutlineLoading3Quarters className="text-3xl animate-spin" />
          ) : (
            <FaCheckCircle className="text-3xl text-green-500" />
          )}
        </div>
        <pre className="mt-2 text-center whitespace-pre-wrap text-sm leading-relaxed break-words">
          {transactionInfo || "Processing transaction..."}
        </pre>
      </div>
    </div>
  );
};

export default TransactionModal;
