import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheckCircle, FaTimesCircle, FaWallet } from "react-icons/fa";
import { motion } from "framer-motion";

const TransactionModal = ({
  status,
  txId,
  error,
  nftCount,
  tshotAmount,
  swapType,
  transactionAction,
  flowAmount, // New prop for FLOW amount
  onClose,
}) => {
  console.log("Rendering TransactionModal with status:", status);

  if (!status) {
    // If status is null or undefined, don't render the modal
    return null;
  }

  const flowStatusMessages = {
    "Awaiting Approval": "Waiting for your approval in the wallet...",
    Pending:
      "Transaction has been received by the network. Awaiting confirmation...",
    Finalized: "Transaction is in a block. Awaiting execution...",
    Executed: "Transaction executed successfully. Sealing in progress...",
    Sealed: "Transaction completed and sealed successfully!",
    Expired: "Transaction expired. Please try again.",
    Error: `Transaction failed: ${error}`,
  };

  const statusMessage =
    flowStatusMessages[status] || "Processing transaction...";

  // Generate the transaction message based on swap type and action
  let transactionMessage = "Processing transaction...";

  if (transactionAction === "COMMIT_SWAP") {
    transactionMessage = `Depositing ${tshotAmount} $TSHOT to receive a receipt (Step 1 of 2)`;
  } else if (
    transactionAction === "REVEAL_SWAP" ||
    transactionAction === "RECEIVE"
  ) {
    // Updated to ensure integer display
    transactionMessage = `Receiving ${Math.round(
      nftCount || 0
    )} Random Common(s)`;
  } else if (swapType === "NFT_TO_TSHOT") {
    transactionMessage = `Swapping ${nftCount} TopShot Common(s) for ${tshotAmount} $TSHOT`;
  } else if (swapType === "TSHOT_TO_NFT") {
    transactionMessage = `Swapping ${tshotAmount} $TSHOT for ${Math.round(
      nftCount || 0
    )} Random Common(s)`;
  } else if (swapType === "NFT_TO_FLOW") {
    // New case: format flowAmount to 2 decimal places
    transactionMessage = `Swapping ${nftCount} TopShot Common(s) for ${Number(
      flowAmount
    ).toFixed(2)} FLOW`;
  }

  const getStatusIcon = () => {
    switch (status) {
      case "Awaiting Approval":
        return (
          <motion.div
            className="flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <FaWallet className="text-6xl text-yellow-400" />
          </motion.div>
        );
      case "Pending":
        return (
          <AiOutlineLoading3Quarters className="text-6xl animate-spin text-blue-500" />
        );
      case "Finalized":
        return (
          <AiOutlineLoading3Quarters className="text-6xl animate-spin text-orange-500" />
        );
      case "Executed":
        return <FaCheckCircle className="text-6xl text-blue-500" />;
      case "Sealed":
        return <FaCheckCircle className="text-6xl text-green-600" />;
      case "Expired":
      case "Error":
        return <FaTimesCircle className="text-6xl text-red-500" />;
      default:
        return (
          <AiOutlineLoading3Quarters className="text-6xl animate-spin text-blue-500" />
        );
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      ></div>
      <motion.div
        className="relative bg-gray-900 text-white p-6 w-11/12 max-w-md rounded-lg shadow-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Transaction Status</h2>
          <button onClick={onClose} className="text-white text-2xl">
            &times;
          </button>
        </div>
        <div className="flex flex-col items-center my-6 space-y-3">
          {getStatusIcon()}
          <motion.p
            className="text-center text-lg font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {statusMessage}
          </motion.p>
          {/* Transaction Details */}
          <div className="text-lg text-gray-400 mt-4 text-center">
            <p>{transactionMessage}</p>
          </div>
        </div>
        {txId && (
          <a
            href={`https://flowscan.io/tx/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 text-center text-blue-400 underline"
          >
            View Transaction Details
          </a>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TransactionModal;
