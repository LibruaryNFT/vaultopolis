// src/utils/SnapshotManager.js
import { metaStore } from "./metaStore";

// --- Constants ---
const SNAPSHOT_VERSION = 1;
const SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// --- Helper Functions ---
const getSnapshotKey = (address) => `collSnap:${address.toLowerCase()}`;

export function tierTally(list) {
  if (!list || !Array.isArray(list)) {
    console.warn(
      "[tierTally] Received invalid list input, returning empty tiers."
    );
    return {};
  }
  return list.reduce((o, n) => {
    if (n && n.tier) {
      const t = n.tier.toLowerCase();
      o[t] = (o[t] || 0) + 1;
    }
    return o;
  }, {});
}

// --- SnapshotManager Module/Class ---
export const SnapshotManager = {
  async getSnapshot(address) {
    const key = getSnapshotKey(address);
    let snapshot = null;
    let needsRefresh = "full";
    let isValid = false;
    let isStale = false;

    try {
      snapshot = await metaStore.getItem(key);
    } catch (error) {
      console.error(
        `[SnapshotManager] Error getting snapshot for ${address}:`,
        error
      );
      return {
        snapshot: null,
        isValid: false,
        isStale: false,
        needsRefresh: "full",
      };
    }

    if (!snapshot) {
      console.log(
        `[SnapshotManager] No snapshot found for ${address}. Needs full refresh.`
      );
      return {
        snapshot: null,
        isValid: false,
        isStale: false,
        needsRefresh: "full",
      };
    }

    // let wasUpgraded = false; // Removed as it was unused
    // "Upgrade on first read" & basic validation
    if (!snapshot.hasOwnProperty("version")) {
      console.warn(
        `[SnapshotManager] Snapshot for ${address} has no version. Invalidating.`
      );
      snapshot.version = -1;
      // wasUpgraded = true;
    }
    if (!snapshot.hasOwnProperty("lastUpdate")) {
      snapshot.lastUpdate = snapshot.ts || Date.now();
      console.log(
        `[SnapshotManager] Upgraded snapshot for ${address}: added lastUpdate.`
      );
      // wasUpgraded = true;
    }
    if (!snapshot.hasOwnProperty("isComplete")) {
      if (
        snapshot.details &&
        snapshot.ids &&
        snapshot.details.length === snapshot.ids.length &&
        snapshot.ids.length > 0
      ) {
        snapshot.isComplete = true;
      } else {
        snapshot.isComplete = false;
      }
      console.log(
        `[SnapshotManager] Upgraded snapshot for ${address}: added isComplete: ${snapshot.isComplete}.`
      );
      // wasUpgraded = true;
    }

    if (snapshot.version !== SNAPSHOT_VERSION) {
      console.warn(
        `[SnapshotManager] Snapshot version mismatch for ${address}. Expected ${SNAPSHOT_VERSION}, got ${snapshot.version}. Needs full refresh.`
      );
      try {
        await metaStore.removeItem(key);
      } catch (e) {
        console.error(
          `[SnapshotManager] Failed to remove outdated snapshot for ${address}`,
          e
        );
      }
      return {
        snapshot: null,
        isValid: false,
        isStale: false,
        needsRefresh: "full",
      };
    }

    if (!snapshot.details || !snapshot.ids || !snapshot.tiers) {
      console.warn(
        `[SnapshotManager] Snapshot for ${address} missing core data structures (details, ids, or tiers). Invalidating.`
      );
      try {
        await metaStore.removeItem(key);
      } catch (e) {
        console.error(
          `[SnapshotManager] Failed to remove structurally invalid snapshot for ${address}`,
          e
        );
      }
      return {
        snapshot: null,
        isValid: false,
        isStale: false,
        needsRefresh: "full",
      };
    }

    isValid = true;
    isStale = Date.now() - snapshot.lastUpdate > SNAPSHOT_MAX_AGE_MS;

    if (isStale) {
      console.log(
        `[SnapshotManager] Snapshot for ${address} is stale. Needs full refresh.`
      );
      needsRefresh = "full";
    } else if (!snapshot.isComplete) {
      console.log(
        `[SnapshotManager] Snapshot for ${address} is incomplete. Needs delta refresh.`
      );
      needsRefresh = "delta";
    } else {
      console.log(
        `[SnapshotManager] Snapshot for ${address} is valid, current, and complete.`
      );
      needsRefresh = "none";
    }

    return { snapshot, isValid, isStale, needsRefresh };
  },

  async saveSnapshot(address, dataToSave, { isComplete }) {
    const key = getSnapshotKey(address);
    const currentTiers =
      dataToSave && dataToSave.tiers
        ? dataToSave.tiers
        : tierTally(dataToSave.details || []);

    const snapshotToStore = {
      version: SNAPSHOT_VERSION,
      lastUpdate: Date.now(),
      isComplete,
      ids: dataToSave.ids || [],
      details: dataToSave.details || [],
      tiers: currentTiers,
    };

    try {
      await metaStore.setItem(key, snapshotToStore);
      console.log(
        `[SnapshotManager] Successfully saved ${
          isComplete ? "complete" : "partial"
        } snapshot for ${address}. Items: ${snapshotToStore.details.length}/${
          snapshotToStore.ids.length
        }`
      );
      return { success: true };
    } catch (error) {
      console.error(
        `[SnapshotManager] Error saving snapshot for ${address}:`,
        error
      );
      return { success: false };
    }
  },

  async mergeSnapshot(
    address,
    { newDataForAddedItems = [], idsToRemove = [], allCurrentIdsOnChain = [] }
  ) {
    const key = getSnapshotKey(address);
    let existingSnapshot;

    try {
      existingSnapshot = await metaStore.getItem(key);
    } catch (error) {
      console.error(
        `[SnapshotManager] Error getting existing snapshot for merge (address: ${address}):`,
        error
      );
      return { success: false, mergedSnapshotData: null };
    }

    if (!existingSnapshot || existingSnapshot.version !== SNAPSHOT_VERSION) {
      console.warn(
        `[SnapshotManager] No valid existing snapshot to merge for ${address}. A full refresh might be needed if this was unexpected.`
      );
      return { success: false, mergedSnapshotData: null };
    }

    const existingDetails = existingSnapshot.details || [];
    const idsToRemoveSet = new Set(idsToRemove.map((id) => String(id)));

    const filteredDetails = existingDetails.filter(
      (item) => !idsToRemoveSet.has(String(item.id))
    );

    const combinedDetails = [...filteredDetails, ...newDataForAddedItems];

    const uniqueDetailsMap = new Map();
    combinedDetails.forEach((item) =>
      uniqueDetailsMap.set(String(item.id), item)
    );
    const finalDetails = Array.from(uniqueDetailsMap.values());

    finalDetails.sort((a, b) => String(a.id).localeCompare(String(b.id)));

    const finalDetailIdsSet = new Set(
      finalDetails.map((item) => String(item.id))
    );
    let newIsComplete = finalDetails.length === allCurrentIdsOnChain.length;
    if (newIsComplete && allCurrentIdsOnChain.length > 0) {
      for (const chainId of allCurrentIdsOnChain) {
        if (!finalDetailIdsSet.has(String(chainId))) {
          newIsComplete = false;
          console.warn(
            `[SnapshotManager] Completeness check failed for ${address}: ID ${chainId} on chain not in final snapshot details.`
          );
          break;
        }
      }
    } else if (allCurrentIdsOnChain.length === 0 && finalDetails.length === 0) {
      newIsComplete = true;
    }

    const sortedAllCurrentIdsOnChain = [...allCurrentIdsOnChain].sort((a, b) =>
      String(a).localeCompare(String(b))
    );

    const mergedSnapshotData = {
      version: SNAPSHOT_VERSION,
      lastUpdate: Date.now(),
      isComplete: newIsComplete,
      ids: sortedAllCurrentIdsOnChain,
      details: finalDetails,
      tiers: tierTally(finalDetails),
    };

    try {
      await metaStore.setItem(key, mergedSnapshotData);
      console.log(
        `[SnapshotManager] Successfully merged and saved snapshot for ${address}. Is complete: ${newIsComplete}. Items: ${finalDetails.length}/${allCurrentIdsOnChain.length}`
      );
      return { success: true, mergedSnapshotData };
    } catch (error) {
      console.error(
        `[SnapshotManager] Error saving merged snapshot for ${address}:`,
        error
      );
      return { success: false, mergedSnapshotData: null };
    }
  },
};
