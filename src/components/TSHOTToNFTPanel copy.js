import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import * as fcl from "@onflow/fcl";
import useTransaction from "../hooks/useTransaction";
import { revealSwap } from "../flow/revealSwap";
import { commitSwap } from "../flow/commitSwap"; // Import commitSwap cadence script
import AccountSelection from "./AccountSelection";

const TSHOTToNFTPanel = ({
  sellAmount,
  depositDisabled,
  onTransactionStart,
}) => {
  const { user, accountData, selectedAccount, dispatch } =
    useContext(UserContext);
  const { sendTransaction } = useTransaction();
  const isLoggedIn = Boolean(user?.loggedIn);

  // Ensure the user is connected.
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

  // A receipt exists when the deposit has been made.
  const hasReceipt = accountData?.hasReceipt;

  // Helper: Get data for the currently selected account.
  const getSelectedAccountData = () => {
    if (selectedAccount === accountData?.parentAddress) {
      return accountData;
    }
    if (accountData?.childrenData) {
      return accountData.childrenData.find(
        (child) => child.addr === selectedAccount
      );
    }
    return null;
  };
  const selectedAccountData = getSelectedAccountData();

  // Always use the parent account for deposit.
  const activeParentAddress = accountData?.parentAddress || user?.addr;

  // Deposit handler: trigger commitSwap.
  const handleDeposit = async () => {
    // Force the selected account to the parent if necessary.
    if (selectedAccount !== activeParentAddress) {
      console.log(
        "Forcing deposit to use parent account:",
        activeParentAddress
      );
      dispatch({
        type: "SET_SELECTED_ACCOUNT",
        payload: { address: activeParentAddress, type: "parent" },
      });
    }
    if (!activeParentAddress || !activeParentAddress.startsWith("0x")) {
      console.error(
        "No valid parent address for deposit:",
        activeParentAddress
      );
      return;
    }
    // Convert sellAmount to a UFix64 string with one decimal.
    const betAmount = Number(sellAmount).toFixed(1);
    // Trigger modal update to show "Awaiting Approval"
    if (onTransactionStart) {
      onTransactionStart({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        tshotAmount: sellAmount,
        transactionAction: "COMMIT_SWAP",
      });
    }
    console.log(
      "Depositing TSHOT with bet amount:",
      betAmount,
      "from",
      activeParentAddress
    );
    try {
      await sendTransaction({
        cadence: commitSwap,
        args: (arg, t) => [arg(betAmount, t.UFix64)],
        limit: 9999,
        onUpdate: (transactionData) => {
          console.log("Deposit transaction update:", transactionData);
          if (onTransactionStart) {
            onTransactionStart({
              ...transactionData,
              tshotAmount: sellAmount,
              transactionAction: "COMMIT_SWAP",
            });
          }
        },
      });
    } catch (error) {
      console.error("Deposit transaction failed:", error);
    }
  };

  // Reveal handler when a receipt exists.
  const handleReveal = async () => {
    if (!selectedAccountData?.hasCollection) {
      alert(
        "The selected account does not have a TopShot collection. Please select an account that has a TopShot collection."
      );
      return;
    }
    if (!selectedAccount || !selectedAccount.startsWith("0x")) {
      alert("Error: Invalid receive account address.");
      return;
    }
    try {
      await sendTransaction({
        cadence: revealSwap,
        args: (arg, t) => [arg(selectedAccount, t.Address)],
        limit: 9999,
        onUpdate: (transactionData) => {
          console.log("Reveal transaction update:", transactionData);
          if (onTransactionStart) {
            onTransactionStart({
              ...transactionData,
              transactionAction: "REVEAL_SWAP",
            });
          }
        },
      });
    } catch (error) {
      console.error("Reveal transaction failed:", error);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {!hasReceipt ? (
        // If no receipt exists, show the deposit button.
        <button
          onClick={handleDeposit}
          disabled={depositDisabled}
          className={`w-full p-4 text-lg rounded-lg font-bold text-white ${
            depositDisabled
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-flow-dark hover:bg-flow-darkest"
          }`}
        >
          Deposit TSHOT
        </button>
      ) : (
        <>
          {/* When a receipt exists, show the Reveal button */}
          <button
            onClick={handleReveal}
            className="w-full p-4 text-lg rounded-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest"
          >
            Receive Random Moments
          </button>
          <div className="mt-4">
            <p className="text-sm text-white mb-4">
              Select the account to receive the moments:
            </p>
            <AccountSelection
              parentAccount={{
                addr: accountData?.parentAddress,
                ...accountData,
              }}
              childrenAccounts={accountData?.childrenData || []}
              selectedAccount={selectedAccount}
              onSelectAccount={() => {}}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TSHOTToNFTPanel;
