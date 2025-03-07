import React, { useEffect, useState } from "react";

// Optional tier color mapping
const tierStyles = {
  common: "text-gray-400",
  rare: "text-blue-500",
  fandom: "text-lime-400",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

function getDisplayedName(nft) {
  const forcedUnknowns = ["Unknown Player", "unknown player"];
  let candidate = nft?.FullName || nft?.fullName;
  if (candidate && forcedUnknowns.includes(candidate.trim())) {
    candidate = null;
  }
  return candidate || nft?.playerName || nft?.teamAtMoment || "Unknown Player";
}

const MomentCard = ({ nft, handleNFTSelection, isSelected }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (nft?.id) {
      setImageUrl(
        `https://assets.nbatopshot.com/media/${nft.id}/image?width=250`
      );
    }
  }, [nft?.id]);

  const playerName = getDisplayedName(nft);
  const seriesText = nft?.series !== undefined ? String(nft.series) : "?";

  // If there's a subedition, use subeditionMaxMint instead of momentCount
  const finalMintCount = nft?.subeditionID
    ? nft?.subeditionMaxMint
    : nft?.momentCount;

  const tierClass = nft?.tier
    ? tierStyles[nft.tier.toLowerCase()] || "text-gray-400"
    : "text-gray-400";
  const tierLabel = nft?.tier
    ? nft.tier.charAt(0).toUpperCase() + nft.tier.slice(1).toLowerCase()
    : "Unknown Tier";

  return (
    <div
      onClick={() => handleNFTSelection?.(nft.id)}
      className={`
        border bg-black rounded cursor-pointer relative text-white 
        transition-colors duration-200 hover:border-2 hover:border-opolis 
        ${isSelected ? "border-green-500" : "border-gray-600"} 
        overflow-hidden flex flex-col
      `}
      style={{ width: "7rem", height: "11rem" }} // fixed card size
    >
      {/* Top content (image, etc.) */}
      <div className="p-1 flex-grow flex flex-col items-center justify-start">
        {imageUrl && (
          <div
            className="relative overflow-hidden rounded"
            style={{ width: 80, height: 80 }}
          >
            <img
              src={imageUrl}
              alt={`${playerName} moment`}
              className="object-cover w-full h-full transform scale-150"
              style={{ objectPosition: "center" }}
            />
          </div>
        )}

        {/* Player name */}
        <h3 className="mt-1 mb-0 text-center text-white text-xs font-semibold truncate whitespace-nowrap">
          {playerName}
        </h3>

        {/* Series */}
        <p className="mt-0 mb-0 text-center text-xs text-gray-400 truncate whitespace-nowrap">
          Series {seriesText}
        </p>

        {/* Tier */}
        <p
          className={`
            mt-0 mb-0 text-center text-xs truncate whitespace-nowrap 
            ${tierClass}
          `}
        >
          {tierLabel}
        </p>

        {/* Serial / Mint */}
        <p className="mt-0 mb-0 text-center text-xs text-gray-400 truncate whitespace-nowrap">
          {nft?.serialNumber ?? "?"} / {finalMintCount ?? "?"}
        </p>

        {/* Set name */}
        <p className="mt-0 mb-0 text-center text-xs text-gray-400 truncate whitespace-nowrap">
          {nft?.name || "Unknown Set"}
        </p>
      </div>
    </div>
  );
};

export default MomentCard;
