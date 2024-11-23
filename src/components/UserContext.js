import React, { createContext, useReducer, useEffect, useMemo } from "react";
import * as fcl from "@onflow/fcl";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { getTopShotCollection } from "../flow/getTopShotCollection";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { getReceiptDetails } from "../flow/getReceiptDetails";
import { hasChildren as hasChildrenCadence } from "../flow/hasChildren";
import { getChildren } from "../flow/getChildren";

export const UserContext = createContext();

const initialState = {
  user: { loggedIn: null, addr: "" },
  accountData: {
    parentAddress: null,
    nftDetails: [],
    tshotBalance: null,
    hasCollection: null,
    tierCounts: {
      common: 0,
      rare: 0,
      fandom: 0,
      legendary: 0,
      ultimate: 0,
    },
    receiptDetails: {},
    hasReceipt: null,
    hasChildren: false,
    childrenData: [],
    childrenAddresses: [],
  },
  selectedAccount: null,
  selectedAccountType: "parent",
  selectedNFTs: [],
};

function userReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_ACCOUNT_DATA":
      return {
        ...state,
        accountData: { ...state.accountData, ...action.payload },
      };
    case "SET_SELECTED_ACCOUNT":
      return {
        ...state,
        selectedAccount: action.payload.address,
        selectedAccountType: action.payload.type,
        selectedNFTs: [],
      };
    case "SET_SELECTED_NFTS":
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
    case "SET_CHILDREN_DATA":
      return {
        ...state,
        accountData: {
          ...state.accountData,
          childrenData: action.payload,
        },
      };
    case "SET_CHILDREN_ADDRESSES":
      return {
        ...state,
        accountData: {
          ...state.accountData,
          childrenAddresses: action.payload,
        },
      };
    default:
      return state;
  }
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const setSelectedAccount = (address) => {
    const isChild = state.accountData.childrenAddresses.includes(address);
    const accountType = isChild ? "child" : "parent";
    dispatch({
      type: "SET_SELECTED_ACCOUNT",
      payload: { address, type: accountType },
    });
  };

  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe(async (currentUser) => {
      dispatch({ type: "SET_USER", payload: currentUser });

      if (currentUser?.loggedIn) {
        await loadParentData(currentUser.addr);
        const hasChildren = await checkForChildren(currentUser.addr);
        setSelectedAccount(currentUser.addr);
      } else {
        resetState();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const resetState = () => {
    dispatch({ type: "RESET_STATE" });
  };

  const loadParentData = async (address) => {
    if (!address.startsWith("0x")) return;

    try {
      const [tshotBalance, collectionData, receiptDetails] = await Promise.all([
        fetchTSHOTBalance(address),
        fetchTopShotCollection(address),
        fetchReceiptDetails(address),
      ]);

      dispatch({
        type: "SET_ACCOUNT_DATA",
        payload: {
          parentAddress: address,
          tshotBalance,
          nftDetails: collectionData.details || [],
          hasCollection: collectionData.hasCollection,
          tierCounts:
            collectionData.tierCounts || initialState.accountData.tierCounts,
          receiptDetails,
          hasReceipt: receiptDetails && receiptDetails.betAmount > 0,
        },
      });
    } catch (error) {
      console.error("Error loading parent account data:", error);
    }
  };

  const checkForChildren = async (parentAddress) => {
    try {
      const hasChildrenStatus = await fetchHasChildren(parentAddress);
      dispatch({
        type: "SET_ACCOUNT_DATA",
        payload: { hasChildren: hasChildrenStatus },
      });

      if (hasChildrenStatus) {
        const childrenAddresses = await fetchChildrenAddresses(parentAddress);

        const childrenData = await Promise.all(
          childrenAddresses.map(async (childAddr) => {
            const [tshotBalance, collectionData, receiptDetails] =
              await Promise.all([
                fetchTSHOTBalance(childAddr),
                fetchTopShotCollection(childAddr),
                fetchReceiptDetails(childAddr),
              ]);

            return {
              addr: childAddr,
              tshotBalance,
              nftDetails: collectionData.details || [],
              hasCollection: collectionData.hasCollection,
              tierCounts:
                collectionData.tierCounts ||
                initialState.accountData.tierCounts,
              receiptDetails,
              hasReceipt: receiptDetails && receiptDetails.betAmount > 0,
            };
          })
        );

        dispatch({ type: "SET_CHILDREN_DATA", payload: childrenData });
        dispatch({
          type: "SET_CHILDREN_ADDRESSES",
          payload: childrenAddresses,
        });
      }

      return hasChildrenStatus;
    } catch (error) {
      console.error("Error fetching children data:", error);
      return false;
    }
  };

  const refreshBalances = async (address) => {
    if (!address || !address.startsWith("0x")) return;

    try {
      const [tshotBalance, collectionData, receiptDetails] = await Promise.all([
        fetchTSHOTBalance(address),
        fetchTopShotCollection(address),
        fetchReceiptDetails(address),
      ]);

      const isParentAccount = state.accountData.parentAddress === address;

      if (isParentAccount) {
        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: {
            tshotBalance,
            nftDetails: collectionData.details || [],
            hasCollection: collectionData.hasCollection,
            tierCounts:
              collectionData.tierCounts || initialState.accountData.tierCounts,
            receiptDetails,
            hasReceipt: receiptDetails && receiptDetails.betAmount > 0,
          },
        });
      } else {
        const updatedChildrenData = state.accountData.childrenData.map(
          (child) =>
            child.addr === address
              ? {
                  ...child,
                  tshotBalance,
                  nftDetails: collectionData.details || [],
                  hasCollection: collectionData.hasCollection,
                  tierCounts:
                    collectionData.tierCounts ||
                    initialState.accountData.tierCounts,
                  receiptDetails,
                  hasReceipt: receiptDetails && receiptDetails.betAmount > 0,
                }
              : child
        );
        dispatch({
          type: "SET_CHILDREN_DATA",
          payload: updatedChildrenData,
        });
      }
    } catch (error) {
      console.error("Error refreshing balances:", error);
    }
  };

  const fetchTSHOTBalance = async (address) => {
    const balance = await fcl.query({
      cadence: getTSHOTBalance,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return balance;
  };

  const fetchTopShotCollection = async (address) => {
    if (!address || !address.startsWith("0x")) {
      return { hasCollection: false, details: [], tierCounts: {} };
    }

    try {
      const hasCollection = await fcl.query({
        cadence: verifyTopShotCollection,
        args: (arg, t) => [arg(address, t.Address)],
      });

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

        details.forEach((nft) => {
          const tier = nft.tier?.toLowerCase();
          if (tier && tierCounts.hasOwnProperty(tier)) {
            tierCounts[tier]++;
          }
        });

        return { hasCollection: true, details, tierCounts };
      } else {
        return { hasCollection: false, details: [], tierCounts: {} };
      }
    } catch (error) {
      console.error(`Error fetching collection for address ${address}:`, error);
      return { hasCollection: false, details: [], tierCounts: {} };
    }
  };

  const fetchReceiptDetails = async (address) => {
    const receiptDetails = await fcl.query({
      cadence: getReceiptDetails,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return receiptDetails;
  };

  const fetchHasChildren = async (address) => {
    const hasChildren = await fcl.query({
      cadence: hasChildrenCadence,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return hasChildren;
  };

  const fetchChildrenAddresses = async (parentAddress) => {
    const children = await fcl.query({
      cadence: getChildren,
      args: (arg, t) => [arg(parentAddress, t.Address)],
    });
    return children;
  };

  useEffect(() => {
    console.log("Updated UserContext State:", state);
  }, [state]);

  const value = useMemo(
    () => ({
      ...state,
      dispatch,
      refreshBalances,
      resetState,
      setSelectedAccount,
    }),
    [state]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
