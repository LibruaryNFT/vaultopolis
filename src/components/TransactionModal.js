// src/components/TransactionModal.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AiOutlineLoading3Quarters as Spinner } from "react-icons/ai";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaWallet,
  FaTimes,
} from "react-icons/fa";
import MomentCard from "./MomentCard";
import { getAllDayImageUrlConsistent } from "../utils/allDayImages";

/* ---------- helpers ---------- */
const plural = (n, s, p) => (n === 1 ? s : p);

/* Hidden placeholder (matches MomentCard shell) */
const HiddenCard = ({ nftId, onReveal }) => (
  <div
    onClick={() => onReveal(nftId)}
    className="
      w-[80px] sm:w-28
      aspect-[4/7]
      pt-1 px-1 pb-0
      flex flex-col items-center justify-center
      bg-black text-white border border-brand-border rounded
      cursor-pointer transition-colors hover:border-2 hover:border-opolis
      select-none
    "
  >
    <p className="text-sm font-semibold text-center leading-tight">Reveal</p>
  </div>
);

/* ---------- component ---------- */
const TransactionModal = ({
  status,
  txId,
  nftCount,
  tshotAmount,
  swapType,
  transactionAction,
  onClose,
  revealedNFTDetails,
  recipient,
  momentDetails,
  offerDetails,
  usdAmount,
  collectionType = 'topshot',
}) => {
  /* collapse noisy statuses */
  const effectiveStatus =
    status === "Finalized" || status === "Executed" ? "Pending" : status;

  /* reveal state */
  const [hidden, setHidden] = useState({});
  useEffect(() => {
    if (!revealedNFTDetails?.length) return setHidden({});
    setHidden(Object.fromEntries(revealedNFTDetails.map((n) => [n.id, false])));
  }, [revealedNFTDetails]);

  /* ---------- PRE-LOAD IMAGES BEFORE REVEAL ---------- */
  useEffect(() => {
    if (!revealedNFTDetails?.length) return;
    const imgs = revealedNFTDetails.map((nft) => {
      // Generate URL based on collection type
      let url;
      if (collectionType === 'allday') {
        url = getAllDayImageUrlConsistent(nft?.editionID);
      } else {
        url = `https://assets.nbatopshot.com/media/${nft.id}/transparent/image?width=250&quality=80`;
      }
      const img = new Image();
      img.src = url; // browser starts downloading in background
      return img;
    });
    return () => imgs.forEach((img) => (img.src = "")); // abort if unmounts
  }, [revealedNFTDetails, collectionType]);
  /* --------------------------------------------------- */

  const revealOne = (id) => setHidden((s) => ({ ...s, [id]: true }));
  const revealAll = () =>
    setHidden(Object.fromEntries(revealedNFTDetails.map((n) => [n.id, true])));

  if (!effectiveStatus) return null;

  /* ---------- copy helpers ---------- */
  const isDone =
    effectiveStatus === "Sealed" ||
    effectiveStatus === "Expired" ||
    effectiveStatus === "Error";

  const nounMoments = plural(nftCount || 0, "Moment", "Moments");
  const past = (present, past) => (isDone ? past : present);

  let txMsg = "";
  switch (transactionAction) {
    case "OFFERS_ACCEPT": {
      const flowAmt = parseFloat(tshotAmount || 0).toFixed(2);
      const base = `${flowAmt} FLOW`;
      const usdText = usdAmount ? ` (~$${usdAmount.toFixed(2)} USD)` : '';
      txMsg = past(
        `Accepting offer · ${base}${usdText}`,
        `Accepted offer · ${base}${usdText}`
      );
      break;
    }
    case "COMMIT_SWAP":
      txMsg = past(
        `Depositing ${parseInt(tshotAmount || 0, 10)} TSHOT`,
        `Deposited ${parseInt(tshotAmount || 0, 10)} TSHOT`
      );
      break;
    case "REVEAL_SWAP": {
      const n =
        tshotAmount && +tshotAmount > 0
          ? parseInt(tshotAmount, 10)
          : parseInt(nftCount ?? 0, 10);
      txMsg = past(
        `Receiving ${n} random ${plural(n, "Moment", "Moments")}`,
        ""
      );
      break;
    }
    default:
      if (swapType === "NFT_TO_TSHOT") {
        const ts = parseInt(tshotAmount || 0, 10);
        txMsg = past(
          `Swapping ${nftCount} ${nounMoments} ↔ ${ts} TSHOT`,
          `Swapped ${nftCount} ${nounMoments} ↔ ${ts} TSHOT`
        );
      } else if (swapType === "TSHOT_TO_NFT") {
        txMsg = past(
          `Swapping ${tshotAmount} TSHOT ↔ ${nftCount} ${nounMoments}`,
          `Swapped ${tshotAmount} TSHOT ↔ ${nftCount} ${nounMoments}`
        );
      } else if (swapType === "BRIDGE_TO_EVM") {
        txMsg = past(
          `Bridging ${nftCount} ${nounMoments}`,
          `Bridged ${nftCount} ${nounMoments}`
        );
      } else if (swapType === "BATCH_TRANSFER") {
        const base = `${nftCount} ${nounMoments}`;
        txMsg =
          recipient && recipient !== "0x"
            ? past(`Sending ${base}`, `Sent ${base}`)
            : past(`Transferring ${base}`, `Transferred ${base}`);
      }
  }

  const flowStatus =
    {
      "Awaiting Approval": "Awaiting approval",
      Pending: "Pending",
      Sealed: "Sealed",
      Expired: "Expired",
      Error: "Error",
    }[effectiveStatus] || "Processing";

  const Icon = (() => {
    switch (effectiveStatus) {
      case "Awaiting Approval":
        return (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <FaWallet className="text-4xl text-yellow-400" />
          </motion.div>
        );
      case "Pending":
        return <Spinner className="text-4xl animate-spin text-blue-500" />;
      case "Sealed":
        return <FaCheckCircle className="text-4xl text-green-500" />;
      case "Expired":
      case "Error":
        return <FaTimesCircle className="text-4xl text-red-500" />;
      default:
        return <Spinner className="text-4xl animate-spin text-blue-500" />;
    }
  })();

  const revealedCount = revealedNFTDetails?.length ?? 0;

  /* ---------- render ---------- */
  return (
    <div
      className="
        fixed inset-0 z-50 flex items-start justify-center
        overflow-y-auto pt-4 pb-4 sm:pt-10 sm:pb-10
      "
    >
      {/* overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 cursor-pointer"
      />

      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="
          relative bg-brand-primary text-brand-text
          w-full p-4 sm:w-11/12 sm:max-w-md sm:rounded-lg
          rounded-none shadow-lg overflow-y-auto max-h-[90vh]
        "
      >
        {/* sticky compact bar */}
        <div className="flex items-center justify-between sticky top-0 bg-brand-primary z-10">
          <div className="flex items-center gap-2">
            {Icon}
            <span className="text-sm font-medium">
              {flowStatus}
              {txMsg && " · "}
              {txMsg}
            </span>
          </div>

          <button
            onClick={onClose}
            className="
              w-11 h-11 flex items-center justify-center flex-shrink-0
              bg-brand-secondary hover:bg-brand-blue
              text-brand-text rounded-full transition-colors select-none
            "
          >
            <FaTimes size={26} />
          </button>
        </div>

        {/* Moment being sold for OFFERS_ACCEPT */}
        {transactionAction === "OFFERS_ACCEPT" && momentDetails && (
          <div className="-mx-4 px-4 mt-4 pb-2 border-t border-brand-border">
            <h3 className="font-bold text-sm mb-2">
              Selling Moment:
            </h3>
            <div className="flex justify-center">
              <MomentCard nft={momentDetails} disableHover collectionType={collectionType} />
            </div>
            {offerDetails && (
              <div className="mt-2 text-center text-sm text-brand-text/70">
                <p>Offer ID: {offerDetails.offerId}</p>
                {collectionType === 'topshot' && (
                  <p>Set {momentDetails.setID}, Play {momentDetails.playID}</p>
                )}
                <p className="mt-1 font-semibold text-green-400">
                  You will receive: {parseFloat(offerDetails.offerAmount).toFixed(2)} FLOW
                  {usdAmount && ` (~$${usdAmount.toFixed(2)} USD)`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* reveal grid - only show for non-OFFERS_ACCEPT transactions */}
        {revealedCount > 0 && transactionAction !== "OFFERS_ACCEPT" && (
          <div className="-mx-4 px-4 mt-4 pb-2 border-t border-brand-border">
            <div className="flex items-center justify-between my-2">
              <h3 className="font-bold text-sm">
                You received {revealedCount}{" "}
                {plural(revealedCount, "Moment", "Moments")}:
              </h3>
              {revealedCount > 1 && (
                <button
                  onClick={revealAll}
                  className="
                    bg-brand-secondary text-brand-text text-xs px-3 py-1 rounded
                    hover:opacity-80 select-none
                  "
                >
                  Reveal All
                </button>
              )}
            </div>
            <div
              className="
                grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6
                gap-2 justify-items-center
                sm:flex sm:flex-wrap sm:justify-center
              "
            >
              {revealedNFTDetails.map((n) =>
                hidden[n.id] ? (
                  <MomentCard key={n.id} nft={n} disableHover collectionType={collectionType} />
                ) : (
                  <HiddenCard key={n.id} nftId={n.id} onReveal={revealOne} />
                )
              )}
            </div>
          </div>
        )}

        {/* flowscan link */}
        {txId && (
          <a
            href={`https://flowscan.io/transaction/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 text-center text-flow-light underline hover:opacity-80 select-none"
          >
            View on Flowscan
          </a>
        )}
      </motion.div>
    </div>
  );
};

export default TransactionModal;
