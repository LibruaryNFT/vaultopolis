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

// Flow imports
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionIDs";
import { getTopShotCollectionBatched } from "../flow/getTopShotCollectionBatched";
import { getFLOWBalance } from "../flow/getFLOWBalance";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { getReceiptDetails } from "../flow/getReceiptDetails";
import { hasChildren as hasChildrenCadence } from "../flow/hasChildren";
import { getChildren } from "../flow/getChildren";
import { getFlowPricePerNFT } from "../flow/getFlowPricePerNFT";

// Named export for the context object
export const UserDataContext = createContext();

/*************************************************************
 * Hardcoded subedition data & initial state
 *************************************************************/
const SUBEDITIONS = {
  1: { name: "Explosion", minted: 500 },
  2: { name: "Torn", minted: 1000 },
  3: { name: "Vortex", minted: 2500 },
  4: { name: "Rippled", minted: 4000 },
  5: { name: "Coded", minted: 25 },
  6: { name: "Halftone", minted: 100 },
  7: { name: "Bubbled", minted: 250 },
  8: { name: "Diced", minted: 10 },
  9: { name: "Bit", minted: 50 },
  10: { name: "Vibe", minted: 5 },
  11: { name: "Astra", minted: 75 },
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
  isRefreshing: false,
  isLoadingChildren: false,
  metadataCache: null,
  flowPricePerNFT: null,
  lastCollectionLoad: null,
};

/*************************************************************
 * userReducer
 *************************************************************/
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
    case "SET_LAST_COLLECTION_LOAD":
      return { ...state, lastCollectionLoad: action.payload };
    default:
      return state;
  }
}

/*************************************************************
 * Merges DB-based metadata + subedition data
 *************************************************************/
async function enrichWithMetadata(details, metadataCache) {
  return details.map((nft) => {
    const key = `${nft.setID}-${nft.playID}`;
    const meta = metadataCache ? metadataCache[key] : undefined;
    let enriched = { ...nft };

    if (meta) {
      enriched.tier = meta.tier || enriched.tier;
      enriched.fullName =
        meta.FullName ||
        meta.fullName ||
        enriched.fullName ||
        enriched.playerName ||
        "Unknown Player";
      enriched.momentCount = Number(meta.momentCount) || enriched.momentCount;
      enriched.jerseyNumber =
        meta.JerseyNumber || meta.jerseyNumber || enriched.jerseyNumber;

      if (meta.retired !== undefined) {
        enriched.retired = meta.retired;
      }
      if (meta.playOrder) {
        enriched.playOrder = meta.playOrder;
      }
      if (meta.series !== undefined) {
        enriched.series = meta.series;
      }
      if (meta.name) {
        enriched.name = meta.name;
      }
      if (meta.TeamAtMoment) {
        enriched.teamAtMoment = meta.TeamAtMoment;
      }
    }

    if (nft.subeditionID && SUBEDITIONS[nft.subeditionID]) {
      const sub = SUBEDITIONS[nft.subeditionID];
      enriched.subeditionName = sub.name;
      enriched.subeditionMaxMint = sub.minted;
    }

    return enriched;
  });
}

/*************************************************************
 * localStorage approach for metadata
 *************************************************************/
async function loadTopShotMetadataFromServerOrCache(dispatch) {
  try {
    const now = Date.now();
    const ONE_HOUR = 3600000;

    const raw = localStorage.getItem("topshotMetadata");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.timestamp && parsed.data) {
        const age = now - parsed.timestamp;
        if (age < ONE_HOUR) {
          dispatch({ type: "SET_METADATA_CACHE", payload: parsed.data });
          return parsed.data;
        }
      } else {
        // old style
        dispatch({ type: "SET_METADATA_CACHE", payload: parsed });
        return parsed;
      }
    }
    // else fetch
    return await fetchRemoteTopShotMetadata(dispatch);
  } catch (err) {
    console.error("Error loading TopShot metadata:", err);
    return {};
  }
}

/*************************************************************
 * Download Top Shot metadata, trim unused fields,
 * dispatch immediately, then attempt to cache.
 *************************************************************/
async function fetchRemoteTopShotMetadata(dispatch) {
  const now = Date.now();

  try {
    /* ---------- 1. fetch the JSON dump ---------- */
    const resp = await fetch("https://api.vaultopolis.com/topshot-data");
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    /* ---------- 2. keep only the fields we use ---------- */
    const metadataMap = data.reduce((acc, item) => {
      acc[`${item.setID}-${item.playID}`] = {
        tier: item.tier,
        FullName: item.FullName,
        JerseyNumber: item.JerseyNumber,
        momentCount: item.momentCount,
        TeamAtMoment: item.TeamAtMoment,
        name: item.name,
        series: item.series,
        ...(item.subeditions?.length ? { subeditions: item.subeditions } : {}),
      };
      return acc;
    }, {});

    /* ---------- 3. give React the data right away ---------- */
    dispatch({ type: "SET_METADATA_CACHE", payload: metadataMap });

    /* ---------- 4. try to persist; swallow quota errors ---------- */
    try {
      const toStore = { timestamp: now, data: metadataMap };
      localStorage.setItem("topshotMetadata", JSON.stringify(toStore));
    } catch (storageErr) {
      console.warn(
        "LocalStorage quota exceeded – using in‑memory cache only",
        storageErr
      );
    }

    return metadataMap;
  } catch (err) {
    console.error("fetchRemoteTopShotMetadata error:", err);
    return {};
  }
}

/*************************************************************
 * Example flow fetches
 *************************************************************/
async function fetchFLOWBalance(addr) {
  if (!addr?.startsWith("0x")) return 0;
  try {
    return await fcl.query({
      cadence: getFLOWBalance,
      args: (arg, t) => [arg(addr, t.Address)],
    });
  } catch {
    return 0;
  }
}
async function fetchTSHOTBalance(addr) {
  if (!addr?.startsWith("0x")) return 0;
  try {
    return await fcl.query({
      cadence: getTSHOTBalance,
      args: (arg, t) => [arg(addr, t.Address)],
    });
  } catch {
    return 0;
  }
}
async function fetchReceiptDetails(addr) {
  if (!addr?.startsWith("0x")) return {};
  try {
    return await fcl.query({
      cadence: getReceiptDetails,
      args: (arg, t) => [arg(addr, t.Address)],
    });
  } catch {
    return {};
  }
}

/*************************************************************
 * fetchTopShotCollection => for a single address
 *************************************************************/
async function fetchTopShotCollection(addr, dispatch, state) {
  // 1) verify collection
  const hasColl = await fcl.query({
    cadence: verifyTopShotCollection,
    args: (arg, t) => [arg(addr, t.Address)],
  });
  if (!hasColl) {
    return { hasCollection: false, details: [], tierCounts: {} };
  }

  // 2) get IDs
  const ids = await fcl.query({
    cadence: getTopShotCollectionIDs,
    args: (arg, t) => [arg(addr, t.Address)],
  });
  if (!ids || !ids.length) {
    return { hasCollection: true, details: [], tierCounts: {} };
  }

  // 3) batch
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
            arg(addr, t.Address),
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
    subeditionID: n.subeditionID != null ? Number(n.subeditionID) : null,
  }));

  // ensure metadata is loaded
  let cache = state.metadataCache;
  if (!cache) {
    cache = await loadTopShotMetadataFromServerOrCache(dispatch);
  }
  // check missing
  const missing = rawNFTs.some((nft) => {
    const k = `${nft.setID}-${nft.playID}`;
    return !cache[k];
  });
  if (missing) {
    cache = await fetchRemoteTopShotMetadata(dispatch);
  }

  const enriched = await enrichWithMetadata(rawNFTs, cache);
  const tierCounts = enriched.reduce((acc, nft) => {
    const tier = nft.tier?.toLowerCase();
    if (tier) acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});
  return { hasCollection: true, details: enriched, tierCounts };
}

/*************************************************************
 * The default export => a component named "UserContext"
 *************************************************************/
function UserContext({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const [didLoad, setDidLoad] = useState(false);

  // loadParentData
  const loadParentData = useCallback(
    async (address) => {
      if (!address?.startsWith("0x")) return;
      dispatch({ type: "SET_REFRESHING_STATE", payload: true });
      try {
        const [flowBal, tshotBal, colData, receipt] = await Promise.all([
          fetchFLOWBalance(address),
          fetchTSHOTBalance(address),
          fetchTopShotCollection(address, dispatch, state),
          fetchReceiptDetails(address),
        ]);

        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: {
            parentAddress: address,
            flowBalance: flowBal,
            tshotBalance: tshotBal,
            nftDetails: colData.details,
            hasCollection: colData.hasCollection,
            tierCounts: colData.tierCounts,
            receiptDetails: receipt,
            hasReceipt: receipt?.betAmount > 0,
          },
        });
      } catch (err) {
        console.error("Error in loadParentData:", err);
      } finally {
        dispatch({ type: "SET_REFRESHING_STATE", payload: false });
      }
    },
    [state]
  );

  // loadChildrenData
  const loadChildrenData = useCallback(
    async (childAddrs) => {
      if (!Array.isArray(childAddrs)) return;
      dispatch({ type: "SET_LOADING_CHILDREN", payload: true });
      try {
        const results = [];
        for (const child of childAddrs) {
          const [flowBal, tshotBal, colData, receipt] = await Promise.all([
            fetchFLOWBalance(child),
            fetchTSHOTBalance(child),
            fetchTopShotCollection(child, dispatch, state),
            fetchReceiptDetails(child),
          ]);
          results.push({
            addr: child,
            flowBalance: flowBal,
            tshotBalance: tshotBal,
            nftDetails: colData.details || [],
            hasCollection: colData.hasCollection,
            tierCounts: colData.tierCounts || {},
            receiptDetails: receipt,
            hasReceipt: receipt?.betAmount > 0,
          });
        }
        dispatch({ type: "SET_CHILDREN_DATA", payload: results });
        dispatch({ type: "SET_CHILDREN_ADDRESSES", payload: childAddrs });
      } catch (e) {
        console.error("Error in loadChildrenData:", e);
      } finally {
        dispatch({ type: "SET_LOADING_CHILDREN", payload: false });
      }
    },
    [state]
  );

  // Single-child loader if needed
  const loadChildData = useCallback(
    async (childAddr) => {
      if (!childAddr?.startsWith("0x")) return;
      await loadChildrenData([childAddr]);
    },
    [loadChildrenData]
  );

  const checkForChildren = useCallback(
    async (addr) => {
      if (!addr?.startsWith("0x")) return false;
      dispatch({ type: "SET_LOADING_CHILDREN", payload: true });
      try {
        const hasKids = await fcl.query({
          cadence: hasChildrenCadence,
          args: (arg, t) => [arg(addr, t.Address)],
        });
        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: { hasChildren: hasKids },
        });
        if (hasKids) {
          const childAddrs = await fcl.query({
            cadence: getChildren,
            args: (arg, t) => [arg(addr, t.Address)],
          });
          await loadChildrenData(childAddrs);
        } else {
          dispatch({ type: "SET_CHILDREN_ADDRESSES", payload: [] });
          dispatch({ type: "SET_CHILDREN_DATA", payload: [] });
        }
        return hasKids;
      } catch (err) {
        console.error("Error in checkForChildren:", err);
        return false;
      } finally {
        dispatch({ type: "SET_LOADING_CHILDREN", payload: false });
      }
    },
    [loadChildrenData]
  );

  /**
   * loadAllUserData => parent + children,
   * with an optional parameter for skipping child load
   */
  const loadAllUserData = useCallback(
    async (addr, options = { skipChildLoad: false }) => {
      if (!addr?.startsWith("0x")) return;
      dispatch({ type: "SET_REFRESHING_STATE", payload: true });
      try {
        await loadParentData(addr);

        // Only load children if skipChildLoad is NOT set
        if (!options.skipChildLoad) {
          await checkForChildren(addr);
        }

        // fetch flowPrice
        try {
          const price = await fcl.query({
            cadence: getFlowPricePerNFT,
            args: (arg, t) => [],
          });
          dispatch({ type: "SET_FLOW_PRICE_PER_NFT", payload: price });
        } catch (pErr) {
          console.error("Error fetching getFlowPricePerNFT:", pErr);
        }

        dispatch({ type: "SET_LAST_COLLECTION_LOAD", payload: Date.now() });
      } finally {
        dispatch({ type: "SET_REFRESHING_STATE", payload: false });
      }
    },
    [loadParentData, checkForChildren]
  );

  // Subscribe to fcl.currentUser
  useEffect(() => {
    const unsub = fcl.currentUser.subscribe((cu) => {
      dispatch({ type: "SET_USER", payload: cu });
      if (!cu?.loggedIn) {
        dispatch({ type: "RESET_STATE" });
        setDidLoad(false);
      }
    });
    return () => unsub();
  }, [dispatch]);

  // After login => load once
  useEffect(() => {
    const { loggedIn, addr } = state.user;
    if (!didLoad && loggedIn && addr) {
      setDidLoad(true);
      dispatch({
        type: "SET_SELECTED_ACCOUNT",
        payload: { address: addr, type: "parent" },
      });
      loadAllUserData(addr).catch((err) => console.error(err));
    }
  }, [didLoad, state.user, dispatch, loadAllUserData]);

  // manual refresh
  const refreshUserData = useCallback(async () => {
    if (state.user?.addr?.startsWith("0x")) {
      await loadAllUserData(state.user.addr);
    }
  }, [loadAllUserData, state.user]);

  const contextValue = useMemo(() => {
    return {
      ...state,
      dispatch,
      loadAllUserData,
      refreshUserData,
      loadChildData,
    };
  }, [state, dispatch, loadAllUserData, refreshUserData, loadChildData]);

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
}

export default UserContext;
