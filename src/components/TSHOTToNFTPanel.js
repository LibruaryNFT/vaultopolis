// src/components/TSHOTToNFTPanel.js
import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";

// Flow scripts
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import { getTopShotBatched } from "../flow/getTopShotBatched";

/**
 * If your `enrichWithMetadata` is defined in the UserContext or a separate utility,
 * just import it. For example:
 *
 * import { enrichWithMetadata } from "../flow/enrichWithMetadata";
 *
 * OR if it's in the UserContext file, do something like:
 *
 * const { metadataCache, enrichWithMetadata } = useContext(UserContext);
 *
 * For simplicity, here we define the same function inline, but
 * you should reuse your actual implementation if possible.
 */
async function enrichWithMetadata(nftList, metadataCache) {
  if (!metadataCache) return nftList; // No local metadata? Just return as-is

  // If you have a SUBEDITIONS constant, reference it here as well:
  const SUBEDITIONS = {
    1: { name: "Explosion", minted: 500 },
    2: { name: "Torn", minted: 1000 },
    // ...
  };

  return nftList.map((nft) => {
    const enriched = { ...nft };
    const key = `${nft.setID}-${nft.playID}`;
    const meta = metadataCache[key];

    // Merge standard fields
    if (meta) {
      enriched.tier = meta.tier || enriched.tier;
      enriched.fullName =
        meta.FullName ||
        meta.fullName ||
        enriched.fullName ||
        enriched.playerName ||
        "Unknown Player";
      enriched.momentCount = Number(meta.momentCount) || enriched.momentCount;
      enriched.name = meta.name || enriched.name;
      // If series is in meta, override
      if (typeof meta.series !== "undefined") {
        enriched.series = meta.series;
      }
      // etc. (teamAtMoment, etc.)
      if (meta.TeamAtMoment) {
        enriched.teamAtMoment = meta.TeamAtMoment;
      }
    } else {
      console.warn(
        `No metadata found for setID=${nft.setID}, playID=${nft.playID}.`
      );
    }

    // Handle subedition
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
    return (
      <div className="bg-gray-700 rounded-lg">
        <button
          onClick={() => fcl.authenticate()}
          className="w-full p-4 text-lg rounded-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // Step logic:
  const depositStep = !accountData?.hasReceipt; // Step 1 => deposit TSHOT
  const revealStep = !!accountData?.hasReceipt; // Step 2 => reveal minted NFTs

  // Parse the sellAmount safely (as integer for simplicity)
  let numericValue = parseInt(sellAmount, 10);
  if (Number.isNaN(numericValue) || numericValue < 0) numericValue = 0;

  // We'll define a simple range check: must be between 1 and 50 inclusive
  const isUnderMin = numericValue < 1;
  const isOverMax = numericValue > 50;
  const isValidAmount = !isUnderMin && !isOverMax;

  // -----------------------------------
  // STEP 1 => Deposit TSHOT
  // -----------------------------------
  async function handleDeposit() {
    // If it's disabled or the amount is invalid, we bail
    if (depositDisabled || !isValidAmount) {
      // Optionally, you can show an alert for clarity
      if (isOverMax) {
        alert("Max 50 TSHOT allowed. Please lower your amount.");
      } else if (isUnderMin) {
        alert("Please enter at least 1 TSHOT.");
      }
      return;
    }

    const parentAddr = accountData?.parentAddress || user?.addr;
    if (!parentAddr?.startsWith("0x")) {
      alert("No valid parent address for deposit!");
      return;
    }

    // Convert the integer to a UFix64 string ("10.0", "50.0", etc.)
    const betAmount = `${numericValue}.0`;

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

      // Subscribe to intermediate statuses
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

      // Refresh parent + child
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

  // -----------------------------------
  // STEP 2 => Reveal minted NFTs
  // -----------------------------------
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

      // Wait for seal
      const sealedResult = await fcl.tx(txId).onceSealed();

      // Gather minted NFT IDs (TopShot deposit events)
      const depositEvents = sealedResult.events.filter(
        (evt) =>
          evt.type === "A.0b2a3299cc857e29.TopShot.Deposit" &&
          evt.data.to === selectedAccount
      );
      const receivedNFTIDs = depositEvents.map((evt) => evt.data.id);

      let revealedNFTDetails = [];
      if (receivedNFTIDs.length > 0) {
        // 1) Grab raw NFT data
        revealedNFTDetails = await fcl.query({
          cadence: getTopShotBatched,
          args: (arg, t) => [
            arg(selectedAccount, t.Address),
            arg(receivedNFTIDs, t.Array(t.UInt64)),
          ],
        });

        // 2) Enrich metadata
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

      // Finally, refresh parent + child
      const parentAddr = accountData?.parentAddress || user?.addr;
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

  // -----------------------------------
  // RENDER
  // -----------------------------------
  if (depositStep) {
    // Step 1 => deposit TSHOT
    const buttonDisabled =
      depositDisabled || numericValue === 0 || isOverMax || isUnderMin;

    return (
      <div className="bg-gray-700 rounded-lg p-4">
        <button
          onClick={handleDeposit}
          disabled={buttonDisabled}
          className={`w-full p-4 text-lg rounded-lg font-bold text-white ${
            buttonDisabled
              ? "bg-gray-800 cursor-not-allowed"
              : "bg-flow-dark hover:bg-flow-darkest"
          }`}
        >
          (Step 1 of 2) Swap TSHOT for Moments
        </button>

        {/* Inline help messages */}
        {!isValidAmount && (
          <div className="mt-2 text-red-400 text-sm">
            {isOverMax && (
              <>
                You have exceeded the maximum of <strong>50 TSHOT</strong>.
                Please lower your amount.
              </>
            )}
            {isUnderMin && (
              <>
                You must enter at least <strong>1 TSHOT</strong> to swap.
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  if (revealStep) {
    // Step 2 => reveal minted NFTs
    return (
      <div className="bg-gray-700 rounded-lg p-4">
        <button
          onClick={handleReveal}
          className="w-full p-4 text-lg rounded-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest"
        >
          (Step 2 of 2) Swap TSHOT for Moments
        </button>
      </div>
    );
  }

  // Fallback
  return <div className="text-gray-400">Loading...</div>;
}
