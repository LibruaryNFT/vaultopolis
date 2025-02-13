import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import useTransaction from "../hooks/useTransaction";
import { getReceiptDetails } from "../flow/getReceiptDetails";
import AccountSelection from "./AccountSelection"; // Import the AccountSelection component

const TSHOTToNFTPanel = ({
  isNFTToTSHOT,
  setIsNFTToTSHOT,
  onTransactionStart,
}) => {
  const { accountData, selectedAccount, user, setSelectedAccount } =
    useContext(UserContext);

  // Use the selectedAccount from context or default to the parent's address
  const activeAccountAddr = selectedAccount || accountData.parentAddress;

  const {
    tshotBalance = 0,
    childrenData = [],
    hasReceipt = false,
    tierCounts = {},
  } = accountData || {};

  const [tshotAmount, setTshotAmount] = useState(0);
  const [selectedRecipient, setSelectedRecipient] = useState(activeAccountAddr);
  const [betAmount, setBetAmount] = useState(0);

  const { sendTransaction } = useTransaction();

  useEffect(() => {
    const fetchBetAmount = async () => {
      if (hasReceipt && activeAccountAddr) {
        try {
          const result = await fcl.query({
            cadence: getReceiptDetails,
            args: (arg, t) => [arg(activeAccountAddr, t.Address)],
          });
          const fetchedBetAmount = parseInt(result.betAmount || 0, 10);
          setBetAmount(fetchedBetAmount);
          console.log("Fetched betAmount:", fetchedBetAmount);
        } catch (error) {
          console.error("Error fetching betAmount:", error);
        }
      }
    };

    fetchBetAmount();
  }, [hasReceipt, activeAccountAddr]);

  const handleCommit = async () => {
    if (!user.loggedIn) {
      fcl.authenticate();
      return;
    }

    if (tshotAmount <= 0) {
      alert("Please enter a valid $TSHOT amount.");
      return;
    }

    const tshotAmountDecimal = `${tshotAmount.toFixed(1)}`;

    try {
      onTransactionStart({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        tshotAmount,
        swapType: "TSHOT_TO_NFT",
        transactionAction: "DEPOSIT",
      });

      await sendTransaction({
        cadence: commitSwap,
        args: (arg, t) => [arg(tshotAmountDecimal, t.UFix64)],
        limit: 9999,
        onUpdate: (transactionData) => {
          onTransactionStart({
            ...transactionData,
            tshotAmount,
            swapType: "TSHOT_TO_NFT",
            transactionAction: "DEPOSIT",
          });
        },
      });
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const handleReveal = async () => {
    if (!user.loggedIn) {
      fcl.authenticate();
      return;
    }

    try {
      onTransactionStart({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount: betAmount,
        swapType: "TSHOT_TO_NFT",
        transactionAction: "RECEIVE",
      });

      await sendTransaction({
        cadence: revealSwap,
        args: (arg, t) => [arg(selectedRecipient, t.Address)],
        limit: 9999,
        onUpdate: (transactionData) => {
          onTransactionStart({
            ...transactionData,
            nftCount: betAmount,
            swapType: "TSHOT_TO_NFT",
            transactionAction: "RECEIVE",
          });
        },
      });
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const renderAccountInfo = (
    label,
    accountAddr,
    tshotBalance,
    commonMoments
  ) => (
    <div
      key={accountAddr}
      className={`p-2 w-48 flex-shrink-0 text-center rounded-lg border-4 cursor-pointer ${
        selectedRecipient === accountAddr
          ? "border-green-500 bg-gray-700"
          : "border-gray-500 bg-gray-800"
      }`}
      onClick={() => setSelectedRecipient(accountAddr)}
    >
      <h4 className="text-sm font-semibold text-white">{label}</h4>
      <p className="text-xs text-gray-400 truncate">{accountAddr}</p>
      <div className="mt-2">
        <p className="text-base font-semibold text-white">
          {parseFloat(tshotBalance).toFixed(1)} $TSHOT
        </p>
        <p className="text-sm text-gray-300">
          {commonMoments || 0} Common Moments
        </p>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg space-y-4">
      {/* Toggle Mode Section */}
      <div className="flex items-center justify-center space-x-4">
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

      {/* Account Selection Section */}
      {user.loggedIn && (
        <AccountSelection
          parentAccount={{ addr: accountData.parentAddress, ...accountData }}
          childrenAccounts={childrenData || []}
          selectedAccount={activeAccountAddr}
          onSelectAccount={setSelectedAccount}
        />
      )}

      {/* Step 1: Deposit $TSHOT */}
      <div
        className={`relative flex flex-col items-start bg-gray-800 p-4 rounded-lg ${
          hasReceipt ? "bg-gray-900 bg-opacity-75" : ""
        }`}
      >
        {hasReceipt && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center rounded-lg">
            <p className="bg-yellow-500 text-black px-6 py-3 font-semibold text-lg rounded-lg w-full text-center">
              Complete Step 2
            </p>
          </div>
        )}
        <h3 className="text-lg font-semibold text-white mb-2">
          Step 1: Deposit $TSHOT (from {activeAccountAddr})
        </h3>
        <div className="flex items-center">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={tshotAmount || 0}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d+$/.test(value)) {
                setTshotAmount(parseInt(value, 10) || 0);
              } else if (value === "") {
                setTshotAmount(0);
              }
            }}
            className="text-2xl font-bold bg-gray-700 text-white rounded-lg text-center px-2 py-1 mr-2 appearance-none focus:outline-none"
            style={{ width: "150px" }}
          />
          <span className="text-white text-lg font-bold">
            {`$TSHOT = ${tshotAmount || 0} Random Commons`}
          </span>
        </div>
        <button
          onClick={handleCommit}
          className={`mt-4 p-2 text-lg rounded-lg font-bold w-full ${
            tshotAmount > 0
              ? "bg-flow-dark hover:bg-flow-darkest"
              : "bg-gray-600 cursor-not-allowed"
          } text-white`}
          disabled={tshotAmount <= 0}
        >
          Deposit $TSHOT
        </button>
      </div>

      {/* Step 2: Receive Moments */}
      <div className="relative flex flex-col items-start bg-gray-800 p-4 rounded-lg">
        {!hasReceipt && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center rounded-lg">
            <p className="bg-yellow-500 text-black px-6 py-3 font-semibold text-lg rounded-lg w-full text-center">
              Complete Step 1
            </p>
          </div>
        )}
        <h3 className="text-lg font-semibold text-white mb-2">
          Step 2: Receive Random Common Moments
        </h3>
        <p className="text-gray-400 mb-2">
          Select the account where you want to receive the moments:
        </p>
        <div className="flex space-x-2 overflow-auto">
          {renderAccountInfo(
            "Parent Account",
            accountData.parentAddress,
            accountData.tshotBalance,
            tierCounts.common
          )}
          {childrenData.map((child, index) =>
            renderAccountInfo(
              `Child Account ${index + 1}`,
              child.addr,
              child.tshotBalance,
              child.tierCounts?.common || 0
            )
          )}
        </div>
        <button
          onClick={handleReveal}
          className={`mt-4 p-2 text-lg rounded-lg font-bold w-full ${
            hasReceipt
              ? "bg-flow-dark hover:bg-flow-darkest"
              : "bg-gray-600 cursor-not-allowed"
          } text-white`}
          disabled={!hasReceipt}
        >
          Receive {betAmount} Random Common Moments
        </button>
      </div>
    </div>
  );
};

export default TSHOTToNFTPanel;
