// src/context/UserContext.js

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
        series:
          meta.series !== undefined && meta.series !== null
            ? meta.series
            : nft.series,
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
    nftDetails: [], // Full NFT collection for parent
    flowBalance: null,
    tshotBalance: null,
    hasCollection: null,
    receiptDetails: {},
    hasReceipt: null,
    hasChildren: false,
    childrenData: [], // Each child's data
    childrenAddresses: [],
  },
  selectedAccount: null,
  selectedAccountType: "parent",
  selectedNFTs: [],
  isRefreshing: false,
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

    case "SET_CHILDREN_ADDRESSES":
      return {
        ...state,
        accountData: {
          ...state.accountData,
          childrenAddresses: action.payload,
        },
      };

    case "SET_REFRESHING_STATE":
      return { ...state, isRefreshing: action.payload };

    case "SET_LOADING_CHILDREN":
      return { ...state, isLoadingChildren: action.payload };

    case "SET_FLOW_PRICE_PER_NFT":
      return { ...state, flowPricePerNFT: action.payload };

    default:
      return state;
  }
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const [didLoad, setDidLoad] = useState(false);

  /***************************
   *  Basic fetch functions
   ***************************/
  const fetchFLOWBalance = useCallback(async (address) => {
    if (!address || !address.startsWith("0x")) return 0;
    try {
      return await fcl.query({
        cadence: getFLOWBalance,
        args: (arg, t) => [arg(address, t.Address)],
      });
    } catch {
      return 0;
    }
  }, []);

  const fetchTSHOTBalance = useCallback(async (address) => {
    if (!address || !address.startsWith("0x")) return 0;
    try {
      return await fcl.query({
        cadence: getTSHOTBalance,
        args: (arg, t) => [arg(address, t.Address)],
      });
    } catch {
      return 0;
    }
  }, []);

  const fetchReceiptDetails = useCallback(async (address) => {
    if (!address || !address.startsWith("0x")) {
      return {};
    }
    try {
      return await fcl.query({
        cadence: getReceiptDetails,
        args: (arg, t) => [arg(address, t.Address)],
      });
    } catch {
      return {};
    }
  }, []);

  const fetchTopShotCollection = useCallback(
    async (address) => {
      if (!address || !address.startsWith("0x")) {
        return { hasCollection: false, details: [], tierCounts: {} };
      }
      try {
        const hasColl = await fcl.query({
          cadence: verifyTopShotCollection,
          args: (arg, t) => [arg(address, t.Address)],
        });
        if (!hasColl) {
          return { hasCollection: false, details: [], tierCounts: {} };
        }

        const ids = await fcl.query({
          cadence: getTopShotCollectionIDs,
          args: (arg, t) => [arg(address, t.Address)],
        });
        if (!ids || ids.length === 0) {
          return { hasCollection: true, details: [], tierCounts: {} };
        }

        const limit = pLimit(30);
        const batchSize = 2500;
        const batches = [];
        for (let i = 0; i < ids.length; i += batchSize) {
          batches.push(ids.slice(i, i + batchSize));
        }

        const allResults = await Promise.all(
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
        const rawNFTs = allResults.flat().map((n) => ({
          ...n,
          id: Number(n.id),
          setID: Number(n.setID),
          playID: Number(n.playID),
          serialNumber: Number(n.serialNumber),
          isLocked: Boolean(n.isLocked),
        }));

        const effectiveMetadata =
          state.metadataCache ||
          JSON.parse(localStorage.getItem("topshotMetadata") || "{}");
        const enriched = await enrichWithMetadata(rawNFTs, effectiveMetadata);

        const tierCounts = enriched.reduce((acc, nft) => {
          const tier = nft.tier?.toLowerCase();
          if (tier) acc[tier] = (acc[tier] || 0) + 1;
          return acc;
        }, {});

        return { hasCollection: true, details: enriched, tierCounts };
      } catch (err) {
        console.error("Error fetching collection for", address, err);
        return { hasCollection: false, details: [], tierCounts: {} };
      }
    },
    [state.metadataCache]
  );

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
      const resp = await fetch(`${baseUrl}/topshot-data`);
      if (!resp.ok) {
        throw new Error(`HTTP Error: ${resp.status}`);
      }
      const data = await resp.json();
      const metadataMap = data.reduce((acc, item) => {
        const key = `${item.setID}-${item.playID}`;
        acc[key] = item;
        return acc;
      }, {});
      localStorage.setItem("topshotMetadata", JSON.stringify(metadataMap));
      dispatch({ type: "SET_METADATA_CACHE", payload: metadataMap });
      return metadataMap;
    } catch (err) {
      console.error("Error loading TopShot metadata:", err);
      return {};
    }
  }, [dispatch]);

  /***********************************************
   *      loadParentData => fetch NFT collection
   ***********************************************/
  const loadParentData = useCallback(
    async (addr) => {
      if (!addr || !addr.startsWith("0x")) return;
      dispatch({ type: "SET_REFRESHING_STATE", payload: true });
      try {
        const [flowBal, tshotBal, colData, receipt] = await Promise.all([
          fetchFLOWBalance(addr),
          fetchTSHOTBalance(addr),
          fetchTopShotCollection(addr), // Re-fetch the entire NFT list
          fetchReceiptDetails(addr),
        ]);
        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: {
            parentAddress: addr,
            flowBalance: flowBal,
            tshotBalance: tshotBal,
            nftDetails: colData.details || [],
            hasCollection: colData.hasCollection,
            tierCounts: colData.tierCounts || {},
            receiptDetails: receipt,
            hasReceipt: receipt?.betAmount > 0,
          },
        });
      } catch (err) {
        console.error("Error loading parent data:", err);
      } finally {
        dispatch({ type: "SET_REFRESHING_STATE", payload: false });
      }
    },
    [
      fetchFLOWBalance,
      fetchTSHOTBalance,
      fetchTopShotCollection,
      fetchReceiptDetails,
    ]
  );

  const loadChildData = useCallback(
    async (childAddr) => {
      if (!childAddr || !childAddr.startsWith("0x")) return;
      try {
        const [flowBal, tshotBal, colData, receipt] = await Promise.all([
          fetchFLOWBalance(childAddr),
          fetchTSHOTBalance(childAddr),
          fetchTopShotCollection(childAddr),
          fetchReceiptDetails(childAddr),
        ]);
        dispatch((prev) => {
          const oldList = prev.accountData.childrenData || [];
          const updatedChild = {
            addr: childAddr,
            flowBalance: flowBal,
            tshotBalance: tshotBal,
            nftDetails: colData.details || [],
            hasCollection: colData.hasCollection,
            tierCounts: colData.tierCounts || {},
            receiptDetails: receipt,
            hasReceipt: receipt?.betAmount > 0,
          };
          const filtered = oldList.filter((c) => c.addr !== childAddr);
          return {
            ...prev,
            accountData: {
              ...prev.accountData,
              childrenData: [...filtered, updatedChild],
            },
          };
        });
      } catch (err) {
        console.error("Error loading child data:", err);
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

  const loadChildrenData = useCallback(
    async (childAddresses) => {
      if (!Array.isArray(childAddresses)) return;
      dispatch({ type: "SET_LOADING_CHILDREN", payload: true });
      try {
        const results = await Promise.all(
          childAddresses.map(async (addr) => {
            const [flowBal, tshotBal, colData, receipt] = await Promise.all([
              fetchFLOWBalance(addr),
              fetchTSHOTBalance(addr),
              fetchTopShotCollection(addr),
              fetchReceiptDetails(addr),
            ]);
            return {
              addr,
              flowBalance: flowBal,
              tshotBalance: tshotBal,
              nftDetails: colData.details || [],
              hasCollection: colData.hasCollection,
              tierCounts: colData.tierCounts || {},
              receiptDetails: receipt,
              hasReceipt: receipt?.betAmount > 0,
            };
          })
        );
        dispatch({ type: "SET_CHILDREN_DATA", payload: results });
        dispatch({
          type: "SET_CHILDREN_ADDRESSES",
          payload: childAddresses,
        });
      } catch (err) {
        console.error("Error loading children data:", err);
      } finally {
        dispatch({ type: "SET_LOADING_CHILDREN", payload: false });
      }
    },
    [
      fetchFLOWBalance,
      fetchTSHOTBalance,
      fetchTopShotCollection,
      fetchReceiptDetails,
    ]
  );

  const checkForChildren = useCallback(
    async (parentAddr) => {
      if (!parentAddr || !parentAddr.startsWith("0x")) return false;
      dispatch({ type: "SET_LOADING_CHILDREN", payload: true });
      try {
        const hasKids = await fcl.query({
          cadence: hasChildrenCadence,
          args: (arg, t) => [arg(parentAddr, t.Address)],
        });
        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: { hasChildren: hasKids },
        });
        if (hasKids) {
          const childAddrs = await fcl.query({
            cadence: getChildren,
            args: (arg, t) => [arg(parentAddr, t.Address)],
          });
          await loadChildrenData(childAddrs);
        } else {
          dispatch({ type: "SET_CHILDREN_ADDRESSES", payload: [] });
          dispatch({ type: "SET_CHILDREN_DATA", payload: [] });
        }
        return hasKids;
      } catch (error) {
        console.error("Error fetching children data:", error);
        return false;
      } finally {
        dispatch({ type: "SET_LOADING_CHILDREN", payload: false });
      }
    },
    [loadChildrenData, dispatch]
  );

  const loadAllUserData = useCallback(
    async (address) => {
      if (!address) return;
      // Load metadata once
      await loadTopShotMetadata();

      // Load parent
      await loadParentData(address);

      // Check children
      await checkForChildren(address);

      // Optionally, flowPricePerNFT
      try {
        const price = await fcl.query({
          cadence: getFlowPricePerNFT,
          args: (arg, t) => [],
        });
        dispatch({ type: "SET_FLOW_PRICE_PER_NFT", payload: price });
      } catch (err) {
        console.error("Error fetching flowPricePerNFT:", err);
      }
    },
    [loadTopShotMetadata, loadParentData, checkForChildren, dispatch]
  );

  /*******************
   * FCL subscription
   *******************/
  useEffect(() => {
    const unsub = fcl.currentUser.subscribe((currentUser) => {
      dispatch({ type: "SET_USER", payload: currentUser });
      if (!currentUser?.loggedIn) {
        dispatch({ type: "RESET_STATE" });
        setDidLoad(false);
      }
    });
    return () => unsub();
  }, [dispatch]);

  // Once user logs in, load data if not done
  useEffect(() => {
    const { loggedIn, addr } = state.user || {};
    if (loggedIn && addr && !didLoad) {
      setDidLoad(true);
      dispatch({
        type: "SET_SELECTED_ACCOUNT",
        payload: { address: addr, type: "parent" },
      });
      loadAllUserData(addr).catch((err) => console.error(err));
    }
  }, [state.user, didLoad, loadAllUserData, dispatch]);

  /****************************************
   *   Poll only parent's FLOW/TSHOT
   ****************************************/
  useEffect(() => {
    const { loggedIn, addr } = state.user || {};
    if (!loggedIn || !addr) return;

    const timer = setInterval(async () => {
      try {
        // only poll balances
        const flowBal = await fetchFLOWBalance(addr);
        const tshotBal = await fetchTSHOTBalance(addr);

        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: { flowBalance: flowBal, tshotBalance: tshotBal },
        });
      } catch (err) {
        console.error("Polling refresh error:", err);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [state.user, fetchFLOWBalance, fetchTSHOTBalance, dispatch]);

  // Debug
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("UserContext State:", state);
    }
  }, [state]);

  const contextValue = useMemo(
    () => ({
      ...state,
      dispatch,
      loadAllUserData, // parent + children
      loadParentData, // single parent
      loadChildData, // single child
    }),
    [state, dispatch, loadAllUserData, loadParentData, loadChildData]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export default UserProvider;
