// src/components/NFTToTSHOTPanel.js
import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";

// Cadence scripts
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import { exchangeNFTForTSHOT_child } from "../flow/exchangeNFTForTSHOT_child";

/**
 * We do a safe fallback inside the component to ensure
 * `nftIds` is never undefined, and `buyAmount` is never null.
 */
function NFTToTSHOTPanel(props) {
  // Deconstruct props with some fallback logic
  let { nftIds, buyAmount, onTransactionStart } = props;
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
  const parentAddr = accountData.parentAddress || user?.addr;
  const isChildSwap = selectedAccountType === "child";

  // Which script to run?
  const cadenceScript = isChildSwap
    ? exchangeNFTForTSHOT_child
    : exchangeNFTForTSHOT;

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
      alert("Please select at least one Moment to swap for TSHOT.");
      return;
    }

    if (!parentAddr?.startsWith("0x")) {
      console.error("Invalid parent address:", parentAddr);
      return;
    }

    // 1) Inform parent
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
      // 2) Submit transaction
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

      // 3) Optimistic reset: clear user selection
      dispatch({ type: "RESET_SELECTED_NFTS" });

      // 4) UI => "Pending"
      onTransactionStart?.({
        status: "Pending",
        txId,
        error: null,
        nftCount: nftIds.length,
        tshotAmount: buyAmount,
        swapType: "NFT_TO_TSHOT",
        nftIds,
      });

      // 5) Subscribe to tx status
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

      // 6) Wait for sealing
      await fcl.tx(txId).onceSealed();

      // 7) Refresh parent and/or child
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
    <div className="bg-gray-700 rounded-lg">
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
}

export default NFTToTSHOTPanel;
