import React, { useContext, useMemo, useState } from "react";
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

  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);
  // If you don't need selectedSeries or sortBy right now, remove them.
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Compute the "eligibleMoments": filtered + sorted
  const eligibleMoments = useMemo(() => {
    if (!nftDetails || nftDetails.length === 0) return [];

    // Filter
    let filtered = nftDetails.filter((nft) => {
      const serialNumber = parseInt(nft.serialNumber, 10);
      const numMomentsInEdition = parseInt(nft.numMomentsInEdition, 10);
      const jerseyNumber = nft.jerseyNumber
        ? parseInt(nft.jerseyNumber, 10)
        : null;

      const isSpecialSerial =
        serialNumber === 1 ||
        serialNumber === numMomentsInEdition ||
        (jerseyNumber && jerseyNumber === serialNumber);

      // If you had series: use nft.series instead of nft.seriesID
      // For now, ignoring series filtering:
      // const isSeriesSelected =
      //   selectedSeries.length === 0 ||
      //   selectedSeries.includes(parseInt(nft.seriesID, 10));

      return (
        nft.tier?.toLowerCase() === "common" && // Only common
        !nft.isLocked && // not locked
        (!excludeSpecialSerials || !isSpecialSerial) &&
        !selectedNFTs.includes(nft.id) // not already selected
      );
    });

    // Now sort highest serialNumber first
    filtered.sort((a, b) => {
      const serialA = parseInt(a.serialNumber, 10);
      const serialB = parseInt(b.serialNumber, 10);
      return serialB - serialA; // descending
    });

    return filtered;
  }, [nftDetails, excludeSpecialSerials, selectedNFTs]);

  // Paginate
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
    setCurrentPage(1);
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
      {/* Available Eligible Moments Section */}
      <div className="bg-gray-700 p-2 rounded-lg">
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

        {/* Display eligible moments: highest serial first */}
        <div className="flex flex-wrap gap-2 mt-2">
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
