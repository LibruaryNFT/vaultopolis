// MomentCard.js
import React, { useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";

const tierStyles = {
  common: "text-gray-400",
  rare: "text-blue-500",
  fandom: "text-lime-400",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

const MomentCard = ({ nft, handleNFTSelection, isSelected }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [isDebuggingVisible, setDebuggingVisible] = useState(false);

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
      className={`border rounded bg-black cursor-pointer relative ${
        isSelected ? "border-green-500" : "border-gray-600"
      } font-inter text-white w-28 sm:w-32`}
      style={{ padding: "0.5rem" }}
    >
      {/* Image Section */}
      {imageUrl && (
        <div className="relative h-32 overflow-hidden rounded">
          <img
            src={imageUrl}
            alt={`${nft?.playerName || "Unknown Player"} moment`}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* Player Name */}
      <h3 className="text-center text-white mt-1 text-xs font-semibold truncate">
        {nft?.playerName || "Unknown Player"}
      </h3>

      {/* Tier and Serial Number */}
      <p
        className={`text-center ${
          tierStyles[nft?.tier?.toLowerCase()] || "text-gray-400"
        } text-xs`}
      >
        {nft?.tier
          ? nft.tier.charAt(0).toUpperCase() + nft.tier.slice(1).toLowerCase()
          : "Unknown Tier"}{" "}
        #{nft?.serialNumber || "?"} / {nft?.numMomentsInEdition || "?"}
      </p>

      {/* Set Name and Series */}
      <p className="text-center text-gray-400 text-xs truncate">
        {nft?.setName || "Unknown Set"}
      </p>
      <p className="text-center text-gray-400 text-xs">
        Series {nft?.seriesID || "?"}
      </p>

      {/* Locked Icon */}
      <div className="text-center mt-1">
        {nft?.isLocked && (
          <AiOutlineInfoCircle className="text-red-500 mx-auto" />
        )}
      </div>

      {/* Collapsible Debugging Info */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDebuggingVisible((prev) => !prev);
        }}
        className="mt-1 flex items-center justify-center text-gray-400 text-xs"
      >
        <AiOutlineInfoCircle className="mr-1" /> Debugging Info
      </button>

      {isDebuggingVisible && (
        <div className="text-gray-400 mt-1 text-xs">
          <p>ID: {nft?.id || "Unknown ID"}</p>
          <p>Play ID: {nft?.playID || "Unknown Play ID"}</p>
          <p>Set ID: {nft?.setID || "Unknown Set ID"}</p>
          <p>Team: {nft?.teamAtMoment || "Unknown Team"}</p>
        </div>
      )}
    </div>
  );
};

export default MomentCard;
