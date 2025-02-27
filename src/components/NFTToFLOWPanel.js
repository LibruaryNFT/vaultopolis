// src/components/NFTToFLOWPanel.js

import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";
import useTransaction from "../hooks/useTransaction";

import { exchangeNFTForFLOW } from "../flow/exchangeNFTForFLOW";
import { exchangeNFTForFLOW_child } from "../flow/exchangeNFTForFLOW_child";

const NFTToFLOWPanel = ({ nftIds, buyAmount, onTransactionStart }) => {
  const {
    user,
    accountData,
    selectedAccount,
    selectedAccountType,
    loadAllUserData,
    loadChildData,
    dispatch,
  } = useContext(UserContext);

  const { sendTransaction } = useTransaction();
  const isLoggedIn = Boolean(user?.loggedIn);

  // Parent address from context or fallback
  const parentAddr = accountData.parentAddress || user?.addr;
  const isChildSwap = selectedAccountType === "child";

  // Decide script
  const cadenceScript = isChildSwap
    ? exchangeNFTForFLOW_child
    : exchangeNFTForFLOW;

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

    // 1) "Awaiting Approval"
    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      nftCount: nftIds.length,
      flowAmount: buyAmount,
      swapType: "NFT_TO_FLOW",
      nftIds,
    });

    try {
      // 2) Submit transaction
      const txId = await fcl.mutate({
        cadence: cadenceScript,
        args: (arg, t) =>
          isChildSwap
            ? [
                arg(selectedAccount, t.Address),
                arg(nftIds.map(String), t.Array(t.UInt64)),
              ]
            : [arg(nftIds.map(String), t.Array(t.UInt64))],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });

      // 3) Optimistic reset
      dispatch({ type: "RESET_SELECTED_NFTS" });

      // Update UI to "Pending"
      onTransactionStart?.({
        status: "Pending",
        txId,
        error: null,
        nftCount: nftIds.length,
        flowAmount: buyAmount,
        swapType: "NFT_TO_FLOW",
        nftIds,
      });

      // 4) Subscribe to transaction status
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

        const error = txStatus.errorMessage?.length
          ? txStatus.errorMessage
          : null;

        onTransactionStart?.({
          status: newStatus,
          error,
          txId,
          nftCount: nftIds.length,
          flowAmount: buyAmount,
          swapType: "NFT_TO_FLOW",
          nftIds,
        });

        if (txStatus.status === 4) {
          unsub();
        }
      });

      // 5) Wait for sealing
      await fcl.tx(txId).onceSealed();

      // 6) Refresh data exactly like Transfer
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
        error: err?.message || String(err),
        txId: null,
        nftCount: nftIds.length,
        flowAmount: buyAmount,
        swapType: "NFT_TO_FLOW",
        nftIds,
      });
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
