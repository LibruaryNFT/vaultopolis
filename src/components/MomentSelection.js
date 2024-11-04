// src/components/MomentSelection.js
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import MomentCard from "./MomentCard";

const MomentSelection = () => {
  const { nftDetails, selectedNFTs, dispatch } = useContext(UserContext);

  const [eligibleMoments, setEligibleMoments] = useState([]);
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [sortBy, setSortBy] = useState("serialNumber");
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const updateEligibleMoments = () => {
      let eligible = nftDetails.filter((nft) => {
        const isSpecialSerial =
          nft.serialNumber === 1 ||
          nft.serialNumber === nft.numMomentsInEdition ||
          (nft.jerseyNumber && parseInt(nft.jerseyNumber) === nft.serialNumber);
        const isSeriesSelected =
          selectedSeries.length === 0 ||
          selectedSeries.includes(parseInt(nft.seriesID));
        return (
          nft.tier.toLowerCase() === "common" &&
          !nft.isLocked &&
          (!excludeSpecialSerials || !isSpecialSerial) &&
          isSeriesSelected
        );
      });

      if (sortBy === "series") {
        eligible.sort(
          (a, b) => b.seriesID - a.seriesID || b.serialNumber - a.serialNumber
        );
      } else {
        eligible.sort(
          (a, b) => b.serialNumber - a.serialNumber || b.seriesID - a.seriesID
        );
      }

      setEligibleMoments(eligible);
    };

    updateEligibleMoments();
  }, [nftDetails, excludeSpecialSerials, selectedSeries, sortBy]);

  const handleNFTSelection = (id) => {
    dispatch({ type: "SELECT_NFT", payload: id });
  };

  const paginatedMoments = eligibleMoments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(eligibleMoments.length / itemsPerPage);

  return (
    <div className="w-full p-2">
      {/* Selected Moments Section */}
      <div className="bg-gray-900 p-2 rounded-lg">
        <h2 className="text-white text-lg font-semibold">Selected Moments</h2>
        {selectedNFTs.length ? (
          <div className="flex flex-wrap mt-2">
            {selectedNFTs.map((id) => {
              const nft = nftDetails.find((n) => n.id === id);
              return (
                <MomentCard
                  key={id}
                  nft={nft}
                  handleNFTSelection={handleNFTSelection}
                  isSelected={true}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 mt-2">
            Select moments to swap for $TSHOT.
          </p>
        )}
      </div>

      {/* Available Eligible Moments Section */}
      <div className="bg-gray-900 p-2 rounded-lg mt-4">
        <h2 className="text-white text-lg font-semibold">
          Available Eligible Moments
        </h2>

        {/* Filter and Sort Options */}
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={excludeSpecialSerials}
            onChange={() => setExcludeSpecialSerials(!excludeSpecialSerials)}
            className="mr-2"
          />
          <label className="text-gray-300">
            Exclude special serials (#1, last serial, or jersey match)
          </label>
        </div>
        {/* Display eligible moments */}
        <div className="flex flex-wrap mt-2">
          {paginatedMoments.map((nft) => (
            <MomentCard
              key={nft.id}
              nft={nft}
              handleNFTSelection={handleNFTSelection}
              isSelected={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MomentSelection;
