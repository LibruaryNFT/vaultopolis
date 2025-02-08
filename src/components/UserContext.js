// src/contexts/UserContext.js
import React, { createContext, useReducer, useEffect, useMemo } from "react";
import * as fcl from "@onflow/fcl";
import pLimit from "p-limit";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionIDs";
import { getTopShotCollectionBatched } from "../flow/getTopShotCollectionBatched";
import { getFLOWBalance } from "../flow/getFLOWBalance";
import { hasChildren as hasChildrenCadence } from "../flow/hasChildren";
import { getChildren } from "../flow/getChildren";

export const UserContext = createContext();

const initialState = {
  user: { loggedIn: null, addr: "" },
  accountData: {
    parentAddress: null,
    nftDetails: [],
    flowBalance: null,
    hasCollection: null,
    hasChildren: false,
    childrenData: [],
    childrenAddresses: [],
  },
  selectedAccount: null,
  selectedAccountType: "parent",
  selectedNFTs: [],
  isRefreshing: false,
  isLoadingChildren: false,
  metadataCache: null,
};

/**
 * Enrich the NFT details with metadata loaded from our single API endpoint.
 * Each NFT is looked up by a composite key: "setID-playID".
 */
const enrichWithMetadata = async (details, metadataCache) => {
  if (!metadataCache) return details;
  return details.map((nft) => {
    const key = `${nft.setID}-${nft.playID}`;
    const meta = metadataCache[key];
    if (meta) {
      return {
        ...nft,
        tier: meta.tier, // e.g., "ultimate"
        fullName: meta.FullName, // e.g., "Trae Young"
        momentCount: Number(meta.momentCount), // e.g., 1
        jerseyNumber: meta.JerseyNumber, // e.g., "11"
        retired: meta.retired,
        playOrder: meta.playOrder,
        series: meta.series,
        name: meta.name,
      };
    }
    return nft;
  });
};

function userReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_METADATA_CACHE":
      return { ...state, metadataCache: action.payload };
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
    case "SET_REFRESHING_STATE":
      return { ...state, isRefreshing: action.payload };
    case "SET_LOADING_CHILDREN":
      return { ...state, isLoadingChildren: action.payload };
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

  // -------------------------------
  // Helper: Set the selected account.
  // -------------------------------
  const setSelectedAccount = (address) => {
    const isChild = state.accountData.childrenAddresses.includes(address);
    dispatch({
      type: "SET_SELECTED_ACCOUNT",
      payload: { address, type: isChild ? "child" : "parent" },
    });
  };

  // -------------------------------
  // Helper: Load metadata from the API endpoint.
  // -------------------------------
  const loadTopShotMetadata = async () => {
    try {
      const cachedData = localStorage.getItem("topshotMetadata");
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        dispatch({
          type: "SET_METADATA_CACHE",
          payload: parsed,
        });
        return parsed;
      }
      const baseUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://flowconnectbackend-864654c6a577.herokuapp.com";
      const response = await fetch(`${baseUrl}/topshot-data`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      // Create a lookup map keyed by "setID-playID".
      const metadataMap = data.reduce((acc, item) => {
        const key = `${item.setID}-${item.playID}`;
        acc[key] = item;
        return acc;
      }, {});
      localStorage.setItem("topshotMetadata", JSON.stringify(metadataMap));
      dispatch({ type: "SET_METADATA_CACHE", payload: metadataMap });
      return metadataMap;
    } catch (error) {
      console.error("Error loading TopShot metadata:", error);
    }
  };

  // -------------------------------
  // Fetch and enrich the Top Shot collection from Flow.
  // -------------------------------
  const fetchTopShotCollection = async (address) => {
    if (!address || !address.startsWith("0x"))
      return { hasCollection: false, details: [] };

    try {
      // Verify that the collection exists.
      const hasCollection = await fcl.query({
        cadence: verifyTopShotCollection,
        args: (arg, t) => [arg(address, t.Address)],
      });
      if (!hasCollection) {
        return { hasCollection: false, details: [] };
      }

      // Fetch the NFT IDs.
      const ids = await fcl.query({
        cadence: getTopShotCollectionIDs,
        args: (arg, t) => [arg(address, t.Address)],
      });

      if (!ids || ids.length === 0) {
        return { hasCollection: true, details: [] };
      }

      // Split the IDs into batches.
      const batchSize = 2500;
      const batches = [];
      for (let i = 0; i < ids.length; i += batchSize) {
        batches.push(ids.slice(i, i + batchSize));
      }

      // Query batches concurrently.
      const limit = pLimit(30);
      const batchResults = await Promise.all(
        batches.map((batch) =>
          limit(() =>
            fcl.query({
              cadence: getTopShotCollectionBatched,
              args: (arg, t) => [
                arg(address, t.Address),
                arg(batch, t.Array(t.UInt64)),
              ],
            })
          )
        )
      );

      // Normalize NFT details.
      const details = batchResults.flat().map((nft) => ({
        ...nft,
        id: Number(nft.id),
        setID: Number(nft.setID),
        playID: Number(nft.playID),
        serialNumber: Number(nft.serialNumber),
        isLocked: Boolean(nft.isLocked),
      }));

      // Use effective metadata: prefer state, fallback to localStorage.
      const effectiveMetadata =
        state.metadataCache ||
        JSON.parse(localStorage.getItem("topshotMetadata") || "{}");

      // Enrich NFT details.
      const enrichedDetails = await enrichWithMetadata(
        details,
        effectiveMetadata
      );
      return { hasCollection: true, details: enrichedDetails };
    } catch (error) {
      console.error(`Error fetching collection for ${address}:`, error);
      return { hasCollection: false, details: [] };
    }
  };

  // -------------------------------
  // Fetch the FLOW balance.
  // -------------------------------
  const fetchFLOWBalance = async (address) => {
    try {
      const balance = await fcl.query({
        cadence: getFLOWBalance,
        args: (arg, t) => [arg(address, t.Address)],
      });
      return balance;
    } catch (error) {
      console.error(
        `Error fetching FLOW balance for ${address}: ${error.message}`
      );
      return state.accountData.flowBalance || 0;
    }
  };

  // -------------------------------
  // Load parent account data: balance and NFT collection.
  // -------------------------------
  const loadParentData = async (address) => {
    if (!address || !address.startsWith("0x")) return;
    try {
      dispatch({ type: "SET_REFRESHING_STATE", payload: true });
      const [flowBalance, collectionData] = await Promise.all([
        fetchFLOWBalance(address),
        fetchTopShotCollection(address),
      ]);
      dispatch({
        type: "SET_ACCOUNT_DATA",
        payload: {
          parentAddress: address,
          flowBalance,
          nftDetails: collectionData.details || [],
          hasCollection: collectionData.hasCollection,
        },
      });
    } catch (error) {
      console.error("Error loading parent account data:", error);
    } finally {
      dispatch({ type: "SET_REFRESHING_STATE", payload: false });
    }
  };

  // -------------------------------
  // Load children account data.
  // -------------------------------
  const loadChildrenData = async (childrenAddresses) => {
    try {
      const childrenData = await Promise.all(
        childrenAddresses.map(async (childAddr) => {
          const [flowBalance, collectionData] = await Promise.all([
            fetchFLOWBalance(childAddr),
            fetchTopShotCollection(childAddr),
          ]);
          return {
            addr: childAddr,
            flowBalance,
            nftDetails: collectionData.details || [],
            hasCollection: collectionData.hasCollection,
          };
        })
      );
      dispatch({ type: "SET_CHILDREN_DATA", payload: childrenData });
      dispatch({ type: "SET_CHILDREN_ADDRESSES", payload: childrenAddresses });
    } catch (error) {
      console.error("Error loading children data:", error);
    }
  };

  // -------------------------------
  // Check for children accounts.
  // -------------------------------
  const checkForChildren = async (parentAddress) => {
    dispatch({ type: "SET_LOADING_CHILDREN", payload: true });
    try {
      const hasChildrenStatus = await fcl.query({
        cadence: hasChildrenCadence,
        args: (arg, t) => [arg(parentAddress, t.Address)],
      });
      dispatch({
        type: "SET_ACCOUNT_DATA",
        payload: { hasChildren: hasChildrenStatus },
      });
      if (hasChildrenStatus) {
        const children = await fcl.query({
          cadence: getChildren,
          args: (arg, t) => [arg(parentAddress, t.Address)],
        });
        await loadChildrenData(children);
      }
      return hasChildrenStatus;
    } catch (error) {
      console.error("Error fetching children data:", error);
      return false;
    } finally {
      dispatch({ type: "SET_LOADING_CHILDREN", payload: false });
    }
  };

  // -------------------------------
  // Refresh balances and collection for an address.
  // -------------------------------
  const refreshBalances = async (address) => {
    if (!address || !address.startsWith("0x")) return;
    dispatch({ type: "SET_REFRESHING_STATE", payload: true });
    try {
      const [flowBalance, collectionData] = await Promise.all([
        fetchFLOWBalance(address),
        fetchTopShotCollection(address),
      ]);
      const isParentAccount = state.accountData.parentAddress === address;
      if (isParentAccount) {
        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: {
            flowBalance,
            nftDetails: collectionData.details || [],
            hasCollection: collectionData.hasCollection,
          },
        });
      } else {
        const updatedChildrenData = state.accountData.childrenData.map(
          (child) =>
            child.addr === address
              ? {
                  ...child,
                  flowBalance,
                  nftDetails: collectionData.details || [],
                  hasCollection: collectionData.hasCollection,
                }
              : child
        );
        dispatch({ type: "SET_CHILDREN_DATA", payload: updatedChildrenData });
      }
    } catch (error) {
      console.error("Error refreshing data for", address, error);
    } finally {
      dispatch({ type: "SET_REFRESHING_STATE", payload: false });
    }
  };

  // -------------------------------
  // Refresh data for parent and all children.
  // -------------------------------
  const refreshAllBalances = async () => {
    const parentAddress = state.accountData.parentAddress;
    if (!parentAddress) return;
    try {
      dispatch({ type: "SET_REFRESHING_STATE", payload: true });
      await Promise.all([
        refreshBalances(parentAddress),
        ...state.accountData.childrenAddresses.map((addr) =>
          refreshBalances(addr)
        ),
      ]);
    } catch (error) {
      console.error("Error refreshing all balances:", error);
    } finally {
      dispatch({ type: "SET_REFRESHING_STATE", payload: false });
    }
  };

  // -------------------------------
  // Initial data load for the signed-in user.
  // -------------------------------
  const loadInitialData = async (address) => {
    try {
      await Promise.all([loadParentData(address), checkForChildren(address)]);
    } catch (error) {
      console.error("Error in initial load:", error);
    }
  };

  // -------------------------------
  // Effects
  // -------------------------------
  // Load metadata on mount.
  useEffect(() => {
    loadTopShotMetadata();
  }, []);

  // Subscribe to FCL user authentication changes.
  useEffect(() => {
    const userUnsubscribe = fcl.currentUser.subscribe(async (currentUser) => {
      dispatch({ type: "SET_USER", payload: currentUser });
      if (currentUser?.loggedIn) {
        // Always load metadata (or reload) so that we have it available.
        await loadTopShotMetadata();
        await loadInitialData(currentUser.addr);
        setSelectedAccount(currentUser.addr);
      } else {
        dispatch({ type: "RESET_STATE" });
      }
    });
    return () => {
      userUnsubscribe();
    };
  }, []);

  // Log state changes in development.
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("UserContext State:", state);
    }
  }, [state]);

  const value = useMemo(
    () => ({
      ...state,
      dispatch,
      refreshBalances,
      refreshAllBalances,
      setSelectedAccount,
    }),
    [state]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
