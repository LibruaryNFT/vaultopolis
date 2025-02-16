import React, { useContext } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import useTransaction from "../hooks/useTransaction";
import { revealSwap } from "../flow/revealSwap";
import AccountSelection from "./AccountSelection";

const TSHOTToNFTPanel = ({
  onDeposit, // Function to trigger the deposit transaction
  depositDisabled, // Flag to disable deposit button
}) => {
  const { user, accountData, selectedAccount } = useContext(UserContext);
  const { sendTransaction } = useTransaction();
  const isLoggedIn = Boolean(user?.loggedIn);

  // Ensure the user is connected
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

  // A receipt exists when the deposit has been made
  const hasReceipt = accountData?.hasReceipt;

  // Helper: Get the data for the currently selected account.
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

  // When receiving (revealing), make sure the selected account has a TopShot collection.
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
      // Optionally, you can integrate a callback here (e.g. onTransactionStart) to update your UI.
      await sendTransaction({
        cadence: revealSwap,
        args: (arg, t) => [arg(selectedAccount, t.Address)],
        limit: 9999,
        onUpdate: (transactionData) => {
          // Update your UI based on transaction progress if needed.
          console.log("Transaction update:", transactionData);
        },
      });
    } catch (error) {
      console.error("Reveal transaction failed:", error);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {!hasReceipt ? (
        // If no receipt, show the deposit action button
        <button
          onClick={onDeposit}
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
          {/* When a receipt exists, show the Receive button */}
          <button
            onClick={handleReveal}
            className="w-full p-4 text-lg rounded-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest"
          >
            Receive Random Moments
          </button>
          {/* Add a margin so the homepage background is visible between the action and the account selector */}
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
