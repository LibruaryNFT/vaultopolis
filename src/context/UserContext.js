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

/** Increment this when snapshot schema changes */
const SNAPSHOT_VERSION = 1;

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
  lastCollectionLoad: null,
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
    case "SET_LAST_COLLECTION_LOAD":
      return { ...state, lastCollectionLoad: action.payload };
    default:
      return state;
  }
}

/* ═══════════════════════════════════════════════
 *  A. Metadata cache helpers
 * ═══════════════════════════════════════════════ */
async function loadMeta(dispatch) {
  const snap = await metaStore.getItem("topshotMeta_v1");
  const ONE_HOUR = 3_600_000;
  if (snap && Date.now() - snap.ts < ONE_HOUR) {
    dispatch({ type: "SET_METADATA_CACHE", payload: snap.data });
    return snap.data;
  }
  return fetchMeta(dispatch);
}

async function fetchMeta(dispatch) {
  try {
    const res = await fetch("https://api.vaultopolis.com/topshot-data");
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
    return map;
  } catch (e) {
    console.error("[meta] fetch failed", e);
    dispatch({ type: "SET_METADATA_CACHE", payload: {} });
    return {};
  }
}

/* ═══════════════════════════════════════════════
 *  B. Collection snapshot & delta refresh
 * ═══════════════════════════════════════════════ */
const SNAP = (addr) => `collSnap:${addr.toLowerCase()}`;
const LIMIT = pLimit(30);
const BATCH_SIZE = 2500;

function tierTally(list) {
  return list.reduce((o, n) => {
    const t = n.tier?.toLowerCase();
    if (t) o[t] = (o[t] || 0) + 1;
    return o;
  }, {});
}

async function enrich(list, meta) {
  return list.map((n) => {
    const k = `${n.setID}-${n.playID}`;
    const m = meta[k];
    const out = { ...n };
    if (m) {
      out.tier = m.tier;
      out.fullName = m.FullName || n.fullName;
      out.name = m.name || n.name;
      out.series = m.series ?? n.series;
      out.teamAtMoment = m.TeamAtMoment ?? n.teamAtMoment;
      out.momentCount = m.momentCount ?? n.momentCount;
    }
    if (n.subeditionID && SUBEDITIONS[n.subeditionID]) {
      const s = SUBEDITIONS[n.subeditionID];
      out.subeditionName = s.name;
      out.subeditionMaxMint = s.minted;
    }
    return out;
  });
}

/* ------------- CORE FETCH ------------- */
async function fetchCollection(addr, dispatch, state) {
  /* 0️⃣ capability-check */
  let hasColl = false;
  try {
    hasColl = await fcl.query({
      cadence: verifyTopShotCollection,
      args: (arg, t) => [arg(addr, t.Address)],
    });
  } catch (e) {
    console.warn("[verifyTopShotCollection] failed →", e);
  }

  /* fallback brute-force */
  let preFetchedIDs = null;
  if (!hasColl) {
    try {
      preFetchedIDs = await fcl.query({
        cadence: getTopShotCollectionIDs,
        args: (arg, t) => [arg(addr, t.Address)],
      });
      hasColl = preFetchedIDs.length > 0;
    } catch (e) {
      console.warn("[getTopShotCollectionIDs] fallback failed →", e);
    }
  }
  if (!hasColl) return { hasCollection: false, details: [], tierCounts: {} };

  /* 1️⃣ current IDs */
  const ids =
    preFetchedIDs ||
    (await fcl.query({
      cadence: getTopShotCollectionIDs,
      args: (arg, t) => [arg(addr, t.Address)],
    }));
  ids.sort((a, b) => a.localeCompare(b));

  /* 2️⃣ snapshot read & validation */
  let snap = await metaStore.getItem(SNAP(addr));
  const snapValid =
    snap &&
    snap.version === SNAPSHOT_VERSION &&
    snap.details &&
    snap.details.length === snap.ids?.length;
  if (!snapValid && snap) {
    try {
      await metaStore.removeItem(SNAP(addr)); // purge incompatible or half-baked snapshot
    } catch (e) {
      console.error("[metaStore] purge failed", e);
    }
    snap = null;
  }

  const snapSet = new Set(snap?.ids || []);
  const currSet = new Set(ids);
  const addIds = [...currSet].filter((id) => !snapSet.has(id));
  const removeIds = [...snapSet].filter((id) => !currSet.has(id));
  const nothingChanged = snap && addIds.length === 0 && removeIds.length === 0;

  /* 3️⃣ reuse snapshot if perfectly valid and unchanged */
  if (snapValid && nothingChanged) {
    return {
      hasCollection: true,
      details: snap.details,
      tierCounts: snap.tiers,
    };
  }

  /* 4️⃣ fetch missing IDs */
  let fetched = [];
  if (addIds.length) {
    const batches = [];
    for (let i = 0; i < addIds.length; i += BATCH_SIZE) {
      batches.push(addIds.slice(i, i + BATCH_SIZE));
    }

    const chunks = await Promise.all(
      batches.map((b) =>
        LIMIT(() =>
          fcl.query({
            cadence: getTopShotCollectionBatched,
            args: (arg, t) => [arg(addr, t.Address), arg(b, t.Array(t.UInt64))],
          })
        )
      )
    );

    const raw = chunks.flat().map((n) => ({
      ...n,
      id: String(n.id),
      setID: Number(n.setID),
      playID: Number(n.playID),
      serialNumber: Number(n.serialNumber),
      isLocked: Boolean(n.isLocked),
      subeditionID: n.subeditionID != null ? Number(n.subeditionID) : null,
    }));

    let meta = state.metadataCache;
    if (!meta) meta = await loadMeta(dispatch);
    const missingMeta = raw.some((n) => !meta[`${n.setID}-${n.playID}`]);
    if (missingMeta) meta = await fetchMeta(dispatch);

    fetched = await enrich(raw, meta);
  }

  /* 5️⃣ merge */
  const basis = (snap?.details || []).filter((n) => !removeIds.includes(n.id));
  const details = [...basis, ...fetched];
  const tiers = tierTally(details);

  /* 6️⃣ save snapshot only if complete */
  const isComplete = details.length === ids.length && ids.length > 0;
  if (isComplete) {
    try {
      await metaStore.setItem(SNAP(addr), {
        version: SNAPSHOT_VERSION,
        ts: Date.now(),
        ids,
        details,
        tiers,
      });
    } catch (e) {
      console.error("[metaStore] setItem failed", e);
    }
  } else {
    console.warn(
      `[snapshot] skipped for ${addr}: ${details.length}/${ids.length} items resolved`
    );
  }

  return { hasCollection: true, details, tierCounts: tiers };
}

/* ═══════════════════════════════════════════════
 *  C. Thin helpers for balances/receipts
 * ═══════════════════════════════════════════════ */
const fetchFLOW = (a) => fetchGeneric(a, getFLOWBalance);
const fetchTSHOT = (a) => fetchGeneric(a, getTSHOTBalance);

async function fetchReceipt(addr) {
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

async function fetchGeneric(addr, script) {
  if (!addr?.startsWith("0x")) return 0;
  try {
    return await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(addr, t.Address)],
    });
  } catch {
    return 0;
  }
}

/* ═══════════════════════════════════════════════
 *  D. React context provider
 * ═══════════════════════════════════════════════ */
function UserContext({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const [didInit, setDidInit] = useState(false);

  /* FLOW price polling */
  useEffect(() => {
    let timer;
    const poll = async () => {
      try {
        const p = await fcl.query({ cadence: getFlowPricePerNFT });
        dispatch({ type: "SET_FLOW_PRICE_PER_NFT", payload: p });
      } catch (e) {
        console.error("[price]", e);
      }
      timer = setTimeout(poll, 600_000);
    };
    poll();
    return () => clearTimeout(timer);
  }, []);

  /* parent */
  const loadParent = useCallback(
    async (addrRaw) => {
      const addr = addrRaw?.toLowerCase();
      if (!addr?.startsWith("0x")) return;
      const [flow, tshot, col, receipt] = await Promise.all([
        fetchFLOW(addr),
        fetchTSHOT(addr),
        fetchCollection(addr, dispatch, state),
        fetchReceipt(addr),
      ]);
      dispatch({
        type: "SET_ACCOUNT_DATA",
        payload: {
          parentAddress: addr,
          flowBalance: flow,
          tshotBalance: tshot,
          nftDetails: col.details,
          hasCollection: col.hasCollection,
          tierCounts: col.tierCounts,
          receiptDetails: receipt,
          hasReceipt: receipt?.betAmount > 0,
        },
      });
    },
    [state]
  );

  /* children */
  const loadChildren = useCallback(
    async (addrs = []) => {
      const out = [];
      for (const raw of addrs) {
        const a = raw.toLowerCase();
        const [flow, tshot, col, receipt] = await Promise.all([
          fetchFLOW(a),
          fetchTSHOT(a),
          fetchCollection(a, dispatch, state),
          fetchReceipt(a),
        ]);
        out.push({
          addr: a,
          flowBalance: flow,
          tshotBalance: tshot,
          nftDetails: col.details,
          hasCollection: col.hasCollection,
          tierCounts: col.tierCounts,
          receiptDetails: receipt,
          hasReceipt: receipt?.betAmount > 0,
        });
      }
      dispatch({ type: "SET_CHILDREN_DATA", payload: out });
      dispatch({
        type: "SET_CHILDREN_ADDRESSES",
        payload: addrs.map((x) => x.toLowerCase()),
      });
    },
    [state]
  );

  const loadChildData = useCallback(
    (addr) => loadChildren([addr]),
    [loadChildren]
  );

  /* ensureChildren */
  const ensureChildren = useCallback(
    async (addrRaw) => {
      const addr = addrRaw?.toLowerCase();
      if (!addr?.startsWith("0x")) return 0;
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
          const kids = await fcl.query({
            cadence: getChildren,
            args: (arg, t) => [arg(addr, t.Address)],
          });
          await loadChildren(kids);
          return kids.length;
        }
        dispatch({ type: "SET_CHILDREN_DATA", payload: [] });
        dispatch({ type: "SET_CHILDREN_ADDRESSES", payload: [] });
        return 0;
      } catch (e) {
        console.error("[children]", e);
        return 0;
      } finally {
        dispatch({ type: "SET_LOADING_CHILDREN", payload: false });
      }
    },
    [loadChildren]
  );

  /* umbrella loader */
  const loadAll = useCallback(
    async (addrRaw, { skipChildLoad = false } = {}) => {
      const addr = addrRaw?.toLowerCase();
      if (!addr?.startsWith("0x")) return;
      dispatch({ type: "SET_REFRESHING_STATE", payload: true });
      try {
        await loadParent(addr);
        if (!skipChildLoad) await ensureChildren(addr);
        dispatch({ type: "SET_LAST_COLLECTION_LOAD", payload: Date.now() });
      } finally {
        dispatch({ type: "SET_REFRESHING_STATE", payload: false });
      }
    },
    [loadParent, ensureChildren]
  );

  /* FCL subscription */
  useEffect(() => {
    const unsub = fcl.currentUser.subscribe((u) => {
      if (u?.addr) u.addr = u.addr.toLowerCase(); // normalise
      dispatch({ type: "SET_USER", payload: u });
      if (!u?.loggedIn) {
        dispatch({ type: "RESET_STATE" });
        setDidInit(false);
      }
    });
    return () => unsub();
  }, []);

  /* first load */
  useEffect(() => {
    if (!didInit && state.user.loggedIn && state.user.addr) {
      setDidInit(true);
      dispatch({
        type: "SET_SELECTED_ACCOUNT",
        payload: { address: state.user.addr, type: "parent" },
      });
      loadAll(state.user.addr).catch(console.error);
    }
  }, [didInit, state.user, loadAll]);

  const refreshUserData = useCallback(() => {
    if (state.user.addr) loadAll(state.user.addr).catch(console.error);
  }, [loadAll, state.user.addr]);

  const ctx = useMemo(
    () => ({
      ...state,
      dispatch,
      loadAllUserData: loadAll,
      refreshUserData,
      loadChildData,
    }),
    [state, loadAll, refreshUserData, loadChildData]
  );

  return (
    <UserDataContext.Provider value={ctx}>{children}</UserDataContext.Provider>
  );
}

export default UserContext;
