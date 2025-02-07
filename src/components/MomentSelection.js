import React, { useContext, useMemo, useState } from "react";
import { UserContext } from "./UserContext";
import MomentCard from "./MomentCard";

const MomentSelection = () => {
  const {
    user,
    accountData,
    selectedAccount,
    selectedNFTs,
    dispatch,
    isRefreshing,
  } = useContext(UserContext);

  // Determine the active account: if a child is selected use that, otherwise the parent account
  const activeAccount =
    accountData.childrenData?.find((child) => child.addr === selectedAccount) ||
    accountData;
  const { nftDetails = [] } = activeAccount;

  // Local state for filtering and pagination
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);
  // (Optionally, you can add state for series filtering if needed)
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Compute eligible moments: filter for "common" tier, unlocked,
  // not already selected, and (if enabled) exclude special serials
  // where a "special" moment is one whose serial is either the first,
  // the last, or (if available) matches the jersey number.
  const eligibleMoments = useMemo(() => {
    if (!nftDetails || nftDetails.length === 0) return [];
    const filtered = nftDetails.filter((nft) => {
      const serialNumber = parseInt(nft.serialNumber, 10);
      const numMomentsInEdition = parseInt(nft.numMomentsInEdition, 10);
      const jerseyNumber = nft.jerseyNumber
        ? parseInt(nft.jerseyNumber, 10)
        : null;
      const isSpecialSerial =
        serialNumber === 1 ||
        serialNumber === numMomentsInEdition ||
        (jerseyNumber && jerseyNumber === serialNumber);

      return (
        nft.tier?.toLowerCase() === "common" && // Only "common" moments
        !nft.isLocked && // Must not be locked
        (!excludeSpecialSerials || !isSpecialSerial) && // Optionally filter out special serials
        !selectedNFTs.includes(nft.id) // Exclude already-selected moments
      );
    });

    // Sort by serialNumber descending (highest first)
    return filtered.sort(
      (a, b) => parseInt(b.serialNumber, 10) - parseInt(a.serialNumber, 10)
    );
  }, [nftDetails, excludeSpecialSerials, selectedNFTs]);

  // Pagination calculations
  const totalPages = Math.ceil(eligibleMoments.length / itemsPerPage);
  const paginatedMoments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return eligibleMoments.slice(startIndex, startIndex + itemsPerPage);
  }, [eligibleMoments, currentPage, itemsPerPage]);

  // Handler to toggle NFT selection in context
  const handleNFTSelection = (id) => {
    dispatch({ type: "SET_SELECTED_NFTS", payload: id });
  };

  // Toggle filtering of special serials and reset the page to 1
  const toggleExcludeSpecialSerials = () => {
    setExcludeSpecialSerials((prev) => !prev);
    setCurrentPage(1);
  };

  // Render pagination buttons with ellipsis when many pages exist
  const renderPaginationButtons = () => {
    const paginationRange = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        paginationRange.push(i);
      }
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
        onClick={() => {
          if (page !== "...") setCurrentPage(page);
        }}
        className={`px-3 py-1 mx-1 rounded ${
          page === currentPage
            ? "bg-blue-500 text-white"
            : "bg-gray-700 text-gray-300"
        } ${page === "..." ? "pointer-events-none" : ""}`}
      >
        {page}
      </button>
    ));
  };

  if (!user?.loggedIn) return null;

  return (
    <div className="w-full">
      <div className="bg-gray-700 p-2 rounded-lg">
        {/* Top section: total count and loading indicator */}
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-400">
            Total Available: {eligibleMoments.length}
          </p>
          {isRefreshing && (
            <span className="text-gray-400">
              <span className="animate-spin inline-block mr-2">⟳</span>
              Loading...
            </span>
          )}
        </div>

        {/* Filter toggle for excluding special serials */}
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

        {/* Display the eligible NFT moments */}
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

        {/* Pagination controls (if needed) */}
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
