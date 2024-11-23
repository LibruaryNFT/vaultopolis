import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { setupTopShotCollection } from "../flow/setupTopShotCollection";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection"; // Script to check collection status

const TestingSetupPrompt = () => {
  const { user, dispatch } = useContext(UserContext);
  const [hasCollection, setHasCollection] = useState(false);
  const isConnected = !!user?.addr;
  const googleFormUrl = "https://forms.gle/dVmDgW9CidbEetXy5"; // Replace with your actual form URL

  useEffect(() => {
    const checkCollection = async () => {
      if (isConnected) {
        try {
          const result = await fcl.query({
            cadence: verifyTopShotCollection,
            args: (arg, t) => [arg(user.addr, t.Address)],
          });
          setHasCollection(result);
          dispatch({ type: "SET_COLLECTION_STATUS", payload: result });
        } catch (error) {
          console.error("Error checking TopShot collection:", error);
        }
      }
    };

    checkCollection();
  }, [isConnected, user.addr, dispatch]);

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
      setHasCollection(true);
      dispatch({ type: "SET_COLLECTION_STATUS", payload: true });
      console.log("Collection setup complete.");
    } catch (error) {
      console.error("Error setting up collection:", error);
    }
  };

  return (
    <div className="bg-yellow-100 text-yellow-800 p-2 rounded-md mb-2">
      <h2 className="font-bold mb-2">Testing Setup Steps</h2>

      {/* Step 1: Connect Wallet */}
      <div className="mb-3">
        <p className="flex items-center text-sm">
          Step 1: Connect your wallet (Only Flow Wallet is supported, not Blocto
          Wallet)
          {isConnected ? (
            <span className="ml-auto text-green-600 font-semibold">✓ Done</span>
          ) : (
            <span className="ml-auto text-yellow-600 font-semibold">
              In Progress
            </span>
          )}
        </p>
        <button
          onClick={handleConnectWallet}
          disabled={isConnected}
          className={`px-3 py-1 mt-1 rounded text-sm ${
            isConnected
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-flow-dark text-white hover:bg-flow-darkest"
          }`}
        >
          {isConnected ? "Wallet Connected" : "Connect Wallet"}
        </button>
      </div>

      {/* Step 2: Setup Collection */}
      <div className="mb-3">
        <p className="flex items-center text-sm">
          Step 2: Set up your TopShot collection
          {hasCollection ? (
            <span className="ml-auto text-green-600 font-semibold">✓ Done</span>
          ) : (
            <span className="ml-auto text-yellow-600 font-semibold">
              In Progress
            </span>
          )}
        </p>
        <button
          onClick={setupCollection}
          disabled={!isConnected || hasCollection}
          className={`px-3 py-1 mt-1 rounded text-sm ${
            !isConnected || hasCollection
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-flow-dark text-white hover:bg-flow-darkest"
          }`}
        >
          {hasCollection ? "Collection Set Up" : "Setup Collection"}
        </button>
      </div>

      {/* Step 3: Share Wallet Address */}
      <div className="mb-3">
        <p className="flex items-center text-sm">
          Step 3: Send us your wallet address for testing NFTs
          {hasCollection && isConnected ? (
            <span className="ml-auto text-green-600 font-semibold">✓ Done</span>
          ) : (
            <span className="ml-auto text-gray-500 font-semibold">Pending</span>
          )}
        </p>
        <button
          onClick={() => navigator.clipboard.writeText(user.addr)}
          disabled={!hasCollection || !isConnected}
          className={`px-3 py-1 mt-1 rounded text-sm ${
            !hasCollection || !isConnected
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-flow-dark text-white hover:bg-flow-darkest"
          }`}
        >
          {hasCollection && isConnected
            ? "Copy Wallet Address"
            : "Complete Previous Steps First"}
        </button>
      </div>

      {/* Step 4: Test the Product and Complete the Survey */}
      <div>
        <p className="flex items-center text-sm">
          Step 4: Test the product and provide feedback
          {hasCollection && isConnected ? (
            <span className="ml-auto text-yellow-600 font-semibold">
              Current Step
            </span>
          ) : (
            <span className="ml-auto text-gray-500 font-semibold">Pending</span>
          )}
        </p>
        <a
          href={googleFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
            !hasCollection || !isConnected
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-flow-dark text-white hover:bg-flow-darkest"
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
