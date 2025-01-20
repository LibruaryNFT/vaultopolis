// src/contexts/UserContext.js

import React, { createContext, useReducer, useEffect, useMemo } from "react";
import * as fcl from "@onflow/fcl";
import pLimit from "p-limit";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionIDs";
import { getTopShotCollectionBatched } from "../flow/getTopShotCollectionBatched";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { getFLOWBalance } from "../flow/getFLOWBalance";
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
    flowBalance: null,
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
  isRefreshing: false,
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
    case "SET_REFRESHING_STATE":
      return { ...state, isRefreshing: action.payload };
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

  // Update refreshBalances to handle errors better
  const refreshBalances = async (address) => {
    if (!address || !address.startsWith("0x")) return;

    dispatch({ type: "SET_REFRESHING_STATE", payload: true });
    try {
      const [collectionData, receiptDetails] = await Promise.allSettled([
        fetchTopShotCollection(address),
        fetchReceiptDetails(address),
      ]);

      const isParentAccount = state.accountData.parentAddress === address;

      // Only update with successful responses
      const updates = {
        ...(collectionData.status === "fulfilled"
          ? {
              nftDetails: collectionData.value.details || [],
              hasCollection: collectionData.value.hasCollection,
              tierCounts:
                collectionData.value.tierCounts ||
                initialState.accountData.tierCounts,
            }
          : {}),
        ...(receiptDetails.status === "fulfilled"
          ? {
              receiptDetails: receiptDetails.value,
              hasReceipt:
                receiptDetails.value && receiptDetails.value.betAmount > 0,
            }
          : {}),
      };

      if (Object.keys(updates).length > 0) {
        if (isParentAccount) {
          dispatch({
            type: "SET_ACCOUNT_DATA",
            payload: updates,
          });
        } else {
          const updatedChildrenData = state.accountData.childrenData.map(
            (child) =>
              child.addr === address ? { ...child, ...updates } : child
          );
          dispatch({ type: "SET_CHILDREN_DATA", payload: updatedChildrenData });
        }
      }
    } catch (error) {
      console.error("Error refreshing balances:", error);
      // State remains unchanged if there's an error
    } finally {
      dispatch({ type: "SET_REFRESHING_STATE", payload: false });
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
      const [tshotBalance, flowBalance, collectionData, receiptDetails] =
        await Promise.all([
          fetchTSHOTBalance(address),
          fetchFLOWBalance(address),
          fetchTopShotCollection(address),
          fetchReceiptDetails(address),
        ]);

      dispatch({
        type: "SET_ACCOUNT_DATA",
        payload: {
          parentAddress: address,
          tshotBalance,
          flowBalance,
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
            const [tshotBalance, flowBalance, collectionData, receiptDetails] =
              await Promise.all([
                fetchTSHOTBalance(childAddr),
                fetchFLOWBalance(childAddr),
                fetchTopShotCollection(childAddr),
                fetchReceiptDetails(childAddr),
              ]);

            return {
              addr: childAddr,
              tshotBalance,
              flowBalance,
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
    try {
      const balance = await fcl.query({
        cadence: getTSHOTBalance,
        args: (arg, t) => [arg(address, t.Address)],
      });
      return balance;
    } catch (error) {
      console.error(`Error fetching TSHOT balance: ${error.message}`);
      // Return last known balance instead of failing
      const currentBalance = state.accountData.tshotBalance || 0;
      return currentBalance;
    }
  };

  const fetchFLOWBalance = async (address) => {
    try {
      const balance = await fcl.query({
        cadence: getFLOWBalance, // must import getFLOWBalance at top
        args: (arg, t) => [arg(address, t.Address)],
      });
      return balance;
    } catch (error) {
      console.error(`Error fetching FLOW balance: ${error.message}`);
      // Return last known if needed
      const currentFlow = state.accountData.flowBalance || 0;
      return currentFlow;
    }
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

      const batchSize = 500;
      const concurrencyLimit = 10;
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
    if (!details?.length) return details;

    try {
      // Get unique setIDs and playIDs
      const uniqueSetIDs = [...new Set(details.map((nft) => nft.setID))];
      const uniquePlayIDs = [...new Set(details.map((nft) => nft.playID))];

      // Batch metadata requests by unique IDs
      const [editions, tiers, sets, plays] = await Promise.all([
        Promise.all(
          uniqueSetIDs.map((setID) =>
            Promise.all(
              uniquePlayIDs.map((playID) =>
                fetchMetadata("topshot-editions", { setID, playID })
              )
            )
          )
        ).then((results) => results.flat(2)),
        Promise.all(
          uniqueSetIDs.map((setID) =>
            Promise.all(
              uniquePlayIDs.map((playID) =>
                fetchMetadata("topshot-tiers", { setID, playID })
              )
            )
          )
        ).then((results) => results.flat(2)),
        Promise.all(
          uniqueSetIDs.map((setID) =>
            fetchMetadata("topshot-sets", { id: setID })
          )
        ).then((results) => results.flat()),
        Promise.all(
          uniquePlayIDs.map((playID) =>
            fetchMetadata("topshot-plays", { playID: playID })
          )
        ).then((results) => results.flat()),
      ]);

      // Create optimized lookup maps
      const editionsMap = createMetadataMap(editions.filter(Boolean), [
        "setID",
        "playID",
      ]);
      const tiersMap = createMetadataMap(tiers.filter(Boolean), [
        "setID",
        "playID",
      ]);
      const setsMap = createMetadataMap(sets.filter(Boolean), ["id"]);
      const playsMap = createMetadataMap(plays.filter(Boolean), ["PlayID"]);

      return details.map((nft) => {
        const key = `${nft.setID}-${nft.playID}`;
        const setMetadata = setsMap[nft.setID] || {};
        const playMetadata = playsMap[nft.playID] || {};
        const editionMetadata = editionsMap[key] || {};
        const tierMetadata = tiersMap[key] || {};

        return {
          ...nft,
          numMomentsInEdition: editionMetadata?.momentCount || null,
          tier: tierMetadata?.tier || null,
          setName: setMetadata?.name || null,
          series: setMetadata?.series ?? null,
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

  const fetchMetadata = async (endpoint, params = {}) => {
    try {
      // Filter out null/undefined values and convert numbers to strings
      const validParams = Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined)
        .reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {});

      const queryString = new URLSearchParams(validParams).toString();
      const baseUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://flowconnectbackend-864654c6a577.herokuapp.com";
      const url = `${baseUrl}/${endpoint}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint} metadata:`, error);
      return [];
    }
  };

  const createMetadataMap = (data, keys) =>
    data.reduce((map, item) => {
      const compositeKey = keys.map((k) => item[k]).join("-");
      map[compositeKey] = item;
      return map;
    }, {});

  useEffect(() => {
    const userUnsubscribe = fcl.currentUser.subscribe(async (currentUser) => {
      dispatch({ type: "SET_USER", payload: currentUser });

      if (currentUser?.loggedIn) {
        // Initial load of data
        await loadParentData(currentUser.addr);
        await checkForChildren(currentUser.addr);
        setSelectedAccount(currentUser.addr);
      } else {
        dispatch({ type: "RESET_STATE" });
      }
    });

    return () => {
      userUnsubscribe();
    };
  }, []);

  // Update the balance refresh effect
  useEffect(() => {
    let isSubscribed = true;
    const interval = setInterval(async () => {
      if (state.user?.loggedIn && state.user?.addr) {
        try {
          // 1) Fetch parent's TSHOT + FLOW
          const [parentTSHOT, parentFLOW] = await Promise.all([
            fetchTSHOTBalance(state.user.addr),
            fetchFLOWBalance(state.user.addr),
          ]);

          if (isSubscribed) {
            dispatch({
              type: "SET_ACCOUNT_DATA",
              payload: {
                tshotBalance: parentTSHOT,
                flowBalance: parentFLOW,
              },
            });
          }

          // 2) Update children's TSHOT + FLOW if any
          if (state.accountData.childrenAddresses.length > 0) {
            const childrenUpdates = await Promise.allSettled(
              state.accountData.childrenAddresses.map(async (childAddr) => {
                const [childTSHOT, childFLOW] = await Promise.all([
                  fetchTSHOTBalance(childAddr),
                  fetchFLOWBalance(childAddr),
                ]);
                return { addr: childAddr, tshot: childTSHOT, flow: childFLOW };
              })
            );

            if (isSubscribed) {
              const updatedChildrenData = state.accountData.childrenData.map(
                (child) => {
                  const update = childrenUpdates.find(
                    (result) =>
                      result.status === "fulfilled" &&
                      result.value.addr === child.addr
                  );
                  return update
                    ? {
                        ...child,
                        tshotBalance: update.value.tshot,
                        flowBalance: update.value.flow,
                      }
                    : child;
                }
              );
              dispatch({
                type: "SET_CHILDREN_DATA",
                payload: updatedChildrenData,
              });
            }
          }
        } catch (error) {
          console.error("Error in balance refresh:", error);
          // Don't update state if there's an error - keep previous values
        }
      }
    }, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [state.user?.addr, state.accountData.childrenAddresses]);

  // Keep the existing collection refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.user?.loggedIn) {
        refreshBalances(state.user.addr);
        state.accountData.childrenAddresses.forEach((addr) =>
          refreshBalances(addr)
        );
      }
    }, 30000); // Collection updates every 30 seconds

    return () => clearInterval(interval);
  }, [state.user, state.accountData.childrenAddresses]);

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
