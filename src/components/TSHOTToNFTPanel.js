// src/components/TSHOTToNFTPanel.js
import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import * as fcl from "@onflow/fcl";
import useTransaction from "../hooks/useTransaction";

import { revealSwap } from "../flow/revealSwap";
import { commitSwap } from "../flow/commitSwap";

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
    loadParentData,
    loadChildData,
    dispatch,
  } = useContext(UserContext);

  const { sendTransaction } = useTransaction();
  const isLoggedIn = Boolean(user?.loggedIn);

  const parentAddr = accountData?.parentAddress || user?.addr;

  // If user is not logged in, show "Connect Wallet" button
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

  // Convert the incoming sellAmount to a number
  const numericSell = Number(sellAmount) || 0;

  // We only want to limit the deposit to 50 TSHOT max
  const TSHOT_LIMIT = 50;
  const isOverTSHOTLimit = numericSell > TSHOT_LIMIT;

  // Parent has a TopShot collection if `accountData.hasCollection` is true
  const parentHasCollection = !!accountData?.hasCollection;

  // Filter children to only those with TopShot
  const childrenWithCollection = (accountData.childrenData || []).filter(
    (child) => child.hasCollection
  );

  // Switch selected account in context
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

  const handleDeposit = async () => {
    if (!parentAddr?.startsWith("0x")) {
      console.error("Invalid parent address for deposit");
      return;
    }

    // Enforce the 50 TSHOT limit
    if (numericSell > TSHOT_LIMIT) {
      alert(`You cannot deposit more than ${TSHOT_LIMIT} TSHOT at once.`);
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
    // The betAmount for "reveal" typically uses the receiptDetails or fallback to sellAmount
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

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* If user hasn't deposited TSHOT yet => show Deposit button */}
      {!accountData.hasReceipt ? (
        <div>
          {/* Show a warning if over the TSHOT limit */}
          {isOverTSHOTLimit && (
            <div className="text-red-400 font-semibold mb-2">
              You cannot deposit more than {TSHOT_LIMIT} TSHOT at once.
            </div>
          )}

          <button
            onClick={handleDeposit}
            disabled={depositDisabled || isOverTSHOTLimit}
            className={`w-full p-4 text-lg rounded-lg font-bold text-white ${
              depositDisabled || isOverTSHOTLimit
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-flow-dark hover:bg-flow-darkest"
            }`}
          >
            {isOverTSHOTLimit ? "Over TSHOT Limit" : "Deposit TSHOT"}
          </button>
        </div>
      ) : (
        <>
          {/* Once TSHOT is deposited (hasReceipt == true), show "Reveal" */}
          <button
            onClick={handleReveal}
            className="w-full p-4 text-lg rounded-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest"
          >
            Receive Random Moments
          </button>

          {/* AccountSelection to pick where Moments go (parent or child) */}
          <div className="mt-4">
            <p className="text-sm text-white mb-2">
              Select which account should receive the Moments:
            </p>
            <AccountSelection
              // Pass parent if it has a collection, else null
              parentAccount={
                parentHasCollection
                  ? { addr: parentAddr, ...accountData }
                  : null
              }
              // Pass children that have a TopShot collection
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
