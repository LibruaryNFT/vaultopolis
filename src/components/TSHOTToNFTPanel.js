/* eslint-disable react/prop-types */
import React, { useContext, useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { UserDataContext } from "../context/UserContext";
import { metaStore } from "../utils/metaStore";
import Button from "./Button";
import { Check } from "lucide-react";

/* ──────────── Cadence ──────────── */
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import { getTopShotBatched } from "../flow/getTopShotBatched";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { SUBEDITIONS, getParallelIconUrl } from "../utils/subeditions";

const META_KEY = "topshotMeta_v1";
const ONE_HOUR = 3_600_000;

/* ──────────────────────────────────────────────────────────
 *  Format TSHOT amount for display (removes trailing .0)
 * ─────────────────────────────────────────────────────────*/
function formatTSHOTAmount(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return "0 TSHOT";
  // If it's a whole number, show without decimals
  if (num % 1 === 0) {
    return `${Math.floor(num)} TSHOT`;
  }
  // Otherwise, show one decimal place
  return `${num.toFixed(1)} TSHOT`;
}

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

    // Treat null/undefined as 0 (Standard), or use the actual subeditionID
    const effectiveSubeditionID = (out.subeditionID === null || out.subeditionID === undefined) ? 0 : out.subeditionID;
    if (SUBEDITIONS[effectiveSubeditionID]) {
      const s = SUBEDITIONS[effectiveSubeditionID];
      out.subeditionName = s.name;
      out.subeditionMaxMint = s.minted;
      out.subeditionIcon = getParallelIconUrl(effectiveSubeditionID);
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
      const errorMsg = err?.message ?? String(err);
      const isUserRejection = errorMsg.toLowerCase().includes("user rejected") || 
                              errorMsg.toLowerCase().includes("declined");
      onTransactionStart?.({
        status: isUserRejection ? "Declined" : "Error",
        error: errorMsg,
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

          // Treat null/undefined as 0 (Standard), or use the actual subeditionID
          const effectiveSubeditionID = (o.subeditionID === null || o.subeditionID === undefined) ? 0 : o.subeditionID;
          if (SUBEDITIONS[effectiveSubeditionID]) {
            const s = SUBEDITIONS[effectiveSubeditionID];
            o.subeditionName = s.name;
            o.subeditionMaxMint = s.minted;
            o.subeditionIcon = getParallelIconUrl(effectiveSubeditionID);
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
      const errorMsg = err?.message ?? String(err);
      const isUserRejection = errorMsg.toLowerCase().includes("user rejected") || 
                              errorMsg.toLowerCase().includes("declined");
      onTransactionStart?.({
        status: isUserRejection ? "Declined" : "Error",
        error: errorMsg,
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

  /* Render based on step - only one primary button at a time */
  
  // Step 2 state
  const step2Disabled = revealStep ? (checkingCol || !hasCollection) : true;
  const betAmount = accountData?.receiptDetails?.betAmount || sellAmount;
  const formattedAmount = formatTSHOTAmount(betAmount);

  /* ───────────────────────────────────────────────────────
   *  STEP 1 VIEW (no receipt)
   * ───────────────────────────────────────────────────────*/
  if (depositStep) {
    return (
      <div className="space-y-3">
        {/* Step 1 Primary Button */}
        <Button
          onClick={handleDeposit}
          disabled={btnDisabledDeposit}
          variant={btnDisabledDeposit ? "secondary" : "opolis"}
          size="lg"
          className={`
            w-full px-4 py-4 
            shadow-md shadow-black/40
            transition-all duration-200
            ${!btnDisabledDeposit
              ? 'hover:scale-[1.02] hover:shadow-lg hover:shadow-opolis/30 active:scale-[0.98] focus:ring-2 focus:ring-opolis/50 focus:ring-offset-2 focus:ring-offset-brand-primary'
              : 'opacity-60 cursor-not-allowed'
            }
          `}
        >
          Commit TSHOT
        </Button>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center">
              <span className="text-xs font-semibold text-white">1</span>
            </div>
            <span className="text-xs font-medium text-brand-accent">Commit TSHOT</span>
          </div>
          <div className="w-12 h-px bg-brand-border" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-text/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-brand-text/40">2</span>
            </div>
            <span className="text-xs font-medium text-brand-text/40">Reveal Moments</span>
          </div>
        </div>

        {/* Step 1 Helper Text - Only when enabled */}
        {!btnDisabledDeposit && (
          <p className="text-xs text-brand-text/60 text-center mt-2 px-2">
            Burns your TSHOT and creates a receipt for your reveal.
          </p>
        )}

        {/* Step 1 Error Helpers - Only when disabled */}
        {btnDisabledDeposit && numericValue === 0 && (
          <p className="text-xs text-brand-text/60 text-center mt-1 px-2">
            Enter an amount to continue.
          </p>
        )}
        {btnDisabledDeposit && numericValue > 50 && (
          <p className="text-xs text-red-400 text-center mt-1 px-2">
            Maximum 50 TSHOT per swap
          </p>
        )}
        {btnDisabledDeposit && numericValue > parentTSHOT && numericValue <= 50 && (
          <p className="text-xs text-yellow-400 text-center mt-1 px-2">
            Insufficient TSHOT balance
          </p>
        )}
      </div>
    );
  }

  /* ───────────────────────────────────────────────────────
   *  STEP 2 VIEW (has receipt)
   * ───────────────────────────────────────────────────────*/
  return (
    <div className="space-y-3">
      {/* Step 1 Completion Pill (not a button) */}
      <div className="p-2 bg-brand-accent/10 border border-brand-accent/30 rounded-lg">
        <div className="flex items-center gap-2 text-xs text-brand-accent">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>
            Receipt ready — You committed {formattedAmount}
          </span>
        </div>
      </div>

      {/* Step 2 Primary Button */}
      <Button
        onClick={handleReveal}
        disabled={step2Disabled}
        variant={step2Disabled ? "secondary" : "opolis"}
        size="lg"
        className={`
          w-full px-4 py-4 
          shadow-md shadow-black/40
          transition-all duration-200
          relative
          select-none
          ${!step2Disabled
            ? 'hover:scale-[1.02] hover:shadow-lg hover:shadow-opolis/30 active:scale-[0.98] focus:ring-2 focus:ring-opolis/50 focus:ring-offset-2 focus:ring-offset-brand-primary'
            : 'opacity-60 cursor-not-allowed'
          }
        `}
      >
        {checkingCol && (
          <span className="absolute left-4">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        )}
        {checkingCol
          ? "Checking collection..."
          : "Reveal Moments"}
      </Button>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand-text/20 flex items-center justify-center">
            <Check className="w-3 h-3 text-brand-accent" />
          </div>
          <span className="text-xs font-medium text-brand-text/40">Commit TSHOT</span>
        </div>
        <div className="w-12 h-px bg-brand-border" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center">
            <span className="text-xs font-semibold text-white">2</span>
          </div>
          <span className="text-xs font-medium text-brand-accent">Reveal Moments</span>
        </div>
      </div>

      {/* Step 2 Helper Text - Only when enabled and not checking */}
      {!step2Disabled && !checkingCol && (
        <p className="text-xs text-brand-text/60 text-center mt-2 px-2">
          Redeems your receipt and delivers random Moments to your collection.
        </p>
      )}

      {/* Step 2 Error Helper - Only when disabled and not checking */}
      {step2Disabled && !checkingCol && (
        <p className="text-xs text-brand-text/70 text-center mt-1 px-2">
          To reveal, choose an account that has a Top Shot collection set up.
        </p>
      )}
    </div>
  );
}
