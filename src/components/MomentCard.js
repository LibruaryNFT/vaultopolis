import React, { useEffect, useState } from "react";

// Optional tier color mapping
const tierStyles = {
  common: "text-gray-400",
  rare: "text-blue-500",
  fandom: "text-lime-400",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

/**
 * Helper to decide the displayed name, ignoring aggregator's literal "Unknown Player"
 * so we can fallback to teamAtMoment if needed.
 */
function getDisplayedName(nft) {
  const forcedUnknowns = ["Unknown Player", "unknown player"];
  let candidate = nft?.FullName || nft?.fullName; // aggregator fields

  // If aggregator forcibly sets "Unknown Player", treat it as null
  if (candidate && forcedUnknowns.includes(candidate.trim())) {
    candidate = null;
  }

  return (
    candidate ||
    nft?.playerName || // alternative aggregator field
    nft?.teamAtMoment || // fallback to team
    "Unknown Player"
  );
}

const MomentCard = ({ nft, handleNFTSelection, isSelected }) => {
  const [imageUrl, setImageUrl] = useState("");

  // Build the official TopShot media URL (or your custom URL)
  useEffect(() => {
    if (nft?.id) {
      setImageUrl(
        `https://assets.nbatopshot.com/media/${nft.id}/image?width=250`
      );
    }
  }, [nft?.id]);

  // 1) Display name
  const playerName = getDisplayedName(nft);

  // 2) Series text
  const seriesText =
    nft?.series !== undefined && nft?.series !== null
      ? String(nft.series)
      : "?";

  // 3) If there's a subedition, use subeditionMaxMint instead of momentCount
  const finalMintCount = nft?.subeditionID
    ? nft?.subeditionMaxMint
    : nft?.momentCount;

  // 4) Tier stylings
  const tierClass = nft?.tier
    ? tierStyles[nft.tier.toLowerCase()] || "text-gray-400"
    : "text-gray-400";
  const tierLabel = nft?.tier
    ? nft.tier.charAt(0).toUpperCase() + nft.tier.slice(1).toLowerCase()
    : "Unknown Tier";

  // 5) Render the card
  return (
    <div
      onClick={() => handleNFTSelection?.(nft.id)}
      className={`border bg-black rounded cursor-pointer relative p-1 text-white transition-colors duration-200 hover:border-2 hover:border-opolis ${
        isSelected ? "border-green-500" : "border-gray-600"
      } overflow-hidden`}
      style={{ width: "7rem", height: "12rem" }}
    >
      {/* Thumbnail image */}
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

      {/* Player Name or fallback */}
      <h3 className="text-center text-white mt-1 text-xs font-semibold truncate whitespace-nowrap">
        {playerName}
      </h3>

      {/* Series */}
      <p className="text-center text-xs text-gray-400 truncate whitespace-nowrap">
        Series {seriesText}
      </p>

      {/* Tier Label */}
      <p
        className={`text-center text-xs truncate whitespace-nowrap ${tierClass}`}
      >
        {tierLabel}
      </p>

      {/* SerialNumber / final mint count */}
      <p className="text-center text-xs text-gray-400 truncate whitespace-nowrap">
        {nft?.serialNumber ?? "?"} / {finalMintCount ?? "?"}
      </p>

      {/* Set name */}
      <p className="text-center text-gray-400 text-xs truncate whitespace-nowrap">
        {nft?.name || "Unknown Set"}
      </p>
    </div>
  );
};

export default MomentCard;
