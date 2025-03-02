// src/components/TSHOTToNFTPanel.js

import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";

import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import { getTopShotBatched } from "../flow/getTopShotBatched";

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
    dispatch,
    loadAllUserData,
    loadChildData,
    metadataCache,
  } = useContext(UserContext);

  const isLoggedIn = Boolean(user?.loggedIn);

  // Parent info
  const parentAddr = accountData?.parentAddress || user?.addr;
  const parentHasCollection = !!accountData?.hasCollection;

  // Children info
  const allChildren = accountData?.childrenData || [];
  const childrenWithCollection = allChildren.filter((c) => c.hasCollection);

  // Step logic
  const depositStep = !accountData?.hasReceipt;
  const revealStep = !!accountData?.hasReceipt;

  // Convert user input to number
  const numericSell = Number(sellAmount) || 0;
  const TSHOT_LIMIT = 50;
  const isOverTSHOTLimit = numericSell > TSHOT_LIMIT;

  // A local enrichment function if you want to apply metadata
  const enrichLocalMetadata = (rawNFTs) => {
    if (!metadataCache) return rawNFTs;
    return rawNFTs.map((nft) => {
      const key = `${nft.setID}-${nft.playID}`;
      const meta = metadataCache[key] || {};
      return {
        ...nft,
        fullName:
          meta.FullName ||
          meta.fullName ||
          nft.fullName ||
          nft.playerName ||
          "Unknown Player",
        momentCount: meta.momentCount
          ? Number(meta.momentCount)
          : nft.momentCount || 0,
        name: meta.name || nft.name,
      };
    });
  };

  /*******************************************************
   * STEP 1: Deposit TSHOT (Parent only)
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

      await fcl.tx(txId).onceSealed();

      onTransactionStart?.({
        status: "Sealed",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "COMMIT_SWAP",
      });

      // Refresh
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
   * STEP 2: Reveal => random NFTs minted
   *******************************************************/
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

      const sealedResult = await fcl.tx(txId).onceSealed();

      // Grab deposit events => new IDs
      const depositEvents = sealedResult.events.filter(
        (evt) =>
          evt.type === "A.0b2a3299cc857e29.TopShot.Deposit" &&
          evt.data.to === selectedAccount
      );
      const receivedNFTIDs = depositEvents.map((evt) => evt.data.id);

      // Partial fetch if we have new IDs
      let revealedNFTDetails = [];
      if (receivedNFTIDs.length > 0) {
        revealedNFTDetails = await fcl.query({
          cadence: getTopShotBatched,
          args: (arg, t) => [
            arg(selectedAccount, t.Address),
            arg(receivedNFTIDs, t.Array(t.UInt64)),
          ],
        });
        revealedNFTDetails = enrichLocalMetadata(revealedNFTDetails);
      }

      onTransactionStart?.({
        status: "Sealed",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "REVEAL_SWAP",
        revealedNFTs: receivedNFTIDs,
        revealedNFTDetails,
      });

      // Full refresh
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

  // STEP 1: Deposit => Only a single button
  if (depositStep) {
    const isOverLimit = numericSell > TSHOT_LIMIT;
    return (
      <div className="space-y-6 max-w-md mx-auto">
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
          (Step 1 of 2) Deposit TSHOT
        </button>
      </div>
    );
  }

  // STEP 2: Reveal => user hasReceipt = true
  if (revealStep) {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <button
          onClick={handleReveal}
          className="w-full p-4 text-lg rounded-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest"
        >
          (Step 2 of 2) Receive Random Moments
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
