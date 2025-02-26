// src/components/NFTToFLOWPanel.js
import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";

import { UserContext } from "../context/UserContext";
import useTransaction from "../hooks/useTransaction";

// Suppose you have two transaction scripts:
import { exchangeNFTForFLOW } from "../flow/exchangeNFTForFLOW";
import { exchangeNFTForFLOW_child } from "../flow/exchangeNFTForFLOW_child";

const NFTToFLOWPanel = ({ nftIds, buyAmount, onTransactionStart }) => {
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

  // The parent's address from context or fallback to user address
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
      alert("No NFTs selected for exchange.");
      return;
    }
    if (!parentAddr?.startsWith("0x")) {
      console.error("Invalid parent address:", parentAddr);
      return;
    }

    // Decide which Cadence script to call
    const isChildSwap = selectedAccountType === "child";
    const cadenceScript = isChildSwap
      ? exchangeNFTForFLOW_child
      : exchangeNFTForFLOW;

    try {
      // Notify parent UI that the transaction is starting
      onTransactionStart?.({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount: nftIds.length,
        flowAmount: buyAmount,
        swapType: "NFT_TO_FLOW",
      });

      // FCL automatically uses the parent's session to sign
      await sendTransaction({
        cadence: cadenceScript,
        args: (arg, t) =>
          isChildSwap
            ? [
                arg(selectedAccount, t.Address),
                arg(nftIds.map(String), t.Array(t.UInt64)),
              ]
            : [arg(nftIds.map(String), t.Array(t.UInt64))],
        limit: 9999,
        onUpdate: (txData) => {
          onTransactionStart?.({
            ...txData,
            nftCount: nftIds.length,
            flowAmount: buyAmount,
            swapType: "NFT_TO_FLOW",
          });
        },
      });

      // Refresh data
      await loadParentData(parentAddr);
      if (isChildSwap) {
        await loadChildData(selectedAccount);
      }

      // Clear selected NFTs
      dispatch({ type: "RESET_SELECTED_NFTS" });
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <button
        onClick={handleSwap}
        className={`w-full p-4 text-lg rounded-lg font-bold text-white ${
          nftIds.length === 0
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-flow-dark hover:bg-flow-darkest"
        }`}
        disabled={nftIds.length === 0}
      >
        Swap for FLOW
      </button>
    </div>
  );
};

export default NFTToFLOWPanel;
