// src/components/TSHOTToNFTPanel.js
import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";

// Import your Cadence code
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";

// A generic account selection component
import AccountSelection from "./AccountSelection";

/**
 * TSHOTToNFTPanel
 *
 * 1) Step 1 (Commit/Deposit) => user hasReceipt = false
 *    - Show parent + children, but only parent can actually deposit TSHOT
 *    - Once sealed, we refresh user data => if a receipt is created, hasReceipt = true => switch to Step 2
 *
 * 2) Step 2 (Reveal) => user hasReceipt = true
 *    - Show only accounts that have a TopShot collection
 *    - On reveal, if your Cadence code removes the receipt, hasReceipt => false => goes back to Step 1
 */
const TSHOTToNFTPanel = ({
  sellAmount,
  depositDisabled,
  onTransactionStart,
}) => {
  const {
    user,
    accountData,
    selectedAccount,
    dispatch,
    loadAllUserData,
    loadChildData,
  } = useContext(UserContext);

  const isLoggedIn = Boolean(user?.loggedIn);

  // Basic data
  const parentAddr = accountData?.parentAddress || user?.addr;
  const parentHasCollection = !!accountData?.hasCollection;
  const allChildren = accountData?.childrenData || [];
  const childrenWithCollection = allChildren.filter((c) => c.hasCollection);

  // Step logic
  const depositStep = !accountData?.hasReceipt; // Step 1
  const revealStep = !!accountData?.hasReceipt; // Step 2

  // Convert user input to number
  const numericSell = Number(sellAmount) || 0;
  const TSHOT_LIMIT = 50;
  const isOverTSHOTLimit = numericSell > TSHOT_LIMIT;

  /*******************************************************
   *  STEP 1: Deposit TSHOT (Manual fcl calls)
   *******************************************************/
  const handleDeposit = async () => {
    // Validate
    if (!parentAddr?.startsWith("0x")) {
      console.error("Invalid parent address for deposit");
      return;
    }
    if (numericSell > TSHOT_LIMIT) {
      alert(`You cannot deposit more than ${TSHOT_LIMIT} TSHOT at once.`);
      return;
    }

    const betAmount = String(sellAmount);

    // 1) Let the modal know: "Awaiting Approval"
    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      tshotAmount: betAmount,
      transactionAction: "COMMIT_SWAP",
    });

    try {
      // 2) Send transaction via fcl.mutate
      const txId = await fcl.mutate({
        cadence: commitSwap,
        args: (arg, t) => [arg(betAmount, t.UFix64)],
        limit: 9999,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
      });

      // 3) Immediately set "Pending" status
      onTransactionStart?.({
        status: "Pending",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "COMMIT_SWAP",
      });

      // 4) Subscribe for more status transitions
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

        const error = txStatus.errorMessage || null;

        onTransactionStart?.({
          status: newStatus,
          txId,
          error,
          tshotAmount: betAmount,
          transactionAction: "COMMIT_SWAP",
        });

        if (txStatus.status === 4) {
          unsub();
        }
      });

      // 5) Wait for sealing
      await fcl.tx(txId).onceSealed();

      // 6) Now refresh user data so we see hasReceipt = true if it was created
      if (parentAddr) {
        await loadAllUserData(parentAddr);
      }
      if (selectedAccount && selectedAccount !== parentAddr) {
        await loadChildData(selectedAccount);
      }

      // If the chain set hasReceipt = true, we now see Step 2
    } catch (err) {
      console.error("Deposit transaction failed:", err);
      onTransactionStart?.({
        status: "Error",
        error: err?.message || String(err),
        txId: null,
        tshotAmount: betAmount,
        transactionAction: "COMMIT_SWAP",
      });
    }
  };

  /*******************************************************
   *  STEP 2: Reveal (Manual fcl calls)
   *******************************************************/
  const handleReveal = async () => {
    // Validate
    if (!selectedAccount?.startsWith("0x")) {
      alert("Invalid receiving address for reveal.");
      return;
    }

    // If the bet is stored, use that amount; else fallback
    const betAmount = accountData?.receiptDetails?.betAmount
      ? String(accountData.receiptDetails.betAmount)
      : String(sellAmount);

    // 1) "Awaiting Approval"
    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      tshotAmount: betAmount,
      transactionAction: "REVEAL_SWAP",
    });

    try {
      // 2) fcl.mutate
      const txId = await fcl.mutate({
        cadence: revealSwap,
        args: (arg, t) => [arg(selectedAccount, t.Address)],
        limit: 9999,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
      });

      // 3) Mark "Pending"
      onTransactionStart?.({
        status: "Pending",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "REVEAL_SWAP",
      });

      // 4) Subscribe for status transitions
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

        const error = txStatus.errorMessage || null;

        onTransactionStart?.({
          status: newStatus,
          txId,
          error,
          tshotAmount: betAmount,
          transactionAction: "REVEAL_SWAP",
        });

        if (txStatus.status === 4) {
          unsub();
        }
      });

      // 5) Wait for sealing
      await fcl.tx(txId).onceSealed();

      // 6) Refresh the user context. If the reveal transaction removed the receipt,
      //    loadAllUserData => hasReceipt = false => back to Step 1
      if (parentAddr) {
        await loadAllUserData(parentAddr);
      }
      if (selectedAccount && selectedAccount !== parentAddr) {
        await loadChildData(selectedAccount);
      }
    } catch (err) {
      console.error("Reveal transaction failed:", err);
      onTransactionStart?.({
        status: "Error",
        error: err?.message || String(err),
        txId: null,
        tshotAmount: betAmount,
        transactionAction: "REVEAL_SWAP",
      });
    }
  };

  /*******************************************************
   *             Render UI
   *******************************************************/
  if (!isLoggedIn) {
    // Not logged in => show Connect
    return (
      <button
        onClick={() => fcl.authenticate()}
        className="w-full text-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest p-2"
      >
        Connect Wallet
      </button>
    );
  }

  // ========== Step 1: depositStep => user hasReceipt = false ==========
  if (depositStep) {
    // Show the parent + children, but only parent can deposit
    const numericSell = Number(sellAmount) || 0;
    const isOverLimit = numericSell > 50;

    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div className="bg-gray-700 p-3 rounded">
          <h4 className="text-white mb-2 font-semibold">Account Balances</h4>
          <AccountSelection
            // show parent + children
            parentAccount={{ addr: parentAddr, ...accountData }}
            childrenAddresses={accountData.childrenAddresses || []}
            childrenAccounts={allChildren}
            // forcibly highlight the parent so it gets the green border
            selectedAccount={parentAddr}
            // if user tries to select child => do nothing
            onSelectAccount={(addr) => {
              if (addr !== parentAddr) {
                alert("Only the parent can deposit TSHOT.");
              }
            }}
          />
          <p className="text-xs text-gray-300 mt-1">
            <em>Note:</em> Only the <strong>parent</strong> can deposit TSHOT.
          </p>
        </div>

        {isOverLimit && (
          <div className="text-red-400 font-semibold">
            You cannot deposit more than 50 TSHOT at once.
          </div>
        )}

        <button
          onClick={handleDeposit}
          disabled={depositDisabled || isOverLimit}
          className={`w-full p-4 text-lg rounded-lg font-bold text-white ${
            depositDisabled || isOverLimit
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-flow-dark hover:bg-flow-darkest"
          }`}
        >
          Deposit TSHOT
        </button>
      </div>
    );
  }

  // ========== Step 2: revealStep => user hasReceipt = true ==========
  // show only accounts that have a TopShot collection
  if (revealStep) {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <button
          onClick={handleReveal}
          className="w-full p-4 text-lg rounded-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest"
        >
          Receive Random Moments
        </button>

        <div className="bg-gray-700 p-3 rounded">
          <h4 className="text-white mb-2 font-semibold">
            Select Receiving Account
          </h4>
          <AccountSelection
            // parent if it has a collection
            parentAccount={
              parentHasCollection ? { addr: parentAddr, ...accountData } : null
            }
            // children that have a collection
            childrenAddresses={childrenWithCollection.map((c) => c.addr)}
            childrenAccounts={childrenWithCollection}
            selectedAccount={selectedAccount}
            onSelectAccount={(addr) => {
              // user can pick any valid account
              dispatch({
                type: "SET_SELECTED_ACCOUNT",
                payload: {
                  address: addr,
                  type: addr === parentAddr ? "parent" : "child",
                },
              });
            }}
          />
          <p className="text-xs text-gray-300 mt-1">
            <em>Note:</em> You can only receive Moments in an account that
            already has a TopShot collection.
          </p>
        </div>
      </div>
    );
  }

  // If for some reason we are neither deposit nor reveal
  // (should not happen logically),
  // just show a fallback
  return <div className="text-gray-400 p-4">Loading...</div>;
};

export default TSHOTToNFTPanel;
