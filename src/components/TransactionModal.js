// src/components/TransactionModal.js

import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheckCircle, FaTimesCircle, FaWallet } from "react-icons/fa";
import { motion } from "framer-motion";

// Import your MomentCard component
import MomentCard from "./MomentCard";

const TransactionModal = ({
  status,
  txId,
  error,
  nftCount,
  tshotAmount,
  swapType,
  transactionAction,
  flowAmount,
  onClose,
  // Instead of displaying them in text, we'll only show them as cards
  revealedNFTDetails, // Array of newly minted NFT objects
}) => {
  if (!status) {
    return null; // No status => no modal
  }

  // Map each status to a user-friendly message
  const flowStatusMessages = {
    "Awaiting Approval": "Waiting for your approval in the wallet...",
    Pending: "Transaction received by the network. Awaiting confirmation...",
    Finalized: "Transaction is in a block. Awaiting execution...",
    Executed: "Transaction executed successfully. Sealing in progress...",
    Sealed: "Transaction completed and sealed successfully!",
    Expired: "Transaction expired. Please try again.",
    Error: `Transaction failed: ${error}`,
  };

  const statusMessage =
    flowStatusMessages[status] || "Processing transaction...";

  // Build a descriptive message for the user's action
  let transactionMessage = "Processing transaction...";

  if (transactionAction === "COMMIT_SWAP") {
    transactionMessage = `(Step 1 of 2) Depositing ${tshotAmount} TSHOT.`;
  } else if (transactionAction === "REVEAL_SWAP") {
    const count =
      tshotAmount && Number(tshotAmount) > 0
        ? Number(tshotAmount).toFixed(1)
        : nftCount
        ? Math.round(nftCount)
        : "0.0";
    transactionMessage = `Receiving ${count} Random TopShot Moment(s)`;
  } else if (swapType === "NFT_TO_TSHOT") {
    transactionMessage = `Swapping ${nftCount} Moment(s) for ${tshotAmount} TSHOT`;
  } else if (swapType === "TSHOT_TO_NFT") {
    transactionMessage = `Swapping ${tshotAmount} TSHOT for ${Math.round(
      nftCount || 0
    )} Moment(s)`;
  } else if (swapType === "NFT_TO_FLOW") {
    transactionMessage = `Swapping ${nftCount} Moment(s) for ${Number(
      flowAmount
    ).toFixed(2)} FLOW`;
  } else if (swapType === "BATCH_TRANSFER") {
    transactionMessage = `Transferring ${nftCount} Moment(s) to recipient`;
  }

  // Decide which icon to show based on status
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
        return <FaCheckCircle className="text-6xl text-green-500" />;
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
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>

      <motion.div
        className="relative bg-gray-900 text-white p-6 w-11/12 max-w-md rounded-lg shadow-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex justify-between items-center mb-4">
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
          <div className="text-lg text-gray-400 mt-4 text-center">
            <p>{transactionMessage}</p>
          </div>
        </div>

        {/* If we fetched newly minted NFT details => show them as MomentCards */}
        {revealedNFTDetails && revealedNFTDetails.length > 0 && (
          <div className="mt-4 p-2 border border-gray-600 rounded">
            <h3 className="font-bold text-center mb-2">
              You received these Moments:
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {revealedNFTDetails.map((nft) => (
                <MomentCard key={nft.id} nft={nft} />
              ))}
            </div>
          </div>
        )}

        {txId && (
          <a
            href={`https://flowscan.org/transaction/${txId}`}
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
