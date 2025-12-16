// src/components/TransactionModal.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Wallet, X } from "lucide-react";
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
  error,
  collectionType = 'topshot',
}) => {
  /* detect user rejection vs actual error */
  const isUserRejection = (status, error) => {
    if (status === "Declined") return true;
    if (error && typeof error === "string") {
      const errorLower = error.toLowerCase();
      return errorLower.includes("user rejected") || 
             errorLower.includes("declined") ||
             errorLower.includes("user cancelled");
    }
    return false;
  };

  const userRejected = isUserRejection(status, error);

  /* collapse noisy statuses and normalize user rejections */
  let effectiveStatus = status === "Finalized" || status === "Executed" ? "Pending" : status;
  if (userRejected && effectiveStatus === "Error") {
    effectiveStatus = "Declined";
  }

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
    effectiveStatus === "Error" ||
    effectiveStatus === "Declined" ||
    userRejected;

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
        `Committing ${parseInt(tshotAmount || 0, 10)} TSHOT`,
        `Committed ${parseInt(tshotAmount || 0, 10)} TSHOT`
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
      Declined: "Declined",
      Error: userRejected ? "Declined" : "Error",
    }[effectiveStatus] || (userRejected ? "Declined" : "Processing");

  const Icon = (() => {
    switch (effectiveStatus) {
      case "Awaiting Approval":
        return (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Wallet className="text-2xl sm:text-3xl text-yellow-400" />
          </motion.div>
        );
      case "Pending":
        return <Loader2 className="text-2xl sm:text-3xl animate-spin text-blue-500" />;
      case "Sealed":
        return <CheckCircle2 className="text-2xl sm:text-3xl text-green-500" />;
      case "Expired":
      case "Error":
        return <XCircle className="text-2xl sm:text-3xl text-red-500" />;
      case "Declined":
        return <XCircle className="text-2xl sm:text-3xl text-orange-400" />;
      default:
        return <Loader2 className="text-2xl sm:text-3xl animate-spin text-blue-500" />;
    }
  })();

  const revealedCount = revealedNFTDetails?.length ?? 0;

  /* ---------- Shared content render function ---------- */
  const renderContent = () => (
    <>
      {/* Scrollable content container - smooth scrolling on mobile */}
      <div className="overflow-y-auto h-full max-h-[75vh] sm:max-h-[80vh] overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* sticky compact header */}
        <div className="flex items-center justify-between sticky top-0 bg-black/30 backdrop-blur-md border-b border-white/10 z-10 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
            <div className="flex-shrink-0">
              {Icon}
            </div>
            <div className="flex-1 min-w-0">
              {/* Status text as 2-line block */}
              <div className="flex flex-col leading-tight">
                <div className="text-xs sm:text-sm font-semibold text-brand-text">
                  {flowStatus}
                </div>
                {txMsg && (
                  <div className="text-[10px] sm:text-xs font-medium text-brand-text/70 mt-0.5 truncate" title={txMsg}>
                    {txMsg}
                  </div>
                )}
                {userRejected && !txMsg && (
                  <div className="text-[10px] sm:text-xs font-medium text-orange-400/80 mt-0.5">
                    Cancelled by user
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="
              flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center
              bg-brand-secondary hover:bg-brand-blue
              text-brand-text rounded-full transition-colors select-none
              ml-2
            "
            aria-label="Close"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content padding */}
        <div className="p-4 md:p-5">
          {/* Transaction Details - only show additional context not in header (e.g., recipient address) */}
          {transactionAction !== "REVEAL_SWAP" && transactionAction !== "OFFERS_ACCEPT" && swapType === "BATCH_TRANSFER" && recipient && recipient !== "0x" && (
            <div className="mb-4 p-3 bg-brand-secondary/30 rounded-lg border border-brand-border/30">
              <div className="text-xs text-brand-text/70">
                <p>Recipient: {recipient.slice(0, 6)}...{recipient.slice(-4)}</p>
              </div>
            </div>
          )}

          {/* Moment being sold for OFFERS_ACCEPT */}
          {transactionAction === "OFFERS_ACCEPT" && momentDetails && (
            <div className="mt-4 pb-2 border-t border-brand-border pt-4">
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
            <div className="mt-4 pb-2 border-t border-brand-border pt-4">
              <div className="flex items-center justify-between my-2 flex-wrap gap-2">
                <h3 className="font-bold text-sm">
                  You received {revealedCount}{" "}
                  {plural(revealedCount, "Moment", "Moments")}:
                </h3>
                {revealedCount > 1 && (
                  <button
                    onClick={revealAll}
                    className="
                      bg-opolis/20 border-2 border-opolis/40 hover:bg-opolis/30 hover:border-opolis text-white text-xs px-3 py-1.5 rounded-lg font-bold
                      shadow-md hover:shadow-lg select-none
                      transition-all duration-200
                    "
                  >
                    Reveal All
                  </button>
                )}
              </div>
              <div
                className="
                  grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6
                  gap-2 sm:gap-3 justify-items-center
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
              className="block mt-4 text-center text-flow-light underline hover:opacity-80 select-none text-xs sm:text-sm"
            >
              View on Flowscan
            </a>
          )}
        </div>
      </div>
    </>
  );

  /* ---------- render ---------- */
  return (
    <>
      {/* Mobile backdrop - only on mobile, click-through disabled */}
      <div
        className="fixed inset-0 bg-black/20 z-40 sm:hidden pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          // Don't close on backdrop click - user must use close button
        }}
      />

      {/* Mobile wrapper - provides side margins for breathing room */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 sm:hidden pointer-events-none">
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 400, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 400, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="
            w-full max-h-[75vh]
            rounded-t-2xl
            bg-brand-secondary/95 backdrop-blur-md
            border border-white/10
            shadow-2xl shadow-black/40
            overflow-hidden pointer-events-auto
            text-brand-text
          "
        >
          {renderContent()}
        </motion.div>
      </div>

      {/* Desktop: bottom-right drawer with enhanced spacing and visibility */}
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 400, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 400, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="
          hidden sm:block
          fixed z-50
          bottom-6 right-6
          w-[360px] sm:w-[400px] md:w-[440px] lg:w-[480px]
          max-w-[90vw]
          max-h-[80vh]
          rounded-lg
          bg-brand-secondary/95 backdrop-blur-md
          border border-white/10
          shadow-2xl shadow-black/40
          overflow-hidden
          text-brand-text
        "
      >
        {renderContent()}
      </motion.div>
    </>
  );
};

export default TransactionModal;
