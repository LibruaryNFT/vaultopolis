// UserContext.js
import React, { createContext, useReducer, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { useQuery, useQueryClient } from "react-query";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { getTopShotCollection } from "../flow/getTopShotCollection";
import { verifyTSHOTVault } from "../flow/verifyTSHOTVault";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import { verifyReceipt } from "../flow/verifyReceipt";
import { getReceiptDetails } from "../flow/getReceiptDetails"; // Import getReceiptDetails script

export const UserContext = createContext();

const initialState = {
  user: { loggedIn: null },
  nftDetails: [],
  hasCollection: null,
  hasVault: null,
  tshotBalance: null,
  selectedNFTs: [],
  transactionInfo: "",
  showModal: false,
  network: "",
  tierCounts: {
    common: 0,
    rare: 0,
    fandom: 0,
    legendary: 0,
    ultimate: 0,
  },
  hasReceipt: null, // State to track receipt existence
  receiptDetails: {}, // State to store receipt details
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
    case "SET_TRANSACTION_INFO":
      return { ...state, transactionInfo: action.payload };
    case "TOGGLE_MODAL":
      return { ...state, showModal: action.payload };
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

  const refreshBalances = async () => {
    if (state.user.addr) {
      try {
        // Refresh TSHOT balance
        const tshotBalance = await fcl.query({
          cadence: getTSHOTBalance,
          args: (arg, t) => [arg(state.user.addr, t.Address)],
        });
        dispatch({ type: "SET_TSHOT_BALANCE", payload: tshotBalance });

        // Check for TopShot collection
        const hasCollection = await fcl.query({
          cadence: verifyTopShotCollection,
          args: (arg, t) => [arg(state.user.addr, t.Address)],
        });
        dispatch({ type: "SET_COLLECTION_STATUS", payload: hasCollection });

        // Check for TSHOT vault
        const hasVault = await fcl.query({
          cadence: verifyTSHOTVault,
          args: (arg, t) => [arg(state.user.addr, t.Address)],
        });
        dispatch({ type: "SET_VAULT_STATUS", payload: hasVault });

        // Check for receipt
        const hasReceipt = await fcl.query({
          cadence: verifyReceipt,
          args: (arg, t) => [arg(state.user.addr, t.Address)],
        });
        dispatch({ type: "SET_RECEIPT_STATUS", payload: hasReceipt });

        // Fetch receipt details if the receipt exists
        if (hasReceipt) {
          await fetchReceiptDetails();
        } else {
          dispatch({ type: "SET_RECEIPT_DETAILS", payload: {} });
        }

        // Refresh NFT details
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
        } else {
          dispatch({ type: "SET_NFT_DETAILS", payload: [] });
          dispatch({ type: "SET_TIER_COUNTS", payload: {} });
        }
      } catch (error) {
        console.error("Error refreshing balances:", error);
      }
    }
  };

  const fetchReceiptDetails = async () => {
    if (state.user.addr) {
      try {
        const receiptDetails = await fcl.query({
          cadence: getReceiptDetails,
          args: (arg, t) => [arg(state.user.addr, t.Address)],
        });
        dispatch({ type: "SET_RECEIPT_DETAILS", payload: receiptDetails });
      } catch (error) {
        console.error("Error fetching receipt details:", error);
      }
    }
  };

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
      onSuccess: (balance) => {
        dispatch({ type: "SET_TSHOT_BALANCE", payload: balance });
      },
    }
  );

  useQuery(
    ["topShotCollection", state.user.addr],
    async () => {
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
        payload: `Processing swap of ${state.selectedNFTs.length} NFT(s) for TSHOT...`,
      });

      const txId = await fcl.mutate({
        cadence: exchangeNFTForTSHOT,
        args: (arg, t) => [arg(state.selectedNFTs, t.Array(t.UInt64))],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });

      await fcl.tx(txId).onceSealed();

      await refreshBalances();

      dispatch({ type: "RESET_SELECTED_NFTS" });

      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Swap transaction completed. ${state.selectedNFTs.length} NFT(s) exchanged for TSHOT.\nTransaction ID: ${txId}`,
      });

      setTimeout(() => {
        dispatch({ type: "TOGGLE_MODAL", payload: false });
      }, 3000);
    } catch (error) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Error exchanging NFTs for TSHOT: ${error.message}`,
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
        refreshBalances,
        receiptDetails: state.receiptDetails,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
