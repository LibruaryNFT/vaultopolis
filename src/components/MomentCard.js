import React, { useEffect, useState } from "react";

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
    if (nft?.setID && nft?.playID) {
      setImageUrl(
        `https://storage.googleapis.com/flowconnect/topshot/images_small/${nft.setID}_${nft.playID}.jpg`
      );
    }
  }, [nft?.setID, nft?.playID]);

  return (
    <div
      onClick={() => handleNFTSelection(nft?.id)}
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
      // Fixed dimensions so that the card size remains constant
      style={{
        width: "7rem",
        height: "12rem",
      }}
    >
      {/* Image Section */}
      {imageUrl && (
        <div
          className="relative overflow-hidden rounded mx-auto"
          style={{
            height: "80px",
            width: "80px",
          }}
        >
          <img
            src={imageUrl}
            alt={`${nft?.fullName || "Unknown Player"} moment`}
            className="object-cover w-full h-full transform scale-150"
            style={{
              objectPosition: "center",
            }}
          />
        </div>
      )}

      {/* Player Name */}
      <h3 className="text-center text-white mt-1 text-xs font-semibold truncate whitespace-nowrap">
        {nft?.fullName || nft?.playerName || "Unknown Player"}
      </h3>

      {/* Series */}
      <p className="text-center text-xs text-gray-400 truncate whitespace-nowrap">
        Series {nft?.series ?? "?"}
      </p>

      {/* Tier */}
      <p
        className={`text-center ${
          tierStyles[nft?.tier?.toLowerCase()] || "text-gray-400"
        } text-xs truncate whitespace-nowrap`}
      >
        {nft?.tier
          ? nft.tier.charAt(0).toUpperCase() + nft.tier.slice(1).toLowerCase()
          : "Unknown Tier"}
      </p>

      {/* Serial Number and Edition Size */}
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
