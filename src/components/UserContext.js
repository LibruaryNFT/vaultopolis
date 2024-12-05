// src/contexts/UserContext.js

import React, { createContext, useReducer, useEffect, useMemo } from "react";
import * as fcl from "@onflow/fcl";
import pLimit from "p-limit";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionIDs";
import { getTopShotCollectionBatched } from "../flow/getTopShotCollectionBatched";
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

  const refreshAllBalances = async () => {
    const parentAddress = state.accountData.parentAddress;
    if (!parentAddress) return;

    await refreshBalances(parentAddress);
    await Promise.all(
      state.accountData.childrenAddresses.map((childAddr) =>
        refreshBalances(childAddr)
      )
    );
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

      if (!hasCollection) {
        return { hasCollection: false, details: [], tierCounts: {} };
      }

      const ids = await fcl.query({
        cadence: getTopShotCollectionIDs,
        args: (arg, t) => [arg(address, t.Address)],
      });

      const batchSize = 1500;
      const concurrencyLimit = 5;
      const limit = pLimit(concurrencyLimit);

      const batches = [];
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        batches.push(batch);
      }

      const batchPromises = batches.map((batch) =>
        limit(() =>
          fcl.query({
            cadence: getTopShotCollectionBatched,
            args: (arg, t) => [
              arg(address, t.Address),
              arg(batch, t.Array(t.UInt64)),
            ],
          })
        )
      );

      const batchResults = await Promise.all(batchPromises);
      const details = batchResults.flat();

      // Ensure correct data types
      const processedDetails = details.map((nft) => ({
        ...nft,
        id: Number(nft.id),
        setID: Number(nft.setID),
        playID: Number(nft.playID),
        serialNumber: Number(nft.serialNumber),
        isLocked: Boolean(nft.isLocked),
      }));

      // Enrich metadata
      const enrichedDetails = await enrichNFTMetadata(processedDetails);

      // Tier counts
      const tierCounts = enrichedDetails.reduce(
        (counts, nft) => {
          const tier = nft.tier?.toLowerCase();
          if (tier && counts.hasOwnProperty(tier)) {
            counts[tier]++;
          }
          return counts;
        },
        { ...initialState.accountData.tierCounts }
      );

      return { hasCollection: true, details: enrichedDetails, tierCounts };
    } catch (error) {
      console.error(`Error fetching collection for ${address}:`, error);
      return { hasCollection: false, details: [], tierCounts: {} };
    }
  };

  const enrichNFTMetadata = async (details) => {
    try {
      const [editions, tiers, sets, plays] = await Promise.all([
        fetchMetadata("topshot-editions"),
        fetchMetadata("topshot-tiers"),
        fetchMetadata("topshot-sets"),
        fetchMetadata("topshot-plays"),
      ]);

      // Create maps for metadata with numeric keys
      const editionsMap = createMetadataMap(editions, ["setID", "playID"]);
      const tiersMap = createMetadataMap(tiers, ["setID", "playID"]);
      const setsMap = createMetadataMap(sets, ["id"]);
      const playsMap = createMetadataMap(plays, ["PlayID"]);

      return details.map((nft) => {
        const key = `${nft.setID}-${nft.playID}`;
        const setMetadata = setsMap[nft.setID];
        const playMetadata = playsMap[nft.playID];
        const editionMetadata = editionsMap[key];
        const tierMetadata = tiersMap[key];

        return {
          ...nft,
          numMomentsInEdition: editionMetadata?.momentCount || null,
          tier: tierMetadata?.tier || null,
          setName: setMetadata?.name || null,
          series:
            setMetadata && setMetadata.series !== undefined
              ? setMetadata.series
              : null,
          playerName:
            playMetadata?.FullName ||
            (playMetadata?.FirstName && playMetadata?.LastName
              ? `${playMetadata.FirstName} ${playMetadata.LastName}`
              : null),
        };
      });
    } catch (error) {
      console.error("Error enriching NFT metadata:", error);
      return details;
    }
  };

  const fetchMetadata = async (endpoint) => {
    const response = await fetch(
      `https://flowconnectbackend-864654c6a577.herokuapp.com/${endpoint}`
    );
    return response.json();
  };

  const createMetadataMap = (data, keys) =>
    data.reduce((map, item) => {
      const compositeKey = keys.map((k) => item[k]).join("-");
      map[compositeKey] = item;
      return map;
    }, {});

  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe(async (currentUser) => {
      dispatch({ type: "SET_USER", payload: currentUser });

      if (currentUser?.loggedIn) {
        await loadParentData(currentUser.addr);
        await checkForChildren(currentUser.addr);
        setSelectedAccount(currentUser.addr);
        await refreshAllBalances();
      } else {
        dispatch({ type: "RESET_STATE" });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (state.user?.loggedIn) {
        refreshAllBalances();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [state.user, state.accountData]);

  useEffect(() => {
    console.log("Updated UserContext State:", state);
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
