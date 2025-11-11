// src/components/AllDayMomentCard.jsx

import React, { useEffect, useState, useCallback } from "react";
import { FaLock } from "react-icons/fa";
import { getAllDayImageUrlConsistent } from "../utils/allDayImages";
import { getSeriesDisplayText } from "../utils/seriesNames";

// Export tierStyles for AllDay (different from TopShot)
export const allDayTierStyles = {
  common: "text-gray-400",
  uncommon: "text-lime-400", // Add UNCOMMON tier color
  rare: "text-blue-500",
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

  // For mint counts, use more precise formatting
  if (num < 1300) {
    // Always show full number under 1300
    return num.toString();
  }
  if (num < 10000) {
    // For numbers 1300-10k, show with decimal precision
    const thousands = num / 1000;
    if (thousands % 1 === 0) {
      // Clean thousands (2000, 3000, etc.)
      return thousands + "k";
    } else {
      // Show one decimal place (1500 -> 1.5k, 7500 -> 7.5k)
      return thousands.toFixed(1) + "k";
    }
  }
  // For numbers 10k and above, round to nearest thousand
  return Math.round(num / 1000) + "k";
}

/**
 * Returns the display name for an AllDay NFT.
 * Uses AllDay-specific field names from the metadata API
 */
function getDisplayedName(nft) {
  const forcedUnknowns = ["Unknown Player", "unknown player", "Unknown"];
  let candidate = nft?.playerName;

  // If candidate is "Unknown Player" or similar, force it to null
  if (
    candidate &&
    forcedUnknowns.some((unknown) => candidate.trim() === unknown)
  ) {
    candidate = null;
  }

  // Check for teamName (AllDay field)
  const teamName = nft?.teamName;

  // Fallback chain: candidate -> teamName -> "Unknown Player"
  return candidate || teamName || "Unknown Player";
}

/**
 * AllDay-specific MomentCard component.
 * Uses AllDay data structure and field names
 */
const AllDayMomentCard = ({
  nft,
  handleNFTSelection,
  isSelected,
  disableHover = false,
  showMetadata = false,
}) => {
  const [imageUrl, setImageUrl] = useState("");

  // AllDay image URL generation
  const getImageUrls = () => {
    const baseUrl = getAllDayImageUrlConsistent(nft?.editionID);
    return { primary: baseUrl }; // AllDay doesn't have fallback variants
  };

  const { primary: primaryImageUrl } = getImageUrls();

  useEffect(() => {
    // Check for valid AllDay NFT identifier
    const hasValidId = nft?.editionID;
    
    if (hasValidId) {
      // Always try the primary URL first when NFT changes
      setImageUrl(primaryImageUrl);
    } else {
      // Clear image if no valid identifier
      setImageUrl("");
    }
    // Depend on the image URLs to reset when NFT changes
  }, [nft?.editionID, primaryImageUrl]);

  // Use useCallback to memoize the error handler function
  const handleImageError = useCallback(() => {
    // For AllDay, we don't have fallback URLs, so just log the error
    console.warn(`AllDay image failed for edition ${nft?.editionID}`);
  }, [nft?.editionID]);

  const playerName = getDisplayedName(nft);
  
  // AllDay-specific field mapping from metadata API
  const seriesText = getSeriesDisplayText(nft?.series, 'allday');
  const setName = nft?.setName || "Unknown Set";
  
  // AllDay maxMintSize comes from the Edition, not the NFT directly
  // If not available from metadata, show "?" 
  const mintCount = nft?.maxMintSize || "?";

  // Format the serial numbers for display
  const serialNumber = formatNumber(nft?.serialNumber, false);
  const mintCountFormatted = formatNumber(mintCount, true);

  // Tier color classes from allDayTierStyles, fallback "text-gray-400"
  const tierClass = nft?.tier
    ? allDayTierStyles[nft.tier.toLowerCase()] || "text-gray-400"
    : "text-gray-400";

  const tierLabel = nft?.tier
    ? nft.tier.charAt(0).toUpperCase() + nft.tier.slice(1).toLowerCase()
    : "Unknown Tier";

  // Base styling for consistent layout
  const baseCardClasses = `
    w-[80px]
    sm:w-28
    aspect-[4/7]
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
    : `cursor-pointer transition-colors duration-200 hover:border-2 hover:border-opalis ${
        isSelected ? "border-2 border-green-500" : ""
      }`;

  const cardClasses = `${baseCardClasses} ${hoverClasses}`;

  const handleClick = () => {
    if (!disableHover && handleNFTSelection && nft?.editionID) {
      handleNFTSelection(nft.editionID);
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
            <div className="absolute top-0.5 right-0.5 bg-red-500 rounded-full p-0.5 shadow-md">
              <FaLock size={6} className="text-white" />
            </div>
          )}
        </div>
      )}
      {/* Placeholder if no image URL (e.g., missing nft.editionID) */}
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
          {setName}
        </p>
        <p
          className={`text-center text-[10px] sm:text-xs truncate leading-tight ${tierClass} mb-0`}
        >
          {tierLabel}
        </p>
        <p className="text-center text-[10px] sm:text-xs text-brand-text/60 truncate leading-tight mb-0">
          {serialNumber} / {mintCountFormatted}
        </p>
      </div>

      {/* On-Chain Metadata Display */}
      {showMetadata && (
        <div className="mt-1 pt-1 border-t border-gray-700 space-y-0.5">
          {nft?.editionID !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">editionID: {nft.editionID}</p>}
          {nft?.setID !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">setID: {nft.setID}</p>}
          {nft?.playID !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">playID: {nft.playID}</p>}
          {nft?.numMinted !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">numMinted: {nft.numMinted}</p>}
          {nft?.seriesID !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">seriesID: {nft.seriesID}</p>}
          {nft?.series !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">series: {nft.series}</p>}
          {nft?.tier !== undefined && <p className="text-center text-[8px] sm:text-[9px] text-gray-500">tier: {nft.tier}</p>}
        </div>
      )}
    </div>
  );
};

export default AllDayMomentCard;
