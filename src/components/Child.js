import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { setupChild } from "../flow/setupChild";
import { UserContext } from "./UserContext";

const Child = () => {
  const { user } = useContext(UserContext);

  const isConnected = !!user?.addr;

  const runSetupChild = async () => {
    try {
      console.log("Running setupChild transaction...");
      const transactionId = await fcl.mutate({
        cadence: setupChild,
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 100, // Adjust as needed for the transaction
      });

      console.log(`Transaction ID: ${transactionId}`);
      const transaction = await fcl.tx(transactionId).onceSealed();
      console.log("Transaction Sealed:", transaction);
      alert("setupChild transaction completed successfully!");
    } catch (error) {
      console.error("Error running setupChild transaction:", error);
      alert(
        "Failed to run the setupChild transaction. Check the console for details."
      );
    }
  };

  return (
    <div className="bg-blue-100 text-blue-800 p-4 rounded-lg mb-4">
      <h2 className="font-bold mb-3">Child Setup</h2>
      <p className="mb-4">
        Run the <code>setupChild.js</code> transaction to set up the child
        collection.
      </p>
      <button
        onClick={runSetupChild}
        disabled={!isConnected}
        className={`px-4 py-2 rounded ${
          isConnected
            ? "bg-flow-dark text-white hover:bg-flow-darkest"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isConnected ? "Run setupChild Transaction" : "Connect Wallet First"}
      </button>
    </div>
  );
};

export default Child;
