// UserContext.js
import React, {
  createContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import * as fcl from "@onflow/fcl";
import pLimit from "p-limit";

import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionIDs";
import { getTopShotCollectionBatched } from "../flow/getTopShotCollectionBatched";
import { getFLOWBalance } from "../flow/getFLOWBalance";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { getReceiptDetails } from "../flow/getReceiptDetails";
import { hasChildren as hasChildrenCadence } from "../flow/hasChildren";
import { getChildren } from "../flow/getChildren";
import { getFlowPricePerNFT } from "../flow/getFlowPricePerNFT";

// ------------------
// Context + Reducer
// ------------------
export const UserContext = createContext();

const enrichWithMetadata = async (details, metadataCache) => {
  if (!metadataCache) return details;
  return details.map((nft) => {
    const key = `${nft.setID}-${nft.playID}`;
    const meta = metadataCache[key];
    if (meta) {
      return {
        ...nft,
        tier: meta.tier || nft.tier,
        fullName:
          meta.FullName ||
          meta.fullName ||
          nft.fullName ||
          nft.playerName ||
          "Unknown Player",
        momentCount: Number(meta.momentCount) || nft.momentCount,
        jerseyNumber:
          meta.JerseyNumber || meta.jerseyNumber || nft.jerseyNumber,
        retired: meta.retired !== undefined ? meta.retired : nft.retired,
        playOrder: meta.playOrder || nft.playOrder,
        series: meta.series || nft.series,
        name: meta.name || nft.name,
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
    tshotBalance: null,
    hasCollection: null,
    receiptDetails: {},
    hasReceipt: null,
    hasChildren: false,
    childrenData: [],
    childrenAddresses: [],
  },
  selectedAccount: null,
  selectedAccountType: "parent",
  selectedNFTs: [],
  isRefreshing: false, // Will only be toggled in loadAllUserData now
  isLoadingChildren: false,
  metadataCache: null,
  flowPricePerNFT: null,
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
    case "SET_SELECTED_NFTS": {
      const isSelected = state.selectedNFTs.includes(action.payload);
      return {
        ...state,
        selectedNFTs: isSelected
          ? state.selectedNFTs.filter((id) => id !== action.payload)
          : [...state.selectedNFTs, action.payload],
      };
    }
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
    case "SET_FLOW_PRICE_PER_NFT":
      return { ...state, flowPricePerNFT: action.payload };
    default:
      return state;
  }
}

// ------------------
// Provider
// ------------------
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Prevent repeated requests for this user session
  const [didLoad, setDidLoad] = useState(false);

  // ----------------------
  // Fetch Helpers
  // ----------------------
  const fetchFLOWBalance = useCallback(async (address) => {
    if (!address || !address.startsWith("0x")) {
      console.error("Invalid address for fetchFLOWBalance:", address);
      return 0;
    }
    try {
      const balance = await fcl.query({
        cadence: getFLOWBalance,
        args: (arg, t) => [arg(address, t.Address)],
      });
      return balance;
    } catch (error) {
      console.error(`Error fetching FLOW balance for ${address}:`, error);
      return 0;
    }
  }, []);

  const fetchTSHOTBalance = useCallback(async (address) => {
    if (!address || !address.startsWith("0x")) {
      console.error("Invalid address for fetchTSHOTBalance:", address);
      return 0;
    }
    try {
      const balance = await fcl.query({
        cadence: getTSHOTBalance,
        args: (arg, t) => [arg(address, t.Address)],
      });
      return balance;
    } catch (error) {
      console.error(`Error fetching TSHOT balance for ${address}:`, error);
      return 0;
    }
  }, []);

  const fetchReceiptDetails = useCallback(async (address) => {
    if (!address || !address.startsWith("0x")) {
      return {};
    }
    try {
      const receiptDetails = await fcl.query({
        cadence: getReceiptDetails,
        args: (arg, t) => [arg(address, t.Address)],
      });
      return receiptDetails;
    } catch (error) {
      console.error(`Error fetching receipt details for ${address}:`, error);
      return {};
    }
  }, []);

  const fetchTopShotCollection = useCallback(
    async (address) => {
      if (!address || !address.startsWith("0x")) {
        console.error("Invalid address for fetchTopShotCollection:", address);
        return { hasCollection: false, details: [], tierCounts: {} };
      }
      try {
        // 1) Verify collection
        const hasCollection = await fcl.query({
          cadence: verifyTopShotCollection,
          args: (arg, t) => [arg(address, t.Address)],
        });
        if (!hasCollection) {
          return { hasCollection: false, details: [], tierCounts: {} };
        }

        // 2) Get NFT IDs
        const ids = await fcl.query({
          cadence: getTopShotCollectionIDs,
          args: (arg, t) => [arg(address, t.Address)],
        });
        if (!ids || ids.length === 0) {
          return { hasCollection: true, details: [], tierCounts: {} };
        }

        // 3) Batch fetch details
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

        // Enrich with local metadata
        const effectiveMetadata =
          state.metadataCache ||
          JSON.parse(localStorage.getItem("topshotMetadata") || "{}");
        const enrichedDetails = await enrichWithMetadata(
          details,
          effectiveMetadata
        );

        // Tally tier counts
        const tierCounts = enrichedDetails.reduce((counts, nft) => {
          const tier = nft.tier?.toLowerCase();
          if (tier) {
            counts[tier] = (counts[tier] || 0) + 1;
          }
          return counts;
        }, {});

        return {
          hasCollection: true,
          details: enrichedDetails,
          tierCounts,
        };
      } catch (error) {
        console.error(`Error fetching collection for ${address}:`, error);
        return { hasCollection: false, details: [], tierCounts: {} };
      }
    },
    [state.metadataCache]
  );

  // ----------------------
  // Metadata Cache
  // ----------------------
  const loadTopShotMetadata = useCallback(async () => {
    try {
      const cachedData = localStorage.getItem("topshotMetadata");
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        dispatch({ type: "SET_METADATA_CACHE", payload: parsed });
        return parsed;
      }
      const baseUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://flowconnectbackend-864654c6a577.herokuapp.com";
      const response = await fetch(`${baseUrl}/topshot-data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      return {};
    }
  }, [dispatch]);

  // ----------------------
  // Core Loaders
  // ----------------------
  // (1) loadParentData: Remove any SET_REFRESHING_STATE lines
  const loadParentData = useCallback(
    async (address) => {
      if (!address || !address.startsWith("0x")) return;
      // DO NOT set isRefreshing here; let loadAllUserData control that
      try {
        const [flowBalance, tshotBalance, collectionData, receiptDetails] =
          await Promise.all([
            fetchFLOWBalance(address),
            fetchTSHOTBalance(address),
            fetchTopShotCollection(address),
            fetchReceiptDetails(address),
          ]);

        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: {
            parentAddress: address,
            flowBalance,
            tshotBalance,
            nftDetails: collectionData.details || [],
            hasCollection: collectionData.hasCollection,
            tierCounts: collectionData.tierCounts || {},
            receiptDetails,
            hasReceipt: receiptDetails?.betAmount > 0,
          },
        });
      } catch (error) {
        console.error("Error loading parent account data:", error);
      }
      // No finally block that sets isRefreshing = false
    },
    [
      fetchFLOWBalance,
      fetchTSHOTBalance,
      fetchTopShotCollection,
      fetchReceiptDetails,
      dispatch,
    ]
  );

  // (2) loadChildrenData: already uses its own SET_LOADING_CHILDREN, not isRefreshing
  const loadChildrenData = useCallback(
    async (childrenAddresses) => {
      if (!Array.isArray(childrenAddresses)) return;
      try {
        dispatch({ type: "SET_LOADING_CHILDREN", payload: true });

        const childrenData = await Promise.all(
          childrenAddresses.map(async (childAddr) => {
            const [flowBalance, tshotBalance, collectionData, receiptDetails] =
              await Promise.all([
                fetchFLOWBalance(childAddr),
                fetchTSHOTBalance(childAddr),
                fetchTopShotCollection(childAddr),
                fetchReceiptDetails(childAddr),
              ]);
            return {
              addr: childAddr,
              flowBalance,
              tshotBalance,
              nftDetails: collectionData.details || [],
              hasCollection: collectionData.hasCollection,
              tierCounts: collectionData.tierCounts || {},
              receiptDetails,
              hasReceipt: receiptDetails?.betAmount > 0,
            };
          })
        );

        dispatch({ type: "SET_CHILDREN_DATA", payload: childrenData });
        dispatch({
          type: "SET_CHILDREN_ADDRESSES",
          payload: childrenAddresses,
        });
      } catch (error) {
        console.error("Error loading children data:", error);
      } finally {
        dispatch({ type: "SET_LOADING_CHILDREN", payload: false });
      }
    },
    [
      fetchFLOWBalance,
      fetchTSHOTBalance,
      fetchTopShotCollection,
      fetchReceiptDetails,
      dispatch,
    ]
  );

  // (3) checkForChildren: sets isLoadingChildren, not isRefreshing
  const checkForChildren = useCallback(
    async (parentAddress) => {
      if (!parentAddress || !parentAddress.startsWith("0x")) return false;
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
    },
    [loadChildrenData, dispatch]
  );

  // ----------------------
  // Single "big" load call => controls isRefreshing
  // ----------------------
  const loadAllUserData = useCallback(
    async (address) => {
      if (!address) return;
      dispatch({ type: "SET_REFRESHING_STATE", payload: true });
      try {
        // 1) load metadata
        await loadTopShotMetadata();
        // 2) load parent
        await loadParentData(address);
        // 3) load children
        await checkForChildren(address);

        // 4) optional: flow price
        try {
          const price = await fcl.query({
            cadence: getFlowPricePerNFT,
            args: (arg, t) => [],
          });
          dispatch({ type: "SET_FLOW_PRICE_PER_NFT", payload: price });
        } catch (error) {
          console.error("Error fetching flow price per NFT:", error);
        }
      } catch (error) {
        console.error("loadAllUserData error:", error);
      } finally {
        // All done (or failed)
        dispatch({ type: "SET_REFRESHING_STATE", payload: false });
      }
    },
    [loadTopShotMetadata, loadParentData, checkForChildren, dispatch]
  );

  // ----------------------
  // FCL user subscription
  // ----------------------
  useEffect(() => {
    const userUnsubscribe = fcl.currentUser.subscribe((currentUser) => {
      dispatch({ type: "SET_USER", payload: currentUser });
      if (!currentUser?.loggedIn) {
        dispatch({ type: "RESET_STATE" });
        setDidLoad(false);
      }
    });
    return () => userUnsubscribe();
  }, [dispatch]);

  // ----------------------
  // Load data ONCE per login
  // ----------------------
  useEffect(() => {
    const { loggedIn, addr } = state.user || {};
    if (loggedIn && addr && !didLoad) {
      setDidLoad(true);
      loadAllUserData(addr).catch((err) =>
        console.error("loadAllUserData error:", err)
      );
    }
  }, [state.user, didLoad, loadAllUserData]);

  // ----------------------
  // OPTIONAL: Polling for balances
  // ----------------------
  useEffect(() => {
    const { loggedIn, addr } = state.user || {};
    if (!loggedIn || !addr) return;

    const intervalId = setInterval(async () => {
      try {
        const flowBalance = await fetchFLOWBalance(addr);
        const tshotBalance = await fetchTSHOTBalance(addr);
        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: { flowBalance, tshotBalance },
        });
      } catch (err) {
        console.error("Polling refresh error:", err);
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [state.user, fetchFLOWBalance, fetchTSHOTBalance, dispatch]);

  // Debug/logging (optional)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("UserContext State:", state);
    }
  }, [state]);

  // ----------------------
  // Final context value
  // ----------------------
  const value = useMemo(
    () => ({
      ...state,
      dispatch,
      loadAllUserData, // Exposed for "Refresh"
    }),
    [state, loadAllUserData]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
