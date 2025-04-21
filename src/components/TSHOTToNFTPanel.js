// src/components/TSHOTToNFTPanel.js
import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserDataContext } from "../context/UserContext";

// Flow scripts
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import { getTopShotBatched } from "../flow/getTopShotBatched";

// NOTE: This local enrich function is used for immediate enrichment in handleReveal.
// Consider consolidating with the version in UserContext if appropriate.
/**
 * Updated enrichWithMetadata that also merges set name + momentCount
 */
async function enrichWithMetadata(nftList, metadataCache) {
  if (!metadataCache) return nftList; // if no cache, just return raw

  // Example subedition data, kept locally for this function's use.
  // Ensure this matches the definition in UserContext.js or import from there.
  const SUBEDITIONS = {
    1: { name: "Explosion", minted: 500 },
    2: { name: "Torn", minted: 1000 },
    3: { name: "Vortex", minted: 2500 },
    4: { name: "Rippled", minted: 4000 },
    5: { name: "Coded", minted: 25 },
    6: { name: "Halftone", minted: 100 },
    7: { name: "Bubbled", minted: 250 },
    8: { name: "Diced", minted: 10 },
    9: { name: "Bit", minted: 50 },
    10: { name: "Vibe", minted: 5 },
    11: { name: "Astra", minted: 75 },
  };

  return nftList.map((nft) => {
    // Start with the potentially already partially enriched NFT
    // (e.g., might already have subeditionMaxMint from the calling logic)
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
      // Use enriched.name as fallback in case raw data/partial enrichment had one
      enriched.name =
        meta.setName || meta.name || enriched.name || "Unknown Set";
      if (typeof meta.momentCount !== "undefined") {
        enriched.momentCount = Number(meta.momentCount);
      }
    } else {
      console.warn(
        `No metadata found for setID=${nft.setID}, playID=${nft.playID}.`
      );
      // Ensure a default name if none exists
      if (!enriched.name) enriched.name = "Unknown Set";
    }

    // Subedition handling (redundant if called after partial enrichment, but safe)
    // This ensures it's applied even if this function is called directly with raw data.
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
    metadataCache, // Get metadata cache from context
  } = useContext(UserDataContext);

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
  const buttonDisabled =
    depositDisabled ||
    numericValue === 0 ||
    numericValue > parentTSHOTBalance ||
    isOverMax;

  // ---------------------------------------------
  // STEP 1 => deposit TSHOT (commitSwap)
  // ---------------------------------------------
  async function handleDeposit() {
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

      // Refresh parent / child
      if (selectedAccount && selectedAccount !== parentAddr) {
        await loadAllUserData(parentAddr, { skipChildLoad: true });
        await loadChildData(selectedAccount);
      } else {
        await loadAllUserData(parentAddr);
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

      // Initialize final details array
      let finalRevealedDetails = [];

      if (receivedNFTIDs.length > 0) {
        // 1) Grab raw NFT data on-chain
        const rawNFTData = await fcl.query({
          cadence: getTopShotBatched,
          args: (arg, t) => [
            arg(selectedAccount, t.Address),
            arg(receivedNFTIDs, t.Array(t.UInt64)),
          ],
        });

        // --- START: MODIFIED ENRICHMENT LOGIC ---

        // Define or import the SUBEDITIONS map. Ensure it's consistent with UserContext.
        const SUBEDITIONS = {
          1: { name: "Explosion", minted: 500 },
          2: { name: "Torn", minted: 1000 },
          3: { name: "Vortex", minted: 2500 },
          4: { name: "Rippled", minted: 4000 },
          5: { name: "Coded", minted: 25 },
          6: { name: "Halftone", minted: 100 },
          7: { name: "Bubbled", minted: 250 },
          8: { name: "Diced", minted: 10 },
          9: { name: "Bit", minted: 50 },
          10: { name: "Vibe", minted: 5 },
          11: { name: "Astra", minted: 75 },
        };

        // 2a) Apply Subedition Enrichment FIRST & Basic Type Conversion
        let partiallyEnrichedData = rawNFTData.map((nft) => {
          const enriched = { ...nft }; // Start with raw data
          // Basic Type Conversions
          enriched.id = Number(nft.id);
          enriched.setID = Number(nft.setID);
          enriched.playID = Number(nft.playID);
          enriched.serialNumber = Number(nft.serialNumber);
          enriched.isLocked = Boolean(nft.isLocked);
          enriched.subeditionID =
            nft.subeditionID != null && !isNaN(Number(nft.subeditionID))
              ? Number(nft.subeditionID)
              : null;

          // Apply Subedition Data
          if (enriched.subeditionID && SUBEDITIONS[enriched.subeditionID]) {
            const sub = SUBEDITIONS[enriched.subeditionID];
            enriched.subeditionName = sub.name;
            enriched.subeditionMaxMint = sub.minted; // Add the crucial field
          }
          return enriched;
        });

        // 2b) Apply Metadata Cache Enrichment if available
        if (metadataCache) {
          // Use the local/imported enrichWithMetadata function, passing the *partially enriched* data
          // This function will now layer on details from the cache onto the data
          // that already has subeditionMaxMint (if applicable).
          try {
            // Pass partially enriched data to the local enrich function
            finalRevealedDetails = await enrichWithMetadata(
              partiallyEnrichedData,
              metadataCache
            );
          } catch (enrichErr) {
            console.error("Error during metadata enrichment:", enrichErr);
            // Fallback to partially enriched data if metadata enrichment fails
            finalRevealedDetails = partiallyEnrichedData;
          }
        } else {
          console.warn(
            "Metadata cache not available during reveal enrichment. Using partial enrichment."
          );
          // Use the data that at least has subedition info applied
          finalRevealedDetails = partiallyEnrichedData;
        }
        // --- END: MODIFIED ENRICHMENT LOGIC ---
      } // End: if (receivedNFTIDs.length > 0)

      // Pass the final (partially or fully enriched) data to the modal state update
      onTransactionStart?.({
        status: "Sealed",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "REVEAL_SWAP",
        swapType: "TSHOT_TO_NFT",
        revealedNFTs: receivedNFTIDs, // Pass the IDs
        revealedNFTDetails: finalRevealedDetails, // Pass the enriched details array
      });

      // Refresh parent + child data in the background AFTER updating the modal
      if (selectedAccount && selectedAccount !== parentAddr) {
        await loadAllUserData(parentAddr, { skipChildLoad: true });
        await loadChildData(selectedAccount);
      } else {
        await loadAllUserData(parentAddr);
      }

      onRevealComplete?.(); // Callback for potential further actions
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
  } // End handleReveal

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
            w-full p-4 text-lg rounded-lg font-bold transition-colors
            shadow-md shadow-black/40
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
            w-full p-4 text-lg rounded-lg font-bold transition-colors
            shadow-md shadow-black/40
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
        w-full p-4 text-lg rounded-lg font-bold transition-colors
        shadow-md shadow-black/40 cursor-not-allowed bg-brand-primary text-brand-text/50
      "
    >
      Loading...
    </button>
  );
}
