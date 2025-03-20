// src/components/NFTToTSHOTPanel.js
import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";

// Cadence scripts
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import { exchangeNFTForTSHOT_child } from "../flow/exchangeNFTForTSHOT_child";

function NFTToTSHOTPanel({ nftIds, buyAmount, onTransactionStart }) {
  if (!Array.isArray(nftIds)) nftIds = [];
  if (!buyAmount) buyAmount = "0";

  const {
    user,
    accountData,
    selectedAccount,
    selectedAccountType,
    loadAllUserData,
    loadChildData,
    dispatch,
  } = useContext(UserContext);

  const isLoggedIn = Boolean(user?.loggedIn);
  const parentAddr = accountData?.parentAddress || user?.addr;
  const isChildSwap = selectedAccountType === "child";

  // Determine which transaction script to use
  const cadenceScript = isChildSwap
    ? exchangeNFTForTSHOT_child
    : exchangeNFTForTSHOT;

  // Limit constants
  const MAX_NFTS = 200;
  const isOverLimit = nftIds.length > MAX_NFTS;

  // If user not logged in => "Connect Wallet"
  if (!isLoggedIn) {
    return (
      <button
        onClick={() => fcl.authenticate()}
        className="
          w-full
          text-lg
          rounded-lg
          font-bold
          text-white
          bg-flow-light
          hover:bg-flow-dark
          p-2
        "
      >
        Connect Wallet
      </button>
    );
  }

  // Dynamically label the button
  const buttonLabel = nftIds.length === 0 ? "Select Moments" : "Swap";

  const handleSwap = async () => {
    if (nftIds.length === 0) {
      alert("Please select at least one Moment to swap for TSHOT.");
      return;
    }
    if (nftIds.length > MAX_NFTS) {
      alert(`You can only swap up to ${MAX_NFTS} NFTs at a time.`);
      return;
    }
    if (!parentAddr?.startsWith("0x")) {
      console.error("Invalid parent address:", parentAddr);
      return;
    }

    // Fire the initial "Awaiting Approval" event
    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      nftCount: nftIds.length,
      tshotAmount: buyAmount,
      swapType: "NFT_TO_TSHOT",
      nftIds,
    });

    try {
      const txId = await fcl.mutate({
        cadence: cadenceScript,
        args: (arg, t) => {
          if (isChildSwap) {
            return [
              arg(selectedAccount, t.Address),
              arg(nftIds.map(String), t.Array(t.UInt64)),
            ];
          } else {
            return [arg(nftIds.map(String), t.Array(t.UInt64))];
          }
        },
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });

      // Clear selected NFTs
      dispatch({ type: "RESET_SELECTED_NFTS" });

      // Fire "Pending" event
      onTransactionStart?.({
        status: "Pending",
        txId,
        error: null,
        nftCount: nftIds.length,
        tshotAmount: buyAmount,
        swapType: "NFT_TO_TSHOT",
        nftIds,
      });

      // Subscribe for status changes
      const unsub = fcl.tx(txId).subscribe((txStatus) => {
        let newStatus = "Processing...";
        switch (txStatus.statusString) {
          case "PENDING":
            newStatus = "Pending";
            break;
          case "FINALIZED":
            newStatus = "Finalized";
            break;
          case "EXECUTED":
            newStatus = "Executed";
            break;
          case "SEALED":
            newStatus = "Sealed";
            break;
          default:
            break;
        }
        const errorMsg = txStatus.errorMessage?.length
          ? txStatus.errorMessage
          : null;

        onTransactionStart?.({
          status: newStatus,
          error: errorMsg,
          txId,
          nftCount: nftIds.length,
          tshotAmount: buyAmount,
          swapType: "NFT_TO_TSHOT",
          nftIds,
        });

        if (txStatus.status === 4) {
          unsub();
        }
      });

      // Wait for seal
      await fcl.tx(txId).onceSealed();

      // Reload parent's data (and child if necessary)
      if (parentAddr) {
        await loadAllUserData(parentAddr);
      }
      if (isChildSwap) {
        await loadChildData(selectedAccount);
      }
    } catch (err) {
      console.error("Transaction failed:", err);
      onTransactionStart?.({
        status: "Error",
        error: err?.message ?? String(err),
        txId: null,
        nftCount: nftIds.length,
        tshotAmount: buyAmount,
        swapType: "NFT_TO_TSHOT",
        nftIds,
      });
    }
  };

  return (
    <>
      {/* 
        Swap button spanning full width; we add a box-shadow for a “raised” effect. 
        Adjust shadow classes as you like: 
          "shadow-md shadow-black/40" or "shadow-lg shadow-black/50" etc.
      */}
      <button
        onClick={handleSwap}
        disabled={nftIds.length === 0 || isOverLimit}
        className={`
          w-full
          p-4
          text-lg
          rounded-lg
          font-bold
          transition-colors
          shadow-md 
          shadow-black/40
          ${
            nftIds.length === 0 || isOverLimit
              ? /* Disabled style */
                "cursor-not-allowed bg-brand-primary text-brand-text/50"
              : /* Normal style */
                "bg-flow-light text-white hover:bg-flow-dark"
          }
        `}
      >
        {buttonLabel}
      </button>

      {/* If user selected more than the limit, show small warning. */}
      {isOverLimit && (
        <div className="mt-2 text-sm text-red-500 px-3 pb-2">
          You can only swap up to {MAX_NFTS} NFTs at a time. Please reduce your
          selection.
        </div>
      )}
    </>
  );
}

export default NFTToTSHOTPanel;
