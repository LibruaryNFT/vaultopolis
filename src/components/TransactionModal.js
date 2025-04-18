// src/components/TransactionModal.jsx

import React, { useState, useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheckCircle, FaTimesCircle, FaWallet } from "react-icons/fa";
import { motion } from "framer-motion";
import MomentCard from "./MomentCard";

/** Helper for singular vs plural */
function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

/**
 * A simple "Hidden" card that uses the same size as MomentCard
 * but is styled as a black card with "Reveal" text.
 */
function HiddenCard({ nftId, onReveal }) {
  return (
    <div
      className="
        w-28 h-48
        border
        border-brand-border
        bg-black
        text-white
        rounded
        flex flex-col items-center justify-center
        cursor-pointer
        transition-colors
        duration-200
        hover:border-2
        hover:border-opolis
      "
      onClick={() => onReveal(nftId)}
    >
      <p className="text-center font-semibold text-sm">Reveal</p>
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
  recipient,
}) => {
  const [hiddenStates, setHiddenStates] = useState({});

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

  if (!status) {
    return null;
  }

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

  // --- Construct the main transaction message ---
  let transactionMessage = "Processing transaction...";
  const label = pluralize(nftCount || 0, "Moment", "Moments");

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
    const revealLabel = pluralize(count, "Moment", "Moments");
    transactionMessage = `Receiving ${count} Random TopShot ${revealLabel}`;
  } else if (swapType === "NFT_TO_TSHOT") {
    const tshotInt = parseInt(tshotAmount || "0", 10);
    transactionMessage = `Swapping ${nftCount} ${label} for ${tshotInt} TSHOT`;
  } else if (swapType === "TSHOT_TO_NFT") {
    transactionMessage = `Swapping ${tshotAmount} TSHOT for ${nftCount} ${label}`;
  } else if (swapType === "BRIDGE_TO_EVM") {
    // Bridging to EVM
    transactionMessage = `Bridging ${nftCount} ${label} to your Flow EVM COA`;
  } else if (swapType === "BATCH_TRANSFER") {
    // Flow -> Flow
    if (recipient && recipient !== "0x") {
      transactionMessage = `Transferring ${nftCount} ${label} to ${recipient}`;
    } else {
      // Fallback (shouldn't usually happen due to validation)
      transactionMessage = `Transferring ${nftCount} ${label} to recipient`;
    }
  }

  // Icon based on status
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

  const revealedCount = revealedNFTDetails ? revealedNFTDetails.length : 0;
  const revealedHeading = `You received ${
    revealedCount === 1 ? "this Moment" : "these Moments"
  }:`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-10 pb-10">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>

      <motion.div
        className="
          relative
          bg-brand-primary
          text-brand-text
          p-6
          w-11/12
          max-w-md
          sm:max-w-xl
          md:max-w-3xl
          2xl:max-w-5xl
          rounded-lg
          shadow-lg
          overflow-y-auto
          max-h-[90vh]
        "
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Transaction Status</h2>
          <button onClick={onClose} className="text-2xl hover:opacity-80">
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
          <div className="text-lg text-brand-text/80 mt-4 text-center">
            <p>{transactionMessage}</p>
          </div>
        </div>

        {/* Revealed NFTs (optional, for random swap scenarios) */}
        {revealedCount > 0 && (
          <div className="mt-4 p-2 border border-brand-border rounded">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{revealedHeading}</h3>
              {revealedCount > 1 && (
                <button
                  onClick={handleRevealAll}
                  className="
                    bg-brand-secondary
                    text-brand-text
                    text-sm
                    px-3
                    py-1
                    rounded
                    hover:opacity-80
                  "
                >
                  Reveal All
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {revealedNFTDetails.map((nft) => {
                const isRevealed = hiddenStates[nft.id];
                return isRevealed ? (
                  <MomentCard key={nft.id} nft={nft} disableHover />
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

        {/* Flowscan Link */}
        {txId && (
          <a
            href={`https://flowscan.io/transaction/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 text-center text-flow-light underline hover:opacity-80"
          >
            View Transaction Details
          </a>
        )}
      </motion.div>
    </div>
  );
};

export default TransactionModal;
