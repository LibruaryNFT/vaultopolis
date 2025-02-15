import React, { useContext } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import useTransaction from "../hooks/useTransaction";
import { exchangeNFTForFLOW } from "../flow/exchangeNFTForFLOW";
import { exchangeNFTForFLOW_child } from "../flow/exchangeNFTForFLOW_child";

const NFTToFLOWPanel = ({ sellAmount, buyAmount, onTransactionStart }) => {
  const { user, selectedAccount, selectedAccountType, refreshBalances } =
    useContext(UserContext);
  const isLoggedIn = Boolean(user?.loggedIn);
  const momentCount = sellAmount; // 1:1 conversion
  const activeAccountAddr = selectedAccount || user?.addr;
  const isParentAccount = selectedAccountType === "parent";
  const { sendTransaction } = useTransaction();

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => fcl.authenticate()}
        className="w-full text-lg rounded-lg font-bold text-white bg-opolis hover:bg-opolis-dark p-0"
      >
        Connect Wallet
      </button>
    );
  }

  const handleSwap = async () => {
    if (momentCount <= 0) {
      alert("Enter a valid number of moments to exchange.");
      return;
    }
    if (!activeAccountAddr || !activeAccountAddr.startsWith("0x")) {
      console.error("Invalid active account address:", activeAccountAddr);
      alert(
        "Error: Invalid account address. Please log in again or select a valid account."
      );
      return;
    }
    const cadenceScript = isParentAccount
      ? exchangeNFTForFLOW
      : exchangeNFTForFLOW_child;
    try {
      onTransactionStart({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount: momentCount,
        flowAmount: momentCount,
        swapType: "MOMENTS_TO_FLOW",
      });
      await sendTransaction({
        cadence: cadenceScript,
        args: (arg, t) =>
          isParentAccount
            ? [arg(momentCount, t.UInt64)]
            : [arg(selectedAccount, t.Address), arg(momentCount, t.UInt64)],
        limit: 9999,
        onUpdate: (transactionData) => {
          onTransactionStart({
            ...transactionData,
            nftCount: momentCount,
            flowAmount: momentCount,
            swapType: "MOMENTS_TO_FLOW",
          });
        },
      });
      await refreshBalances(activeAccountAddr);
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
            : "bg-opolis hover:bg-opolis-dark"
        }`}
        disabled={momentCount <= 0}
      >
        Swap
      </button>
    </div>
  );
};

export default NFTToFLOWPanel;
