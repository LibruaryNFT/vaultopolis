// src/components/TSHOTToNFTPanel.js

import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";

// Your existing Cadence transactions
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";

// The partial fetch script for newly minted NFTs
import { getTopShotBatched } from "../flow/getTopShotBatched";

// A generic account selection component
import AccountSelection from "./AccountSelection";

/**
 * TSHOTToNFTPanel
 *
 * Step 1: deposit TSHOT => create a receipt
 * Step 2: reveal => random NFT minted to user
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
    // Access your metadataCache if needed:
    metadataCache,
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

  const numericSell = Number(sellAmount) || 0;
  const TSHOT_LIMIT = 50;
  const isOverTSHOTLimit = numericSell > TSHOT_LIMIT;

  // Example "local" enrichment function, if you want to apply your metadata:
  // (If you already have a big "enrichWithMetadata" from your context, reuse that.)
  const enrichLocalMetadata = (rawNFTs) => {
    if (!metadataCache) return rawNFTs;
    return rawNFTs.map((nft) => {
      const key = `${nft.setID}-${nft.playID}`;
      const meta = metadataCache[key] || {};
      return {
        ...nft,
        // these fields are only if you want them:
        fullName:
          meta.FullName ||
          meta.fullName ||
          nft.fullName ||
          nft.playerName ||
          "Unknown Player",
        momentCount: meta.momentCount
          ? Number(meta.momentCount)
          : nft.momentCount || 0,
        name: meta.name || nft.name, // set name
        // etc. for other fields you store in metadata
      };
    });
  };

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

    // Let the modal know: "Awaiting Approval"
    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      tshotAmount: betAmount,
      transactionAction: "COMMIT_SWAP",
    });

    try {
      const txId = await fcl.mutate({
        cadence: commitSwap,
        args: (arg, t) => [arg(betAmount, t.UFix64)],
        limit: 9999,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
      });

      onTransactionStart?.({
        status: "Pending",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "COMMIT_SWAP",
      });

      // Subscribe for partial statuses
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
          transactionAction: "COMMIT_SWAP",
        });
      });

      // Wait for sealing
      await fcl.tx(txId).onceSealed();

      // Final "Sealed"
      onTransactionStart?.({
        status: "Sealed",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "COMMIT_SWAP",
      });

      // Full refresh to reflect new receipt
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
   *  STEP 2: Reveal => random NFTs minted
   *******************************************************/
  const handleReveal = async () => {
    if (!selectedAccount?.startsWith("0x")) {
      alert("Invalid receiving address for reveal.");
      return;
    }

    const betAmount = accountData?.receiptDetails?.betAmount
      ? String(accountData.receiptDetails.betAmount)
      : String(sellAmount);

    // "Awaiting Approval"
    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      tshotAmount: betAmount,
      transactionAction: "REVEAL_SWAP",
    });

    try {
      const txId = await fcl.mutate({
        cadence: revealSwap,
        args: (arg, t) => [arg(selectedAccount, t.Address)],
        limit: 9999,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
      });

      onTransactionStart?.({
        status: "Pending",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "REVEAL_SWAP",
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

      // Once sealed, parse deposit events
      const sealedResult = await fcl.tx(txId).onceSealed();
      const depositEvents = sealedResult.events.filter(
        (evt) =>
          evt.type === "A.0b2a3299cc857e29.TopShot.Deposit" &&
          evt.data.to === selectedAccount
      );
      const receivedNFTIDs = depositEvents.map((evt) => evt.data.id);

      // Optionally partial fetch for those new IDs
      let revealedNFTDetails = [];
      if (receivedNFTIDs.length > 0) {
        revealedNFTDetails = await fcl.query({
          cadence: getTopShotBatched,
          args: (arg, t) => [
            arg(selectedAccount, t.Address),
            arg(receivedNFTIDs, t.Array(t.UInt64)),
          ],
        });

        // If you want to show player names, set names, etc.:
        revealedNFTDetails = enrichLocalMetadata(revealedNFTDetails);
      }

      // Final "Sealed" => pass everything to the modal
      onTransactionStart?.({
        status: "Sealed",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "REVEAL_SWAP",
        revealedNFTs: receivedNFTIDs, // just IDs if you want them
        revealedNFTDetails, // enriched array for MomentCard
      });

      // FULL refresh => user context has the new NFTs
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
   *               Render the UI
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

  // Step 1: deposit TSHOT
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

  // Step 2: reveal
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

  // Fallback
  return <div className="text-gray-400 p-4">Loading...</div>;
};

export default TSHOTToNFTPanel;
