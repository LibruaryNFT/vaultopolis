import React, { useContext, useMemo, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import MomentCard from "./MomentCard";

/**
 * If `allowAllTiers = false`, we only allow ["common", "fandom"].
 * If `allowAllTiers = true`, we show ["common", "fandom", "rare", "legendary", "ultimate"].
 */
const defaultTiers = ["common", "fandom"];
const allPossibleTiers = ["common", "fandom", "rare", "legendary", "ultimate"];

/** For coloring tier labels */
function getTierColorClass(tierVal) {
  switch (tierVal) {
    case "common":
      return "text-gray-400";
    case "fandom":
      return "text-lime-400";
    case "rare":
      return "text-blue-500";
    case "legendary":
      return "text-orange-500";
    case "ultimate":
      return "text-pink-500";
    default:
      return "";
  }
}

const MomentSelection = ({ allowAllTiers = false }) => {
  // 1) Always call hooks at top (unconditional)
  const {
    user,
    accountData,
    selectedAccount,
    selectedNFTs,
    dispatch,
    isRefreshing,
  } = useContext(UserContext);

  // Decide which tiers to show
  const tierOptions = useMemo(
    () => (allowAllTiers ? allPossibleTiers : defaultTiers),
    [allowAllTiers]
  );

  // Keep track of selected tiers in local state
  const [selectedTiers, setSelectedTiers] = useState(tierOptions);

  // Exclude special serial
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);

  // Pagination
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Which series are selected
  const [selectedSeries, setSelectedSeries] = useState([]);

  // Identify the active account (child or parent)
  const activeAccount =
    accountData?.childrenData?.find(
      (child) => child.addr === selectedAccount
    ) || accountData;
  const { nftDetails = [] } = activeAccount;

  // Build numeric series array
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

  // On mount/updates, if we have no selected series yet, set all
  useEffect(() => {
    if (seriesOptions.length && selectedSeries.length === 0) {
      setSelectedSeries(seriesOptions);
    }
  }, [seriesOptions, selectedSeries]);

  // 2) Define all Hook-based logic before any early return
  // Filter + sort the NFT data
  const eligibleMoments = useMemo(() => {
    if (!nftDetails.length) return [];

    return nftDetails
      .filter((n) => {
        // Must not be locked
        if (n.isLocked) return false;

        // Must match a selected tier
        const t = n.tier?.toLowerCase();
        if (!selectedTiers.includes(t)) return false;

        // Must match selected series
        const s = Number(n.series);
        if (Number.isNaN(s) || !selectedSeries.includes(s)) return false;

        // Exclude special serial if needed
        const sn = parseInt(n.serialNumber, 10);
        const edSize = parseInt(n.momentCount, 10);
        const jersey = n.jerseyNumber ? parseInt(n.jerseyNumber, 10) : null;
        const isSpecial =
          sn === 1 || sn === edSize || (jersey && jersey === sn);
        if (excludeSpecialSerials && isSpecial) return false;

        // Exclude if already selected
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

  // Paginate
  const totalPages = Math.ceil(eligibleMoments.length / itemsPerPage);
  const paginatedMoments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return eligibleMoments.slice(start, start + itemsPerPage);
  }, [eligibleMoments, currentPage, itemsPerPage]);

  // 3) **Now** we can do an early return if not logged in
  if (!user?.loggedIn) {
    return <p className="text-gray-400">Please log in.</p>;
  }

  // Handlers for toggling filters
  const handleToggleTier = (tierVal) => {
    setSelectedTiers((prev) =>
      prev.includes(tierVal)
        ? prev.filter((v) => v !== tierVal)
        : [...prev, tierVal]
    );
    setCurrentPage(1);
  };

  const handleToggleSeries = (val) => {
    setSelectedSeries((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
    setCurrentPage(1);
  };

  const toggleExcludeSpecialSerials = () => {
    setExcludeSpecialSerials((p) => !p);
    setCurrentPage(1);
  };

  // Handler for selecting an NFT
  const handleNFTSelection = (id) => {
    dispatch({ type: "SET_SELECTED_NFTS", payload: id });
  };

  // Pagination buttons
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

  // 4) Final render
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
        {/* Filter by Series */}
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

        {/* Filter by Tier */}
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

      {/* Grid of Moments */}
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
