import React, { useEffect, useState } from "react";

// Optional: tier color mapping
const tierStyles = {
  common: "text-gray-400",
  rare: "text-blue-500",
  fandom: "text-lime-400",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

const MomentCard = ({ nft, handleNFTSelection, isSelected }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    // If we have an NFT ID, build the official NBA Top Shot media URL
    if (nft?.id) {
      // e.g. https://assets.nbatopshot.com/media/40628102/image?width=250
      setImageUrl(
        `https://assets.nbatopshot.com/media/${nft.id}/image?width=250`
      );
    }
  }, [nft?.id]);

  // Player name fallback
  const playerName =
    nft?.FullName || nft?.fullName || nft?.playerName || "Unknown Player";

  // Series text
  const seriesText =
    nft?.series !== undefined && nft?.series !== null
      ? String(nft.series)
      : "?";

  // Tier stylings
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
        border
        bg-black
        rounded
        cursor-pointer
        relative
        p-1
        font-inter
        text-white
        transition-colors
        duration-200
        hover:border-2
        hover:border-opolis
        ${isSelected ? "border-green-500" : "border-gray-600"}
        overflow-hidden
      `}
      style={{ width: "7rem", height: "12rem" }}
    >
      {/* Image */}
      {imageUrl && (
        <div
          className="relative overflow-hidden rounded mx-auto"
          style={{ height: "80px", width: "80px" }}
        >
          <img
            src={imageUrl}
            alt={`${playerName} moment`}
            className="object-cover w-full h-full transform scale-150"
            style={{ objectPosition: "center" }}
          />
        </div>
      )}

      {/* Player Name */}
      <h3 className="text-center text-white mt-1 text-xs font-semibold truncate whitespace-nowrap">
        {playerName}
      </h3>

      {/* Series */}
      <p className="text-center text-xs text-gray-400 truncate whitespace-nowrap">
        Series {seriesText}
      </p>

      {/* Tier */}
      <p
        className={`text-center ${tierClass} text-xs truncate whitespace-nowrap`}
      >
        {tierLabel}
      </p>

      {/* SerialNumber / momentCount */}
      <p className="text-center text-xs text-gray-400 truncate whitespace-nowrap">
        {nft?.serialNumber ?? "?"} / {nft?.momentCount ?? "?"}
      </p>

      {/* Set Name */}
      <p className="text-center text-gray-400 text-xs truncate whitespace-nowrap">
        {nft?.name || "Unknown Set"}
      </p>
    </div>
  );
};

export default MomentCard;
