/* eslint-disable react/prop-types */
import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserDataContext } from "../context/UserContext";

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
    loadAllUserData,
    loadChildData,
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
    if (!nftIds.length) return alert("Select at least one Moment.");
    if (nftIds.length > MAX_NFTS)
      return alert(`Max ${MAX_NFTS} NFTs per swap.`);
    if (!parentAddr?.startsWith("0x"))
      return console.error("Bad parent address:", parentAddr);

    // emit UI event – awaiting wallet approval
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
                arg(selectedAccount, t.Address),
                arg(nftIds.map(String), t.Array(t.UInt64)),
              ]
            : [arg(nftIds.map(String), t.Array(t.UInt64))],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });

      // clear selection immediately
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
        if (tx.status === 4) unsub();
      });

      /* 3. wait for seal */
      await fcl.tx(txId).onceSealed();

      /* 4. delta-refresh */
      if (parentAddr?.startsWith("0x")) {
        if (isChildSwap) {
          await Promise.all([
            loadAllUserData(parentAddr, { skipChildLoad: true }), // quick parent refresh
            loadChildData(selectedAccount), // exact child refresh
          ]);
        } else {
          await loadAllUserData(parentAddr); // parent + children
        }
      }
      // tier counts & MomentSelection update automatically
    } catch (err) {
      console.error("[NFT→TSHOT] tx failed:", err);
      onTransactionStart?.({
        status: "Error",
        error: err?.message ?? String(err),
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
      <button
        onClick={() => fcl.authenticate()}
        className="w-full text-lg font-bold rounded-lg p-2 bg-flow-light text-white hover:bg-flow-dark"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <button
      onClick={handleSwap}
      disabled={disabled}
      className={`
        w-full p-4 text-lg font-bold rounded-lg transition-colors shadow-md shadow-black/40
        ${
          disabled
            ? "cursor-not-allowed bg-brand-primary text-brand-text/50"
            : "bg-flow-light text-white hover:bg-flow-dark"
        }
      `}
    >
      {buttonLabel}
    </button>
  );
}

export default NFTToTSHOTPanel;
