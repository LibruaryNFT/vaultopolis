// src/hooks/useTransaction.js
import { useState } from "react";
import * as fcl from "@onflow/fcl";

const useTransaction = () => {
  const [status, setStatus] = useState(null);
  const [txId, setTxId] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Send a transaction to the network using FCL.
   * We do NOT specify payer/proposer/authorizations explicitly.
   * FCL automatically uses the currently logged-in user
   * for all roles (assuming they're logged in).
   */
  const sendTransaction = async ({
    cadence,
    args = [],
    limit = 9999,
    onUpdate,
  }) => {
    try {
      // Indicate we need wallet approval
      setStatus("Awaiting Approval");
      setError(null);
      onUpdate?.({ status: "Awaiting Approval", txId: null, error: null });

      // Just call fcl.mutate without specifying roles
      const transactionId = await fcl.mutate({
        cadence,
        args,
        limit,
      });

      // Transaction created, now in Pending
      setTxId(transactionId);
      setStatus("Pending");
      onUpdate?.({ status: "Pending", txId: transactionId, error: null });

      // Subscribe to updates
      let stuckTimerId = null;
      const startStuckTimer = (label) => {
        if (stuckTimerId) return;
        stuckTimerId = setTimeout(() => {
          console.warn(
            `[useTransaction] Transaction appears stuck after 20s`,
            {
              txId: transactionId,
              lastStatus: label,
              at: new Date().toISOString(),
            }
          );
        }, 20_000);
      };
      const clearStuckTimer = () => {
        if (stuckTimerId) {
          clearTimeout(stuckTimerId);
          stuckTimerId = null;
        }
      };

      startStuckTimer("Pending");

      fcl.tx(transactionId).subscribe((transaction) => {
        const statusMap = {
          0: "Pending",
          1: "Pending",
          2: "Finalized",
          3: "Executed",
          4: "Sealed",
          5: "Expired",
        };
        const newStatus = statusMap[transaction.status] || "Pending";
        setStatus(newStatus);
        onUpdate?.({ status: newStatus, txId: transactionId, error: null });

        // Reset timer on each status transition; stop on terminal statuses
        if (newStatus === "Sealed" || newStatus === "Expired") {
          clearStuckTimer();
        } else {
          clearStuckTimer();
          startStuckTimer(newStatus);
        }
      });
    } catch (err) {
      const errorMsg = err.message || String(err);
      setError(errorMsg);
      setStatus("Error");
      onUpdate?.({ status: "Error", txId: null, error: errorMsg });
      throw err;
    }
  };

  return { status, txId, error, sendTransaction };
};

export default useTransaction;
