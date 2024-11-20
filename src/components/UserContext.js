import React, {
  createContext,
  useReducer,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as fcl from "@onflow/fcl";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { getTopShotCollection } from "../flow/getTopShotCollection";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { getReceiptDetails } from "../flow/getReceiptDetails";
import { hasChildren } from "../flow/hasChildren";
import { getChildren } from "../flow/getChildren";

export const UserContext = createContext();

const initialState = {
  user: { loggedIn: null, addr: "" },
  nftDetails: [],
  hasCollection: null,
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
  hasChildren: false,
  childrenAddresses: [],
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
    case "SET_TSHOT_BALANCE":
      return { ...state, tshotBalance: action.payload };
    case "SET_TIER_COUNTS":
      return { ...state, tierCounts: action.payload };
    case "SET_HAS_CHILDREN":
      return { ...state, hasChildren: action.payload };
    case "SET_CHILDREN_ADDRESSES":
      return { ...state, childrenAddresses: action.payload };
    case "SET_HAS_RECEIPT":
      return { ...state, hasReceipt: action.payload };
    case "SET_RECEIPT_DETAILS":
      return { ...state, receiptDetails: action.payload };
    case "SELECT_NFT":
      const isSelected = state.selectedNFTs.includes(action.payload);
      return {
        ...state,
        selectedNFTs: isSelected
          ? state.selectedNFTs.filter((id) => id !== action.payload)
          : [...state.selectedNFTs, action.payload],
      };
    case "RESET_SELECTED_NFTS":
      return { ...state, selectedNFTs: [] };
    case "RESET_STATE":
      return { ...initialState, user: { loggedIn: false } };
    default:
      return state;
  }
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const [activeAccount, setActiveAccount] = useState("");

  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe(async (currentUser) => {
      dispatch({ type: "SET_USER", payload: currentUser });
      if (currentUser?.loggedIn) {
        setActiveAccount(currentUser.addr);
        await refreshBalances(currentUser.addr);
        await checkForChildren(currentUser.addr);
        await fetchReceiptDetails(currentUser.addr); // Fetch receipt details for logged-in user
      } else {
        resetState();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (activeAccount) {
      dispatch({ type: "RESET_SELECTED_NFTS" });
      refreshBalances(activeAccount);
      fetchReceiptDetails(activeAccount); // Refresh receipt details for active account
    }
  }, [activeAccount]);

  // Set up interval to refresh balances every 10 seconds
  useEffect(() => {
    if (!activeAccount) return;

    const interval = setInterval(() => {
      refreshBalances(activeAccount);
      fetchReceiptDetails(activeAccount); // Periodically refresh receipt details
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [activeAccount]);

  const resetState = () => {
    dispatch({ type: "RESET_STATE" });
    setActiveAccount("");
  };

  const refreshBalances = async (address) => {
    if (!address || !address.startsWith("0x")) return;

    try {
      const [tshotBalance, collectionData] = await Promise.all([
        fetchTSHOTBalance(address),
        fetchTopShotCollection(address),
      ]);
      console.log(`Refreshed Balances for ${address}:`, {
        tshotBalance,
        collectionData,
      });
    } catch (error) {
      console.error("Error refreshing balances:", error);
    }
  };

  const checkForChildren = async (parentAddress) => {
    if (!parentAddress || !parentAddress.startsWith("0x")) return;

    try {
      const hasChildrenStatus = await fetchHasChildren(parentAddress);
      if (hasChildrenStatus) {
        await fetchChildrenAddresses(parentAddress);
      }
    } catch (error) {
      console.error("Error checking for children:", error);
    }
  };

  const fetchHasChildren = async (address) => {
    if (!address || !address.startsWith("0x")) return false;

    const hasChildrenStatus = await fcl.query({
      cadence: hasChildren,
      args: (arg, t) => [arg(address, t.Address)],
    });
    dispatch({ type: "SET_HAS_CHILDREN", payload: hasChildrenStatus });
    return hasChildrenStatus;
  };

  const fetchChildrenAddresses = async (address) => {
    if (!address || !address.startsWith("0x")) return [];

    const children = await fcl.query({
      cadence: getChildren,
      args: (arg, t) => [arg(address, t.Address)],
    });
    dispatch({ type: "SET_CHILDREN_ADDRESSES", payload: children });
    return children;
  };

  const fetchTSHOTBalance = async (address) => {
    if (!address || !address.startsWith("0x")) return null;

    const tshotBalance = await fcl.query({
      cadence: getTSHOTBalance,
      args: (arg, t) => [arg(address, t.Address)],
    });
    dispatch({ type: "SET_TSHOT_BALANCE", payload: tshotBalance });
    return tshotBalance;
  };

  const fetchTopShotCollection = async (address) => {
    if (!address || !address.startsWith("0x"))
      return { details: [], tierCounts: {} };

    const hasCollection = await fcl.query({
      cadence: verifyTopShotCollection,
      args: (arg, t) => [arg(address, t.Address)],
    });
    dispatch({ type: "SET_COLLECTION_STATUS", payload: hasCollection });

    if (hasCollection) {
      const details = await fcl.query({
        cadence: getTopShotCollection,
        args: (arg, t) => [arg(address, t.Address)],
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

  const fetchReceiptDetails = async (address) => {
    if (!address || !address.startsWith("0x")) return null;

    const receiptDetails = await fcl.query({
      cadence: getReceiptDetails,
      args: (arg, t) => [arg(address, t.Address)],
    });

    const hasReceipt =
      receiptDetails &&
      receiptDetails.betAmount &&
      parseFloat(receiptDetails.betAmount) > 0;

    dispatch({ type: "SET_HAS_RECEIPT", payload: hasReceipt });
    dispatch({ type: "SET_RECEIPT_DETAILS", payload: receiptDetails || {} });

    return receiptDetails;
  };

  const value = useMemo(
    () => ({
      ...state,
      activeAccount,
      setActiveAccount,
      dispatch,
      refreshBalances,
      fetchTopShotCollection,
    }),
    [state, activeAccount]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
