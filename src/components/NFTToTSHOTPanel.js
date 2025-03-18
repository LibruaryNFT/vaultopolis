// src/components/NFTToTSHOTPanel.js
import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";

// Cadence scripts
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import { exchangeNFTForTSHOT_child } from "../flow/exchangeNFTForTSHOT_child";

function NFTToTSHOTPanel(props) {
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
  const cadenceScript = isChildSwap
    ? exchangeNFTForTSHOT_child
    : exchangeNFTForTSHOT;

  // --- Added limit constant ---
  const MAX_NFTS = 200;
  const isOverLimit = nftIds.length > MAX_NFTS;

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

    // -- Add a final check to prevent going beyond 200 --
    if (nftIds.length > MAX_NFTS) {
      alert(`You can only swap up to ${MAX_NFTS} NFTs at a time.`);
      return;
    }

    if (!parentAddr?.startsWith("0x")) {
      console.error("Invalid parent address:", parentAddr);
      return;
    }

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

      dispatch({ type: "RESET_SELECTED_NFTS" });

      onTransactionStart?.({
        status: "Pending",
        txId,
        error: null,
        nftCount: nftIds.length,
        tshotAmount: buyAmount,
        swapType: "NFT_TO_TSHOT",
        nftIds,
      });

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

      await fcl.tx(txId).onceSealed();

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
    <div className="bg-gray-800 rounded-lg p-2">
      <button
        onClick={handleSwap}
        // --- Disable button if 0 or >200 NFTs selected ---
        disabled={nftIds.length === 0 || isOverLimit}
        className={`w-full p-4 text-lg rounded-lg font-bold text-white ${
          nftIds.length === 0 || isOverLimit
            ? "bg-gray-800 cursor-not-allowed"
            : "bg-flow-dark hover:bg-flow-darkest"
        }`}
      >
        Swap
      </button>

      {/* Show a message if user exceeded the limit */}
      {isOverLimit && (
        <div className="mt-2 text-sm text-red-500">
          You can only swap up to {MAX_NFTS} NFTs at a time. Please reduce your
          selection.
        </div>
      )}
    </div>
  );
}

export default NFTToTSHOTPanel;
