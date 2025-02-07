import React, { useContext, useMemo, useState, useEffect } from "react";
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

  // Determine the active account:
  // if a child account is selected, use its data; otherwise, use the parent account.
  const activeAccount =
    accountData.childrenData?.find((child) => child.addr === selectedAccount) ||
    accountData;
  const { nftDetails = [] } = activeAccount;

  // -----------------------------------------------------------
  // Multi-select Filter: Series (sorted numerically)
  // -----------------------------------------------------------
  const [selectedSeries, setSelectedSeries] = useState([]);
  const seriesOptions = useMemo(() => {
    const uniqueSeries = new Set(nftDetails.map((nft) => nft.series));
    return Array.from(uniqueSeries).sort((a, b) => a - b);
  }, [nftDetails]);

  useEffect(() => {
    if (seriesOptions.length && selectedSeries.length === 0) {
      setSelectedSeries(seriesOptions);
    }
  }, [seriesOptions, selectedSeries]);

  // -----------------------------------------------------------
  // Tier filter: We want to show all tiers but only allow "Common" to be toggled.
  // -----------------------------------------------------------
  const tierOptions = ["common", "rare", "fandom", "legendary", "ultimate"];
  // We don't need a state for tiers because we're forcing filtering to "common".
  // The UI will display all options, but only "Common" will be enabled.
  // We'll add a dummy onChange handler for disabled inputs.

  // -----------------------------------------------------------
  // Local state for filtering and pagination.
  // -----------------------------------------------------------
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // -----------------------------------------------------------
  // Handler for toggling series filter.
  // -----------------------------------------------------------
  const handleToggleSeries = (seriesVal) => {
    setSelectedSeries((prev) =>
      prev.includes(seriesVal)
        ? prev.filter((val) => val !== seriesVal)
        : [...prev, seriesVal]
    );
    setCurrentPage(1);
  };

  // -----------------------------------------------------------
  // Compute eligible moments.
  // -----------------------------------------------------------
  const eligibleMoments = useMemo(() => {
    if (!nftDetails || nftDetails.length === 0) return [];
    const filtered = nftDetails.filter((nft) => {
      const serialNumber = parseInt(nft.serialNumber, 10);
      const editionSize = parseInt(nft.momentCount, 10); // using momentCount as edition size
      const jerseyNumber = nft.jerseyNumber
        ? parseInt(nft.jerseyNumber, 10)
        : null;
      const isSpecialSerial =
        serialNumber === 1 ||
        serialNumber === editionSize ||
        (jerseyNumber && jerseyNumber === serialNumber);

      return (
        nft.tier?.toLowerCase() === "common" && // Force filter: only "common" moments
        selectedSeries.includes(nft.series) && // And only those in the selected series
        (!excludeSpecialSerials || !isSpecialSerial) && // Optionally filter out special serials
        !selectedNFTs.includes(nft.id)
      );
    });

    // Sort by serial number descending (largest first).
    return filtered.sort(
      (a, b) => parseInt(b.serialNumber, 10) - parseInt(a.serialNumber, 10)
    );
  }, [nftDetails, excludeSpecialSerials, selectedNFTs, selectedSeries]);

  // -----------------------------------------------------------
  // Pagination calculations.
  // -----------------------------------------------------------
  const totalPages = Math.ceil(eligibleMoments.length / itemsPerPage);
  const paginatedMoments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return eligibleMoments.slice(startIndex, startIndex + itemsPerPage);
  }, [eligibleMoments, currentPage, itemsPerPage]);

  // -----------------------------------------------------------
  // Handler to toggle NFT selection in context.
  // -----------------------------------------------------------
  const handleNFTSelection = (id) => {
    dispatch({ type: "SET_SELECTED_NFTS", payload: id });
  };

  // Toggle filtering of special serials and reset page to 1.
  const toggleExcludeSpecialSerials = () => {
    setExcludeSpecialSerials((prev) => !prev);
    setCurrentPage(1);
  };

  // -----------------------------------------------------------
  // Render pagination buttons with ellipsis when needed.
  // -----------------------------------------------------------
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
        key={`pagination-${index}`}
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

        {/* Multi-select Filter Controls */}
        <div className="mb-2 space-y-2">
          {/* Series Filter */}
          <div>
            <p className="text-gray-300 text-sm font-semibold">
              Filter by Series:
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {seriesOptions.map((seriesVal) => (
                <label
                  key={`series-${seriesVal}`}
                  className="text-gray-300 text-xs flex items-center"
                >
                  <input
                    type="checkbox"
                    checked={selectedSeries.includes(seriesVal)}
                    onChange={() => handleToggleSeries(seriesVal)}
                    className="mr-1"
                  />
                  {seriesVal}
                </label>
              ))}
            </div>
          </div>
          {/* Tier Filter - Display all tiers, but only "Common" is enabled */}
          <div>
            <p className="text-gray-300 text-sm font-semibold">
              Filter by Tier:
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {tierOptions.map((tierVal) => (
                <label
                  key={`tier-${tierVal}`}
                  className="text-gray-300 text-xs flex items-center"
                >
                  <input
                    type="checkbox"
                    checked={tierVal === "common"}
                    disabled={tierVal !== "common"}
                    onChange={() => {}}
                    className="mr-1"
                  />
                  {tierVal.charAt(0).toUpperCase() + tierVal.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Exclude Special Serials Toggle */}
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={excludeSpecialSerials}
            onChange={toggleExcludeSpecialSerials}
            className="mr-2"
          />
          <label className="text-gray-300 text-sm">
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

        {/* Pagination controls */}
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
