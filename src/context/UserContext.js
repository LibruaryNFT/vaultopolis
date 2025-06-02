// src/contexts/UserContext.js
/* eslint-disable react/prop-types */
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

// Imports
import { SnapshotManager, tierTally } from "../utils/SnapshotManager"; // Assuming SnapshotManager is simplified (no mergeSnapshot)
import { fclQueryWithRetry } from "../utils/fclUtils";
import { metaStore } from "../utils/metaStore";

/* ───────── cadence imports ───────── */
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionIDs";
import { getTopShotCollectionBatched } from "../flow/getTopShotCollectionBatched";
import { getFLOWBalance } from "../flow/getFLOWBalance";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { getReceiptDetails } from "../flow/getReceiptDetails";
import { hasChildren as hasChildrenCadence } from "../flow/hasChildren";
import { getChildren } from "../flow/getChildren";
import { getFlowPricePerNFT } from "../flow/getFlowPricePerNFT";

/* ───────── exports ───────── */
export const UserDataContext = createContext();

/* ───────── constants ───────── */
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

const LIMIT_FCL = pLimit(10);
const BATCH_SIZE_FCL = 250;

/* ───────── initial state ───────── */
const initialState = {
  user: { loggedIn: null, addr: "" },
  accountData: {
    parentAddress: null,
    nftDetails: [],
    flowBalance: null,
    tshotBalance: null,
    hasCollection: null,
    tierCounts: {},
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
  lastSuccessfulUpdate: null,
  collectionLoadStatus: "idle", // 'idle', 'loading_snapshot', 'loading_full', 'success', 'error'
};

/* ───────── reducer ───────── */
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
      const isSel = state.selectedNFTs.includes(action.payload);
      return {
        ...state,
        selectedNFTs: isSel
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
        accountData: { ...state.accountData, childrenData: action.payload },
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
    case "SET_LAST_SUCCESSFUL_UPDATE":
      return { ...state, lastSuccessfulUpdate: action.payload };
    case "SET_COLLECTION_LOAD_STATUS":
      return { ...state, collectionLoadStatus: action.payload };
    default:
      return state;
  }
}

/* ═══════════════════════════════════════════════
 * A. Metadata cache helpers
 * ═══════════════════════════════════════════════ */
async function loadMeta(dispatch, currentCache, options = {}) {
  const { forceRefresh = false } = options;

  if (!forceRefresh) {
    const snap = await metaStore.getItem("topshotMeta_v1");
    const ONE_HOUR = 3_600_000;
    if (snap && Date.now() - snap.ts < ONE_HOUR) {
      if (!currentCache || Object.keys(currentCache).length === 0) {
        dispatch({ type: "SET_METADATA_CACHE", payload: snap.data });
      }
      return snap.data;
    }
  } else {
    console.log(
      "[loadMeta] Force refresh: Bypassing metadata cache, fetching fresh."
    );
  }
  return fetchMeta(dispatch);
}

async function fetchMeta(dispatch) {
  try {
    console.log("[fetchMeta] Fetching fresh global metadata from API...");
    const res = await fetch("https://api.vaultopolis.com/topshot-data");
    if (!res.ok)
      throw new Error(`API request failed with status ${res.status}`);
    const arr = await res.json();
    const map = arr.reduce((m, r) => {
      m[`${r.setID}-${r.playID}`] = {
        tier: r.tier,
        FullName: r.FullName,
        JerseyNumber: r.JerseyNumber,
        momentCount: r.momentCount,
        TeamAtMoment: r.TeamAtMoment,
        name: r.name,
        series: r.series,
      };
      return m;
    }, {});
    dispatch({ type: "SET_METADATA_CACHE", payload: map });
    await metaStore.setItem("topshotMeta_v1", { ts: Date.now(), data: map });
    console.log("[fetchMeta] Fresh global metadata fetched and cached.");
    return map;
  } catch (e) {
    console.error("[meta] fetch failed", e);
    return {};
  }
}

/* ═══════════════════════════════════════════════
 * B. Collection data helpers
 * ═══════════════════════════════════════════════ */
async function enrichNFTData(list, metadata, subeditionData = SUBEDITIONS) {
  return list.map((n) => {
    const k = `${n.setID}-${n.playID}`;
    const m = metadata[k];
    const out = { ...n };
    if (m) {
      out.tier = m.tier;
      out.fullName = m.FullName || n.fullName;
      out.name = m.name || n.name;
      out.series = m.series ?? n.series;
      out.teamAtMoment = m.TeamAtMoment ?? n.teamAtMoment;
      out.momentCount = m.momentCount ?? n.momentCount;
    }
    if (n.subeditionID && subeditionData[n.subeditionID]) {
      const s = subeditionData[n.subeditionID];
      out.subeditionName = s.name;
      out.subeditionMaxMint = s.minted;
    }
    return out;
  });
}

/**
 * Compares two arrays of IDs to see if they are identical.
 * Assumes IDs are strings or numbers that can be consistently stringified.
 * @param {Array<string|number>} idsA - First array of IDs.
 * @param {Array<string|number>} idsB - Second array of IDs.
 * @returns {boolean} True if identical, false otherwise.
 */
function areIdListsIdentical(idsA, idsB) {
  if (!idsA || !idsB) return false; // Handle null/undefined cases
  if (idsA.length !== idsB.length) return false;
  const sortedA = [...idsA].map(String).sort();
  const sortedB = [...idsB].map(String).sort();
  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i] !== sortedB[i]) return false;
  }
  return true;
}

/* ------------- CORE FETCH COLLECTION (Simplified Logic) ------------- */
async function fetchCollection(addr, dispatch, state, options = {}) {
  // forceCollectionRefresh: Clears the user's specific collection snapshot, forcing a full rebuild of it.
  // forceGlobalMetaRefresh: Clears the global metadata cache (topshotMeta_v1), forcing it to re-fetch from API.
  const { forceGlobalMetaRefresh = false } = options; // Only destructure forceGlobalMetaRefresh
  // The line "options;" has been removed.

  dispatch({ type: "SET_COLLECTION_LOAD_STATUS", payload: "loading_snapshot" });

  let currentMetaCache = state.metadataCache;
  if (
    !currentMetaCache ||
    Object.keys(currentMetaCache).length === 0 ||
    forceGlobalMetaRefresh
  ) {
    currentMetaCache = await loadMeta(dispatch, currentMetaCache, {
      forceRefresh: forceGlobalMetaRefresh,
    });
  }

  let hasTopShotCollectionCapability = false;
  try {
    hasTopShotCollectionCapability = await fclQueryWithRetry({
      cadence: verifyTopShotCollection,
      args: (arg, t) => [arg(addr, t.Address)],
    });
  } catch (e) {
    console.warn(
      `[verifyTopShotCollection] failed for ${addr}. Will attempt to get IDs. Error:`,
      e
    );
  }

  let currentIdsOnChain = [];
  try {
    currentIdsOnChain = await fclQueryWithRetry({
      cadence: getTopShotCollectionIDs,
      args: (arg, t) => [arg(addr, t.Address)],
    });
    currentIdsOnChain.sort((a, b) => String(a).localeCompare(String(b))); // Sort for consistent comparison
    if (currentIdsOnChain.length > 0) {
      hasTopShotCollectionCapability = true;
    }
  } catch (e) {
    if (!hasTopShotCollectionCapability) {
      // If verify also failed, then likely no collection
      console.error(
        `[getTopShotCollectionIDs] also failed for ${addr}. Assuming no collection. Error:`,
        e
      );
      dispatch({ type: "SET_COLLECTION_LOAD_STATUS", payload: "error" });
      await SnapshotManager.saveSnapshot(
        addr,
        { ids: [], details: [], tiers: {} },
        { isComplete: true }
      );
      dispatch({ type: "SET_LAST_SUCCESSFUL_UPDATE", payload: Date.now() });
      return { hasCollection: false, nftDetails: [], tierCounts: {} };
    }
    // If verify passed but getIDs failed, this is a more problematic state
    console.error(
      `[getTopShotCollectionIDs] failed for ${addr} despite positive verification. Error:`,
      e
    );
    dispatch({ type: "SET_COLLECTION_LOAD_STATUS", payload: "error" });
    return {
      hasCollection: true,
      nftDetails: state.accountData.nftDetails,
      tierCounts: state.accountData.tierCounts,
    }; // Return stale data
  }

  if (!hasTopShotCollectionCapability) {
    console.log(
      `[fetchCollection] Address ${addr} does not have a TopShot collection.`
    );
    dispatch({ type: "SET_COLLECTION_LOAD_STATUS", payload: "success" }); // Success, but empty
    await SnapshotManager.saveSnapshot(
      addr,
      { ids: [], details: [], tiers: {} },
      { isComplete: true }
    );
    dispatch({ type: "SET_LAST_SUCCESSFUL_UPDATE", payload: Date.now() });
    return { hasCollection: false, nftDetails: [], tierCounts: {} };
  }

  // Get snapshot assessment (version, staleness, isComplete flag)
  const { snapshot, needsRefresh: snapshotAssessmentInitial } =
    await SnapshotManager.getSnapshot(addr);
  let finalSnapshotAssessment = snapshotAssessmentInitial;

  // THE CRUCIAL FIX: Even if snapshot looks 'none' (good on its own),
  // compare its IDs with live on-chain IDs. If they differ, force a full rebuild.
  if (snapshotAssessmentInitial === "none" && snapshot) {
    if (!areIdListsIdentical(snapshot.ids, currentIdsOnChain)) {
      console.log(
        `[fetchCollection] Snapshot for ${addr} was 'none' but IDs differ from chain. Forcing full rebuild.`
      );
      finalSnapshotAssessment = "full";
    }
  }

  // If an explicit forceCollectionRefresh is passed (e.g., from manual refresh button)
  // this also forces a full rebuild path by ensuring we don't use the snapshot.
  if (options.forceCollectionRefresh) {
    console.log(
      `[fetchCollection] Explicit forceCollectionRefresh for ${addr}.`
    );
    finalSnapshotAssessment = "full"; // Ensure it goes to rebuild path
  }

  if (finalSnapshotAssessment === "none" && snapshot) {
    console.log(
      `[fetchCollection] Using valid, complete, current, and ID-matched snapshot for ${addr}.`
    );
    dispatch({ type: "SET_COLLECTION_LOAD_STATUS", payload: "success" });
    dispatch({ type: "SET_LAST_SUCCESSFUL_UPDATE", payload: Date.now() });
    return {
      hasCollection: true,
      nftDetails: snapshot.details,
      tierCounts: snapshot.tiers,
    };
  }

  // --- Perform Full Collection Rebuild ---
  // This path is taken if:
  // 1. SnapshotManager deemed it 'full' (stale, invalid, incomplete, or no snapshot).
  // 2. SnapshotManager deemed it 'none', but its IDs didn't match currentIdsOnChain.
  // 3. options.forceCollectionRefresh was true.
  dispatch({ type: "SET_COLLECTION_LOAD_STATUS", payload: "loading_full" });
  console.log(
    `[fetchCollection] Performing full collection data rebuild for ${addr}. Reason: assessment '${finalSnapshotAssessment}', explicit force: ${!!options.forceCollectionRefresh}`
  );

  if (currentIdsOnChain.length === 0) {
    console.log(
      `[fetchCollection] Full rebuild for ${addr}: No items on chain. Saving empty complete snapshot.`
    );
    const saveResult = await SnapshotManager.saveSnapshot(
      addr,
      { ids: [], details: [], tiers: {} },
      { isComplete: true }
    );
    dispatch({ type: "SET_LAST_SUCCESSFUL_UPDATE", payload: Date.now() });
    dispatch({
      type: "SET_COLLECTION_LOAD_STATUS",
      payload: saveResult.success ? "success" : "error",
    });
    return { hasCollection: true, nftDetails: [], tierCounts: {} };
  }

  const batches = [];
  for (let i = 0; i < currentIdsOnChain.length; i += BATCH_SIZE_FCL) {
    batches.push(currentIdsOnChain.slice(i, i + BATCH_SIZE_FCL));
  }

  let allFetchedNFTsRaw = [];
  try {
    const chunkPromises = batches.map((batchIds) =>
      LIMIT_FCL(() =>
        fclQueryWithRetry({
          cadence: getTopShotCollectionBatched,
          args: (arg, t) => [
            arg(addr, t.Address),
            arg(
              batchIds.map((id) => String(id)),
              t.Array(t.UInt64)
            ),
          ],
        })
      )
    );
    const fetchedChunks = await Promise.all(chunkPromises);
    allFetchedNFTsRaw = fetchedChunks.flat().filter((item) => item != null);
  } catch (error) {
    console.error(
      `[fetchCollection] Error fetching NFT details during full rebuild for ${addr}:`,
      error
    );
    dispatch({ type: "SET_COLLECTION_LOAD_STATUS", payload: "error" });
    // Fallback to old snapshot data if it existed and was somewhat valid before, otherwise empty
    const fallbackDetails =
      snapshotAssessmentInitial !== "full" && snapshot?.details
        ? snapshot.details
        : [];
    const fallbackTiers =
      snapshotAssessmentInitial !== "full" && snapshot?.tiers
        ? snapshot.tiers
        : {};
    return {
      hasCollection: true,
      nftDetails: fallbackDetails,
      tierCounts: fallbackTiers,
    };
  }

  const processedNFTs = allFetchedNFTsRaw.map((n) => ({
    ...n,
    id: String(n.id),
    setID: Number(n.setID),
    playID: Number(n.playID),
    serialNumber: Number(n.serialNumber),
    isLocked: Boolean(n.isLocked),
    subeditionID: n.subeditionID != null ? Number(n.subeditionID) : null,
  }));

  if (
    processedNFTs.some((n) => !currentMetaCache[`${n.setID}-${n.playID}`]) &&
    !forceGlobalMetaRefresh
  ) {
    console.log(
      "[fetchCollection] Metadata cache incomplete for some items, fetching fresh metadata..."
    );
    currentMetaCache = await fetchMeta(dispatch);
  }
  const enrichedNFTs = await enrichNFTData(processedNFTs, currentMetaCache);
  enrichedNFTs.sort((a, b) => String(a.id).localeCompare(String(b.id)));

  const tiersForSave = tierTally(enrichedNFTs);
  const saveData = {
    ids: currentIdsOnChain,
    details: enrichedNFTs,
    tiers: tiersForSave,
  };
  const isDataComplete = enrichedNFTs.length === currentIdsOnChain.length;

  const saveResult = await SnapshotManager.saveSnapshot(addr, saveData, {
    isComplete: isDataComplete,
  });

  if (saveResult.success) {
    dispatch({ type: "SET_LAST_SUCCESSFUL_UPDATE", payload: Date.now() });
    dispatch({ type: "SET_COLLECTION_LOAD_STATUS", payload: "success" });
    return {
      hasCollection: true,
      nftDetails: enrichedNFTs,
      tierCounts: tiersForSave,
    };
  } else {
    dispatch({ type: "SET_COLLECTION_LOAD_STATUS", payload: "error" });
    const fallbackDetails =
      snapshotAssessmentInitial !== "full" && snapshot?.details
        ? snapshot.details
        : [];
    const fallbackTiers =
      snapshotAssessmentInitial !== "full" && snapshot?.tiers
        ? snapshot.tiers
        : {};
    return {
      hasCollection: true,
      nftDetails: fallbackDetails,
      tierCounts: fallbackTiers,
    };
  }
}

/* ═══════════════════════════════════════════════
 * C. Thin helpers for balances/receipts
 * ═══════════════════════════════════════════════ */
const fetchFLOW = (a) => fetchGeneric(a, getFLOWBalance);
const fetchTSHOT = (a) => fetchGeneric(a, getTSHOTBalance);

async function fetchReceipt(addr) {
  if (!addr?.startsWith("0x")) return {};
  try {
    return await fclQueryWithRetry({
      cadence: getReceiptDetails,
      args: (arg, t) => [arg(addr, t.Address)],
    });
  } catch (e) {
    console.warn(`[fetchReceipt] Failed for ${addr}:`, e);
    return {};
  }
}

async function fetchGeneric(addr, script) {
  if (!addr?.startsWith("0x")) return 0;
  try {
    return await fclQueryWithRetry({
      cadence: script,
      args: (arg, t) => [arg(addr, t.Address)],
    });
  } catch (e) {
    console.warn(`[fetchGeneric] Failed for ${addr} with script:`, e);
    return 0;
  }
}

/* ═══════════════════════════════════════════════
 * D. React context provider
 * ═══════════════════════════════════════════════ */
function UserDataProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const [didInit, setDidInit] = useState(false);

  useEffect(() => {
    let timer;
    const poll = async () => {
      try {
        const p = await fclQueryWithRetry({ cadence: getFlowPricePerNFT });
        dispatch({ type: "SET_FLOW_PRICE_PER_NFT", payload: p });
      } catch (e) {
        console.error("[pricePoll] Failed to get FLOW price:", e);
      }
      timer = setTimeout(poll, 600_000);
    };
    poll();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state.metadataCache === null) {
      loadMeta(dispatch, state.metadataCache, { forceRefresh: false }).catch(
        (e) => console.error("[UserContext] Initial metadata load failed", e)
      );
    }
  }, [state.metadataCache]);

  const loadParent = useCallback(
    async (addrRaw, options = {}) => {
      const addr = addrRaw?.toLowerCase();
      if (!addr?.startsWith("0x")) return;
      try {
        const [flow, tshot, colData, receipt] = await Promise.all([
          fetchFLOW(addr),
          fetchTSHOT(addr),
          fetchCollection(addr, dispatch, state, options),
          fetchReceipt(addr),
        ]);
        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: {
            parentAddress: addr,
            flowBalance: flow,
            tshotBalance: tshot,
            nftDetails: colData.nftDetails,
            hasCollection: colData.hasCollection,
            tierCounts: colData.tierCounts,
            receiptDetails: receipt,
            hasReceipt: receipt?.betAmount > 0,
          },
        });
      } catch (error) {
        console.error(`[loadParent] Error loading data for ${addr}:`, error);
      }
    },
    [state]
  );

  const loadChildren = useCallback(
    async (addrs = [], options = {}) => {
      if (addrs.length === 0) {
        dispatch({ type: "SET_CHILDREN_DATA", payload: [] });
        dispatch({ type: "SET_CHILDREN_ADDRESSES", payload: [] });
        return;
      }
      dispatch({ type: "SET_LOADING_CHILDREN", payload: true });
      try {
        const childrenPromises = addrs.map(async (rawAddr) => {
          const a = rawAddr.toLowerCase();
          const [flow, tshot, colData, receipt] = await Promise.all([
            fetchFLOW(a),
            fetchTSHOT(a),
            fetchCollection(a, dispatch, state, options),
            fetchReceipt(a),
          ]);
          return {
            addr: a,
            flowBalance: flow,
            tshotBalance: tshot,
            nftDetails: colData.nftDetails,
            hasCollection: colData.hasCollection,
            tierCounts: colData.tierCounts,
            receiptDetails: receipt,
            hasReceipt: receipt?.betAmount > 0,
          };
        });
        const out = await Promise.all(childrenPromises);
        dispatch({ type: "SET_CHILDREN_DATA", payload: out });
        dispatch({
          type: "SET_CHILDREN_ADDRESSES",
          payload: addrs.map((x) => x.toLowerCase()),
        });
      } catch (error) {
        console.error(`[loadChildren] Error loading data for children:`, error);
      } finally {
        dispatch({ type: "SET_LOADING_CHILDREN", payload: false });
      }
    },
    [state]
  );

  const loadChildData = useCallback(
    (addr, options = {}) => loadChildren([addr], options),
    [loadChildren]
  );

  const ensureChildren = useCallback(
    async (addrRaw, options = {}) => {
      const addr = addrRaw?.toLowerCase();
      if (!addr?.startsWith("0x")) return 0;
      dispatch({ type: "SET_LOADING_CHILDREN", payload: true });
      let hasKids = false;
      try {
        hasKids = await fclQueryWithRetry({
          cadence: hasChildrenCadence,
          args: (arg, t) => [arg(addr, t.Address)],
        });
        dispatch({
          type: "SET_ACCOUNT_DATA",
          payload: { hasChildren: hasKids },
        });
        if (hasKids) {
          const kids = await fclQueryWithRetry({
            cadence: getChildren,
            args: (arg, t) => [arg(addr, t.Address)],
          });
          await loadChildren(kids, options);
          return kids.length;
        } else {
          dispatch({ type: "SET_CHILDREN_DATA", payload: [] });
          dispatch({ type: "SET_CHILDREN_ADDRESSES", payload: [] });
          dispatch({ type: "SET_LOADING_CHILDREN", payload: false });
          return 0;
        }
      } catch (e) {
        console.error(`[ensureChildren] Error for ${addr}:`, e);
        dispatch({ type: "SET_ACCOUNT_DATA", payload: { hasChildren: false } });
        dispatch({ type: "SET_CHILDREN_DATA", payload: [] });
        dispatch({ type: "SET_CHILDREN_ADDRESSES", payload: [] });
        dispatch({ type: "SET_LOADING_CHILDREN", payload: false });
        return 0;
      }
    },
    [loadChildren]
  );

  const loadAllUserData = useCallback(
    async (
      addrRaw,
      {
        forceCollectionRefresh = false, // This will now be the primary flag to force a collection data rebuild
        forceGlobalMetaRefresh = false, // This specifically forces the global metadata (topshotMeta_v1) to refresh
        skipChildLoad = false,
      } = {}
    ) => {
      const addr = addrRaw?.toLowerCase();
      if (!addr?.startsWith("0x")) return;

      // The logic to clear `collSnap` if forceCollectionRefresh is true is now implicitly handled
      // by fetchCollection because it will see options.forceCollectionRefresh and act accordingly.
      // No need to `metaStore.removeItem` here directly.

      dispatch({ type: "SET_REFRESHING_STATE", payload: true });
      try {
        const fetchOptions = { forceCollectionRefresh, forceGlobalMetaRefresh };
        await loadParent(addr, fetchOptions);
        if (!skipChildLoad) {
          await ensureChildren(addr, fetchOptions);
        }
      } catch (error) {
        console.error(
          `[loadAllUserData] Error loading all data for ${addr}:`,
          error
        );
      } finally {
        dispatch({ type: "SET_REFRESHING_STATE", payload: false });
      }
    },
    [loadParent, ensureChildren]
  );

  useEffect(() => {
    const unsub = fcl.currentUser.subscribe((uConfig) => {
      const user = { ...uConfig };
      if (user?.addr) user.addr = user.addr.toLowerCase();
      dispatch({ type: "SET_USER", payload: user });
      if (!user?.loggedIn) {
        dispatch({ type: "RESET_STATE" });
        setDidInit(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!didInit && state.user.loggedIn && state.user.addr) {
      setDidInit(true);
      dispatch({
        type: "SET_SELECTED_ACCOUNT",
        payload: { address: state.user.addr, type: "parent" },
      });
      loadAllUserData(state.user.addr, {
        forceCollectionRefresh: false,
        forceGlobalMetaRefresh: false,
      }).catch(console.error);
    }
  }, [didInit, state.user, loadAllUserData]);

  const refreshUserData = useCallback(() => {
    // Manual refresh button
    if (state.user.addr) {
      console.log(
        "[UserContext] Manual full refresh triggered by user (forces collection & global meta refresh)."
      );
      loadAllUserData(state.user.addr, {
        forceCollectionRefresh: true, // Ensures collection snapshot is rebuilt
        forceGlobalMetaRefresh: true, // Ensures global metadata is re-fetched
      }).catch(console.error);
    }
  }, [loadAllUserData, state.user.addr]);

  const smartRefreshUserData = useCallback(() => {
    // Programmatic refresh (e.g., after a transaction)
    if (state.user.addr) {
      console.log(
        "[UserContext] Smart refresh triggered (e.g., post-transaction - forces collection refresh, uses cached global meta if fresh)."
      );
      // This will force a rebuild of the collection snapshot because forceCollectionRefresh is true.
      // Global metadata will be used from cache if it's fresh, unless forceGlobalMetaRefresh was also true.
      loadAllUserData(state.user.addr, {
        forceCollectionRefresh: true, // This is the key to ensure collection data is rebuilt based on current chain state
        forceGlobalMetaRefresh: false, // Typically, don't need to force global meta on every programmatic refresh
      }).catch(console.error);
    }
  }, [loadAllUserData, state.user.addr]);

  const contextValue = useMemo(
    () => ({
      ...state,
      dispatch,
      loadAllUserData,
      refreshUserData,
      smartRefreshUserData,
      loadChildData,
    }),
    [
      state,
      loadAllUserData,
      refreshUserData,
      smartRefreshUserData,
      loadChildData,
    ]
  );

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
}

export default UserDataProvider;
