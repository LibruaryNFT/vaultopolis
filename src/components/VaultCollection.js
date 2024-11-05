import React, { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import { getVaultCollection } from "../flow/getVaultCollection"; // Adjust path if needed

// Tier styles matching MomentCard
const tierStyles = {
  common: "text-gray-400",
  rare: "text-blue-500",
  fandom: "text-lime-400",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

const VaultCollection = () => {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const address = "0x332ffc0ae9bba9c1";

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const result = await fcl.query({
          cadence: getVaultCollection,
          args: (arg, t) => [arg(address, t.Address)],
        });
        setCollection(result);
      } catch (error) {
        console.error("Failed to fetch collection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-500">Loading Vault Collection...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Vault Collection</h1>
      {collection.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-x-2 gap-y-4">
          {" "}
          {/* Adjust columns and reduce gap */}
          {collection.map((nft, index) => (
            <div
              key={index}
              className="border rounded bg-black font-inter text-white w-24 sm:w-28 border-gray-600"
              style={{ padding: "0.5rem" }}
            >
              {/* Image Section */}
              <ImageSection nft={nft} />

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
                  ? nft.tier.charAt(0).toUpperCase() +
                    nft.tier.slice(1).toLowerCase()
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
              {nft?.isLocked && (
                <div className="text-center mt-1">
                  <span className="text-red-500 text-xs">Locked</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No items found in the vault collection.
        </p>
      )}
    </div>
  );
};

const ImageSection = ({ nft }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (nft?.setID && nft?.playID) {
      setImageUrl(
        `https://storage.googleapis.com/flowconnect/topshot/images_small/${nft.setID}_${nft.playID}.jpg`
      );
    }
  }, [nft?.setID, nft?.playID]);

  return imageUrl ? (
    <div className="relative h-32 overflow-hidden rounded">
      <img
        src={imageUrl}
        alt={`${nft?.playerName || "Unknown Player"} moment`}
        className="object-cover w-full h-full"
      />
    </div>
  ) : (
    <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500">
      No Image Available
    </div>
  );
};

export default VaultCollection;
