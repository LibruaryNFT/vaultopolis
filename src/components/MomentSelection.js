import React, { useContext, useMemo, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import MomentCard from "./MomentCard";

/**
 * Displays a filterable/paginatable list of 'nftDetails'.
 * We do NOT do an early return before all hooks are called.
 */

const tierOptions = ["common", "fandom"];

function getTierColorClass(tierVal) {
  switch (tierVal) {
    case "common":
      return "text-gray-400";
    case "fandom":
      return "text-lime-400";
    default:
      return "";
  }
}

const MomentSelection = () => {
  // 1) Always call hooks at top level
  const {
    user,
    accountData,
    selectedAccount,
    selectedNFTs,
    dispatch,
    isRefreshing,
  } = useContext(UserContext);

  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // We'll store which Tiers are selected
  const [selectedTiers, setSelectedTiers] = useState(tierOptions);

  // Series
  const [selectedSeries, setSelectedSeries] = useState([]);
  // We parse 'nftDetails' at top
  const activeAccount =
    accountData?.childrenData?.find(
      (child) => child.addr === selectedAccount
    ) || accountData;
  const { nftDetails = [] } = activeAccount;

  // 2) Build numeric series array
  const seriesOptions = useMemo(() => {
    const set = new Set(
      nftDetails.map((n) => {
        const val = Number(n.series);
        return Number.isNaN(val) ? null : val;
      })
    );
    set.delete(null);
    return [...set].sort((a, b) => a - b);
  }, [nftDetails]);

  useEffect(() => {
    // If no series selected yet, use all
    if (seriesOptions.length && selectedSeries.length === 0) {
      setSelectedSeries(seriesOptions);
    }
  }, [seriesOptions, selectedSeries]);

  // 3) Filtering logic
  const eligibleMoments = useMemo(() => {
    // if no data
    if (!nftDetails.length) return [];

    // filter + sort
    return nftDetails
      .filter((n) => {
        // tier must be in selectedTiers
        const t = n.tier?.toLowerCase();
        if (!selectedTiers.includes(t)) return false;

        // parse numeric series
        const s = Number(n.series);
        if (Number.isNaN(s) || !selectedSeries.includes(s)) return false;

        // exclude special serial
        const sn = parseInt(n.serialNumber, 10);
        const edSize = parseInt(n.momentCount, 10);
        const jersey = n.jerseyNumber ? parseInt(n.jerseyNumber, 10) : null;
        const isSpecial =
          sn === 1 || sn === edSize || (jersey && jersey === sn);
        if (excludeSpecialSerials && isSpecial) return false;

        // exclude if already selected
        if (selectedNFTs.includes(n.id)) return false;

        return true;
      })
      .sort(
        (a, b) => parseInt(b.serialNumber, 10) - parseInt(a.serialNumber, 10)
      );
  }, [
    nftDetails,
    selectedTiers,
    selectedSeries,
    excludeSpecialSerials,
    selectedNFTs,
  ]);

  // pagination
  const totalPages = Math.ceil(eligibleMoments.length / itemsPerPage);
  const paginatedMoments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return eligibleMoments.slice(start, start + itemsPerPage);
  }, [eligibleMoments, currentPage, itemsPerPage]);

  // 4) All hooks are defined. We do a conditional render below

  // If user not logged in, just show something minimal
  if (!user?.loggedIn) {
    return <p className="text-gray-400">Please log in.</p>;
  }

  // 5) Tier toggles
  const handleToggleTier = (tierVal) => {
    setSelectedTiers((prev) =>
      prev.includes(tierVal)
        ? prev.filter((v) => v !== tierVal)
        : [...prev, tierVal]
    );
    setCurrentPage(1);
  };

  // 6) Series toggles
  const handleToggleSeries = (val) => {
    setSelectedSeries((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
    setCurrentPage(1);
  };

  // 7) Exclude serial toggles
  const toggleExcludeSpecialSerials = () => {
    setExcludeSpecialSerials((p) => !p);
    setCurrentPage(1);
  };

  // 8) NFT selection
  const handleNFTSelection = (id) => {
    dispatch({ type: "SET_SELECTED_NFTS", payload: id });
  };

  // 9) pagination buttons
  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage > totalPages - 4) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }

    return (
      <div className="flex justify-center mt-4">
        {pages.map((p, idx) => (
          <button
            key={idx}
            onClick={() => p !== "..." && setCurrentPage(p)}
            className={`px-3 py-1 mx-1 rounded ${
              p === currentPage
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            } ${p === "..." ? "pointer-events-none" : ""}`}
          >
            {p}
          </button>
        ))}
      </div>
    );
  };

  // 10) Render the main UI
  return (
    <div className="w-full bg-gray-700 p-2 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <p className="text-gray-400">
          Total Eligible: {eligibleMoments.length}
        </p>
        {isRefreshing && (
          <span className="text-gray-400">
            <span className="animate-spin inline-block mr-2">⟳</span>
            Loading...
          </span>
        )}
      </div>

      <div className="mb-2 space-y-2">
        {/* Series Filter */}
        <div>
          <p className="text-gray-300 text-sm font-semibold">
            Filter by Series:
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {seriesOptions.map((val) => (
              <label
                key={`series-${val}`}
                className="text-gray-300 text-sm flex items-center"
              >
                <input
                  type="checkbox"
                  checked={selectedSeries.includes(val)}
                  onChange={() => handleToggleSeries(val)}
                  className="mr-1"
                />
                {val}
              </label>
            ))}
          </div>
        </div>

        {/* Tiers */}
        <div>
          <p className="text-gray-300 text-sm font-semibold">Filter by Tier:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {tierOptions.map((tVal) => (
              <label key={tVal} className="text-sm flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTiers.includes(tVal)}
                  onChange={() => handleToggleTier(tVal)}
                  className="mr-1"
                />
                <span className={getTierColorClass(tVal)}>
                  {tVal.charAt(0).toUpperCase() + tVal.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Exclude special serial */}
      <div className="flex items-center mb-2">
        <input
          type="checkbox"
          checked={excludeSpecialSerials}
          onChange={toggleExcludeSpecialSerials}
          className="mr-2"
        />
        <label className="text-gray-300 text-sm">
          Exclude special serials (#1, last, or jersey match)
        </label>
      </div>

      {/* The grid of Moments */}
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

      {/* Pagination */}
      {renderPaginationButtons()}
    </div>
  );
};

export default MomentSelection;
