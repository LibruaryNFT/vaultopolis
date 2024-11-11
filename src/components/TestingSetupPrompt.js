import React, { useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { setupTopShotCollection } from "../flow/setupTopShotCollection";

const TestingSetupPrompt = () => {
  const { user, hasCollection, dispatch } = useContext(UserContext);

  const isConnected = !!user?.addr;
  const googleFormUrl = "https://forms.gle/dVmDgW9CidbEetXy5"; // Replace with your actual form URL

  useEffect(() => {
    if (!isConnected) {
      console.log("User is not connected. Prompting them to connect.");
    } else if (!hasCollection) {
      console.log(
        "User connected but does not have a TopShot collection set up."
      );
    }
  }, [isConnected, hasCollection]);

  const handleConnectWallet = () => {
    fcl.authenticate();
  };

  const setupCollection = async () => {
    try {
      const transactionId = await fcl.mutate({
        cadence: setupTopShotCollection,
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 100,
      });
      await fcl.tx(transactionId).onceSealed();
      dispatch({ type: "SET_COLLECTION_STATUS", payload: true });
      console.log("Collection setup complete.");
    } catch (error) {
      console.error("Error setting up collection:", error);
    }
  };

  return (
    <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4">
      <h2 className="font-bold mb-3">Testing Setup Steps</h2>

      {/* Step 1: Connect Wallet */}
      <div className="mb-4">
        <p className="flex items-center">
          <span className="mr-2">Step 1: Connect your wallet</span>
          {isConnected ? (
            <span className="text-green-600 font-semibold">✓ Done</span>
          ) : (
            <span className="text-yellow-600 font-semibold">In Progress</span>
          )}
        </p>
        <button
          onClick={handleConnectWallet}
          disabled={isConnected}
          className={`px-4 py-2 mt-2 rounded ${
            isConnected
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isConnected ? "Wallet Connected" : "Connect Wallet"}
        </button>
      </div>

      {/* Step 2: Setup Collection */}
      <div className="mb-4">
        <p className="flex items-center">
          <span className="mr-2">Step 2: Set up your TopShot collection</span>
          {hasCollection ? (
            <span className="text-green-600 font-semibold">✓ Done</span>
          ) : (
            <span className="text-yellow-600 font-semibold">In Progress</span>
          )}
        </p>
        <button
          onClick={setupCollection}
          disabled={!isConnected || hasCollection}
          className={`px-4 py-2 mt-2 rounded ${
            !isConnected || hasCollection
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {hasCollection ? "Collection Set Up" : "Setup Collection"}
        </button>
      </div>

      {/* Step 3: Share Wallet Address */}
      <div className="mb-4">
        <p className="flex items-center">
          <span className="mr-2">
            Step 3: Send us your wallet address so we can send NFTs for testing
          </span>
          {hasCollection && isConnected ? (
            <span className="text-green-600 font-semibold">✓ Done</span>
          ) : (
            <span className="text-gray-500 font-semibold">Pending</span>
          )}
        </p>
        <button
          onClick={() => navigator.clipboard.writeText(user.addr)}
          disabled={!hasCollection || !isConnected}
          className={`px-4 py-2 mt-2 rounded ${
            !hasCollection || !isConnected
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {hasCollection && isConnected
            ? "Copy Wallet Address"
            : "Complete Previous Steps First"}
        </button>
      </div>

      {/* Step 4: Test the Product and Complete the Survey */}
      <div>
        <p className="flex items-center">
          <span className="mr-2">
            Step 4: Test the product with the NFTs and fill out our feedback
            survey
          </span>
          {hasCollection && isConnected ? (
            <span className="text-yellow-600 font-semibold">Current Step</span>
          ) : (
            <span className="text-gray-500 font-semibold">Pending</span>
          )}
        </p>
        <a
          href={googleFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-block mt-3 px-4 py-2 rounded ${
            !hasCollection || !isConnected
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {hasCollection && isConnected
            ? "Open Feedback Form"
            : "Complete Previous Steps First"}
        </a>
      </div>
    </div>
  );
};

export default TestingSetupPrompt;
