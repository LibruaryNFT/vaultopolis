import React, { createContext, useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";

// Import Cadence scripts
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { getTopShotCollection } from "../flow/getTopShotCollection";
import { verifyTSHOTVault } from "../flow/verifyTSHOTVault";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import { exchangeTSHOTForNFT } from "../flow/exchangeTSHOTForNFT";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ loggedIn: null });
  const [nftDetails, setNftDetails] = useState([]);
  const [hasCollection, setHasCollection] = useState(false);
  const [tshotBalance, setTshotBalance] = useState(null);
  const [playerData, setPlayerData] = useState({});
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [transactionInfo, setTransactionInfo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [network, setNetwork] = useState(""); // Add network state

  useEffect(() => {
    fcl.currentUser.subscribe((currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.loggedIn) {
        checkCollection(currentUser.addr);
        checkTSHOTVault(currentUser.addr);
      } else {
        resetState();
      }
    });

    // Determine the network based on `accessNode.api`
    const determineNetwork = async () => {
      const apiUrl = await fcl.config().get("accessNode.api");
      if (apiUrl.includes("testnet")) {
        setNetwork("Testnet");
      } else if (apiUrl.includes("mainnet")) {
        setNetwork("Mainnet");
      } else {
        setNetwork("Unknown");
      }
    };

    determineNetwork();
  }, []);

  const resetState = () => {
    setNftDetails([]);
    setHasCollection(false);
    setTshotBalance(null);
    setPlayerData({});
    setSelectedNFTs([]);
  };

  const checkCollection = async (userAddress) => {
    try {
      const hasCollection = await fcl.query({
        cadence: verifyTopShotCollection,
        args: (arg, t) => [arg(userAddress, t.Address)],
      });
      setHasCollection(hasCollection);

      if (hasCollection) {
        fetchTopShotCollection(userAddress);
        fetchPlayerData();
      }
    } catch (error) {
      console.error("Error checking TopShot Collection:", error);
    }
  };

  const fetchTopShotCollection = async (userAddress) => {
    try {
      const details = await fcl.query({
        cadence: getTopShotCollection,
        args: (arg, t) => [arg(userAddress, t.Address)],
      });
      setNftDetails(details);
    } catch (error) {
      console.error("Error fetching TopShot Collection details:", error);
    }
  };

  const checkTSHOTVault = async (userAddress) => {
    try {
      const hasVault = await fcl.query({
        cadence: verifyTSHOTVault,
        args: (arg, t) => [arg(userAddress, t.Address)],
      });

      if (hasVault) {
        fetchTSHOTBalance(userAddress);
      }
    } catch (error) {
      console.error("Error checking TSHOT Vault:", error);
    }
  };

  const fetchTSHOTBalance = async (userAddress) => {
    try {
      const balance = await fcl.query({
        cadence: getTSHOTBalance,
        args: (arg, t) => [arg(userAddress, t.Address)],
      });
      setTshotBalance(balance);
    } catch (error) {
      console.error("Error fetching TSHOT balance:", error);
    }
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

  const handleNFTSelection = (nftID) => {
    setSelectedNFTs((prevSelected) => {
      if (prevSelected.includes(nftID)) {
        return prevSelected.filter((id) => id !== nftID);
      } else {
        return [...prevSelected, nftID];
      }
    });
  };

  const exchangeNFTsForTSHOT = async () => {
    if (!user.addr) {
      setTransactionInfo("User is not logged in or address is not available.");
      setShowModal(true);
      return;
    }

    if (selectedNFTs.length === 0) {
      setTransactionInfo("No NFTs selected for exchange.");
      setShowModal(true);
      return;
    }

    try {
      setShowModal(true);
      setTransactionInfo("Transaction submitted...");

      const txId = await fcl.mutate({
        cadence: exchangeNFTForTSHOT,
        args: (arg, t) => [arg(selectedNFTs, t.Array(t.UInt64))],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 50,
      });

      fcl.tx(txId).subscribe((transaction) => {
        let statusMessage = `Transaction Status: ${transaction.statusString}`;
        if (transaction.errorMessage) {
          statusMessage += `\nError: ${transaction.errorMessage}`;
        }
        setTransactionInfo(`${statusMessage}\nTransaction ID: ${txId}`);
      });

      await fcl.tx(txId).onceSealed();
      await fetchTSHOTBalance(user.addr);
      await fetchTopShotCollection(user.addr); // Update the collection
      setSelectedNFTs([]);
      setTransactionInfo(`Transaction completed! Transaction ID: ${txId}`);
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

    if (tokenAmount <= 0) {
      setTransactionInfo("Please enter a valid token amount.");
      setShowModal(true);
      return;
    }

    try {
      setShowModal(true);
      setTransactionInfo("Transaction submitted...");

      const txId = await fcl.mutate({
        cadence: exchangeTSHOTForNFT,
        args: (arg, t) => [arg(tokenAmount, t.UFix64)],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 50,
      });

      fcl.tx(txId).subscribe((transaction) => {
        let statusMessage = `Transaction Status: ${transaction.statusString}`;
        if (transaction.errorMessage) {
          statusMessage += `\nError: ${transaction.errorMessage}`;
        }
        setTransactionInfo(`${statusMessage}\nTransaction ID: ${txId}`);
      });

      await fcl.tx(txId).onceSealed();
      await fetchTSHOTBalance(user.addr);
      await fetchTopShotCollection(user.addr); // Update the collection
      setTransactionInfo(`Transaction completed! Transaction ID: ${txId}`);
    } catch (error) {
      setTransactionInfo(`Error swapping TSHOT for NFT: ${error.message}`);
      setShowModal(true);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        nftDetails,
        hasCollection,
        tshotBalance,
        playerData,
        selectedNFTs,
        handleNFTSelection,
        exchangeNFTsForTSHOT,
        swapTSHOTForNFT,
        transactionInfo,
        showModal,
        setShowModal,
        network, // Include the network in the context
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
