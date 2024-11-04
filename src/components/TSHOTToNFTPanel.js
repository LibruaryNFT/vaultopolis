// src/components/TSHOTToNFTPanel.js
import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import { getReceiptDetails } from "../flow/getReceiptDetails"; // Import the script
import { FaArrowDown, FaCheckCircle } from "react-icons/fa";

const TSHOTToNFTPanel = ({ setIsNFTToTSHOT }) => {
  const {
    user,
    tshotBalance,
    dispatch,
    refreshBalances,
    hasReceipt,
    nftDetails = [],
  } = useContext(UserContext);

  const [tshotAmount, setTshotAmount] = useState(0);
  const [totalCommons, setTotalCommons] = useState(0);
  const [showReceiptDetails, setShowReceiptDetails] = useState(false);
  const [receiptData, setReceiptData] = useState({});

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

  const fetchReceiptDetails = async () => {
    if (!showReceiptDetails) {
      try {
        const result = await fcl.query({
          cadence: getReceiptDetails,
          args: (arg, t) => [arg(user.addr, t.Address)],
        });
        setReceiptData(result);
      } catch (error) {
        console.error("Failed to fetch receipt details:", error);
      }
    }
    setShowReceiptDetails(!showReceiptDetails);
  };

  const handleCommit = async () => {
    if (!user.loggedIn) {
      fcl.authenticate();
      return;
    }

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
    if (!user.loggedIn) {
      fcl.authenticate();
      return;
    }

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
    <div className="p-4 bg-gray-900 rounded-lg space-y-4">
      {/* Give Section */}
      <div className="flex flex-col items-start bg-gray-800 p-3 rounded-lg mb-2">
        <div className="text-gray-400 mb-1">Give</div>
        <div className="text-lg font-bold text-white flex items-center">
          <input
            type="number"
            value={tshotAmount || ""}
            onChange={handleTshotChange}
            className="text-lg font-bold bg-gray-700 text-white rounded-lg text-center px-2 py-1 mr-2"
            min="0"
            step="0.1"
            style={{ width: "70px" }}
          />
          <span>$TSHOT</span>
        </div>
        <small className="text-gray-500">
          Balance: {parseFloat(tshotBalance || 0).toFixed(2)} $TSHOT
        </small>
      </div>

      {/* Centered Down Arrow */}
      <div className="flex justify-center my-1">
        <FaArrowDown
          className="text-white text-2xl cursor-pointer"
          onClick={() => setIsNFTToTSHOT(true)}
        />
      </div>

      {/* Receive Section */}
      <div className="flex flex-col items-start bg-gray-800 p-3 rounded-lg mb-4">
        <div className="text-gray-400 mb-1">Receive</div>
        <div className="text-lg font-bold text-white">
          {tshotAmount || 0} Random TopShot Commons
        </div>
        <small className="text-gray-500">
          Balance: {totalCommons || 0} TopShot Commons
        </small>
      </div>

      {/* Step Guide with Deposit and Receive Buttons */}
      <div className="flex justify-between items-center space-x-4">
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
          <button
            onClick={user.loggedIn ? handleCommit : fcl.authenticate}
            className={`mt-3 p-2 text-lg rounded-lg font-bold w-full ${
              hasReceipt ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600"
            } text-white`}
          >
            {user.loggedIn
              ? hasReceipt
                ? "Completed"
                : "Deposit $TSHOT"
              : "Connect Wallet"}
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
          <p className="text-white font-semibold">Step 2: Receive Moments</p>
          {hasReceipt && (
            <button
              onClick={fetchReceiptDetails}
              className="text-blue-300 underline text-xs mt-2"
            >
              {showReceiptDetails ? "Hide Receipt Details" : "Receipt Details"}
            </button>
          )}
          {showReceiptDetails && (
            <div className="mt-2 bg-gray-800 p-3 rounded-lg">
              <p className="text-gray-400">
                <strong>$TSHOT Swap Amount:</strong>{" "}
                {receiptData.betAmount || "N/A"}
              </p>
              <p className="text-gray-400">
                <strong>Request Block:</strong>{" "}
                {receiptData.requestBlock || "N/A"}
              </p>
              <p className="text-gray-400">
                <strong>Can Fulfill:</strong>{" "}
                {receiptData.canFulfill ? "Yes" : "No"}
              </p>
              <p className="text-gray-400">
                <strong>Request UUID:</strong>{" "}
                {receiptData.requestUUID || "N/A"}
              </p>
              <p className="text-gray-400">
                <strong>Is Fulfilled:</strong>{" "}
                {receiptData.isFulfilled ? "Yes" : "No"}
              </p>
            </div>
          )}
          <button
            onClick={user.loggedIn ? handleReveal : fcl.authenticate}
            className={`mt-3 p-2 text-lg rounded-lg font-bold w-full ${
              hasReceipt ? "bg-green-600" : "bg-gray-500"
            } text-white`}
            disabled={!hasReceipt && user.loggedIn}
          >
            {user.loggedIn
              ? hasReceipt
                ? "Receive Moments"
                : "Complete Step 1"
              : "Connect Wallet"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TSHOTToNFTPanel;
