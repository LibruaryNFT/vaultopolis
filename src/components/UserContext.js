// src/components/UserContext.js

import React, { createContext, useReducer, useEffect, useMemo } from "react";
import * as fcl from "@onflow/fcl";
import { useQuery, useQueryClient } from "react-query";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { getTopShotCollection } from "../flow/getTopShotCollection";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { getReceiptDetails } from "../flow/getReceiptDetails";

export const UserContext = createContext();

const initialState = {
  user: { loggedIn: null },
  nftDetails: [],
  hasCollection: null,
  hasVault: null,
  tshotBalance: null,
  selectedNFTs: [],
  network: "",
  tierCounts: {
    common: 0,
    rare: 0,
    fandom: 0,
    legendary: 0,
    ultimate: 0,
  },
  hasReceipt: null,
  receiptDetails: {},
};

function userReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_NFT_DETAILS":
      return { ...state, nftDetails: action.payload };
    case "SET_COLLECTION_STATUS":
      return { ...state, hasCollection: action.payload };
    case "SET_VAULT_STATUS":
      return { ...state, hasVault: action.payload };
    case "SET_TSHOT_BALANCE":
      return { ...state, tshotBalance: action.payload };
    case "SELECT_NFT":
      return {
        ...state,
        selectedNFTs: state.selectedNFTs.includes(action.payload)
          ? state.selectedNFTs.filter((id) => id !== action.payload)
          : [...state.selectedNFTs, action.payload],
      };
    case "SET_SELECTED_NFTS":
      return { ...state, selectedNFTs: action.payload };
    case "RESET_SELECTED_NFTS":
      return { ...state, selectedNFTs: [] };
    case "SET_TIER_COUNTS":
      return { ...state, tierCounts: action.payload };
    case "SET_NETWORK":
      return { ...state, network: action.payload };
    case "SET_RECEIPT_STATUS":
      return { ...state, hasReceipt: action.payload };
    case "SET_RECEIPT_DETAILS":
      return { ...state, receiptDetails: action.payload };
    case "RESET_STATE":
      return { ...initialState, user: { loggedIn: false } };
    default:
      return state;
  }
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe(async (currentUser) => {
      dispatch({ type: "SET_USER", payload: currentUser });
      if (currentUser && currentUser.loggedIn) {
        await refreshBalances();
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
  }, []);

  const resetState = () => {
    dispatch({ type: "RESET_STATE" });
    dispatch({ type: "SET_NFT_DETAILS", payload: [] });
    dispatch({ type: "SET_TIER_COUNTS", payload: {} });
    dispatch({ type: "SET_RECEIPT_STATUS", payload: null });
    dispatch({ type: "SET_RECEIPT_DETAILS", payload: {} });
  };

  // Define fetch functions for each query
  const fetchTSHOTBalance = async () => {
    const tshotBalance = await fcl.query({
      cadence: getTSHOTBalance,
      args: (arg, t) => [arg(state.user.addr, t.Address)],
    });
    dispatch({ type: "SET_TSHOT_BALANCE", payload: tshotBalance });
    return tshotBalance;
  };

  const fetchReceiptDetails = async () => {
    const receiptDetails = await fcl.query({
      cadence: getReceiptDetails,
      args: (arg, t) => [arg(state.user.addr, t.Address)],
    });
    const hasReceipt =
      receiptDetails &&
      receiptDetails.betAmount &&
      parseFloat(receiptDetails.betAmount) > 0;
    dispatch({ type: "SET_RECEIPT_STATUS", payload: hasReceipt });
    dispatch({ type: "SET_RECEIPT_DETAILS", payload: receiptDetails || {} });
    return receiptDetails;
  };

  const fetchTopShotCollection = async () => {
    const hasCollection = await fcl.query({
      cadence: verifyTopShotCollection,
      args: (arg, t) => [arg(state.user.addr, t.Address)],
    });
    dispatch({ type: "SET_COLLECTION_STATUS", payload: hasCollection });

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

      dispatch({ type: "SET_NFT_DETAILS", payload: details });
      dispatch({ type: "SET_TIER_COUNTS", payload: tierCounts });
      return { details, tierCounts };
    } else {
      dispatch({ type: "SET_NFT_DETAILS", payload: [] });
      dispatch({ type: "SET_TIER_COUNTS", payload: {} });
      return { details: [], tierCounts: {} };
    }
  };

  const refreshBalances = async () => {
    if (state.user.addr) {
      try {
        // Fetch queries with refetchInterval handled by useQuery
        await queryClient.prefetchQuery(
          ["tshotBalance", state.user.addr],
          fetchTSHOTBalance
        );
        await queryClient.prefetchQuery(
          ["hasReceipt", state.user.addr],
          fetchReceiptDetails
        );
        await queryClient.prefetchQuery(
          ["topShotCollection", state.user.addr],
          fetchTopShotCollection
        );
      } catch (error) {
        console.error("Error refreshing balances:", error);
      }
    }
  };

  // Fetch $TSHOT Balance
  useQuery(["tshotBalance", state.user.addr], fetchTSHOTBalance, {
    enabled: !!state.user.addr,
    staleTime: 5000, // Adjust as needed
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch TopShot Collection and Tier Counts
  useQuery(["topShotCollection", state.user.addr], fetchTopShotCollection, {
    enabled: !!state.user.addr,
    staleTime: 5000,
    refetchInterval: 10000,
  });

  // Fetch Receipt Details and Status
  useQuery(["hasReceipt", state.user.addr], fetchReceiptDetails, {
    enabled: !!state.user.addr,
    staleTime: 5000,
    refetchInterval: 5000, // Refetch every 5 seconds for quicker detection
  });

  const value = useMemo(
    () => ({
      ...state,
      dispatch,
      refreshBalances,
    }),
    [state]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
