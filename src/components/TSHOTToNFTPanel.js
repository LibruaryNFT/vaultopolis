// src/components/TSHOTToNFTPanel.js
import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import * as fcl from "@onflow/fcl";
import useTransaction from "../hooks/useTransaction";

import { revealSwap } from "../flow/revealSwap";
import { commitSwap } from "../flow/commitSwap";

// Our new AccountSelection:
import AccountSelection from "./AccountSelection";

const TSHOTToNFTPanel = ({
  sellAmount,
  depositDisabled,
  onTransactionStart,
}) => {
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

  const parentAddr = accountData?.parentAddress || user?.addr;

  // Parent has a TopShot collection if `accountData.hasCollection` is true
  const parentHasCollection = !!accountData?.hasCollection;

  // Filter children to only those with TopShot
  const childrenWithCollection = (accountData.childrenData || []).filter(
    (child) => child.hasCollection
  );

  // If user not logged in, show Connect button
  if (!isLoggedIn) {
    return (
      <button
        onClick={() => fcl.authenticate()}
        className="w-full text-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest p-2"
      >
        Connect Wallet
      </button>
    );
  }

  const handleDeposit = async () => {
    if (!parentAddr?.startsWith("0x")) {
      console.error("Invalid parent address for deposit");
      return;
    }
    const betAmount = String(sellAmount);

    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      tshotAmount: betAmount,
      transactionAction: "COMMIT_SWAP",
    });

    try {
      await sendTransaction({
        cadence: commitSwap,
        args: (arg, t) => [arg(betAmount, t.UFix64)],
        limit: 9999,
        onUpdate: (txData) => {
          onTransactionStart?.({
            ...txData,
            tshotAmount: betAmount,
            transactionAction: "COMMIT_SWAP",
          });
        },
      });

      // Reload parent data
      await loadParentData(parentAddr);
    } catch (err) {
      console.error("Deposit transaction failed:", err);
    }
  };

  const handleReveal = async () => {
    if (!selectedAccount?.startsWith("0x")) {
      alert("Invalid receiving address for reveal.");
      return;
    }
    const betAmount = accountData?.receiptDetails?.betAmount
      ? String(accountData.receiptDetails.betAmount)
      : String(sellAmount);

    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      tshotAmount: betAmount,
      transactionAction: "REVEAL_SWAP",
    });

    try {
      await sendTransaction({
        cadence: revealSwap,
        args: (arg, t) => [arg(selectedAccount, t.Address)],
        limit: 9999,
        onUpdate: (txData) => {
          onTransactionStart?.({
            ...txData,
            tshotAmount: betAmount,
            transactionAction: "REVEAL_SWAP",
          });
        },
      });

      // Reload data
      await loadParentData(parentAddr);
      if (selectedAccount !== parentAddr) {
        await loadChildData(selectedAccount);
      }
    } catch (err) {
      console.error("Reveal transaction failed:", err);
    }
  };

  // Handler to switch between parent or child in context
  const handleAccountSelect = (address) => {
    if (address === parentAddr) {
      dispatch({
        type: "SET_SELECTED_ACCOUNT",
        payload: { address, type: "parent" },
      });
    } else {
      dispatch({
        type: "SET_SELECTED_ACCOUNT",
        payload: { address, type: "child" },
      });
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {!accountData.hasReceipt ? (
        <button
          onClick={handleDeposit}
          disabled={depositDisabled}
          className={`w-full p-4 text-lg rounded-lg font-bold text-white ${
            depositDisabled
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-flow-dark hover:bg-flow-darkest"
          }`}
        >
          Deposit TSHOT
        </button>
      ) : (
        <>
          <button
            onClick={handleReveal}
            className="w-full p-4 text-lg rounded-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest"
          >
            Receive Random Moments
          </button>

          {/* Show our updated AccountSelection */}
          <div className="mt-4">
            <p className="text-sm text-white mb-2">
              Select which account should receive the Moments:
            </p>
            <AccountSelection
              // Pass parent if it has a collection, otherwise null
              parentAccount={
                parentHasCollection
                  ? { addr: parentAddr, ...accountData }
                  : null
              }
              // Pass only children that have a TS collection
              childrenAddresses={childrenWithCollection.map((c) => c.addr)}
              childrenAccounts={childrenWithCollection}
              selectedAccount={selectedAccount}
              onSelectAccount={handleAccountSelect}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TSHOTToNFTPanel;
