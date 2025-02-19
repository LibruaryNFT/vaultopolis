import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import * as fcl from "@onflow/fcl";
import useTransaction from "../hooks/useTransaction";
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import { exchangeNFTForTSHOT_child } from "../flow/exchangeNFTForTSHOT_child";

const NFTToTSHOTPanel = ({ nftIds, buyAmount, onTransactionStart }) => {
  const {
    user,
    selectedAccount,
    selectedAccountType,
    accountData,
    refreshBalances,
    dispatch,
  } = useContext(UserContext);
  const isLoggedIn = Boolean(user?.loggedIn);
  const momentCount = nftIds.length;

  // Use parent's address for signing if a child account is selected
  const activeAccountAddr =
    selectedAccountType === "child"
      ? accountData.parentAddress
      : selectedAccount || user?.addr;

  const isParentAccount = selectedAccountType === "parent";
  const { sendTransaction } = useTransaction();

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => fcl.authenticate()}
        className="w-full text-lg rounded-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest p-0"
      >
        Connect Wallet
      </button>
    );
  }

  const handleSwap = async () => {
    console.log("Attempting swap. Signing with account:", activeAccountAddr);
    if (momentCount <= 0) {
      alert("Select at least one moment to exchange.");
      return;
    }
    if (!activeAccountAddr || !activeAccountAddr.startsWith("0x")) {
      console.error("Invalid active account address:", activeAccountAddr);
      alert("Error: Invalid account address.");
      return;
    }
    const cadenceScript = isParentAccount
      ? exchangeNFTForTSHOT
      : exchangeNFTForTSHOT_child;
    try {
      onTransactionStart({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount: momentCount,
        tshotAmount: momentCount,
        swapType: "MOMENTS_TO_TSHOT",
      });
      await sendTransaction({
        cadence: cadenceScript,
        args: (arg, t) =>
          isParentAccount
            ? [arg(nftIds, t.Array(t.UInt64))]
            : [arg(selectedAccount, t.Address), arg(nftIds, t.Array(t.UInt64))],
        limit: 9999,
        onUpdate: (transactionData) => {
          console.log("Transaction update:", transactionData);
          onTransactionStart({
            ...transactionData,
            nftCount: momentCount,
            tshotAmount: momentCount,
            swapType: "MOMENTS_TO_TSHOT",
          });
        },
      });
      await refreshBalances(activeAccountAddr);
      dispatch({ type: "RESET_SELECTED_NFTS" });
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <button
        onClick={handleSwap}
        className={`w-full p-4 text-lg rounded-lg font-bold text-white ${
          momentCount <= 0
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-flow-dark hover:bg-flow-darkest"
        }`}
        disabled={momentCount <= 0}
      >
        Swap
      </button>
    </div>
  );
};

export default NFTToTSHOTPanel;
