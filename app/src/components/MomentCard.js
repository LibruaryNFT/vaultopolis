import React from "react";

const MomentCard = ({
  nft,
  playerName,
  handleNFTSelection,
  isSelected,
  tier,
}) => {
  return (
    <div
      onClick={() => handleNFTSelection(nft.id)}
      className={`border rounded p-4 m-2 cursor-pointer ${
        isSelected
          ? "bg-green-200 border-green-400"
          : "bg-gray-200 border-gray-300"
      }`}
    >
      <h3 className="text-lg font-semibold text-black">
        {playerName || "Unknown Player"}
      </h3>
      <p className="text-gray-600">ID: {nft.id}</p>
      <p className="text-gray-600">Edition ID: {nft.editionID}</p>
      {nft.serialNumber && (
        <p className="text-gray-600">Serial Number: {nft.serialNumber}</p>
      )}
      {tier && <p className="text-blue-600 font-bold">Tier: {tier}</p>}{" "}
      {/* Display tier */}
    </div>
  );
};

export default MomentCard;
