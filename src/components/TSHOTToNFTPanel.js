import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import { destroyReceipt } from "../flow/destroyReceipt";
import { FaArrowDown, FaCheckCircle } from "react-icons/fa";
import useTransaction from "../hooks/useTransaction";

const TSHOTToNFTPanel = ({
  isNFTToTSHOT,
  setIsNFTToTSHOT,
  onTransactionStart,
}) => {
  const {
    accountData,
    selectedAccount,
    isSelectedChild,
    refreshBalances,
    user,
  } = useContext(UserContext);

  // Determine active account
  const activeAccountAddr = selectedAccount || accountData.parentAddress;
  const activeAccountData = isSelectedChild
    ? accountData.childrenData.find((child) => child.addr === activeAccountAddr)
    : accountData;

  const {
    tshotBalance = 0,
    nftDetails = [],
    hasReceipt,
    receiptDetails = {},
  } = activeAccountData || {};

  const [tshotAmount, setTshotAmount] = useState(0);
  const [totalCommons, setTotalCommons] = useState(0);
  const [showReceiptDetails, setShowReceiptDetails] = useState(false);

  const { sendTransaction } = useTransaction();

  useEffect(() => {
    const calculateTotalCommons = () => {
      const commons = nftDetails.filter(
        (nft) => nft.tier?.toLowerCase() === "common" && !nft.isLocked
      );
      setTotalCommons(commons.length);
    };

    if (nftDetails.length > 0) {
      calculateTotalCommons();
    }
  }, [nftDetails]);

  const handleCommit = async () => {
    if (!user.loggedIn) {
      fcl.authenticate();
      return;
    }

    if (tshotAmount <= 0) {
      alert("Please enter a valid $TSHOT amount.");
      return;
    }

    const nftCount = tshotAmount;

    try {
      onTransactionStart({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount,
        tshotAmount,
        swapType: "TSHOT_TO_NFT",
        transactionAction: "COMMIT_SWAP",
      });

      const tshotAmountDecimal = `${tshotAmount.toFixed(1)}`;

      await sendTransaction({
        cadence: commitSwap,
        args: (arg, t) => [arg(tshotAmountDecimal, t.UFix64)],
        limit: 9999,
        onUpdate: (transactionData) => {
          onTransactionStart({
            ...transactionData,
            nftCount,
            tshotAmount,
            swapType: "TSHOT_TO_NFT",
            transactionAction: "COMMIT_SWAP",
          });
        },
      });

      await refreshBalances(activeAccountAddr);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const handleReveal = async () => {
    if (!user.loggedIn) {
      fcl.authenticate();
      return;
    }

    if (!hasReceipt) {
      alert("You need to complete the deposit step before claiming.");
      return;
    }

    try {
      const tshotAmountFromReceipt = parseInt(receiptDetails.betAmount) || 0;
      const nftCount = tshotAmountFromReceipt;

      onTransactionStart({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount,
        tshotAmount: tshotAmountFromReceipt,
        swapType: "TSHOT_TO_NFT",
        transactionAction: "REVEAL_SWAP",
      });

      await sendTransaction({
        cadence: revealSwap,
        limit: 9999,
        onUpdate: (transactionData) => {
          onTransactionStart({
            ...transactionData,
            nftCount,
            tshotAmount: tshotAmountFromReceipt,
            swapType: "TSHOT_TO_NFT",
            transactionAction: "REVEAL_SWAP",
          });
        },
      });

      await refreshBalances(activeAccountAddr);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const handleDestroyReceipt = async () => {
    if (!user.loggedIn) {
      fcl.authenticate();
      return;
    }

    try {
      onTransactionStart({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount: 0,
        tshotAmount: 0,
        swapType: "TSHOT_TO_NFT",
        transactionAction: "DESTROY_RECEIPT",
      });

      await sendTransaction({
        cadence: destroyReceipt,
        limit: 9999,
        onUpdate: (transactionData) => {
          onTransactionStart({
            ...transactionData,
            nftCount: 0,
            tshotAmount: 0,
            swapType: "TSHOT_TO_NFT",
            transactionAction: "DESTROY_RECEIPT",
          });
        },
      });

      await refreshBalances(activeAccountAddr);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const handleTshotChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTshotAmount(parseInt(value) || 0);
    }
  };

  const handleKeyPress = (e) => {
    const charCode = e.which || e.keyCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };

  return (
    <div className="rounded-lg space-y-1">
      {/* Swap Mode Section */}
      <div className="flex items-center justify-center space-x-4 mb-2">
        <span
          className={`text-gray-400 font-semibold ${
            isNFTToTSHOT ? "text-white" : ""
          }`}
        >
          Moment to $TSHOT
        </span>
        <div
          className="relative w-12 h-6 bg-gray-700 rounded-full cursor-pointer"
          onClick={() => setIsNFTToTSHOT(!isNFTToTSHOT)}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-flow-dark rounded-full transition-transform ${
              isNFTToTSHOT ? "translate-x-0.5" : "translate-x-6"
            }`}
          />
        </div>
        <span
          className={`text-gray-400 font-semibold ${
            !isNFTToTSHOT ? "text-white" : ""
          }`}
        >
          $TSHOT to Moment
        </span>
      </div>

      {/* Sell Section */}
      <div className="flex flex-col items-start bg-gray-800 p-2 rounded-lg">
        <div className="text-gray-400 mb-1">Sell</div>
        <div className="text-3xl font-bold text-white flex items-center">
          {hasReceipt ? (
            <>
              <span>{parseFloat(receiptDetails.betAmount || 0)}</span>
              <span className="ml-2">$TSHOT</span>
            </>
          ) : (
            <>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={tshotAmount || ""}
                onChange={handleTshotChange}
                onKeyPress={handleKeyPress}
                className="text-3xl font-bold bg-gray-700 text-white rounded-lg text-center px-2 py-1 mr-2 appearance-none focus:outline-none"
                disabled={hasReceipt}
                style={{
                  width: "150px",
                }}
              />
              <span>$TSHOT</span>
            </>
          )}
        </div>
        <small className="text-gray-500">
          Balance: {parseFloat(tshotBalance || 0).toFixed(2)} $TSHOT
        </small>
      </div>

      {/* Centered Down Arrow */}
      <div
        className="flex justify-center rounded-lg bg-gray-800 py-5 cursor-pointer"
        onClick={() => setIsNFTToTSHOT(true)}
      >
        <FaArrowDown className="text-white text-2xl" />
      </div>

      {/* Buy Section */}
      <div className="flex flex-col items-start bg-gray-800 p-2 rounded-lg mb-4">
        <div className="text-gray-400 mb-1">Buy</div>
        <div className="text-3xl font-bold text-white">
          {hasReceipt
            ? `${parseFloat(
                receiptDetails.betAmount || 0
              )} Random TopShot Commons`
            : `${tshotAmount || 0} Random TopShot Commons`}
        </div>
        <small className="text-gray-500">
          Balance: {totalCommons || 0} TopShot Commons
        </small>
      </div>

      {/* Steps: Deposit and Claim */}
      <div className="flex justify-between items-center space-x-4">
        {/* Deposit $TSHOT */}
        <div
          className={`w-1/2 p-4 text-center rounded-lg border-2 h-124 flex flex-col justify-between ${
            hasReceipt
              ? "border-gray-500 bg-gray-800"
              : "border-flow-dark bg-gray-700"
          }`}
        >
          <p
            className={`text-sm font-bold ${
              hasReceipt ? "text-gray-500" : "text-flow-dark"
            }`}
          >
            {hasReceipt ? "Completed" : "Current Step"}
          </p>
          <p className="text-white font-semibold flex items-center justify-center">
            Step 1: Deposit $TSHOT and Receive a Receipt
            {hasReceipt && <FaCheckCircle className="ml-2 text-gray-500" />}
          </p>

          <button
            onClick={user.loggedIn ? handleCommit : fcl.authenticate}
            className={`mt-3 p-2 text-lg rounded-lg font-bold w-full ${
              hasReceipt ? "bg-gray-500 cursor-not-allowed" : "bg-flow-dark"
            } text-white`}
            disabled={hasReceipt}
          >
            {user.loggedIn
              ? hasReceipt
                ? "Completed"
                : "Deposit $TSHOT"
              : "Connect Wallet"}
          </button>
        </div>

        {/* Claim Moments */}
        <div
          className={`w-1/2 p-4 text-center rounded-lg border-2 h-124 flex flex-col justify-between ${
            hasReceipt
              ? "border-flow-dark bg-gray-700"
              : "border-gray-500 bg-gray-800"
          }`}
        >
          <p
            className={`text-sm font-bold ${
              hasReceipt ? "text-flow-dark" : "text-gray-500"
            }`}
          >
            {hasReceipt ? "Current Step" : "Upcoming Step"}
          </p>
          <p className="text-white font-semibold flex items-center justify-center">
            Step 2: Submit Receipt and Receive Moments
          </p>

          {hasReceipt && (
            <button
              onClick={() => setShowReceiptDetails(!showReceiptDetails)}
              className="text-blue-300 underline text-xs mt-2"
            >
              {showReceiptDetails ? "Hide Receipt Details" : "Receipt Details"}
            </button>
          )}

          {showReceiptDetails && (
            <div className="mt-2 bg-gray-800 p-3 rounded-lg">
              <p className="text-gray-400">
                <strong>$TSHOT Swap Amount:</strong>{" "}
                {parseFloat(receiptDetails.betAmount || 0)}
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
              <button
                onClick={handleDestroyReceipt}
                className="mt-3 p-2 bg-red-600 text-white rounded-lg font-bold w-full"
              >
                Destroy Receipt
              </button>
            </div>
          )}

          <button
            onClick={user.loggedIn ? handleReveal : fcl.authenticate}
            className={`mt-3 p-2 text-lg rounded-lg font-bold w-full ${
              hasReceipt ? "bg-flow-dark" : "bg-gray-500"
            } text-white`}
            disabled={!hasReceipt}
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
