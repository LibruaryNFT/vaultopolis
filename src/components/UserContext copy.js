import React, { createContext, useReducer, useEffect, useMemo } from "react";
import * as fcl from "@onflow/fcl";
import pLimit from "p-limit";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionIDs";
import { getTopShotCollectionBatched } from "../flow/getTopShotCollectionBatched";
import { getFLOWBalance } from "../flow/getFLOWBalance";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { hasChildren as hasChildrenCadence } from "../flow/hasChildren";
import { getChildren } from "../flow/getChildren";
import { getFlowPricePerNFT } from "../flow/getFlowPricePerNFT"; // Import cadence script for FLOW per NFT

export const UserContext = createContext();

// Define enrichWithMetadata at the top so it’s available everywhere in this file.
const enrichWithMetadata = async (details, metadataCache) => {
  if (!metadataCache) return details;
  return details.map((nft) => {
    const key = `${nft.setID}-${nft.playID}`;
    const meta = metadataCache[key];
    if (meta) {
      return {
        ...nft,
        tier: meta.tier,
        fullName: meta.FullName,
        momentCount: Number(meta.momentCount),
        jerseyNumber: meta.JerseyNumber,
        retired: meta.retired,
        playOrder: meta.playOrder,
        series: meta.series,
        name: meta.name,
      };
    }
    return nft;
  });
};

const initialState = {
  user: { loggedIn: null, addr: "" },
  accountData: {
    parentAddress: null,
    nftDetails: [],
    flowBalance: null,
    tshotBalance: null, // TSHot balance for the parent
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
  flowPricePerNFT: null, // New property to store FLOW price per NFT
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
    case "SET_FLOW_PRICE_PER_NFT": // New action to store FLOW price per NFT
      return { ...state, flowPricePerNFT: action.payload };
    default:
      return state;
  }
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const setSelectedAccount = (address) => {
    const isChild = state.accountData.childrenAddresses.includes(address);
    dispatch({
      type: "SET_SELECTED_ACCOUNT",
      payload: { address, type: isChild ? "child" : "parent" },
    });
  };

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

  const fetchTopShotCollection = async (address) => {
    if (!address || !address.startsWith("0x"))
      return { hasCollection: false, details: [] };

    try {
      const hasCollection = await fcl.query({
        cadence: verifyTopShotCollection,
        args: (arg, t) => [arg(address, t.Address)],
      });
      if (!hasCollection) {
        return { hasCollection: false, details: [] };
      }

      const ids = await fcl.query({
        cadence: getTopShotCollectionIDs,
        args: (arg, t) => [arg(address, t.Address)],
      });

      if (!ids || ids.length === 0) {
        return { hasCollection: true, details: [] };
      }

      const batchSize = 2500;
      const batches = [];
      for (let i = 0; i < ids.length; i += batchSize) {
        batches.push(ids.slice(i, i + batchSize));
      }

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

      const details = batchResults.flat().map((nft) => ({
        ...nft,
        id: Number(nft.id),
        setID: Number(nft.setID),
        playID: Number(nft.playID),
        serialNumber: Number(nft.serialNumber),
        isLocked: Boolean(nft.isLocked),
      }));

      const effectiveMetadata =
        state.metadataCache ||
        JSON.parse(localStorage.getItem("topshotMetadata") || "{}");

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

  // New: Fetch TSHot balance
  const fetchTSHOTBalance = async (address) => {
    try {
      const balance = await fcl.query({
        cadence: getTSHOTBalance,
        args: (arg, t) => [arg(address, t.Address)],
      });
      return balance;
    } catch (error) {
      console.error(
        `Error fetching TSHot balance for ${address}: ${error.message}`
      );
      return state.accountData.tshotBalance || 0;
    }
  };

  // Separate refresh functions for FLOW balance and NFT collection
  const refreshFLOWBalanceOnly = async (address) => {
    if (!address || !address.startsWith("0x")) return;
    try {
      const flowBalance = await fetchFLOWBalance(address);
      const isParent = state.accountData.parentAddress === address;

      if (isParent) {
        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: { flowBalance },
        });
      } else {
        const updatedChildrenData = state.accountData.childrenData.map(
          (child) =>
            child.addr === address ? { ...child, flowBalance } : child
        );
        dispatch({ type: "SET_CHILDREN_DATA", payload: updatedChildrenData });
      }
    } catch (error) {
      console.error("Error refreshing FLOW balance for", address, error);
    }
  };

  // New: Refresh TSHot balance only
  const refreshTSHOTBalanceOnly = async (address) => {
    if (!address || !address.startsWith("0x")) return;
    try {
      const tshotBalance = await fetchTSHOTBalance(address);
      const isParent = state.accountData.parentAddress === address;

      if (isParent) {
        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: { tshotBalance },
        });
      } else {
        const updatedChildrenData = state.accountData.childrenData.map(
          (child) =>
            child.addr === address ? { ...child, tshotBalance } : child
        );
        dispatch({ type: "SET_CHILDREN_DATA", payload: updatedChildrenData });
      }
    } catch (error) {
      console.error("Error refreshing TSHot balance for", address, error);
    }
  };

  const refreshNFTCollectionOnly = async (address) => {
    if (!address || !address.startsWith("0x")) return;
    dispatch({ type: "SET_REFRESHING_STATE", payload: true });
    try {
      const collectionData = await fetchTopShotCollection(address);
      const isParent = state.accountData.parentAddress === address;

      if (isParent) {
        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: {
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
                  nftDetails: collectionData.details || [],
                  hasCollection: collectionData.hasCollection,
                }
              : child
        );
        dispatch({ type: "SET_CHILDREN_DATA", payload: updatedChildrenData });
      }
    } catch (error) {
      console.error("Error refreshing NFT collection for", address, error);
    } finally {
      dispatch({ type: "SET_REFRESHING_STATE", payload: false });
    }
  };

  // Main refresh function that can be used to refresh all balances and collection
  const refreshBalances = async (address) => {
    if (!address || !address.startsWith("0x")) return;
    dispatch({ type: "SET_REFRESHING_STATE", payload: true });
    try {
      await Promise.all([
        refreshFLOWBalanceOnly(address),
        refreshTSHOTBalanceOnly(address),
        refreshNFTCollectionOnly(address),
      ]);
    } catch (error) {
      console.error("Error refreshing data for", address, error);
    } finally {
      dispatch({ type: "SET_REFRESHING_STATE", payload: false });
    }
  };

  const loadParentData = async (address) => {
    if (!address || !address.startsWith("0x")) return;
    try {
      dispatch({ type: "SET_REFRESHING_STATE", payload: true });
      const [flowBalance, tshotBalance, collectionData] = await Promise.all([
        fetchFLOWBalance(address),
        fetchTSHOTBalance(address),
        fetchTopShotCollection(address),
      ]);
      dispatch({
        type: "SET_ACCOUNT_DATA",
        payload: {
          parentAddress: address,
          flowBalance,
          tshotBalance,
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

  const loadChildrenData = async (childrenAddresses) => {
    try {
      const childrenData = await Promise.all(
        childrenAddresses.map(async (childAddr) => {
          const [flowBalance, tshotBalance, collectionData] = await Promise.all(
            [
              fetchFLOWBalance(childAddr),
              fetchTSHOTBalance(childAddr),
              fetchTopShotCollection(childAddr),
            ]
          );
          return {
            addr: childAddr,
            flowBalance,
            tshotBalance,
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

  const loadInitialData = async (address) => {
    try {
      await Promise.all([loadParentData(address), checkForChildren(address)]);
    } catch (error) {
      console.error("Error in initial load:", error);
    }
  };

  // Effect for loading metadata on mount
  useEffect(() => {
    loadTopShotMetadata();
  }, []);

  // New: Effect to load FLOW price per NFT on mount
  useEffect(() => {
    const loadFlowPrice = async () => {
      try {
        const price = await fcl.query({
          cadence: getFlowPricePerNFT,
          args: (arg, t) => [],
        });
        dispatch({ type: "SET_FLOW_PRICE_PER_NFT", payload: price });
      } catch (error) {
        console.error("Error fetching flow price per NFT:", error);
      }
    };
    loadFlowPrice();
  }, []);

  // Effect for FCL authentication subscription
  useEffect(() => {
    const userUnsubscribe = fcl.currentUser.subscribe(async (currentUser) => {
      dispatch({ type: "SET_USER", payload: currentUser });
      if (currentUser?.loggedIn) {
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

  // Effect for polling FLOW and TSHot balances (not NFTs)
  useEffect(() => {
    if (state.user && state.user.addr) {
      console.log("Starting polling for balance refresh...");
      const intervalId = setInterval(() => {
        console.log(
          "Polling balance refresh for parent account:",
          state.user.addr
        );
        refreshFLOWBalanceOnly(state.user.addr);
        refreshTSHOTBalanceOnly(state.user.addr);

        if (state.accountData.childrenAddresses.length > 0) {
          state.accountData.childrenAddresses.forEach((addr) => {
            console.log("Polling balance refresh for child account:", addr);
            refreshFLOWBalanceOnly(addr);
            refreshTSHOTBalanceOnly(addr);
          });
        }
      }, 30000); // Poll every 30 seconds for balances only

      return () => {
        clearInterval(intervalId);
        console.log("Polling for balance refresh stopped.");
      };
    }
  }, [state.user, state.accountData.childrenAddresses]);

  // Development logging
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
      refreshFLOWBalanceOnly,
      refreshTSHOTBalanceOnly,
      refreshNFTCollectionOnly,
      setSelectedAccount,
    }),
    [state]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
