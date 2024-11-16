// src/hooks/useTransaction.js
import { useState } from "react";
import * as fcl from "@onflow/fcl";

const useTransaction = () => {
  const [status, setStatus] = useState(null);
  const [txId, setTxId] = useState(null);
  const [error, setError] = useState(null);

  const sendTransaction = async ({
    cadence,
    args = [],
    limit = 9999,
    onUpdate,
  }) => {
    try {
      setStatus("Awaiting Approval");
      setError(null);
      if (onUpdate)
        onUpdate({ status: "Awaiting Approval", txId: null, error: null });

      const transactionId = await fcl.mutate({
        cadence,
        args,
        limit,
      });

      setTxId(transactionId);
      setStatus("Pending");
      if (onUpdate)
        onUpdate({ status: "Pending", txId: transactionId, error: null });

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
        if (onUpdate)
          onUpdate({ status: newStatus, txId: transactionId, error: null });
      });
    } catch (err) {
      const errorMsg = err.message || err;
      setError(errorMsg);
      setStatus("Error");
      if (onUpdate) onUpdate({ status: "Error", txId: null, error: errorMsg });
      throw err; // Re-throw the error to be caught in the component
    }
  };

  return { status, txId, error, sendTransaction };
};

export default useTransaction;
