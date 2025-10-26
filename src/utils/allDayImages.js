/**
 * AllDay Image Utilities
 * Provides consistent image URL generation for AllDay NFTs
 * Matches TopShot image parameters for consistency
 */

/**
 * Generate AllDay image URL with custom parameters
 * @param {number} editionID - The AllDay edition ID
 * @param {number} width - Image width (default: 250 to match TopShot)
 * @param {number} quality - Image quality (default: 80 to match TopShot)
 * @returns {string} Complete image URL
 */
export const getAllDayImageUrl = (editionID, width = 250, quality = 80) => {
  if (!editionID) return '';
  return `https://media.nflallday.com/editions/${editionID}/media/image?format=webp&width=${width}&quality=${quality}&cv=1`;
};

/**
 * Generate AllDay image URL with TopShot-consistent parameters
 * Matches the exact parameters used in TopShot MomentCard
 * @param {number} editionID - The AllDay edition ID
 * @returns {string} Complete image URL with TopShot-consistent parameters
 */
export const getAllDayImageUrlConsistent = (editionID) => {
  if (!editionID) return '';
  // Match TopShot's exact parameters: width=250&quality=80
  return `https://media.nflallday.com/editions/${editionID}/media/image?format=webp&width=250&quality=80&cv=1`;
};

/**
 * Generate AllDay image URL for different sizes
 * @param {number} editionID - The AllDay edition ID
 * @param {'small'|'medium'|'large'} size - Image size preset
 * @returns {string} Complete image URL
 */
export const getAllDayImageUrlBySize = (editionID, size = 'medium') => {
  if (!editionID) return '';
  
  const sizeMap = {
    small: { width: 150, quality: 70 },
    medium: { width: 250, quality: 80 },
    large: { width: 400, quality: 90 }
  };
  
  const { width, quality } = sizeMap[size] || sizeMap.medium;
  return getAllDayImageUrl(editionID, width, quality);
};

/**
 * Check if an AllDay image URL is valid
 * @param {string} url - The image URL to validate
 * @returns {boolean} True if URL appears to be a valid AllDay image URL
 */
export const isValidAllDayImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('media.nflallday.com/editions/') && url.includes('/media/image');
};

/**
 * Extract edition ID from AllDay image URL
 * @param {string} url - The AllDay image URL
 * @returns {number|null} Edition ID if found, null otherwise
 */
export const extractEditionIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  const match = url.match(/\/editions\/(\d+)\//);
  return match ? parseInt(match[1], 10) : null;
};

