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

// --- SnapshotManager Module ---
export const SnapshotManager = {
  /**
   * Retrieves and assesses a snapshot for a given address.
   * Determines if the snapshot is usable as-is or if a full rebuild is needed.
   * Performs "upgrade on first read" for older snapshot formats.
   */
  async getSnapshot(address) {
    const key = getSnapshotKey(address);
    let snapshot = null;
    let needsRefresh = "full"; // Default assumption
    // isValid will be determined directly in the return object based on needsRefresh
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
        isValid: false, // Explicitly false on error
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
        isValid: false, // No snapshot means not valid for use
        isStale: false,
        needsRefresh: "full",
      };
    }

    // "Upgrade on first read" & basic validation
    if (!snapshot.hasOwnProperty("version")) {
      console.warn(
        `[SnapshotManager] Snapshot for ${address} has no version. Invalidating.`
      );
      snapshot.version = -1; // Mark as invalid
    }
    if (!snapshot.hasOwnProperty("lastUpdate")) {
      snapshot.lastUpdate = snapshot.ts || Date.now(); // Migrate 'ts' or set new
      console.log(
        `[SnapshotManager] Upgraded snapshot for ${address}: added lastUpdate.`
      );
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
        isValid: false, // Version mismatch means not valid
        isStale: false, // Irrelevant if not valid
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
        isValid: false, // Structurally invalid
        isStale: false,
        needsRefresh: "full",
      };
    }

    // If we've reached here, the snapshot has the correct version and basic structure.
    // Now determine if it's stale or incomplete.
    isStale = Date.now() - snapshot.lastUpdate > SNAPSHOT_MAX_AGE_MS;

    if (isStale) {
      console.log(
        `[SnapshotManager] Snapshot for ${address} is stale. Needs full refresh.`
      );
      needsRefresh = "full";
    } else if (!snapshot.isComplete) {
      console.log(
        `[SnapshotManager] Snapshot for ${address} is incomplete. Needs full refresh (as delta logic is removed).`
      );
      needsRefresh = "full";
    } else {
      // Snapshot is version-correct, structurally sound, not stale, and complete.
      console.log(
        `[SnapshotManager] Snapshot for ${address} is valid, current, and complete.`
      );
      needsRefresh = "none";
    }

    const returnSnapshot = needsRefresh === "none" ? snapshot : null;

    return {
      snapshot: returnSnapshot,
      isValid: needsRefresh === "none", // isValid is true only if the snapshot is perfect to use
      isStale,
      needsRefresh,
    };
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
  // mergeSnapshot method has been removed for simplification
};
