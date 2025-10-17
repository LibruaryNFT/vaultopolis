/* eslint-disable react/prop-types */
import React, { useContext, useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { UserDataContext } from "../context/UserContext";
import { metaStore } from "../utils/metaStore";
import Button from "./Button";

/* ──────────── Cadence ──────────── */
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import { getTopShotBatched } from "../flow/getTopShotBatched";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";

/* ──────────── constants ─────────── */
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

const META_KEY = "topshotMeta_v1";
const ONE_HOUR = 3_600_000;

/* ──────────────────────────────────────────────────────────
 *  1. Make sure we always have the metadata cache in memory
 * ─────────────────────────────────────────────────────────*/
async function ensureMetadataCache(current, dispatch) {
  /* a) already good? */
  if (current && Object.keys(current).length) return current;

  /* b) try IndexedDB */
  try {
    const snap = await metaStore.getItem(META_KEY);
    if (snap && Date.now() - snap.ts < ONE_HOUR) {
      dispatch({ type: "SET_METADATA_CACHE", payload: snap.data });
      return snap.data;
    }
  } catch (e) {
    console.warn("[meta] IDB read failed:", e);
  }

  /* c) download */
  try {
    const res = await fetch("https://api.vaultopolis.com/topshot-data");
    const arr = await res.json();
    const map = arr.reduce((m, r) => {
      m[`${r.setID}-${r.playID}`] = {
        tier: r.tier?.toLowerCase() || null,
        FullName: r.FullName,
        JerseyNumber: r.JerseyNumber,
        momentCount: r.momentCount,
        TeamAtMoment: r.TeamAtMoment,
        name: r.name,
        series: r.series,
      };
      return m;
    }, {});
    metaStore.setItem(META_KEY, { ts: Date.now(), data: map }).catch(() => {});
    dispatch({ type: "SET_METADATA_CACHE", payload: map });
    return map;
  } catch (err) {
    console.error("[meta] fetch failed:", err);
    dispatch({ type: "SET_METADATA_CACHE", payload: {} });
    return {};
  }
}

/* ──────────────────────────────────────────────────────────
 *  2. Helper that merges raw NFT data with meta + subedition
 * ─────────────────────────────────────────────────────────*/
function enrichWithMetadata(list, meta) {
  return list.map((n) => {
    const out = { ...n };
    const m = meta?.[`${n.setID}-${n.playID}`];

    if (m) {
      out.tier = m.tier || out.tier;
      out.fullName = m.FullName || out.fullName || "Unknown Player";
      out.series = m.series ?? out.series;
      out.teamAtMoment = m.TeamAtMoment ?? out.teamAtMoment;
      out.name = m.name ?? out.name ?? "Unknown Set";
      if (typeof m.momentCount !== "undefined")
        out.momentCount = Number(m.momentCount);
    }

    if (out.subeditionID && SUBEDITIONS[out.subeditionID]) {
      const s = SUBEDITIONS[out.subeditionID];
      out.subeditionName = s.name;
      out.subeditionMaxMint = s.minted;
    }
    return out;
  });
}

/* ──────────────────────────────────────────────────────────
 *  COMPONENT
 * ─────────────────────────────────────────────────────────*/
export default function TSHOTToNFTPanel({
  sellAmount = "0",
  depositDisabled = false,
  onTransactionStart,
  onTransactionComplete,
}) {
  const {
    user,
    accountData,
    selectedAccount,
    loadAllUserData,
    loadChildData,
    metadataCache,
    dispatch, // <- for ensureMetadataCache
  } = useContext(UserDataContext);

  /* ───  local state  ─── */
  const [hasCollection, setHasCollection] = useState(false);
  const [checkingCol, setCheckingCol] = useState(false);

  /* ───  misc derived  ─── */
  const loggedIn = Boolean(user?.loggedIn);
  const parentAddr = accountData?.parentAddress || user?.addr;
  const parentTSHOT = parseFloat(accountData?.tshotBalance || "0");
  const numericValue = Math.max(0, Number.parseInt(sellAmount, 10) || 0);
  const isOverMax = numericValue > 50;
  const depositStep = !accountData?.hasReceipt;
  const revealStep = accountData?.hasReceipt;
  const btnDisabledDeposit =
    depositDisabled ||
    numericValue === 0 ||
    numericValue > parentTSHOT ||
    isOverMax;

  /* ───  collection check whenever selectedAccount changes  ─── */
  useEffect(() => {
    if (!selectedAccount) return;
    (async () => {
      try {
        setCheckingCol(true);
        const has = await fcl.query({
          cadence: verifyTopShotCollection,
          args: (arg, t) => [arg(selectedAccount, t.Address)],
        });
        setHasCollection(!!has);
      } catch (e) {
        console.error("[collection check]", e);
        setHasCollection(false);
      } finally {
        setCheckingCol(false);
      }
    })();
  }, [selectedAccount]);

  /* ───────────────────────────────────────────────────────
   *  STEP 1 → deposit (commitSwap)
   * ───────────────────────────────────────────────────────*/
  async function handleDeposit() {
    if (btnDisabledDeposit) return;

    const bet = `${numericValue}.0`;

    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      tshotAmount: bet,
      transactionAction: "COMMIT_SWAP",
      swapType: "TSHOT_TO_NFT",
    });

    try {
      const txId = await fcl.mutate({
        cadence: commitSwap,
        args: (arg, t) => [arg(bet, t.UFix64)],
        limit: 9999,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
      });

      onTransactionStart?.({
        status: "Pending",
        txId,
        tshotAmount: bet,
        transactionAction: "COMMIT_SWAP",
        swapType: "TSHOT_TO_NFT",
      });

      let stuckTimerId = null;
      const startStuckTimer = (label) => {
        if (stuckTimerId) return;
        stuckTimerId = setTimeout(() => {
          console.warn("[TSHOTToNFTPanel][deposit] Tx appears stuck after 20s", {
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

      const unsub = fcl.tx(txId).subscribe((s) => {
        const map = {
          PENDING: "Pending",
          FINALIZED: "Finalized",
          EXECUTED: "Executed",
          SEALED: "Sealed",
        };
        onTransactionStart?.({
          status: map[s.statusString] || "Processing…",
          error: s.errorMessage?.length ? s.errorMessage : null,
          txId,
          tshotAmount: bet,
          transactionAction: "COMMIT_SWAP",
          swapType: "TSHOT_TO_NFT",
        });
        const label = map[s.statusString] || "Processing…";
        if (label === "Sealed") {
          clearStuckTimer();
        } else {
          clearStuckTimer();
          startStuckTimer(label);
        }
        if (s.status === 4) unsub();
      });

      await fcl.tx(txId).onceSealed();

      /* background refresh */
      if (parentAddr?.startsWith("0x")) await loadAllUserData(parentAddr);

      /* Remove the reset after deposit step */
    } catch (err) {
      console.error("[deposit] failed:", err);
      onTransactionStart?.({
        status: "Error",
        error: err?.message ?? String(err),
        txId: null,
        tshotAmount: bet,
        transactionAction: "COMMIT_SWAP",
        swapType: "TSHOT_TO_NFT",
      });
    }
  }

  /* ───────────────────────────────────────────────────────
   *  STEP 2 → reveal (revealSwap)
   * ───────────────────────────────────────────────────────*/
  async function handleReveal() {
    const betInteger = accountData?.receiptDetails?.betAmount || sellAmount;
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
      /* ---------- make sure meta cache is loaded ---------- */
      const meta = await ensureMetadataCache(metadataCache, dispatch);

      /* ---------- send tx ---------- */
      const txId = await fcl.mutate({
        cadence: revealSwap,
        args: (arg, t) => [arg(selectedAccount, t.Address)],
        limit: 9999,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
      });

      /* live updates */
      let stuckTimerId2 = null;
      const startStuckTimer2 = (label) => {
        if (stuckTimerId2) return;
        stuckTimerId2 = setTimeout(() => {
          console.warn("[TSHOTToNFTPanel][reveal] Tx appears stuck after 20s", {
            txId,
            lastStatus: label,
            at: new Date().toISOString(),
          });
        }, 20_000);
      };
      const clearStuckTimer2 = () => {
        if (stuckTimerId2) {
          clearTimeout(stuckTimerId2);
          stuckTimerId2 = null;
        }
      };

      startStuckTimer2("Pending");

      const unsub = fcl.tx(txId).subscribe((s) => {
        const map = {
          PENDING: "Pending",
          FINALIZED: "Finalized",
          EXECUTED: "Executed",
          SEALED: "Sealed",
        };
        onTransactionStart?.({
          status: map[s.statusString] || "Processing…",
          error: s.errorMessage?.length ? s.errorMessage : null,
          txId,
          tshotAmount: betAmount,
          transactionAction: "REVEAL_SWAP",
          swapType: "TSHOT_TO_NFT",
        });
        const label = map[s.statusString] || "Processing…";
        if (label === "Sealed") {
          clearStuckTimer2();
        } else {
          clearStuckTimer2();
          startStuckTimer2(label);
        }
        if (s.status === 4) unsub();
      });

      /* wait seal */
      const sealed = await fcl.tx(txId).onceSealed();

      /* parse TopShot.Deposit events to know IDs */
      const depositEv = sealed.events.filter(
        (e) =>
          e.type === "A.0b2a3299cc857e29.TopShot.Deposit" &&
          e.data.to === selectedAccount
      );
      const ids = depositEv.map((e) => e.data.id);

      /* fetch + enrich */
      let details = [];
      if (ids.length) {
        const raw = await fcl.query({
          cadence: getTopShotBatched,
          args: (arg, t) => [
            arg(selectedAccount, t.Address),
            arg(ids, t.Array(t.UInt64)),
          ],
        });

        const pre = raw.map((n) => {
          const o = { ...n };
          o.id = Number(o.id);
          o.setID = Number(o.setID);
          o.playID = Number(o.playID);
          o.serialNumber = Number(o.serialNumber);
          o.isLocked = Boolean(o.isLocked);
          o.subeditionID =
            o.subeditionID != null ? Number(o.subeditionID) : null;

          if (o.subeditionID && SUBEDITIONS[o.subeditionID]) {
            const s = SUBEDITIONS[o.subeditionID];
            o.subeditionName = s.name;
            o.subeditionMaxMint = s.minted;
          }
          return o;
        });

        details = enrichWithMetadata(pre, meta);
      }

      onTransactionStart?.({
        status: "Sealed",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "REVEAL_SWAP",
        swapType: "TSHOT_TO_NFT",
        revealedNFTs: ids,
        revealedNFTDetails: details,
      });

      /* background refresh */
      const pAddr = accountData?.parentAddress || user?.addr;
      if (selectedAccount && selectedAccount !== pAddr) {
        await loadAllUserData(pAddr, { skipChildLoad: true });
        await loadChildData(selectedAccount);
      } else {
        await loadAllUserData(pAddr);
      }

      /* reset amount after successful transaction */
      onTransactionComplete?.();
    } catch (err) {
      console.error("[reveal] failed:", err);
      onTransactionStart?.({
        status: "Error",
        error: err?.message ?? String(err),
        txId: null,
        tshotAmount: betAmount,
        transactionAction: "REVEAL_SWAP",
        swapType: "TSHOT_TO_NFT",
      });
    }
  }

  /* ───────────────────────────────────────────────────────
   *  RENDER
   * ───────────────────────────────────────────────────────*/
  if (!loggedIn) {
    return (
      <Button
        onClick={() => fcl.authenticate()}
        variant="opolis"
        size="lg"
        className="w-full px-4 py-4"
      >
        Connect Wallet
      </Button>
    );
  }

  /* STEP-1 UI */
  if (depositStep) {
    let label = "(Step 1 of 2) Swap TSHOT for Moments";
    if (numericValue === 0) label = "(Step 1 of 2) Enter an amount";
    else if (numericValue > parentTSHOT)
      label = "(Step 1 of 2) Insufficient TSHOT";

    return (
      <Button
        onClick={handleDeposit}
        disabled={btnDisabledDeposit}
        variant={btnDisabledDeposit ? "secondary" : "opolis"}
        size="lg"
        className="w-full px-4 py-4 shadow-md shadow-black/40"
      >
        {label}
      </Button>
    );
  }

  /* STEP-2 UI */
  if (revealStep) {
    const disabled = checkingCol || !hasCollection;
    return (
      <div className="space-y-4">
        <Button
          onClick={handleReveal}
          disabled={disabled}
          variant={disabled ? "secondary" : "opolis"}
          size="lg"
          className="w-full px-4 py-4 shadow-md shadow-black/40 select-none"
        >
          {checkingCol
            ? "Checking collection..."
            : "(Step 2 of 2) Receive Random Moments"}
        </Button>

        {disabled && !checkingCol && (
          <p className="text-red-400 text-sm">
            Please select an account that has a TopShot collection before
            revealing your minted Moments.
          </p>
        )}
      </div>
    );
  }

  /* fallback */
  return (
    <Button
      disabled
      variant="secondary"
      size="lg"
      className="w-full px-4 py-4 select-none"
    >
      Loading…
    </Button>
  );
}
