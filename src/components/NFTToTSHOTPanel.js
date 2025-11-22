/* eslint-disable react/prop-types */
import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserDataContext } from "../context/UserContext";
import Button from "./Button";
// Removed import of metaStore as direct snapshot removal is handled by UserContext options

/* ─── Cadence transactions ─── */
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import { exchangeNFTForTSHOT_child } from "../flow/exchangeNFTForTSHOT_child";

const MAX_NFTS = 200;

function NFTToTSHOTPanel({ nftIds = [], buyAmount = "0", onTransactionStart }) {
  const {
    user,
    accountData,
    selectedAccount,
    selectedAccountType,
    loadAllUserData, // Used for parent refresh
    loadChildData, // Used for specific child refresh
    smartRefreshUserData, // Preferred for refreshing the main user's data
    dispatch,
  } = useContext(UserDataContext);

  const isLoggedIn = Boolean(user?.loggedIn);
  const parentAddr = accountData?.parentAddress || user?.addr;
  const isChildSwap = selectedAccountType === "child";
  const cadenceTx = isChildSwap
    ? exchangeNFTForTSHOT_child
    : exchangeNFTForTSHOT;

  const disabled = nftIds.length === 0 || nftIds.length > MAX_NFTS;
  const buttonLabel = nftIds.length === 0 ? "Select Moments" : "Swap";

  /* ─────────────────────────────── */

  const handleSwap = async () => {
    if (!nftIds.length) {
      // Consider using a more user-friendly notification than alert
      console.warn("Select at least one Moment.");
      return;
    }
    if (nftIds.length > MAX_NFTS) {
      console.warn(`Max ${MAX_NFTS} NFTs per swap.`);
      return;
    }
    if (!parentAddr?.startsWith("0x")) {
      console.error("Bad parent address:", parentAddr);
      return;
    }

    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      nftCount: nftIds.length,
      tshotAmount: buyAmount,
      swapType: "NFT_TO_TSHOT",
      nftIds,
    });

    try {
      /* 1. send tx */
      const txId = await fcl.mutate({
        cadence: cadenceTx,
        args: (arg, t) =>
          isChildSwap
            ? [
                arg(selectedAccount, t.Address), // selectedAccount is the child's address
                arg(nftIds.map(String), t.Array(t.UInt64)),
              ]
            : [arg(nftIds.map(String), t.Array(t.UInt64))], // For parent, no address arg needed in this tx
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });

      dispatch({ type: "RESET_SELECTED_NFTS" });

      onTransactionStart?.({
        status: "Pending",
        txId,
        error: null,
        nftCount: nftIds.length,
        tshotAmount: buyAmount,
        swapType: "NFT_TO_TSHOT",
        nftIds,
      });

      /* 2. live status updates */
      let stuckTimerId = null;
      const startStuckTimer = (label) => {
        if (stuckTimerId) return;
        stuckTimerId = setTimeout(() => {
          console.warn("[NFTToTSHOTPanel] Tx appears stuck after 20s", {
            txId,
            lastStatus: label,
            at: new Date().toISOString(),
          });
        }, 20_000);
      };
      const clearStuckTimer = () => {
        if (stuckTimerId) {
          clearTimeout(stuckTimerId);
          stuckTimerId = null;
        }
      };

      startStuckTimer("Pending");

      const unsub = fcl.tx(txId).subscribe((tx) => {
        const map = {
          PENDING: "Pending",
          FINALIZED: "Finalized",
          EXECUTED: "Executed",
          SEALED: "Sealed",
        };
        onTransactionStart?.({
          status: map[tx.statusString] || "Processing…",
          error: tx.errorMessage?.length ? tx.errorMessage : null,
          txId,
          nftCount: nftIds.length,
          tshotAmount: buyAmount,
          swapType: "NFT_TO_TSHOT",
          nftIds,
        });
        const label = map[tx.statusString] || "Processing…";
        if (label === "Sealed") {
          clearStuckTimer();
        } else {
          clearStuckTimer();
          startStuckTimer(label);
        }
        if (tx.status === 4) unsub(); // Sealed
      });

      /* 3. wait for seal */
      await fcl.tx(txId).onceSealed();
      console.log(
        "[NFTToTSHOTPanel] Transaction sealed. Triggering data refresh."
      );

      /* 4. Refresh data ensuring collection snapshot is rebuilt */
      if (parentAddr?.startsWith("0x")) {
        if (isChildSwap && selectedAccount) {
          console.log(
            `[NFTToTSHOTPanel] Child swap. Refreshing child: ${selectedAccount} and parent: ${parentAddr}`
          );
          // For a child swap, TSHOT balance updates on the parent. Child's NFT collection changes.
          // Refresh parent (mainly for TSHOT balance, collection snapshot also rebuilt).
          await loadAllUserData(parentAddr, {
            skipChildLoad: true, // Don't re-process all children here
            forceCollectionRefresh: true,
            forceGlobalMetaRefresh: false,
          });
          // Specifically refresh the child whose collection changed.
          await loadChildData(selectedAccount, {
            forceCollectionRefresh: true,
            forceGlobalMetaRefresh: false,
          });
        } else {
          // Parent swap, use smartRefreshUserData which handles parentAddr correctly
          // smartRefreshUserData already sets forceCollectionRefresh: true and forceGlobalMetaRefresh: false
          console.log(
            `[NFTToTSHOTPanel] Parent swap. Calling smartRefreshUserData for ${parentAddr}`
          );
          await smartRefreshUserData();
        }
      }
    } catch (err) {
      console.error("[NFT→TSHOT] tx failed:", err);
      const errorMsg = err?.message ?? String(err);
      const isUserRejection = errorMsg.toLowerCase().includes("user rejected") || 
                              errorMsg.toLowerCase().includes("declined");
      onTransactionStart?.({
        status: isUserRejection ? "Declined" : "Error",
        error: errorMsg,
        txId: null,
        nftCount: nftIds.length,
        tshotAmount: buyAmount,
        swapType: "NFT_TO_TSHOT",
        nftIds,
      });
    }
  };

  /* ─────────────────────────────── */

  if (!isLoggedIn) {
    return (
      <Button
        onClick={() => fcl.authenticate()}
        variant="opolis"
        size="lg"
        className="w-full"
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSwap}
      disabled={disabled}
      variant={disabled ? "secondary" : "opolis"}
      size="lg"
      className="w-full"
    >
      {buttonLabel}
    </Button>
  );
}

export default NFTToTSHOTPanel;
