// src/components/NFTToTSHOTPanel.js
import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import * as fcl from "@onflow/fcl";

import useTransaction from "../hooks/useTransaction";

// Cadence scripts for hybrid custody vs. normal parent
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import { exchangeNFTForTSHOT_child } from "../flow/exchangeNFTForTSHOT_child";

const NFTToTSHOTPanel = ({ nftIds, buyAmount, onTransactionStart }) => {
  const {
    user,
    accountData,
    selectedAccount,
    selectedAccountType,
    loadParentData,
    loadChildData,
    dispatch,
  } = useContext(UserContext);

  const { sendTransaction } = useTransaction();
  const isLoggedIn = Boolean(user?.loggedIn);

  // Parent address from context or user session
  const parentAddr = accountData.parentAddress || user?.addr;

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => fcl.authenticate()}
        className="w-full text-lg rounded-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest p-2"
      >
        Connect Wallet
      </button>
    );
  }

  const handleSwap = async () => {
    if (!nftIds || nftIds.length === 0) {
      alert("Select at least one Moment to swap for TSHOT.");
      return;
    }
    if (!parentAddr?.startsWith("0x")) {
      console.error("Invalid parent address:", parentAddr);
      return;
    }

    // Decide which Cadence script to use
    const isChildSwap = selectedAccountType === "child";
    const cadenceScript = isChildSwap
      ? exchangeNFTForTSHOT_child
      : exchangeNFTForTSHOT;

    try {
      // Update parent UI or modal
      onTransactionStart?.({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount: nftIds.length,
        tshotAmount: buyAmount,
        swapType: "NFT_TO_TSHOT",
      });

      // Send transaction to Flow
      // No explicit roles => parent's session is used by default
      await sendTransaction({
        cadence: cadenceScript,
        args: (arg, t) => {
          if (isChildSwap) {
            // exchangeNFTForTSHOT_child(childAddr, nftIDs)
            return [
              arg(selectedAccount, t.Address),
              arg(nftIds.map(String), t.Array(t.UInt64)),
            ];
          } else {
            // exchangeNFTForTSHOT(nftIDs)
            return [arg(nftIds.map(String), t.Array(t.UInt64))];
          }
        },
        limit: 9999,
        onUpdate: (txData) => {
          // Pass along updates to a parent component if needed
          onTransactionStart?.({
            ...txData,
            nftCount: nftIds.length,
            tshotAmount: buyAmount,
            swapType: "NFT_TO_TSHOT",
          });
        },
      });

      // Refresh balances
      await loadParentData(parentAddr);
      if (isChildSwap) {
        await loadChildData(selectedAccount);
      }

      // Clear selected NFTs in context
      dispatch({ type: "RESET_SELECTED_NFTS" });
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <button
        onClick={handleSwap}
        disabled={nftIds.length === 0}
        className={`w-full p-4 text-lg rounded-lg font-bold text-white ${
          nftIds.length === 0
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-flow-dark hover:bg-flow-darkest"
        }`}
      >
        Swap
      </button>
    </div>
  );
};

export default NFTToTSHOTPanel;
