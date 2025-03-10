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
 * Falls back to playerName or teamAtMoment if the primary name is "Unknown Player".
 */
function getDisplayedName(nft) {
  const forcedUnknowns = ["Unknown Player", "unknown player"];
  let candidate = nft?.FullName || nft?.fullName;
  if (candidate && forcedUnknowns.includes(candidate.trim())) {
    candidate = null;
  }
  return candidate || nft?.playerName || nft?.teamAtMoment || "Unknown Player";
}

/**
 * A unified MomentCard component.
 *
 * Props:
 * - nft: NFT object
 * - handleNFTSelection: function to call on click (if applicable)
 * - isSelected: applies a green border if true (only for interactive contexts)
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
      // Using the vault image URL (or adjust if needed)
      setImageUrl(
        `https://storage.googleapis.com/flowconnect/topshot/images_small/${nft.setID}_${nft.playID}.jpg`
      );
    }
  }, [nft?.id, nft?.setID, nft?.playID]);

  const playerName = getDisplayedName(nft);
  const seriesText = nft?.series !== undefined ? String(nft.series) : "?";
  const finalMintCount = nft?.subeditionID
    ? nft?.subeditionMaxMint
    : nft?.momentCount;
  const tierClass = nft?.tier
    ? tierStyles[nft.tier.toLowerCase()] || "text-gray-400"
    : "text-gray-400";
  const tierLabel = nft?.tier
    ? nft.tier.charAt(0).toUpperCase() + nft.tier.slice(1).toLowerCase()
    : "Unknown Tier";

  // Base styling for consistent card layout (changed from h-48 to h-44)
  const baseCardClasses =
    "w-28 h-44 border bg-black rounded relative text-white border-gray-600 overflow-hidden flex flex-col pt-1 pr-1 pl-1 pb-0";

  // Apply hover/selection effects only if disableHover is false.
  const hoverClasses = disableHover
    ? ""
    : `cursor-pointer transition-colors duration-200 hover:border-2 hover:border-opolis ${
        isSelected ? "border-green-500" : ""
      }`;

  const cardClasses = `${baseCardClasses} ${hoverClasses}`;

  return (
    <div
      onClick={() => !disableHover && handleNFTSelection?.(nft.id)}
      className={cardClasses}
    >
      {imageUrl && (
        <div
          className="relative overflow-hidden rounded mx-auto"
          style={{ width: 80, height: 80 }}
        >
          {/* Adjusted objectPosition shifts the image content slightly downward */}
          <img
            src={imageUrl}
            alt={`${playerName} moment`}
            className="object-cover w-full h-full transform scale-150"
            style={{ objectPosition: "center 20%" }}
          />
        </div>
      )}
      <div className="flex flex-col space-y-0">
        <h3 className="text-center text-white mt-1 text-xs font-semibold truncate leading-tight mb-0">
          {playerName}
        </h3>
        <p className="text-center text-xs text-gray-400 truncate leading-tight mb-0">
          Series {seriesText}
        </p>
        <p
          className={`text-center text-xs truncate leading-tight ${tierClass} mb-0`}
        >
          {tierLabel}
        </p>
        <p className="text-center text-xs text-gray-400 truncate leading-tight mb-0">
          {nft?.serialNumber ?? "?"} / {finalMintCount ?? "?"}
        </p>
        <p className="text-center text-gray-400 text-xs truncate leading-tight mb-0">
          {nft?.name || "Unknown Set"}
        </p>
      </div>
    </div>
  );
};

export default MomentCard;
