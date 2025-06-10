// src/components/MomentCard.jsx

import React, { useEffect, useState, useCallback } from "react";

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

  // For mint counts
  if (num < 1000) {
    // Always show full number under 1k
    return num.toString();
  }
  if (num < 4000) {
    // If it's a clean multiple of 500, show as k
    if (num % 500 === 0) {
      return num / 1000 + "k";
    }
    // Otherwise show full number
    return num.toString();
  }
  // For numbers 4000 and above, show as k
  return Math.floor(num / 1000) + "k";
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
 */
const MomentCard = ({
  nft,
  handleNFTSelection,
  isSelected,
  disableHover = false,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [triedFallback, setTriedFallback] = useState(false); // State to prevent infinite loops

  const transparentBaseUrl = `https://assets.nbatopshot.com/media/${nft?.id}/transparent/image?width=250&quality=80`;
  const fallbackBaseUrl = `https://assets.nbatopshot.com/media/${nft?.id}/image?width=250&quality=80`;

  useEffect(() => {
    if (nft?.id) {
      // Always try the transparent URL first when NFT changes
      setImageUrl(transparentBaseUrl);
      setTriedFallback(false); // Reset fallback flag for the new NFT
    } else {
      // Clear image if no nft or id
      setImageUrl("");
      setTriedFallback(false);
    }
    // Depend on the base URLs to reset when nft.id changes
  }, [nft?.id, transparentBaseUrl]); // Include base URLs in dependency array

  // Use useCallback to memoize the error handler function
  const handleImageError = useCallback(() => {
    // Only try the fallback if we haven't already tried it for this NFT
    // and the current URL is the transparent one that failed
    if (!triedFallback && imageUrl === transparentBaseUrl) {
      console.warn(`Transparent image failed for ${nft?.id}, trying fallback.`);
      setImageUrl(fallbackBaseUrl);
      setTriedFallback(true); // Mark that we've attempted the fallback
    }
    // If the fallback also fails, the onError will trigger again, but
    // triedFallback will be true, so we won't set state again, preventing loops.
    // A broken image icon will be shown, which is the expected behavior if both fail.
  }, [imageUrl, triedFallback, fallbackBaseUrl, transparentBaseUrl, nft?.id]); // Add dependencies

  const playerName = getDisplayedName(nft);
  const seriesText = nft?.series !== undefined ? String(nft.series) : "?";
  const finalMintCount = nft?.subeditionID
    ? nft?.subeditionMaxMint
    : nft?.momentCount;

  // Format the serial numbers for display
  const serialNumber = formatNumber(nft?.serialNumber, false);
  const mintCount = formatNumber(finalMintCount, true);

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
    bg-brand-secondary
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
    if (!disableHover && handleNFTSelection && nft?.id) {
      // Check nft?.id before calling
      handleNFTSelection(nft.id);
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
          Series {seriesText}
        </p>
        <p
          className={`text-center text-[10px] sm:text-xs truncate leading-tight ${tierClass} mb-0`}
        >
          {tierLabel}
        </p>
        <p className="text-center text-[10px] sm:text-xs text-brand-text/60 truncate leading-tight mb-0">
          {serialNumber} / {mintCount}
        </p>
        <p className="text-center text-[10px] sm:text-xs text-brand-text/50 truncate leading-tight mb-0">
          {nft?.name || "Unknown Set"}
        </p>
      </div>
    </div>
  );
};

export default MomentCard;
