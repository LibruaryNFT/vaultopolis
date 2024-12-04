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
      className={`border rounded bg-black cursor-pointer relative p-1 ${
        isSelected ? "border-green-500" : "border-gray-600"
      } font-inter text-white`}
      style={{
        width: "fit-content", // Ensure the card's width fits its content
        maxWidth: "7rem", // Set a maximum width constraint
      }}
    >
      {/* Image Section */}
      {imageUrl && (
        <div
          className="relative overflow-hidden rounded mx-auto"
          style={{
            height: "80px", // Adjust container height
            width: "80px", // Adjust container width
          }}
        >
          <img
            src={imageUrl}
            alt={`${nft?.playerName || "Unknown Player"} moment`}
            className="object-cover w-full h-full transform scale-150"
            style={{
              objectPosition: "center", // Ensure the zoom focuses on the center
            }}
          />
        </div>
      )}

      {/* Player Name */}
      <h3 className="text-center text-white mt-1 text-xs font-semibold truncate">
        {nft?.playerName || "Unknown Player"}
      </h3>

      {/* Series */}
      <p className="text-center text-xs text-gray-400">
        Series{" "}
        {nft?.series !== undefined && nft?.series !== null ? nft.series : "?"}
      </p>

      {/* Tier */}
      <p
        className={`text-center ${
          tierStyles[nft?.tier?.toLowerCase()] || "text-gray-400"
        } text-xs`}
      >
        {nft?.tier
          ? nft.tier.charAt(0).toUpperCase() + nft.tier.slice(1).toLowerCase()
          : "Unknown Tier"}
      </p>

      {/* Serial Number and Edition Size */}
      <p className="text-center text-xs text-gray-400">
        {nft?.serialNumber || "?"} / {nft?.numMomentsInEdition || "?"}
      </p>

      {/* Set Name */}
      <p className="text-center text-gray-400 text-xs truncate">
        {nft?.setName || "Unknown Set"}
      </p>

      {/* Locked Icon */}
      {nft?.isLocked && (
        <div className="text-center mt-1">
          <span className="text-red-500 text-xs">Locked</span>
        </div>
      )}
    </div>
  );
};

export default MomentCard;
