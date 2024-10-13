import React, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import MomentCard from "./MomentCard";

// Import Cadence scripts and transactions
import { setupTopShotCollection } from "./flow/setupTopShotCollection";
import { verifyTopShotCollection } from "./flow/verifyTopShotCollection";
import { getTopShotCollection } from "./flow/getTopShotCollection";
import { verifyTSHOTVault } from "./flow/verifyTSHOTVault";
import { getTSHOTBalance } from "./flow/getTSHOTBalance";
import { setupTSHOTVault } from "./flow/setupTSHOTVault";
import { exchangeNFTForTSHOT } from "./flow/exchangeNFTForTSHOT";
import { exchangeTSHOTForNFT } from "./flow/exchangeTSHOTForNFT";

fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  .put("0xFlowToken", "0x7e60df042a9c0868");

function App() {
  const [user, setUser] = useState({ loggedIn: null });
  const [hasCollection, setHasCollection] = useState(false);
  const [hasTSHOTVault, setHasTSHOTVault] = useState(false);
  const [nftDetails, setNftDetails] = useState([]);
  const [playerData, setPlayerData] = useState({});
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [tshotBalance, setTshotBalance] = useState(null);
  const [tokenAmount, setTokenAmount] = useState(0);
  const [transactionInfo, setTransactionInfo] = useState(""); // State for transaction details
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setTransactionInfo("");
  };

  const fetchPlayerData = async () => {
    try {
      const response = await fetch(
        "https://flowconnectbackend-864654c6a577.herokuapp.com/topshot-plays"
      );
      const data = await response.json();
      const playerMap = data.reduce((acc, player) => {
        acc[player.PlayID] = player.FullName;
        return acc;
      }, {});
      setPlayerData(playerMap);
    } catch (error) {
      console.error("Error fetching player data:", error);
    }
  };

  const checkCollection = async () => {
    if (!user.addr) {
      console.error("User is not logged in.");
      return;
    }

    try {
      const hasCollection = await fcl.query({
        cadence: verifyTopShotCollection,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });
      setHasCollection(hasCollection);

      if (hasCollection) {
        fetchTopShotCollection();
        fetchPlayerData();
      }
    } catch (error) {
      console.error("Error checking TopShot Collection:", error);
    }
  };

  const checkTSHOTVault = async () => {
    if (!user.addr) {
      console.error("User is not logged in.");
      return;
    }

    try {
      const hasVault = await fcl.query({
        cadence: verifyTSHOTVault,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });
      setHasTSHOTVault(hasVault);

      if (hasVault) {
        fetchTSHOTBalance();
      }
    } catch (error) {
      console.error("Error checking TSHOT Vault:", error);
    }
  };

  const fetchTSHOTBalance = async () => {
    try {
      const balance = await fcl.query({
        cadence: getTSHOTBalance,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });
      setTshotBalance(balance);
    } catch (error) {
      console.error("Error fetching TSHOT balance:", error);
    }
  };

  const fetchTopShotCollection = async () => {
    try {
      const details = await fcl.query({
        cadence: getTopShotCollection,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });
      setNftDetails(details);
    } catch (error) {
      console.error("Error fetching TopShot Collection details:", error);
    }
  };

  const setupCollection = async () => {
    try {
      const txId = await fcl.mutate({
        cadence: setupTopShotCollection,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 50,
      });

      await handleTransaction(txId);
      checkCollection();
    } catch (error) {
      setTransactionInfo(
        `Error setting up TopShot Collection: ${error.message}`
      );
      setShowModal(true);
    }
  };

  const setupVault = async () => {
    try {
      const txId = await fcl.mutate({
        cadence: setupTSHOTVault,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 50,
      });

      await handleTransaction(txId);
      checkTSHOTVault();
    } catch (error) {
      setTransactionInfo(`Error setting up TSHOT Vault: ${error.message}`);
      setShowModal(true);
    }
  };

  const handleNFTSelection = (nftID) => {
    setSelectedNFTs((prevSelected) => {
      if (prevSelected.includes(nftID)) {
        return prevSelected.filter((id) => id !== nftID);
      } else {
        return [...prevSelected, nftID];
      }
    });
  };

  const handleTransaction = async (txId) => {
    setShowModal(true);
    setTransactionInfo(`Transaction submitted. Transaction ID: ${txId}`);

    console.log("Transaction ID:", txId);

    try {
      fcl.tx(txId).subscribe((transaction) => {
        console.log("Transaction status update:", transaction);
        let statusMessage = `Transaction Status: ${transaction.statusString}`;
        if (transaction.errorMessage) {
          statusMessage += `\nError: ${transaction.errorMessage}`;
        }
        setTransactionInfo(`${statusMessage}\nTransaction ID: ${txId}`);
      });

      const result = await fcl.tx(txId).onceSealed();
      if (result.statusCode !== 0) {
        const errorMessage = result.errorMessage || "Transaction failed.";
        setTransactionInfo(
          `Transaction failed: ${errorMessage}\nTransaction ID: ${txId}`
        );
      } else {
        setTransactionInfo(
          `Transaction sealed successfully!\nTransaction ID: ${txId}`
        );
      }
    } catch (error) {
      setTransactionInfo(
        `Transaction error: ${error.message}\nTransaction ID: ${txId}`
      );
    }
  };

  const exchangeNFTsForTSHOT = async () => {
    if (!user.addr) {
      setTransactionInfo("User is not logged in or address is not available.");
      setShowModal(true);
      return;
    }

    try {
      const txId = await fcl.mutate({
        cadence: exchangeNFTForTSHOT,
        args: (arg, t) => [arg(selectedNFTs, t.Array(t.UInt64))],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 50,
      });

      await handleTransaction(txId);
      fetchTSHOTBalance();
    } catch (error) {
      setTransactionInfo(`Error exchanging NFTs for TSHOT: ${error.message}`);
      setShowModal(true);
    }
  };

  const swapTSHOTForNFT = async (tokenAmount) => {
    if (!user.addr) {
      setTransactionInfo("User is not logged in or address is not available.");
      setShowModal(true);
      return;
    }

    try {
      const txId = await fcl.mutate({
        cadence: exchangeTSHOTForNFT,
        args: (arg, t) => [arg(tokenAmount, t.UFix64)],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 50,
      });

      await handleTransaction(txId);
      fetchTSHOTBalance();
    } catch (error) {
      setTransactionInfo(`Error swapping TSHOT for NFT: ${error.message}`);
      setShowModal(true);
    }
  };

  useEffect(() => {
    if (user.loggedIn) {
      checkCollection();
      checkTSHOTVault();
    }
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Flow Testnet App</h1>
      {user.loggedIn ? (
        <div>
          <p>Logged in as: {user?.addr}</p>
          <button
            onClick={fcl.unauthenticate}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Log Out
          </button>

          {!hasCollection ? (
            <button
              onClick={setupCollection}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              Set Up TopShot Collection
            </button>
          ) : (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">
                Your TopShot Collection
              </h3>
              <p className="text-gray-600 mb-4">
                Selected Moments: {selectedNFTs.length}
              </p>
              <div className="flex flex-wrap">
                {nftDetails.length > 0 ? (
                  nftDetails.map((nft) => (
                    <MomentCard
                      key={nft.id}
                      nft={nft}
                      playerName={playerData[nft.playID]}
                      handleNFTSelection={handleNFTSelection}
                      isSelected={selectedNFTs.includes(nft.id)}
                    />
                  ))
                ) : (
                  <p>No moments found.</p>
                )}
              </div>

              {hasTSHOTVault ? (
                <div className="mt-4">
                  <p className="mb-2">
                    TSHOT Vault is set up! Balance:{" "}
                    {tshotBalance || "Fetching..."} TSHOT
                  </p>
                  <button
                    onClick={exchangeNFTsForTSHOT}
                    className="mt-2 px-4 py-2 bg-purple-500 text-white rounded"
                  >
                    Exchange NFTs for TSHOT
                  </button>

                  <div className="mt-4">
                    <input
                      type="number"
                      placeholder="Enter TSHOT amount"
                      onChange={(e) => setTokenAmount(e.target.value)}
                      className="border p-2 rounded"
                    />
                    <button
                      onClick={() => swapTSHOTForNFT(tokenAmount)}
                      className="ml-2 px-4 py-2 bg-green-500 text-white rounded"
                    >
                      Swap TSHOT for NFT
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={setupVault}
                  className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded"
                >
                  Set Up TSHOT Vault
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={fcl.authenticate}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Log In
        </button>
      )}

      {showModal && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 text-center"
          style={{ width: "100%", zIndex: 1000 }}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Transaction Status</h2>
            <button onClick={closeModal} className="text-white text-xl">
              &times;
            </button>
          </div>
          <pre className="mt-2 whitespace-pre-wrap">{transactionInfo}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
