// src/utils/metaStore.js
import localforage from "localforage";

/**
 * A single IndexedDB-backed store for Top Shot metadata.
 * localforage automatically falls back to WebSQL or localStorage
 * on very old browsers, so nothing breaks.
 */
export const metaStore = localforage.createInstance({
  name: "vaultopolis", // database name
  storeName: "topshotMeta", // object-store (“table”) name
  description: "Cached Top Shot metadata for NFT enrichment",
});
