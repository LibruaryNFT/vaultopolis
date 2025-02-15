import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import useTransaction from "../hooks/useTransaction";
import { getReceiptDetails } from "../flow/getReceiptDetails";
import AccountSelection from "./AccountSelection";

const TSHOTToNFTPanel = ({ onTransactionStart }) => {
  const { accountData, selectedAccount, user } = useContext(UserContext);
  const isLoggedIn = Boolean(user?.loggedIn);

  const initialAccount = isLoggedIn
    ? selectedAccount || accountData?.parentAddress || user?.addr
    : "";
  const [depositAccount, setDepositAccount] = useState(initialAccount);
  const [receiveAccount, setReceiveAccount] = useState(initialAccount);
  const [tshotAmount, setTshotAmount] = useState(0);
  const [betAmount, setBetAmount] = useState(0);
  const { sendTransaction } = useTransaction();

  useEffect(() => {
    console.log("User address:", user?.addr);
    console.log("AccountData parent address:", accountData?.parentAddress);
    console.log("Active account (fallback):", initialAccount);
  }, [user, accountData?.parentAddress, initialAccount]);

  useEffect(() => {
    console.log("Receive account updated:", receiveAccount);
  }, [receiveAccount]);

  useEffect(() => {
    const fetchBetAmount = async () => {
      if (accountData?.hasReceipt && depositAccount) {
        try {
          const result = await fcl.query({
            cadence: getReceiptDetails,
            args: (arg, t) => [arg(depositAccount, t.Address)],
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
  }, [accountData?.hasReceipt, depositAccount]);

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => fcl.authenticate()}
        className="w-full text-lg rounded-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest p-0"
      >
        Connect Wallet
      </button>
    );
  }

  const handleCommit = async () => {
    if (tshotAmount <= 0) {
      alert("Please enter a valid TSHOT amount.");
      return;
    }
    if (!depositAccount || !depositAccount.startsWith("0x")) {
      console.error("Invalid deposit account address:", depositAccount);
      alert("Error: Invalid deposit account address.");
      return;
    }
    const tshotAmountDecimal = `${tshotAmount.toFixed(1)}`;
    try {
      onTransactionStart({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        tshotAmount,
        swapType: "TSHOT_TO_MOMENTS",
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
            swapType: "TSHOT_TO_MOMENTS",
            transactionAction: "DEPOSIT",
          });
        },
      });
    } catch (error) {
      console.error("Transaction failed (Commit):", error);
    }
  };

  const handleReveal = async () => {
    if (!receiveAccount || !receiveAccount.startsWith("0x")) {
      console.error("Invalid receive account address:", receiveAccount);
      alert("Error: Invalid receive account address.");
      return;
    }
    const debugGetAccount = async (addr) => {
      try {
        const response = await fcl.send([fcl.getAccount(addr)]);
        const account = await fcl.decode(response);
        console.log(`Debug: fcl.getAccount(${addr}) returned:`, account);
        return account;
      } catch (error) {
        console.error(`Debug: Error fetching account ${addr}:`, error);
        return null;
      }
    };
    const debugAccount = await debugGetAccount(receiveAccount);
    if (!debugAccount || !debugAccount.address) {
      console.error("Selected receive account does not exist:", receiveAccount);
      alert(
        "The selected receive account does not exist on mainnet. Please select a valid account."
      );
      return;
    }
    try {
      onTransactionStart({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount: betAmount,
        swapType: "TSHOT_TO_MOMENTS",
        transactionAction: "RECEIVE",
      });
      await sendTransaction({
        cadence: revealSwap,
        args: (arg, t) => [arg(receiveAccount, t.Address)],
        limit: 9999,
        onUpdate: (transactionData) => {
          onTransactionStart({
            ...transactionData,
            nftCount: betAmount,
            swapType: "TSHOT_TO_MOMENTS",
            transactionAction: "RECEIVE",
          });
        },
      });
    } catch (error) {
      console.error("Transaction failed (Reveal):", error);
    }
  };

  return (
    <div className="rounded-lg space-y-4">
      {/* Step 1: Deposit TSHOT */}
      <div className="bg-gray-700 p-4 rounded-lg mb-4">
        {accountData?.hasReceipt ? (
          <div className="flex items-center justify-center">
            <p className="text-gray-300 px-6 py-3 font-semibold text-lg">
              Step 1 complete. Deposit disabled.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col mb-4">
              <h3 className="text-lg font-semibold text-white">
                Step 1: Deposit TSHOT
              </h3>
              <p className="text-sm text-white">
                Select the account to deposit TSHOT from:
              </p>
              <AccountSelection
                parentAccount={{
                  addr: accountData?.parentAddress,
                  ...accountData,
                }}
                childrenAccounts={accountData?.childrenData || []}
                selectedAccount={depositAccount}
                onSelectAccount={setDepositAccount}
              />
            </div>
            <div className="flex items-center">
              <input
                type="number"
                value={tshotAmount || 0}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d+$/.test(value)) {
                    setTshotAmount(parseInt(value, 10) || 0);
                  } else if (value === "") {
                    setTshotAmount(0);
                  }
                }}
                className="text-2xl font-bold bg-gray-700 text-white rounded-lg text-center px-2 py-1 mr-2 w-32"
                placeholder="0"
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "textfield",
                  appearance: "none",
                  overflow: "hidden",
                }}
              />
              <span className="text-white text-lg font-bold">
                {`TSHOT = ${tshotAmount || 0} Random Commons`}
              </span>
            </div>
            <button
              onClick={handleCommit}
              className="mt-4 p-2 text-lg rounded-lg font-bold w-full bg-flow-dark hover:bg-flow-darkest text-white"
              disabled={tshotAmount <= 0}
            >
              Deposit TSHOT
            </button>
          </>
        )}
      </div>

      {/* Step 2: Receive Moments */}
      <div className="bg-gray-700 p-4 rounded-lg">
        {!accountData?.hasReceipt ? (
          <div className="flex items-center justify-center">
            <p className="text-gray-300 px-6 py-3 font-semibold text-lg">
              Complete Step 1
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col mb-4">
              <h3 className="text-lg font-semibold text-white">
                Step 2: Receive Moments
              </h3>
              <p className="text-sm text-white">
                Select the account to receive the moments:
              </p>
              <AccountSelection
                parentAccount={{
                  addr: accountData?.parentAddress,
                  ...accountData,
                }}
                childrenAccounts={accountData?.childrenData || []}
                selectedAccount={receiveAccount}
                onSelectAccount={setReceiveAccount}
              />
            </div>
            <div className="flex flex-col items-start w-full">
              <div className="text-white text-sm font-semibold mb-2">
                Receive
              </div>
              <p className="text-2xl font-bold text-white">
                {betAmount || 0} Random Common Moments
              </p>
            </div>
            <button
              onClick={handleReveal}
              className="mt-4 p-2 text-lg rounded-lg font-bold w-full bg-flow-dark hover:bg-flow-darkest text-white"
              disabled={!accountData?.hasReceipt}
            >
              Receive {betAmount} Random Common Moments
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TSHOTToNFTPanel;
