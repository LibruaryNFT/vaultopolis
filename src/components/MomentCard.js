// src/components/MomentCard.jsx

import React, { useEffect, useState } from "react";

// Export tierStyles so other components can use them if needed.
export const tierStyles = {
  common: "text-gray-400",
  rare: "text-blue-500",
  fandom: "text-lime-400",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

/**
 * Returns the display name for an NFT.
 * - If the FullName is known and not "Unknown Player", use it.
 * - Otherwise, use the team name if available.
 * - If there's no team name, use playerName if available.
 * - Finally, default to "Unknown Player".
 */
function getDisplayedName(nft) {
  const forcedUnknowns = ["Unknown Player", "unknown player"];
  let candidate = nft?.FullName || nft?.fullName;

  if (candidate && forcedUnknowns.includes(candidate.trim())) {
    candidate = null;
  }

  return candidate || nft?.teamAtMoment || nft?.playerName || "Unknown Player";
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

  useEffect(() => {
    if (nft?.id) {
      // Use the new Top Shot media endpoint
      setImageUrl(
        `https://assets.nbatopshot.com/media/${nft.id}/transparent/image?width=250&quality=80`
      );
    }
  }, [nft?.id]);

  const playerName = getDisplayedName(nft);
  const seriesText = nft?.series !== undefined ? String(nft.series) : "?";
  const finalMintCount = nft?.subeditionID
    ? nft?.subeditionMaxMint
    : nft?.momentCount;

  // Tier color classes from tierStyles, fallback "text-gray-400"
  const tierClass = nft?.tier
    ? tierStyles[nft.tier.toLowerCase()] || "text-gray-400"
    : "text-gray-400";

  const tierLabel = nft?.tier
    ? nft.tier.charAt(0).toUpperCase() + nft.tier.slice(1).toLowerCase()
    : "Unknown Tier";

  // Base styling for consistent layout
  const baseCardClasses = `
    w-28
    h-44
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
      handleNFTSelection(nft.id);
    }
  };

  return (
    <div onClick={handleClick} className={cardClasses}>
      {imageUrl && (
        <div
          className="relative overflow-hidden rounded mx-auto"
          style={{ width: 80, height: 80 }}
        >
          <img
            src={imageUrl}
            alt={`${playerName} moment`}
            className="object-cover w-full h-full transform scale-150"
            style={{ objectPosition: "center 20%" }}
          />
        </div>
      )}

      <div className="flex flex-col space-y-0 mt-1">
        <h3
          className="
            text-center
            text-xs
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
            text-xs
            text-brand-text/60
            truncate
            leading-tight
            mb-0
          "
        >
          Series {seriesText}
        </p>
        <p
          className={`text-center text-xs truncate leading-tight ${tierClass} mb-0`}
        >
          {tierLabel}
        </p>
        <p className="text-center text-xs text-brand-text/60 truncate leading-tight mb-0">
          {nft?.serialNumber ?? "?"} / {finalMintCount ?? "?"}
        </p>
        <p className="text-center text-xs text-brand-text/50 truncate leading-tight mb-0">
          {nft?.name || "Unknown Set"}
        </p>
      </div>
    </div>
  );
};

export default MomentCard;
