/**
 * Series Name Mappings
 * Maps series IDs to human-readable names for TopShot and AllDay
 */

// AllDay Series Name Mappings
const ALLDAY_SERIES_NAMES = {
  1: "Series 1",
  2: "Historical",
  3: "Series 2",
  4: "Historical 2",
  5: "2023 Season",
  6: "Historical 2024",
  7: "2024 Season",
  8: "Historical 2025",
  9: "2025 Season",
};

// TopShot Series Name Mappings
const TOPSHOT_SERIES_NAMES = {
  0: "1",
  1: "2",
  3: "Summer 2021",
  4: "3",
  5: "4",
  6: "2023-24",
  7: "2024-25",
  8: "2025-26",
};

/**
 * Get the display name for a series ID
 * @param {number|string} seriesId - The series ID
 * @param {'topshot'|'allday'} collectionType - The collection type
 * @returns {string} The mapped series name or "Series {ID}" if not found
 */
export const getSeriesName = (seriesId, collectionType = 'topshot') => {
  if (seriesId === undefined || seriesId === null) return "?";
  
  const id = Number(seriesId);
  if (isNaN(id)) return String(seriesId);
  
  const mapping = collectionType === 'allday' ? ALLDAY_SERIES_NAMES : TOPSHOT_SERIES_NAMES;
  
  // If found in mapping, return it
  if (mapping[id]) {
    return mapping[id];
  }
  
  // If not found, default to just the ID number
  return String(id);
};

/**
 * Get the display name for a series ID with "Series" prefix
 * @param {number|string} seriesId - The series ID
 * @param {'topshot'|'allday'} collectionType - The collection type
 * @returns {string} The formatted series name (e.g., "Series 1" or "Historical")
 */
export const getSeriesDisplayText = (seriesId, collectionType = 'topshot') => {
  const name = getSeriesName(seriesId, collectionType);
  // If the mapped name already starts with "Series", don't add it again
  if (name.startsWith("Series") || name === "?") {
    return name;
  }
  // For TopShot: if it's a simple number (like "1", "2", "3", "4"), add "Series" prefix
  // For names like "Summer 2021", "2023-24", etc., return as-is
  if (collectionType === 'topshot' && /^\d+$/.test(name)) {
    return `Series ${name}`;
  }
  // For AllDay or other names, return as-is
  return name;
};

/**
 * Format series for filter display (shows just the name)
 * @param {number|string} seriesId - The series ID
 * @param {'topshot'|'allday'} collectionType - The collection type
 * @returns {string} The series name (e.g., "Series 1", "Historical", "2023 Season")
 */
export const getSeriesFilterLabel = (seriesId, collectionType = 'topshot') => {
  return getSeriesName(seriesId, collectionType);
};

