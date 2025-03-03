// src/components/TransactionModal.js
import React, { useState, useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheckCircle, FaTimesCircle, FaWallet } from "react-icons/fa";
import { motion } from "framer-motion";

import MomentCard from "./MomentCard";

// Helper to decide singular vs plural
function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

/**
 * A simple "Hidden" card that uses the same size as MomentCard
 * but is black with "Reveal" text.
 */
function HiddenCard({ nftId, onReveal }) {
  return (
    <div
      className="border border-gray-600 bg-black rounded cursor-pointer
                 relative p-1 font-inter text-white transition-colors
                 duration-200 hover:border-2 hover:border-opolis
                 overflow-hidden flex flex-col items-center justify-center"
      style={{ width: "7rem", height: "12rem" }}
      onClick={() => onReveal(nftId)}
    >
      <p className="text-center font-semibold text-sm text-white">Reveal</p>
    </div>
  );
}

const TransactionModal = ({
  status,
  txId,
  error,
  nftCount,
  tshotAmount,
  swapType,
  transactionAction,
  onClose,
  revealedNFTDetails,
}) => {
  /**
   * --------------------------------------------------
   * 1) ALWAYS define your Hooks at the top level
   * --------------------------------------------------
   */
  // We'll track whether each NFT is revealed or not
  const [hiddenStates, setHiddenStates] = useState({});

  // Whenever we get new `revealedNFTDetails`, initialize them as hidden
  useEffect(() => {
    if (!revealedNFTDetails || revealedNFTDetails.length === 0) {
      setHiddenStates({});
      return;
    }
    const initState = {};
    revealedNFTDetails.forEach((nft) => {
      initState[nft.id] = false; // not revealed
    });
    setHiddenStates(initState);
  }, [revealedNFTDetails]);

  // Single reveal
  const handleRevealOne = (nftId) => {
    setHiddenStates((prev) => ({ ...prev, [nftId]: true }));
  };

  // Reveal all
  const handleRevealAll = () => {
    if (!revealedNFTDetails) return;
    const newState = {};
    revealedNFTDetails.forEach((nft) => {
      newState[nft.id] = true;
    });
    setHiddenStates(newState);
  };

  /**
   * --------------------------------------------------
   * 2) AFTER Hooks, we can do early returns or logic
   * --------------------------------------------------
   */
  // If no status, we return null
  if (!status) {
    return null;
  }

  /**
   * 3) Build out the rest of your logic, *always* below the Hooks
   */

  // Status messages
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

  // Transaction message
  let transactionMessage = "Processing transaction...";
  if (transactionAction === "COMMIT_SWAP") {
    const tshotInt = parseInt(tshotAmount || "0", 10);
    transactionMessage = `(Step 1 of 2) Depositing ${tshotInt} TSHOT.`;
  } else if (transactionAction === "REVEAL_SWAP") {
    const count =
      tshotAmount && Number(tshotAmount) > 0
        ? parseInt(tshotAmount, 10)
        : nftCount
        ? parseInt(nftCount, 10)
        : 0;
    const label = pluralize(count, "Moment", "Moments");
    transactionMessage = `Receiving ${count} Random TopShot ${label}`;
  } else if (swapType === "NFT_TO_TSHOT") {
    const tshotInt = parseInt(tshotAmount || "0", 10);
    const label = pluralize(nftCount, "Moment", "Moments");
    transactionMessage = `Swapping ${nftCount} ${label} for ${tshotInt} TSHOT`;
  } else if (swapType === "TSHOT_TO_NFT") {
    const label = pluralize(nftCount, "Moment", "Moments");
    transactionMessage = `Swapping ${tshotAmount} TSHOT for ${nftCount} ${label}`;
  } else if (swapType === "BATCH_TRANSFER") {
    const label = pluralize(nftCount, "Moment", "Moments");
    transactionMessage = `Transferring ${nftCount} ${label} to recipient`;
  }

  // Icon
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

  // If we actually minted NFTs
  const revealedCount = revealedNFTDetails ? revealedNFTDetails.length : 0;
  const revealedHeading = `You received ${
    revealedCount === 1 ? "this Moment" : "these Moments"
  }:`;

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
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Transaction Status</h2>
          <button onClick={onClose} className="text-white text-2xl">
            &times;
          </button>
        </div>

        {/* Body */}
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

        {/* If we minted new NFTs => allow user to Reveal them */}
        {revealedCount > 0 && (
          <div className="mt-4 p-2 border border-gray-600 rounded">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{revealedHeading}</h3>
              {revealedCount > 1 && (
                <button
                  onClick={handleRevealAll}
                  className="bg-gray-700 text-white text-sm px-3 py-1 rounded hover:bg-gray-600"
                >
                  Reveal All
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {revealedNFTDetails.map((nft) => {
                const isRevealed = hiddenStates[nft.id];
                return isRevealed ? (
                  <MomentCard key={nft.id} nft={nft} />
                ) : (
                  <HiddenCard
                    key={nft.id}
                    nftId={nft.id}
                    onReveal={handleRevealOne}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* flowscan link */}
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
