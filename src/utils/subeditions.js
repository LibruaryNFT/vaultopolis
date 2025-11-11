/**
 * Subedition/Parallel Utilities
 * Provides subedition data and icon URL generation for TopShot parallels
 */

/**
 * Subedition mapping: ID -> { name, minted }
 * Note: Icon URLs are generated dynamically, not stored here
 */
export const SUBEDITIONS = {
  0: { name: "Standard", minted: 0 },
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
  13: { name: "Voltage", minted: 100 },
  14: { name: "Livewire", minted: 25 },
  15: { name: "Championship", minted: 5 },
  16: { name: "Club Collection", minted: 99 },
  17: { name: "Blockchain", minted: 99 },
  18: { name: "Hardcourt", minted: 50 },
  19: { name: "Hexwave", minted: 25 },
  20: { name: "Jukebox", minted: 10 },
};

/**
 * Generate parallel icon URL from subedition ID
 * @param {number} subeditionID - The subedition/parallel ID
 * @param {number} width - Icon width (default: 72)
 * @param {number} quality - Image quality (default: 80)
 * @returns {string} Complete icon URL or empty string if invalid
 */
export const getParallelIconUrl = (subeditionID, width = 72, quality = 80) => {
  if (subeditionID === null || subeditionID === undefined) return '';
  return `https://assets.nbatopshot.com/resize/subeditions/parallel-icons/parallel_${subeditionID}.png?format=webp&quality=${quality}&width=${width}&cv=1`;
};

/**
 * Get subedition name by ID
 * @param {number} subeditionID - The subedition/parallel ID
 * @returns {string|null} Subedition name or null if not found
 */
export const getSubeditionName = (subeditionID) => {
  if (subeditionID === null || subeditionID === undefined) return null;
  return SUBEDITIONS[subeditionID]?.name || null;
};

/**
 * Get subedition mint count by ID
 * @param {number} subeditionID - The subedition/parallel ID
 * @returns {number|null} Mint count or null if not found
 */
export const getSubeditionMinted = (subeditionID) => {
  if (subeditionID === null || subeditionID === undefined) return null;
  return SUBEDITIONS[subeditionID]?.minted ?? null;
};

