// src/components/TSHOTToNFTPanel.js

import React, { useContext, useRef, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";

// Flow scripts
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import { getTopShotBatched } from "../flow/getTopShotBatched";

import AccountSelection from "./AccountSelection";

const TSHOT_LIMIT = 50;

/**
 * 2-step flow:
 *   Step 1 (deposit TSHOT) => if no receipt
 *   Step 2 (reveal minted NFTs) => if we have a receipt
 */
export default function TSHOTToNFTPanel({
  sellAmount = "0",
  depositDisabled,
  onTransactionStart,
  onRevealComplete, // optional callback
}) {
  // ------------------------
  // 1) All HOOKS declared unconditionally at top
  // ------------------------
  const {
    user,
    accountData,
    selectedAccount,
    dispatch,
    loadAllUserData,
    loadChildData,
    metadataCache,
  } = useContext(UserContext);

  // Convert sellAmount => integer
  let numericValue = parseInt(sellAmount, 10);
  if (Number.isNaN(numericValue) || numericValue < 0) numericValue = 0;

  // TSHOT balance from parent's data
  const userBalance = Math.floor(accountData?.tshotBalance ?? 0);

  // Are we in Step 1 or Step 2?
  const depositStep = !accountData?.hasReceipt; // no receipt => deposit
  const revealStep = !!accountData?.hasReceipt; // have receipt => reveal
  const isLoggedIn = Boolean(user?.loggedIn);

  // Potential errors if depositing
  const errors = [];
  if (numericValue > userBalance) {
    errors.push("Insufficient TSHOT balance.");
  }
  if (numericValue > TSHOT_LIMIT) {
    errors.push(`Cannot deposit more than ${TSHOT_LIMIT} TSHOT at once.`);
  }

  // We'll track auto-select for Step 2
  const didAutoSelectRef = useRef(false);

  // useEffect for auto-select (Step 2)
  useEffect(() => {
    if (!revealStep) return; // only do this for step 2
    if (didAutoSelectRef.current) return; // only once

    const parentAddr = accountData?.parentAddress || user?.addr;
    const parentIsSelected = selectedAccount === parentAddr;
    const parentHasColl = accountData?.hasCollection && parentIsSelected;

    let childSelectedHasColl = false;
    if (!parentIsSelected && selectedAccount) {
      const childData = (accountData.childrenData || []).find(
        (c) => c.addr === selectedAccount
      );
      if (childData?.hasCollection) childSelectedHasColl = true;
    }

    if (parentHasColl || childSelectedHasColl) {
      return; // already valid
    }

    didAutoSelectRef.current = true;

    if (accountData.hasCollection && parentAddr?.startsWith("0x")) {
      // pick parent
      dispatch({
        type: "SET_SELECTED_ACCOUNT",
        payload: { address: parentAddr, type: "parent" },
      });
    } else {
      // pick first child w/ collection
      const childWithColl = (accountData.childrenData || []).find(
        (c) => c.hasCollection
      );
      if (childWithColl) {
        dispatch({
          type: "SET_SELECTED_ACCOUNT",
          payload: { address: childWithColl.addr, type: "child" },
        });
      }
    }
  }, [revealStep, accountData, selectedAccount, user, dispatch]);

  // Helper: enrich minted NFTs w/ local metadata
  function enrichLocalMetadata(rawNFTs) {
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
  }

  // ------------------------
  // 2) Conditionals after hooks: if not logged in => early return
  // ------------------------
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

  // ------------------------
  // 3) Step 1 => deposit TSHOT
  // ------------------------
  async function handleDeposit() {
    if (errors.length > 0 || numericValue === 0) return;

    const parentAddr = accountData?.parentAddress || user?.addr;
    if (!parentAddr?.startsWith("0x")) {
      alert("No valid parent address for deposit!");
      return;
    }
    const betAmount = `${numericValue}.0`;

    // callback => "Awaiting Approval"
    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      tshotAmount: betAmount,
      transactionAction: "COMMIT_SWAP",
      swapType: "TSHOT_TO_NFT",
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
        swapType: "TSHOT_TO_NFT",
      });

      // Subscribe to TX
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
            break;
        }
        const errMsg = txStatus.errorMessage || null;
        onTransactionStart?.({
          status: newStatus,
          txId,
          error: errMsg,
          tshotAmount: betAmount,
          transactionAction: "COMMIT_SWAP",
          swapType: "TSHOT_TO_NFT",
        });
      });

      // Wait for seal
      await fcl.tx(txId).onceSealed();

      onTransactionStart?.({
        status: "Sealed",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "COMMIT_SWAP",
        swapType: "TSHOT_TO_NFT",
      });

      // Refresh
      await loadAllUserData(parentAddr);
      if (selectedAccount && selectedAccount !== parentAddr) {
        await loadChildData(selectedAccount);
      }
    } catch (err) {
      console.error("Deposit TX failed:", err);
      onTransactionStart?.({
        status: "Error",
        error: err?.message || String(err),
        txId: null,
        tshotAmount: betAmount,
        transactionAction: "COMMIT_SWAP",
        swapType: "TSHOT_TO_NFT",
      });
    }
  }

  // ------------------------
  // 4) Step 2 => reveal minted NFTs
  // ------------------------
  async function handleReveal() {
    if (!selectedAccount?.startsWith("0x")) {
      alert("Invalid receiving address for reveal.");
      return;
    }

    const betFromReceipt = accountData?.receiptDetails?.betAmount;
    const fallback = numericValue.toString();
    const betInteger = betFromReceipt || fallback;
    const betAmount = betInteger.includes(".") ? betInteger : `${betInteger}.0`;

    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      tshotAmount: betAmount,
      transactionAction: "REVEAL_SWAP",
      swapType: "TSHOT_TO_NFT",
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
        swapType: "TSHOT_TO_NFT",
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
            break;
        }
        const errMsg = txStatus.errorMessage || null;
        onTransactionStart?.({
          status: newStatus,
          txId,
          error: errMsg,
          tshotAmount: betAmount,
          transactionAction: "REVEAL_SWAP",
          swapType: "TSHOT_TO_NFT",
        });
      });

      // Wait for seal
      const sealedResult = await fcl.tx(txId).onceSealed();

      // Gather minted NFT IDs
      const depositEvents = sealedResult.events.filter(
        (evt) =>
          evt.type === "A.0b2a3299cc857e29.TopShot.Deposit" &&
          evt.data.to === selectedAccount
      );
      const receivedNFTIDs = depositEvents.map((evt) => evt.data.id);

      // Enrich
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
        swapType: "TSHOT_TO_NFT",
        revealedNFTs: receivedNFTIDs,
        revealedNFTDetails,
      });

      // Refresh
      const parentAddr = accountData?.parentAddress || user?.addr;
      await loadAllUserData(parentAddr);

      if (selectedAccount && selectedAccount !== parentAddr) {
        await loadChildData(selectedAccount);
      }

      // optional callback
      onRevealComplete?.();
    } catch (err) {
      console.error("Reveal TX failed:", err);
      onTransactionStart?.({
        status: "Error",
        error: err?.message || String(err),
        txId: null,
        tshotAmount: betAmount,
        transactionAction: "REVEAL_SWAP",
        swapType: "TSHOT_TO_NFT",
      });
    }
  }

  // ------------------------
  // 5) Render Step 1 or Step 2 or fallback
  // ------------------------
  if (depositStep) {
    // Step 1 => deposit
    const hasErrors = errors.length > 0;
    const disableDeposit = depositDisabled || hasErrors || numericValue === 0;

    return (
      <div className="max-w-md mx-auto space-y-3">
        {hasErrors && (
          <div className="text-red-400 font-semibold">{errors.join(" ")}</div>
        )}

        {/* 
          This matches NFTToTSHOTPanel style => 
          a single bg-gray-700 container for the button 
        */}
        <div className="bg-gray-700 rounded-lg">
          <button
            onClick={handleDeposit}
            disabled={disableDeposit}
            className={`w-full p-4 text-lg rounded-lg font-bold text-white ${
              disableDeposit
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-flow-dark hover:bg-flow-darkest"
            }`}
          >
            (Step 1 of 2) Swap TSHOT for Moments
          </button>
        </div>
      </div>
    );
  }

  if (revealStep) {
    // Step 2 => reveal
    return (
      <div className="max-w-md mx-auto space-y-3">
        {/* 
          1) A container with a 
          "bg-gray-700" for the reveal button 
        */}
        <div className="bg-gray-700 rounded-lg">
          <button
            onClick={handleReveal}
            className="w-full p-4 text-lg rounded-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest"
          >
            (Step 2 of 2) Swap TSHOT for Moments
          </button>
        </div>

        {/* 
          2) Another container for AccountSelection 
          with a different background 
        */}
        <div className="bg-gray-600 rounded-lg p-2">
          <AccountSelection
            parentAccount={
              accountData?.hasCollection
                ? {
                    addr: accountData.parentAddress || user?.addr,
                    ...accountData,
                  }
                : null
            }
            childrenAddresses={(accountData.childrenData || [])
              .filter((c) => c.hasCollection)
              .map((child) => child.addr)}
            childrenAccounts={(accountData.childrenData || []).filter(
              (c) => c.hasCollection
            )}
            selectedAccount={selectedAccount}
            onSelectAccount={(addr) =>
              dispatch({
                type: "SET_SELECTED_ACCOUNT",
                payload: {
                  address: addr,
                  type:
                    addr === (accountData.parentAddress || user?.addr)
                      ? "parent"
                      : "child",
                },
              })
            }
          />
          <p className="text-xs text-gray-300 mt-1">
            <em>Note:</em> You can only receive Moments in an account that has a
            TopShot collection.
          </p>
        </div>
      </div>
    );
  }

  // fallback
  return <div className="text-gray-400 p-4">Loading...</div>;
}
