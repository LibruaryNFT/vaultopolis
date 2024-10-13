// MomentCard.js
import React from "react";

const MomentCard = ({ nft, playerName, handleNFTSelection, isSelected }) => {
  const imageUrl = `https://storage.googleapis.com/flowconnect/topshot/images_small/${nft.setID}_${nft.playID}.jpg`;

  return (
    <div
      className={`w-80 h-auto rounded overflow-hidden shadow-lg m-4 p-4 border ${
        isSelected ? "border-4 border-green-500" : "border-2 border-gray-300"
      } bg-white cursor-pointer`}
      onClick={() => handleNFTSelection(nft.id)}
    >
      <div className="mb-4">
        <img
          className="w-full object-cover rounded"
          src={imageUrl}
          alt={`NFT ${nft.id}`}
        />
      </div>
      <div className="px-4 py-2">
        <h3 className="font-bold text-lg mb-2">
          {playerName || "Unknown Player"}
        </h3>
        <p className="text-gray-700 text-sm mb-2">
          NFT ID: {nft.id}
          <br />
          Set ID: {nft.setID}
          <br />
          Play ID: {nft.playID}
          <br />
          Serial Number: {nft.serialNumber}
        </p>
      </div>
    </div>
  );
};

export default MomentCard;
