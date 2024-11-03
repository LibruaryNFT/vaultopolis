// src/components/TSHOTToNFTPanel.js
import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import { FaCheckCircle } from "react-icons/fa"; // Import icon for completion

const TSHOTToNFTPanel = () => {
  const {
    user,
    tshotBalance,
    dispatch,
    refreshBalances,
    hasReceipt,
    receiptDetails = {},
    nftDetails = [],
  } = useContext(UserContext);

  const [tshotAmount, setTshotAmount] = useState(0);
  const [totalCommons, setTotalCommons] = useState(0);
  const [showReceiptDetails, setShowReceiptDetails] = useState(false); // For expandable receipt

  useEffect(() => {
    const countTotalCommons = () => {
      const commons = nftDetails.filter(
        (nft) => nft.tier.toLowerCase() === "common" && !nft.isLocked
      );
      setTotalCommons(commons.length);
    };

    if (user.loggedIn && nftDetails.length > 0) {
      countTotalCommons();
    }
  }, [user, nftDetails]);

  const handleCommit = async () => {
    if (tshotAmount <= 0) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: "Error: Please enter a valid $TSHOT amount.",
      });
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      return;
    }

    try {
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Depositing ${tshotAmount} $TSHOT...`,
      });

      const txId = await fcl.mutate({
        cadence: commitSwap,
        args: (arg, t) => [arg(tshotAmount.toFixed(1), t.UFix64)],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });

      await fcl.tx(txId).onceSealed();
      await refreshBalances();

      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Deposit completed. ${tshotAmount} $TSHOT deposited.\nTransaction ID: ${txId}`,
      });

      setTimeout(() => {
        dispatch({ type: "TOGGLE_MODAL", payload: false });
      }, 3000);
    } catch (error) {
      const errorMessage =
        error?.message || error?.toString() || "Transaction failed.";
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload:
          errorMessage.includes("Declined") || errorMessage.includes("rejected")
            ? "Transaction failed: User rejected the request."
            : errorMessage.includes("authz")
            ? "Transaction failed: Authorization error. Please try again."
            : `Transaction failed: ${errorMessage}`,
      });
    }
  };

  const handleReveal = async () => {
    if (!hasReceipt) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: "You need to complete the deposit step before claiming.",
      });
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      return;
    }

    try {
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: "Claiming your Moments...",
      });

      const txId = await fcl.mutate({
        cadence: revealSwap,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });
      await fcl.tx(txId).onceSealed();
      await refreshBalances();

      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Claim completed.\nTransaction ID: ${txId}`,
      });

      setTimeout(() => {
        dispatch({ type: "TOGGLE_MODAL", payload: false });
      }, 3000);
    } catch (error) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Claim transaction failed: ${error.message}`,
      });
      dispatch({ type: "TOGGLE_MODAL", payload: true });
    }
  };

  const handleTshotChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setTshotAmount(parseFloat(value) || 0);
    }
  };

  return (
    <>
      <div className="p-4 bg-gray-900 rounded-lg">
        <h2 className="text-white text-lg font-semibold mb-4">
          Swap $TSHOT for Moments
        </h2>

        {/* Step Guide */}
        <div className="flex justify-between items-center mb-6 space-x-4">
          {/* Step 1: Deposit $TSHOT */}
          <div
            className={`w-1/2 p-4 text-center rounded-lg border-2 h-56 flex flex-col justify-between ${
              hasReceipt
                ? "border-gray-500 bg-gray-800"
                : "border-green-500 bg-gray-700"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                hasReceipt ? "text-gray-500" : "text-green-500"
              }`}
            >
              {hasReceipt ? "Completed" : "Current Step"}
            </p>
            <p className="text-white font-semibold flex items-center justify-center">
              Step 1: Deposit $TSHOT
              {hasReceipt && <FaCheckCircle className="ml-2 text-gray-500" />}
            </p>
            <p className="text-gray-300 text-sm mt-1">
              Deposit $TSHOT to begin the swap process.
            </p>

            {/* Deposit Input for Step 1 */}
            {!hasReceipt && (
              <div className="flex flex-col items-center mt-4">
                <div className="flex items-center">
                  <input
                    type="number"
                    value={tshotAmount || ""}
                    onChange={handleTshotChange}
                    className="text-xl font-bold text-white bg-gray-800 border-2 border-gray-600 rounded-lg text-center px-2 py-1"
                    style={{ width: "70px" }}
                    min="0"
                    step="0.1"
                  />
                  <span className="ml-2 text-gray-400">$TSHOT</span>
                </div>
                <small className="text-gray-500 mt-1">
                  Balance: {parseFloat(tshotBalance || 0).toFixed(2)} $TSHOT
                </small>
              </div>
            )}

            {/* Expandable receipt details for Step 1 */}
            {hasReceipt && (
              <>
                <button
                  onClick={() => setShowReceiptDetails(!showReceiptDetails)}
                  className="text-blue-300 underline text-xs mt-2"
                >
                  {showReceiptDetails
                    ? "Hide Receipt Details"
                    : "Receipt Details"}
                </button>
                {showReceiptDetails && (
                  <div className="mt-2 bg-gray-800 p-3 rounded-lg">
                    <p className="text-gray-400">
                      <strong>$TSHOT Swap Amount:</strong>{" "}
                      {parseInt(receiptDetails.betAmount) || "N/A"}
                    </p>
                    <p className="text-gray-400">
                      <strong>Request Block:</strong>{" "}
                      {receiptDetails.requestBlock || "N/A"}
                    </p>
                    <p className="text-gray-400">
                      <strong>Can Fulfill:</strong>{" "}
                      {receiptDetails.canFulfill ? "Yes" : "No"}
                    </p>
                    <p className="text-gray-400">
                      <strong>Request UUID:</strong>{" "}
                      {receiptDetails.requestUUID || "N/A"}
                    </p>
                    <p className="text-gray-400">
                      <strong>Is Fulfilled:</strong>{" "}
                      {receiptDetails.isFulfilled ? "Yes" : "No"}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Deposit Button for Step 1 */}
            <button
              onClick={handleCommit}
              className={`mt-3 p-2 text-lg rounded-lg font-bold w-full ${
                hasReceipt
                  ? "bg-gray-500 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white"
              }`}
              disabled={hasReceipt || tshotAmount <= 0}
            >
              {hasReceipt ? "Completed" : "Deposit $TSHOT"}
            </button>
          </div>

          {/* Step 2: Receive Moments */}
          <div
            className={`w-1/2 p-4 text-center rounded-lg border-2 h-56 flex flex-col justify-between ${
              hasReceipt
                ? "border-green-500 bg-gray-700"
                : "border-gray-500 bg-gray-800"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                hasReceipt ? "text-green-500" : "text-gray-500"
              }`}
            >
              {hasReceipt ? "Current Step" : "Upcoming Step"}
            </p>
            <p
              className={`text-white font-semibold ${
                !hasReceipt ? "text-gray-300" : ""
              }`}
            >
              Step 2: Receive Moments
            </p>
            <p className="text-gray-300 text-sm mt-1">
              {hasReceipt
                ? "Proceed to claim your Moments."
                : "Complete Step 1 to unlock Step 2."}
            </p>

            {/* Receive Button for Step 2 */}
            <button
              onClick={handleReveal}
              className={`mt-3 p-2 text-lg rounded-lg font-bold w-full ${
                hasReceipt
                  ? "bg-green-600 text-white"
                  : "bg-gray-500 text-white cursor-not-allowed"
              }`}
              disabled={!hasReceipt}
            >
              Receive Moments
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TSHOTToNFTPanel;
