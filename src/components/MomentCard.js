// src/components/MomentCard.jsx

import React, { useEffect, useState, useCallback } from "react";
import { FaLock } from "react-icons/fa";
import { getAllDayImageUrlConsistent } from "../utils/allDayImages";
import { getSeriesDisplayText } from "../utils/seriesNames";

// Export tierStyles so other components can use them if needed.
export const tierStyles = {
  common: "text-gray-400",
  rare: "text-blue-500",
  fandom: "text-lime-400",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

/**
 * Formats a number to be more compact if it's large
 * @param {number} num - The number to format
 * @param {boolean} isMintCount - Whether this is a mint count (true) or serial number (false)
 * @returns {string} - Formatted number string
 */
function formatNumber(num, isMintCount = false) {
  if (!num) return "?";

  // For serial numbers, always show the full number
  if (!isMintCount) return num.toString();

  // For mint counts, show full number if 4 digits or less (≤9999)
  if (num <= 9999) {
    return num.toString();
  }
  // For numbers 10k and above, round to nearest thousand
  return Math.round(num / 1000) + "k";
}

/**
 * Returns the display name for an NFT.
 * - If the FullName is known and not "Unknown Player", use it.
 * - Otherwise, use the team name if available.
 * - If there's no team name, use playerName if available.
 * - Finally, default to "Unknown Player".
 */
function getDisplayedName(nft) {
  const forcedUnknowns = ["Unknown Player", "unknown player", "Unknown"];
  let candidate = nft?.FullName || nft?.fullName;

  // If candidate is "Unknown Player" or similar, force it to null
  if (
    candidate &&
    forcedUnknowns.some((unknown) => candidate.trim() === unknown)
  ) {
    candidate = null;
  }

  // Check for TeamAtMoment first (fall back to teamAtMoment for case variations)
  const teamName = nft?.TeamAtMoment || nft?.teamAtMoment;

  // Fallback chain: candidate -> teamName -> playerName -> "Unknown Player"
  return candidate || teamName || nft?.playerName || "Unknown Player";
}

/**
 * A unified MomentCard component.
 *
 * Props:
 * - nft: NFT object
 * - handleNFTSelection: function to call on click (if applicable)
 * - isSelected: applies a highlight border if true (only for interactive contexts)
 * - disableHover: if true, disables hover effects (for static displays)
 * - collectionType: 'topshot' or 'allday' - determines image source and data structure
 */
const MomentCard = ({
  nft,
  handleNFTSelection,
  isSelected,
  disableHover = false,
  collectionType = 'topshot',
  showMetadata = false,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [triedFallback, setTriedFallback] = useState(false); // State to prevent infinite loops

  // Image URL generation based on collection type
  const getImageUrls = () => {
    if (collectionType === 'allday') {
      // AllDay uses editionID for image URLs
      const baseUrl = getAllDayImageUrlConsistent(nft?.editionID);
      return { primary: baseUrl, fallback: baseUrl }; // AllDay doesn't have fallback variants
    } else {
      // TopShot uses NFT ID for image URLs
      const nonTransparentBaseUrl = `https://assets.nbatopshot.com/media/${nft?.id}/image?width=250&quality=80`;
      const fallbackBaseUrl = `https://assets.nbatopshot.com/media/${nft?.id}/transparent/image?width=250&quality=80`;
      return { primary: nonTransparentBaseUrl, fallback: fallbackBaseUrl };
    }
  };

  const { primary: primaryImageUrl, fallback: fallbackImageUrl } = getImageUrls();

  useEffect(() => {
    // Check for valid NFT identifier based on collection type
    const hasValidId = collectionType === 'allday' ? nft?.editionID : nft?.id;
    
    if (hasValidId) {
      // Always try the primary URL first when NFT changes
      setImageUrl(primaryImageUrl);
      setTriedFallback(false); // Reset fallback flag for the new NFT
    } else {
      // Clear image if no valid identifier
      setImageUrl("");
      setTriedFallback(false);
    }
    // Depend on the image URLs to reset when NFT changes
  }, [nft?.id, nft?.editionID, primaryImageUrl, collectionType]);

  // Use useCallback to memoize the error handler function
  const handleImageError = useCallback(() => {
    // Only try the fallback if we haven't already tried it for this NFT
    // and the current URL is the primary one that failed
    if (!triedFallback && imageUrl === primaryImageUrl && collectionType === 'topshot') {
      console.warn(`Primary image failed for ${nft?.id}, trying fallback.`);
      setImageUrl(fallbackImageUrl);
      setTriedFallback(true); // Mark that we've attempted the fallback
    }
    // For AllDay, we don't have fallback URLs, so just log the error
    if (collectionType === 'allday') {
      console.warn(`AllDay image failed for edition ${nft?.editionID}`);
    }
    // If the fallback also fails, the onError will trigger again, but
    // triedFallback will be true, so we won't set state again, preventing loops.
    // A broken image icon will be shown, which is the expected behavior if both fail.
  }, [imageUrl, triedFallback, primaryImageUrl, fallbackImageUrl, collectionType, nft?.id, nft?.editionID]);

  const playerName = getDisplayedName(nft);
  const seriesText = getSeriesDisplayText(nft?.series, collectionType);
  const finalMintCount = nft?.subeditionID
    ? nft?.subeditionMaxMint
    : nft?.momentCount;

  // Format the serial numbers for display
  const serialNumber = formatNumber(nft?.serialNumber, false);
  const mintCount = formatNumber(finalMintCount, true);
  
  // Show subeditionMaxMint if it's 4 digits or less (≤9999)
  const showSubeditionMint = nft?.subeditionMaxMint && Number(nft.subeditionMaxMint) <= 9999;
  const subeditionMintDisplay = showSubeditionMint ? ` /${nft.subeditionMaxMint}` : "";

  // Tier color classes from tierStyles, fallback "text-gray-400"
  const tierClass = nft?.tier
    ? tierStyles[nft.tier.toLowerCase()] || "text-gray-400"
    : "text-gray-400";

  const tierLabel = nft?.tier
    ? nft.tier.charAt(0).toUpperCase() + nft.tier.slice(1).toLowerCase()
    : "Unknown Tier";

  // Base styling for consistent layout
  const baseCardClasses = `
    w-[80px]
    sm:w-28
    min-h-[140px]
    sm:min-h-[196px]
    rounded
    overflow-hidden
    flex
    flex-col
    pt-1
    px-1
    pb-0
    border
    border-brand-text/40
    bg-black
    text-brand-text
    select-none
  `;

  // If hover is enabled and card is selected, highlight; else if hover is enabled, show a pointer/hover effect
  const hoverClasses = disableHover
    ? ""
    : `cursor-pointer transition-colors duration-200 hover:border-2 hover:border-opolis ${
        isSelected ? "border-2 border-green-500" : ""
      }`;

  const cardClasses = `${baseCardClasses} ${hoverClasses}`;

  const handleClick = () => {
    if (!disableHover && handleNFTSelection) {
      // Use appropriate ID based on collection type
      const nftId = collectionType === 'allday' ? nft?.editionID : nft?.id;
      if (nftId) {
        handleNFTSelection(nftId);
      }
    }
  };

  return (
    <div onClick={handleClick} className={cardClasses}>
      {/* Only render div/img if imageUrl is set */}
      {imageUrl && (
        <div className="relative overflow-hidden rounded mx-auto w-full aspect-square">
          <img
            src={imageUrl}
            alt={`${playerName} moment`}
            loading="eager"
            className="object-cover w-full h-full transform scale-150"
            style={{ objectPosition: "center 20%" }}
            onError={handleImageError}
          />
          {/* Lock icon overlay for locked moments */}
          {nft?.isLocked && (
            <div className="absolute top-1 right-1 bg-red-600 rounded-full p-1.5 shadow-lg border border-red-400">
              <FaLock size={10} className="text-white" />
            </div>
          )}
        </div>
      )}
      {/* Placeholder if no image URL (e.g., missing nft.id) */}
      {!imageUrl && (
        <div className="relative overflow-hidden rounded mx-auto w-full aspect-square bg-gray-700">
          {/* Optional: Add an icon or text here */}
        </div>
      )}

      <div className="flex flex-col space-y-0 mt-1">
        <h3
          className="
            text-center
            text-[10px]
            sm:text-xs
            font-semibold
            truncate
            leading-tight
            mb-0
          "
        >
          {playerName}
        </h3>
        <p
          className="
            text-center
            text-[10px]
            sm:text-xs
            text-brand-text/60
            truncate
            leading-tight
            mb-0
          "
        >
          {seriesText}
        </p>
        <p className="text-center text-[10px] sm:text-xs text-brand-text/50 truncate leading-tight mb-0">
          {nft?.name || "Unknown Set"}
        </p>
        <p
          className={`text-center text-[10px] sm:text-xs truncate leading-tight ${tierClass} mb-0`}
        >
          {tierLabel}
        </p>
        {nft?.subeditionName && nft?.subeditionIcon && (
          <div className="flex items-center justify-center gap-1 mb-0">
            <img 
              src={nft.subeditionIcon} 
              alt={nft.subeditionName}
              className="w-3 h-3 object-contain"
            />
            <p className="text-center text-[9px] sm:text-[10px] text-brand-text/70 truncate leading-tight">
              {nft.subeditionName}
            </p>
          </div>
        )}
        <p className="text-center text-[10px] sm:text-xs text-brand-text/60 truncate leading-tight mb-0">
          {serialNumber} / {mintCount}{subeditionMintDisplay}
        </p>
      </div>

      {/* On-Chain Metadata Display */}
      {showMetadata && collectionType === 'topshot' && (
        <div className="mt-1 pt-1 border-t border-gray-700 space-y-0.5">
          {nft?.id && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">id: {nft.id}</p>}
          {nft?.setID !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">setID: {nft.setID}</p>}
          {nft?.playID !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">playID: {nft.playID}</p>}
          {nft?.subeditionID !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">subeditionID: {nft.subeditionID !== null ? nft.subeditionID : 'null'}</p>}
          {nft?.momentCount !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">momentCount: {nft.momentCount}</p>}
          {nft?.series !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">series: {nft.series}</p>}
          {nft?.tier !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">tier: {nft.tier}</p>}
          {nft?.retired !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">retired: {String(nft.retired)}</p>}
        </div>
      )}
    </div>
  );
};

export default MomentCard;
