import React, { useContext, useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";

// Import your Flow scripts/transactions
import { getReceiptDetails } from "../flow/getReceiptDetails";
import { destroyReceipt } from "../flow/destroyReceipt";

export default function TSHOTReceiptPanel() {
  const { user } = useContext(UserContext);
  const userAddress = user?.addr;

  const [receiptData, setReceiptData] = useState(null); // Will hold a dictionary or null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txStatus, setTxStatus] = useState(null);

  // Load the receipt info when the component mounts or user changes
  useEffect(() => {
    if (!userAddress) return;
    fetchReceiptDetails(userAddress);
  }, [userAddress]);

  async function fetchReceiptDetails(addr) {
    setLoading(true);
    setError(null);
    setReceiptData(null);

    try {
      const result = await fcl.query({
        cadence: getReceiptDetails,
        args: (arg, t) => [arg(addr, t.Address)],
      });

      // result will be {} if no receipt found or the capability doesn't exist
      if (Object.keys(result).length > 0) {
        // We have some fields in the dictionary
        setReceiptData(result);
      } else {
        // No receipt found
        setReceiptData(null);
      }
    } catch (err) {
      console.error("Error fetching receipt:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDestroyReceipt() {
    if (!userAddress) {
      alert("No valid address to destroy a receipt for.");
      return;
    }
    setTxStatus("Awaiting Approval...");
    setError(null);

    try {
      // Send the transaction
      const txId = await fcl.mutate({
        cadence: destroyReceipt,
        limit: 9999,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
      });

      // Subscribe to transaction status
      const unsubscribe = fcl.tx(txId).subscribe((txStatusData) => {
        let newStatus = "Processing...";
        switch (txStatusData.statusString) {
          case "PENDING":
            newStatus = "Pending";
            break;
          case "FINALIZED":
            newStatus = "Finalized";
            break;
          case "EXECUTED":
            newStatus = "Executed";
            break;
          default:
            break;
        }
        setTxStatus(newStatus);
        if (txStatusData.errorMessage) {
          setError(txStatusData.errorMessage);
        }
      });

      // Wait for the transaction to seal
      await fcl.tx(txId).onceSealed();
      unsubscribe();

      setTxStatus("Sealed");

      // After destruction, receipt should be gone => fetch again
      await fetchReceiptDetails(userAddress);
    } catch (err) {
      console.error("Failed to destroy receipt:", err);
      setError(err.message);
      setTxStatus("Error");
    }
  }

  if (!userAddress) {
    return (
      <div className="p-4 bg-gray-800 rounded">
        <p className="text-white">
          Please connect your wallet to view/destroy a receipt.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-gray-800 rounded space-y-3">
      <h2 className="text-xl font-bold text-white">TSHOT Receipt Panel</h2>

      {loading && <p className="text-gray-300">Loading receipt info...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}
      {txStatus && !error && (
        <p className="text-gray-200">Transaction: {txStatus}</p>
      )}

      {/* Show receipt details if present */}
      {receiptData ? (
        <div className="bg-gray-700 p-3 rounded text-white space-y-2">
          <p>
            <strong>Bet Amount:</strong> {receiptData.betAmount}
          </p>
          <p>
            <strong>Request Block:</strong> {receiptData.requestBlock}
          </p>
          <p>
            <strong>Can Fulfill:</strong>{" "}
            {receiptData.canFulfill ? "Yes" : "No"}
          </p>
          <p>
            <strong>Request UUID:</strong> {receiptData.requestUUID}
          </p>
          <p>
            <strong>Is Fulfilled:</strong>{" "}
            {receiptData.isFulfilled ? "Yes" : "No"}
          </p>

          {/* Destroy Receipt Button */}
          <button
            onClick={handleDestroyReceipt}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Destroy Receipt
          </button>
        </div>
      ) : (
        !loading && (
          <p className="text-gray-300">
            No receipt found. (It may be destroyed or never created.)
          </p>
        )
      )}
    </div>
  );
}
