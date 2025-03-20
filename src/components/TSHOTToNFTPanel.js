// src/components/TSHOTToNFTPanel.js

import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";

// Flow scripts
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import { getTopShotBatched } from "../flow/getTopShotBatched";

/**
 * Updated enrichWithMetadata that also merges set name + momentCount
 */
async function enrichWithMetadata(nftList, metadataCache) {
  if (!metadataCache) return nftList; // if no cache, just return raw

  // Example subedition data, if relevant:
  const SUBEDITIONS = {
    1: { name: "Explosion", minted: 500 },
    2: { name: "Torn", minted: 1000 },
    // ...
  };

  return nftList.map((nft) => {
    const enriched = { ...nft };
    const key = `${nft.setID}-${nft.playID}`;
    const meta = metadataCache[key];

    if (meta) {
      // Player name & tier
      enriched.tier = meta.tier || enriched.tier;
      enriched.fullName =
        meta.FullName ||
        meta.fullName ||
        enriched.fullName ||
        enriched.playerName ||
        "Unknown Player";

      // Series
      if (typeof meta.series !== "undefined") {
        enriched.series = meta.series;
      }

      // Team
      if (meta.TeamAtMoment) {
        enriched.teamAtMoment = meta.TeamAtMoment;
      }

      // Set name & moment count
      enriched.name = meta.setName || meta.name || enriched.name;
      if (typeof meta.momentCount !== "undefined") {
        enriched.momentCount = Number(meta.momentCount);
      }
    } else {
      console.warn(
        `No metadata found for setID=${nft.setID}, playID=${nft.playID}.`
      );
    }

    // Subedition handling
    if (nft.subeditionID && SUBEDITIONS[nft.subeditionID]) {
      const sub = SUBEDITIONS[nft.subeditionID];
      enriched.subeditionName = sub.name;
      enriched.subeditionMaxMint = sub.minted;
    }

    return enriched;
  });
}

export default function TSHOTToNFTPanel({
  sellAmount = "0",
  depositDisabled,
  onTransactionStart,
  onRevealComplete,
}) {
  const {
    user,
    accountData,
    selectedAccount,
    loadAllUserData,
    loadChildData,
    metadataCache,
  } = useContext(UserContext);

  const isLoggedIn = Boolean(user?.loggedIn);
  if (!isLoggedIn) {
    // Same style as NFTToTSHOTPanel for "Connect Wallet"
    return (
      <button
        onClick={() => fcl.authenticate()}
        className="
          w-full
          text-lg
          rounded-lg
          font-bold
          text-white
          bg-flow-light
          hover:bg-flow-dark
          p-2
        "
      >
        Connect Wallet
      </button>
    );
  }

  // Parent address & TSHOT balance
  const parentAddr = accountData?.parentAddress || user?.addr;
  const parentTSHOTBalance = parseFloat(accountData?.tshotBalance || "0");

  // Step logic: deposit => no receipt; reveal => has receipt
  const depositStep = !accountData?.hasReceipt; // Step 1
  const revealStep = !!accountData?.hasReceipt; // Step 2

  // Validate numeric portion of sellAmount
  let numericValue = parseInt(sellAmount, 10);
  if (Number.isNaN(numericValue) || numericValue < 0) numericValue = 0;

  // Additional checks
  const isOverMax = numericValue > 50;

  // Prepare the deposit button label based on numericValue & TSHOT balance
  let depositButtonLabel = "(Step 1 of 2) Swap TSHOT for Moments";
  if (numericValue === 0) {
    depositButtonLabel = "(Step 1 of 2) Enter an amount";
  } else if (numericValue > parentTSHOTBalance) {
    depositButtonLabel = "(Step 1 of 2) Insufficient TSHOT";
  }

  // Combined deposit disabled logic:
  // - If depositDisabled is explicitly true
  // - If numericValue === 0 or greater than parent's TSHOT
  // - If numericValue > 50
  const buttonDisabled =
    depositDisabled ||
    numericValue === 0 ||
    numericValue > parentTSHOTBalance ||
    isOverMax;

  // ---------------------------------------------
  // STEP 1 => deposit TSHOT (commitSwap)
  // ---------------------------------------------
  async function handleDeposit() {
    // If there's some reason it's disabled, or 0, or over balance, or over max
    if (buttonDisabled) {
      if (isOverMax) {
        alert("Max 50 TSHOT allowed. Please lower your amount.");
      }
      return;
    }
    if (!parentAddr?.startsWith("0x")) {
      alert("No valid parent address for deposit!");
      return;
    }

    const betAmount = `${numericValue}.0`; // e.g. "10.0"

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

      await fcl.tx(txId).onceSealed();

      onTransactionStart?.({
        status: "Sealed",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "COMMIT_SWAP",
        swapType: "TSHOT_TO_NFT",
      });

      // Refresh parent + child if needed
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

  // ---------------------------------------------
  // STEP 2 => reveal minted NFTs (revealSwap)
  // ---------------------------------------------
  async function handleReveal() {
    const betFromReceipt = accountData?.receiptDetails?.betAmount;
    const fallback = numericValue.toString();
    const betInteger = betFromReceipt || fallback;
    const betAmount = betInteger.includes(".") ? betInteger : `${betInteger}.0`;

    if (!selectedAccount?.startsWith("0x")) {
      alert("Invalid receiving address for reveal.");
      return;
    }

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

      // wait for seal
      const sealedResult = await fcl.tx(txId).onceSealed();

      // Find any "TopShot.Deposit" events to see which IDs we received
      const depositEvents = sealedResult.events.filter(
        (evt) =>
          evt.type === "A.0b2a3299cc857e29.TopShot.Deposit" &&
          evt.data.to === selectedAccount
      );
      const receivedNFTIDs = depositEvents.map((evt) => evt.data.id);

      let revealedNFTDetails = [];
      if (receivedNFTIDs.length > 0) {
        // 1) Grab raw NFT data on-chain
        revealedNFTDetails = await fcl.query({
          cadence: getTopShotBatched,
          args: (arg, t) => [
            arg(selectedAccount, t.Address),
            arg(receivedNFTIDs, t.Array(t.UInt64)),
          ],
        });

        // 2) Enrich with metadata => includes name, momentCount, etc.
        if (metadataCache) {
          revealedNFTDetails = await enrichWithMetadata(
            revealedNFTDetails,
            metadataCache
          );
        }
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

      // Refresh parent + child
      await loadAllUserData(parentAddr);
      if (selectedAccount && selectedAccount !== parentAddr) {
        await loadChildData(selectedAccount);
      }

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

  // -------------------------------------------------------------
  // RENDER LOGIC
  // -------------------------------------------------------------
  if (depositStep) {
    return (
      <>
        {/* Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={buttonDisabled}
          className={`
            w-full
            p-4
            text-lg
            rounded-lg
            font-bold
            transition-colors
            shadow-md
            shadow-black/40
            ${
              buttonDisabled
                ? "cursor-not-allowed bg-brand-primary text-brand-text/50"
                : "bg-flow-light text-white hover:bg-flow-dark"
            }
          `}
        >
          {depositButtonLabel}
        </button>

        {/* Show "over max" error only */}
        {isOverMax && (
          <div className="mt-2 text-red-400 text-sm">
            You have exceeded the maximum of <strong>50 TSHOT</strong>. Please
            lower your amount.
          </div>
        )}
      </>
    );
  }

  if (revealStep) {
    // Step 2 => reveal minted NFTs
    const parentAddr = accountData?.parentAddress || user?.addr;
    const isParentSelected = selectedAccount === parentAddr;
    let currentAccountHasCollection = false;

    if (isParentSelected) {
      currentAccountHasCollection = !!accountData?.hasCollection;
    } else {
      const childData = accountData?.childrenData?.find(
        (c) => c.addr === selectedAccount
      );
      currentAccountHasCollection = !!childData?.hasCollection;
    }

    const isRevealDisabled = !currentAccountHasCollection;

    return (
      <>
        {/* Reveal Button */}
        <button
          onClick={handleReveal}
          disabled={isRevealDisabled}
          className={`
            w-full
            p-4
            text-lg
            rounded-lg
            font-bold
            transition-colors
            shadow-md
            shadow-black/40
            ${
              isRevealDisabled
                ? "cursor-not-allowed bg-brand-primary text-brand-text/50"
                : "bg-flow-light text-white hover:bg-flow-dark"
            }
          `}
        >
          (Step 2 of 2) Receive Random Moments
        </button>

        {isRevealDisabled && (
          <p className="text-red-400 mt-2 text-sm">
            Please select an account that has a TopShot collection before
            revealing your minted Moments.
          </p>
        )}
      </>
    );
  }

  // Fallback if state is still loading
  return (
    <button
      disabled
      className="
        w-full
        p-4
        text-lg
        rounded-lg
        font-bold
        transition-colors
        shadow-md
        shadow-black/40
        cursor-not-allowed
        bg-brand-primary
        text-brand-text/50
      "
    >
      Loading...
    </button>
  );
}
