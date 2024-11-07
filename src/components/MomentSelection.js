import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import MomentCard from "./MomentCard";

const MomentSelection = () => {
  const { nftDetails, selectedNFTs, dispatch } = useContext(UserContext);

  const [eligibleMoments, setEligibleMoments] = useState([]);
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true); // Default to true
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [sortBy, setSortBy] = useState("serialNumber");
  const [itemsPerPage, setItemsPerPage] = useState(50); // Default to 50 items per page
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const updateEligibleMoments = () => {
      let eligible = nftDetails.filter((nft) => {
        // Parse serial numbers and edition sizes to integers
        const serialNumber = parseInt(nft.serialNumber);
        const numMomentsInEdition = parseInt(nft.numMomentsInEdition);
        const jerseyNumber = nft.jerseyNumber
          ? parseInt(nft.jerseyNumber)
          : null;

        // Check if this NFT is a special serial
        const isSpecialSerial =
          serialNumber === 1 ||
          serialNumber === numMomentsInEdition ||
          (jerseyNumber && jerseyNumber === serialNumber);

        // Check if this NFT's series is selected
        const isSeriesSelected =
          selectedSeries.length === 0 ||
          selectedSeries.includes(parseInt(nft.seriesID));

        // Only include this NFT if:
        // 1. It is of the "common" tier and is not locked.
        // 2. It matches the selected series (or all series if none are selected).
        // 3. If "excludeSpecialSerials" is true, it is not a special serial.
        // 4. It is not in the list of already selected NFTs.
        return (
          nft.tier.toLowerCase() === "common" &&
          !nft.isLocked &&
          isSeriesSelected &&
          (!excludeSpecialSerials || !isSpecialSerial) &&
          !selectedNFTs.includes(nft.id)
        );
      });

      // Apply sorting
      if (sortBy === "series") {
        eligible.sort(
          (a, b) =>
            parseInt(b.seriesID) - parseInt(a.seriesID) ||
            parseInt(b.serialNumber) - parseInt(a.serialNumber)
        );
      } else {
        eligible.sort(
          (a, b) =>
            parseInt(b.serialNumber) - parseInt(a.serialNumber) ||
            parseInt(b.seriesID) - parseInt(a.seriesID)
        );
      }

      setEligibleMoments(eligible);
    };

    updateEligibleMoments();
  }, [nftDetails, excludeSpecialSerials, selectedSeries, sortBy, selectedNFTs]);

  const handleNFTSelection = (id) => {
    dispatch({ type: "SELECT_NFT", payload: id });
  };

  const handleSelectAllOnPage = () => {
    const pageMomentIDs = paginatedMoments.map((nft) => nft.id);
    dispatch({
      type: "SET_SELECTED_NFTS",
      payload: [...selectedNFTs, ...pageMomentIDs],
    });
  };

  const handleDeselectAll = () => {
    dispatch({ type: "RESET_SELECTED_NFTS" });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const toggleExcludeSpecialSerials = () => {
    setExcludeSpecialSerials(!excludeSpecialSerials);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const paginatedMoments = eligibleMoments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(eligibleMoments.length / itemsPerPage);

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
        onClick={() => handlePageChange(page)}
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
    <div className="w-full p-2">
      {/* Selected Moments Section */}
      <div className="bg-gray-900 p-2 rounded-lg">
        <h2 className="text-white text-lg font-semibold">Selected Moments</h2>
        <p className="text-gray-400">Total Selected: {selectedNFTs.length}</p>
        {selectedNFTs.length > 0 && (
          <button
            onClick={handleDeselectAll}
            className="text-red-500 hover:underline mb-2"
          >
            Deselect All
          </button>
        )}
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

        <button
          onClick={handleSelectAllOnPage}
          className="text-blue-500 hover:underline mb-2"
        >
          Select All on Page
        </button>

        {/* Filter and Sort Options */}
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

        {/* Items per page selection */}
        <div className="mb-2">
          <label className="text-gray-300 mr-2">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="bg-gray-800 text-white rounded px-2 py-1"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
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
