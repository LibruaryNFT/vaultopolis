// UserContext.js
import React, { createContext, useReducer, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { useQuery, useQueryClient } from "react-query";
import { userReducer, initialState } from "../reducers/userReducer";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { getTopShotCollection } from "../flow/getTopShotCollection";
import { verifyTSHOTVault } from "../flow/verifyTSHOTVault";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import { exchangeTSHOTForNFT } from "../flow/exchangeTSHOTForNFT";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe(async (currentUser) => {
      dispatch({ type: "SET_USER", payload: currentUser });
      if (currentUser && currentUser.loggedIn) {
        queryClient.invalidateQueries(["topShotCollection", "tshotBalance"]);

        // Fetch hasCollection and hasVault statuses
        const [hasCollection, hasVault] = await Promise.all([
          fcl.query({
            cadence: verifyTopShotCollection,
            args: (arg, t) => [arg(currentUser.addr, t.Address)],
          }),
          fcl.query({
            cadence: verifyTSHOTVault,
            args: (arg, t) => [arg(currentUser.addr, t.Address)],
          }),
        ]);

        dispatch({ type: "SET_COLLECTION_STATUS", payload: hasCollection });
        dispatch({ type: "SET_VAULT_STATUS", payload: hasVault });
      } else {
        resetState();
      }
    });

    const determineNetwork = async () => {
      const apiUrl = await fcl.config().get("accessNode.api");
      dispatch({
        type: "SET_NETWORK",
        payload: apiUrl.includes("testnet") ? "Testnet" : "Mainnet",
      });
    };

    determineNetwork();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [queryClient]);

  const resetState = () => {
    dispatch({ type: "RESET_STATE" });
  };

  useQuery(
    ["topShotCollection", state.user.addr],
    async () => {
      const hasCollection = await fcl.query({
        cadence: verifyTopShotCollection,
        args: (arg, t) => [arg(state.user.addr, t.Address)],
      });
      if (hasCollection) {
        const details = await fcl.query({
          cadence: getTopShotCollection,
          args: (arg, t) => [arg(state.user.addr, t.Address)],
        });

        const tierCounts = {
          common: 0,
          rare: 0,
          fandom: 0,
          legendary: 0,
          ultimate: 0,
        };

        for (const nft of details) {
          const tier = nft.tier.toLowerCase();
          if (tierCounts.hasOwnProperty(tier)) {
            tierCounts[tier]++;
          }
        }

        return { details, tierCounts };
      } else {
        return { details: [], tierCounts: {} };
      }
    },
    {
      enabled: !!state.user.addr,
      onSuccess: (data) => {
        dispatch({ type: "SET_NFT_DETAILS", payload: data.details });
        dispatch({ type: "SET_TIER_COUNTS", payload: data.tierCounts });
      },
    }
  );

  useQuery(
    ["tshotBalance", state.user.addr],
    async () => {
      return await fcl.query({
        cadence: getTSHOTBalance,
        args: (arg, t) => [arg(state.user.addr, t.Address)],
      });
    },
    {
      enabled: !!state.user.addr,
      onSuccess: (balance) =>
        dispatch({ type: "SET_TSHOT_BALANCE", payload: balance }),
    }
  );

  const handleNFTSelection = (nftID) => {
    dispatch({ type: "SELECT_NFT", payload: nftID });
  };

  const exchangeNFTsForTSHOT = async () => {
    if (!state.user.addr) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: "User is not logged in or address is not available.",
      });
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      return;
    }

    if (state.selectedNFTs.length === 0) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: "No NFTs selected for exchange.",
      });
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      return;
    }

    try {
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: "Transaction submitted...",
      });

      const txId = await fcl.mutate({
        cadence: exchangeNFTForTSHOT,
        args: (arg, t) => [arg(state.selectedNFTs, t.Array(t.UInt64))],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000,
      });

      fcl.tx(txId).subscribe((transaction) => {
        let statusMessage = `Transaction Status: ${transaction.statusString}`;
        if (transaction.errorMessage) {
          statusMessage += `\nError: ${transaction.errorMessage}`;
        }
        dispatch({
          type: "SET_TRANSACTION_INFO",
          payload: `${statusMessage}\nTransaction ID: ${txId}`,
        });
      });

      await fcl.tx(txId).onceSealed();
      queryClient.invalidateQueries("tshotBalance");
      queryClient.invalidateQueries("topShotCollection");
      dispatch({ type: "RESET_SELECTED_NFTS" });
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Transaction completed! Transaction ID: ${txId}`,
      });
    } catch (error) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Error exchanging NFTs for TSHOT: ${error.message}`,
      });
      dispatch({ type: "TOGGLE_MODAL", payload: true });
    }
  };

  const swapTSHOTForNFT = async (tokenAmount) => {
    if (!state.user.addr) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: "User is not logged in or address is not available.",
      });
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      return;
    }

    if (tokenAmount <= 0) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: "Please enter a valid token amount.",
      });
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      return;
    }

    try {
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: "Transaction submitted...",
      });

      const txId = await fcl.mutate({
        cadence: exchangeTSHOTForNFT,
        args: (arg, t) => [arg(tokenAmount, t.UFix64)],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000,
      });

      fcl.tx(txId).subscribe((transaction) => {
        let statusMessage = `Transaction Status: ${transaction.statusString}`;
        if (transaction.errorMessage) {
          statusMessage += `\nError: ${transaction.errorMessage}`;
        }
        dispatch({
          type: "SET_TRANSACTION_INFO",
          payload: `${statusMessage}\nTransaction ID: ${txId}`,
        });
      });

      await fcl.tx(txId).onceSealed();
      queryClient.invalidateQueries("tshotBalance");
      queryClient.invalidateQueries("topShotCollection");
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Transaction completed! Transaction ID: ${txId}`,
      });
    } catch (error) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Error swapping TSHOT for NFT: ${error.message}`,
      });
      dispatch({ type: "TOGGLE_MODAL", payload: true });
    }
  };

  return (
    <UserContext.Provider
      value={{
        ...state,
        dispatch,
        handleNFTSelection,
        exchangeNFTsForTSHOT,
        swapTSHOTForNFT,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
