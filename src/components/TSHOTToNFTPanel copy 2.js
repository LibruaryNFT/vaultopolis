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
 *    - Show parent + children, but only parent can deposit TSHOT
 *    - Once sealed, we refresh user data => if a receipt is created, hasReceipt = true => switch to Step 2
 *
 * 2) Step 2 (Reveal) => user hasReceipt = true
 *    - Show only accounts that have a TopShot collection
 *    - On reveal, if your Cadence code removes the receipt, hasReceipt => false => back to Step 1
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
   *  STEP 1: Deposit TSHOT
   *******************************************************/
  const handleDeposit = async () => {
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

      // 3) Immediately set "Pending"
      onTransactionStart?.({
        status: "Pending",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "COMMIT_SWAP",
      });

      // 4) Subscribe, but do NOT call "Sealed" here
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
            // Once executed, we can unsubscribe to prevent extra "Sealed" calls
            unsub();
            break;
          default:
            // Skip "SEALED" or anything else
            return;
        }

        const error = txStatus.errorMessage || null;
        onTransactionStart?.({
          status: newStatus,
          txId,
          error,
          tshotAmount: betAmount,
          transactionAction: "COMMIT_SWAP",
        });
      });

      // 5) Wait for sealing
      await fcl.tx(txId).onceSealed();

      // 6) Now do the final "Sealed" state *once*
      onTransactionStart?.({
        status: "Sealed",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "COMMIT_SWAP",
      });

      // 7) Refresh user data so we see hasReceipt = true if created
      if (parentAddr) {
        await loadAllUserData(parentAddr);
      }
      if (selectedAccount && selectedAccount !== parentAddr) {
        await loadChildData(selectedAccount);
      }
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
   *  STEP 2: Reveal
   *******************************************************/
  const handleReveal = async () => {
    if (!selectedAccount?.startsWith("0x")) {
      alert("Invalid receiving address for reveal.");
      return;
    }

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

      // 4) Subscribe without "SEALED"
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
            unsub();
            break;
          default:
            return;
        }

        const error = txStatus.errorMessage || null;
        onTransactionStart?.({
          status: newStatus,
          txId,
          error,
          tshotAmount: betAmount,
          transactionAction: "REVEAL_SWAP",
        });
      });

      // 5) Wait for sealing
      const sealedResult = await fcl.tx(txId).onceSealed();

      // 6) Parse events for TopShot.Deposit
      //    (Adjust address if your actual contract is different)
      const topShotDepositEvents = sealedResult.events.filter(
        (evt) =>
          evt.type === "A.0b2a3299cc857e29.TopShot.Deposit" &&
          evt.data.to === selectedAccount
      );
      const receivedNFTIDs = topShotDepositEvents.map((evt) => evt.data.id);

      // 7) Final "Sealed" + reveal result
      onTransactionStart?.({
        status: "Sealed",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "REVEAL_SWAP",
        revealedNFTs: receivedNFTIDs, // pass to modal
      });

      // 8) Refresh data => if receipt was removed, goes back to Step 1
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
    return (
      <button
        onClick={() => fcl.authenticate()}
        className="w-full text-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest p-2"
      >
        Connect Wallet
      </button>
    );
  }

  // Step 1: depositStep => user hasReceipt = false
  if (depositStep) {
    const isOverLimit = numericSell > 50;
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div className="bg-gray-700 p-3 rounded">
          <h4 className="text-white mb-2 font-semibold">Account Balances</h4>
          <AccountSelection
            parentAccount={{ addr: parentAddr, ...accountData }}
            childrenAddresses={accountData.childrenAddresses || []}
            childrenAccounts={allChildren}
            selectedAccount={parentAddr}
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

  // Step 2: revealStep => user hasReceipt = true
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
            parentAccount={
              parentHasCollection ? { addr: parentAddr, ...accountData } : null
            }
            childrenAddresses={childrenWithCollection.map((c) => c.addr)}
            childrenAccounts={childrenWithCollection}
            selectedAccount={selectedAccount}
            onSelectAccount={(addr) => {
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

  return <div className="text-gray-400 p-4">Loading...</div>;
};

export default TSHOTToNFTPanel;
