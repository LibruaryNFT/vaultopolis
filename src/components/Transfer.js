import React, { useState, useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";
import { transferTSHOT } from "../flow/transferTSHOT";

const Transfer = () => {
  const { user, accountData, loadParentData } = useContext(UserContext);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const isLoggedIn = !!user?.loggedIn;
  const parentAddr = accountData?.parentAddress || user?.addr;
  const tshotBalance = accountData?.tshotBalance || 0;

  const handleTransfer = async () => {
    try {
      setStatus("Awaiting Approval");
      setError(null);

      // Basic validation
      if (!isLoggedIn) {
        throw new Error("You must be logged in to send TSHOT.");
      }
      if (!toAddress.startsWith("0x")) {
        throw new Error("Invalid recipient address. Must start with 0x.");
      }
      if (parseFloat(amount) <= 0) {
        throw new Error("Amount must be a positive number.");
      }
      if (parseFloat(amount) > tshotBalance) {
        throw new Error("Insufficient TSHOT balance for this transfer.");
      }

      // Send transaction
      const txId = await fcl.mutate({
        cadence: transferTSHOT,
        args: (arg, t) => [arg(amount, t.UFix64), arg(toAddress, t.Address)],
        proposer: fcl.currentUser, // or simply omit if FCL automatically uses currentUser
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 9999,
      });

      setStatus("Transaction Submitted");

      // Wait for transaction to be sealed
      const sealedTx = await fcl.tx(txId).onceSealed();
      if (sealedTx.status === 4) {
        setStatus("Transaction Sealed Successfully");
      } else {
        setStatus(`Transaction Error (status: ${sealedTx.status})`);
      }

      // Refresh user’s TSHOT balance
      if (parentAddr) {
        await loadParentData(parentAddr);
      }
    } catch (err) {
      console.error("Transfer TSHOT Error:", err);
      setError(err.message || String(err));
      setStatus(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="p-4 bg-gray-800 text-white rounded">
        <p className="mb-2">You are not logged in.</p>
        <button
          onClick={() => fcl.authenticate()}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded w-full max-w-md mx-auto">
      <h2 className="text-xl text-white mb-4">Transfer TSHOT</h2>

      <div className="mb-4">
        <p className="text-white text-sm">Your TSHOT Balance:</p>
        <p className="text-lg text-green-400 font-bold">
          {Number(tshotBalance).toFixed(2)} TSHOT
        </p>
      </div>

      {/* Recipient address */}
      <label className="block mb-2 text-sm text-white">Recipient Address</label>
      <input
        type="text"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        placeholder="0xRecipient"
        className="w-full p-2 rounded bg-gray-700 text-white mb-4"
      />

      {/* Amount */}
      <label className="block mb-2 text-sm text-white">Amount to Send</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.0"
        className="w-full p-2 rounded bg-gray-700 text-white mb-4"
      />

      <button
        onClick={handleTransfer}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
      >
        Send TSHOT
      </button>

      {/* Status & Error messages */}
      {status && <p className="mt-4 text-yellow-400">{status}</p>}
      {error && <p className="mt-2 text-red-400">Error: {error}</p>}
    </div>
  );
};

export default Transfer;
