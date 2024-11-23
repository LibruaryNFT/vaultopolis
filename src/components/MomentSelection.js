import React, { useContext, useEffect, useState, useMemo } from "react";
import { UserContext } from "./UserContext";
import MomentCard from "./MomentCard";

const MomentSelection = () => {
  const { accountData, selectedAccount, selectedNFTs, dispatch } =
    useContext(UserContext);

  // Determine the active account (selected child or parent account)
  const activeAccount =
    accountData.childrenData.find((child) => child.addr === selectedAccount) ||
    accountData;

  const { nftDetails = [] } = activeAccount; // Get NFT details from the active account

  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true); // Exclude special serials toggle
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [sortBy, setSortBy] = useState("serialNumber");
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate eligible moments using `useMemo` for optimization
  const eligibleMoments = useMemo(() => {
    if (!nftDetails || nftDetails.length === 0) return [];

    return nftDetails.filter((nft) => {
      const serialNumber = parseInt(nft.serialNumber, 10);
      const numMomentsInEdition = parseInt(nft.numMomentsInEdition, 10);
      const jerseyNumber = nft.jerseyNumber
        ? parseInt(nft.jerseyNumber, 10)
        : null;

      const isSpecialSerial =
        serialNumber === 1 ||
        serialNumber === numMomentsInEdition ||
        (jerseyNumber && jerseyNumber === serialNumber);

      const isSeriesSelected =
        selectedSeries.length === 0 ||
        selectedSeries.includes(parseInt(nft.seriesID, 10));

      return (
        nft.tier?.toLowerCase() === "common" && // Only common moments
        !nft.isLocked && // Ensure it's not locked
        isSeriesSelected && // Match selected series
        (!excludeSpecialSerials || !isSpecialSerial) && // Exclude special serials if needed
        !selectedNFTs.includes(nft.id) // Ensure it's not already selected
      );
    });
  }, [nftDetails, excludeSpecialSerials, selectedSeries, selectedNFTs]);

  const paginatedMoments = useMemo(() => {
    return eligibleMoments.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [eligibleMoments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(eligibleMoments.length / itemsPerPage);

  const handleNFTSelection = (id) => {
    dispatch({ type: "SET_SELECTED_NFTS", payload: id });
  };

  const toggleExcludeSpecialSerials = () => {
    setExcludeSpecialSerials(!excludeSpecialSerials);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const renderPaginationButtons = () => {
    const paginationRange = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) paginationRange.push(i);
    } else {
      if (currentPage <= 4) {
        paginationRange.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage > totalPages - 4) {
        paginationRange.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        paginationRange.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return paginationRange.map((page, index) => (
      <button
        key={index}
        onClick={() => setCurrentPage(page)}
        className={`px-3 py-1 mx-1 rounded ${
          currentPage === page
            ? "bg-blue-500 text-white"
            : "bg-gray-700 text-gray-300"
        } ${page === "..." ? "pointer-events-none" : ""}`}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="w-full">
      {/* Selected Moments Section */}
      <div className="bg-gray-900 p-2 rounded-lg">
        <h2 className="text-white text-lg font-semibold">Selected Moments</h2>
        <p className="text-gray-400">Total Selected: {selectedNFTs.length}</p>
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
        <p className="text-gray-400">
          Total Available: {eligibleMoments.length}
        </p>

        {/* Exclude Special Serials Toggle */}
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={excludeSpecialSerials}
            onChange={toggleExcludeSpecialSerials}
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
              isSelected={selectedNFTs.includes(nft.id)}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            {renderPaginationButtons()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MomentSelection;
