import React, { useContext, useMemo, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import MomentCard from "./MomentCard";

/**
 * If `allowAllTiers = false`, we only allow ["common", "fandom"].
 * If `allowAllTiers = true`, we show ["common", "fandom", "rare", "legendary", "ultimate"].
 */
const defaultTiers = ["common", "fandom"];
const allPossibleTiers = ["common", "fandom", "rare", "legendary", "ultimate"];

/** Tier color classes for filter labels & possible usage in cards */
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

const MomentSelection = ({ allowAllTiers = false, excludeIds = [] }) => {
  // 1) Context
  const {
    user,
    accountData,
    selectedAccount,
    selectedNFTs,
    dispatch,
    isRefreshing,
  } = useContext(UserContext);

  // 2) Determine which account data we're referencing (parent vs child)
  const activeAccount =
    accountData?.childrenData?.find(
      (child) => child.addr === selectedAccount
    ) || accountData;
  const { nftDetails = [] } = activeAccount;

  // 3) Tiers
  const tierOptions = useMemo(
    () => (allowAllTiers ? allPossibleTiers : defaultTiers),
    [allowAllTiers]
  );
  const [selectedTiers, setSelectedTiers] = useState(tierOptions);

  // 4) Exclude special serials (#1, last, jersey)
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);

  // 5) Series
  const [selectedSeries, setSelectedSeries] = useState([]);
  const seriesOptions = useMemo(() => {
    const setOfSeries = new Set(
      nftDetails.map((n) => {
        const val = Number(n.series);
        return Number.isNaN(val) ? null : val;
      })
    );
    setOfSeries.delete(null);
    return [...setOfSeries].sort((a, b) => a - b);
  }, [nftDetails]);

  // On mount, if no selectedSeries, select them all
  useEffect(() => {
    if (seriesOptions.length && selectedSeries.length === 0) {
      setSelectedSeries(seriesOptions);
    }
  }, [seriesOptions, selectedSeries]);

  // "All Series" toggle
  const allSeriesChecked =
    selectedSeries.length > 0 && selectedSeries.length === seriesOptions.length;

  const handleAllSeriesToggle = (checked) => {
    if (checked) {
      setSelectedSeries(seriesOptions);
    } else {
      setSelectedSeries([]);
    }
    setCurrentPage(1);
  };

  // 6) Set Name & Player
  const [selectedSetName, setSelectedSetName] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState("All");

  // Build partial subsets for set & player dropdown options
  const subsetForSets = useMemo(() => {
    return nftDetails.filter((n) => {
      // Must match series/tier, exclude special if needed, etc. (ignores set filter for now)
      const s = Number(n.series);
      if (!selectedSeries.includes(s)) return false;

      const t = n.tier?.toLowerCase();
      if (!selectedTiers.includes(t)) return false;

      if (selectedPlayer !== "All" && n.fullName !== selectedPlayer) {
        return false;
      }

      if (excludeSpecialSerials) {
        const sn = parseInt(n.serialNumber, 10);
        const edSize = parseInt(n.momentCount, 10);
        const jersey = n.jerseyNumber ? parseInt(n.jerseyNumber, 10) : null;
        const isSpecial =
          sn === 1 || sn === edSize || (jersey && jersey === sn);
        if (isSpecial) return false;
      }

      return true;
    });
  }, [
    nftDetails,
    selectedSeries,
    selectedTiers,
    selectedPlayer,
    excludeSpecialSerials,
  ]);

  const subsetForPlayers = useMemo(() => {
    return nftDetails.filter((n) => {
      // Must match series/tier, exclude special if needed, etc. (ignores player filter for now)
      const s = Number(n.series);
      if (!selectedSeries.includes(s)) return false;

      const t = n.tier?.toLowerCase();
      if (!selectedTiers.includes(t)) return false;

      if (selectedSetName !== "All" && n.name !== selectedSetName) {
        return false;
      }

      if (excludeSpecialSerials) {
        const sn = parseInt(n.serialNumber, 10);
        const edSize = parseInt(n.momentCount, 10);
        const jersey = n.jerseyNumber ? parseInt(n.jerseyNumber, 10) : null;
        const isSpecial =
          sn === 1 || sn === edSize || (jersey && jersey === sn);
        if (isSpecial) return false;
      }

      return true;
    });
  }, [
    nftDetails,
    selectedSeries,
    selectedTiers,
    selectedSetName,
    excludeSpecialSerials,
  ]);

  // Build setNameOptions from subsetForSets
  const setNameOptions = useMemo(() => {
    const s = new Set(subsetForSets.map((n) => n.name).filter(Boolean));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [subsetForSets]);

  // Build playerNameOptions from subsetForPlayers
  const playerNameOptions = useMemo(() => {
    const p = new Set(subsetForPlayers.map((n) => n.fullName).filter(Boolean));
    return Array.from(p).sort((a, b) => a.localeCompare(b));
  }, [subsetForPlayers]);

  // Reset setName/player if invalid
  useEffect(() => {
    if (
      selectedSetName !== "All" &&
      !setNameOptions.includes(selectedSetName)
    ) {
      setSelectedSetName("All");
    }
  }, [selectedSetName, setNameOptions]);

  useEffect(() => {
    if (
      selectedPlayer !== "All" &&
      !playerNameOptions.includes(selectedPlayer)
    ) {
      setSelectedPlayer("All");
    }
  }, [selectedPlayer, playerNameOptions]);

  // 7) Final eligibleMoments
  const eligibleMoments = useMemo(() => {
    if (!nftDetails.length) return [];

    return nftDetails
      .filter((n) => {
        // Exclude by ID
        if (excludeIds.includes(String(n.id))) return false;
        // Exclude locked
        if (n.isLocked) return false;

        // Tier
        const t = n.tier?.toLowerCase();
        if (!selectedTiers.includes(t)) return false;

        // Series
        const s = Number(n.series);
        if (!selectedSeries.includes(s)) return false;

        // Set
        if (selectedSetName !== "All" && n.name !== selectedSetName) {
          return false;
        }

        // Player
        if (selectedPlayer !== "All" && n.fullName !== selectedPlayer) {
          return false;
        }

        // Special Serials
        if (excludeSpecialSerials) {
          const sn = parseInt(n.serialNumber, 10);
          const edSize = parseInt(n.momentCount, 10);
          const jersey = n.jerseyNumber ? parseInt(n.jerseyNumber, 10) : null;
          const isSpecial =
            sn === 1 || sn === edSize || (jersey && jersey === sn);
          if (isSpecial) return false;
        }

        // Already selected
        if (selectedNFTs.includes(n.id)) return false;

        return true;
      })
      .sort(
        (a, b) => parseInt(b.serialNumber, 10) - parseInt(a.serialNumber, 10)
      );
  }, [
    nftDetails,
    excludeIds,
    selectedTiers,
    selectedSeries,
    selectedSetName,
    selectedPlayer,
    excludeSpecialSerials,
    selectedNFTs,
  ]);

  // 8) Pagination
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(eligibleMoments.length / itemsPerPage);
  const paginatedMoments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return eligibleMoments.slice(start, start + itemsPerPage);
  }, [eligibleMoments, currentPage, itemsPerPage]);

  // 9) Auth guard
  if (!user?.loggedIn) {
    return <p className="text-gray-400">Please log in.</p>;
  }

  // 10) Handlers
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

  const handleSetNameChange = (e) => {
    setSelectedSetName(e.target.value);
    setCurrentPage(1);
  };

  const handlePlayerChange = (e) => {
    setSelectedPlayer(e.target.value);
    setCurrentPage(1);
  };

  const handleNFTSelection = (id) => {
    dispatch({ type: "SET_SELECTED_NFTS", payload: id });
  };

  // 11) Pagination buttons
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
            key={`page-${idx}`}
            onClick={() => p !== "..." && setCurrentPage(Number(p))}
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

  // 12) Render
  return (
    <div className="w-full bg-gray-700 p-2 rounded-lg">
      {/* Top bar: total eligible + loading indicator */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-gray-400">
          {eligibleMoments.length === 0
            ? "No moments match your filters."
            : `Total Eligible: ${eligibleMoments.length}`}
        </p>
        {isRefreshing && (
          <span className="text-gray-400">
            <span className="animate-spin inline-block mr-2">⟳</span>
            Loading...
          </span>
        )}
      </div>

      {/* If no series are available, likely no NFTs */}
      {seriesOptions.length === 0 && (
        <p className="text-gray-400">
          You have no NFTs in this account. No Series available.
        </p>
      )}

      {/* FILTERS */}
      {seriesOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-sm bg-gray-600 p-2 rounded mb-2">
          {/* Tiers */}
          <div className="flex items-center gap-2">
            <span className="text-gray-200 font-semibold">Tiers:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {tierOptions.map((tVal) => {
                const label = tVal.charAt(0).toUpperCase() + tVal.slice(1);
                const colorClass = getTierColorClass(tVal);
                return (
                  <label key={tVal} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={selectedTiers.includes(tVal)}
                      onChange={() => handleToggleTier(tVal)}
                    />
                    <span className={colorClass}>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Series */}
          <div className="flex items-center gap-2">
            <span className="text-gray-200 font-semibold">Series:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {/* "All Series" toggle */}
              <label className="flex items-center gap-1 text-gray-200">
                <input
                  type="checkbox"
                  checked={allSeriesChecked}
                  onChange={(e) => handleAllSeriesToggle(e.target.checked)}
                />
                All
              </label>

              {/* Individual series */}
              {seriesOptions.map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-1 text-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedSeries.includes(val)}
                    onChange={() => handleToggleSeries(val)}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>

          {/* Set */}
          <div className="flex items-center gap-1">
            <span className="text-gray-200 font-semibold">Set:</span>
            <select
              value={selectedSetName}
              onChange={handleSetNameChange}
              className="bg-gray-800 text-gray-200 rounded px-1 py-0.5"
              disabled={setNameOptions.length === 0}
            >
              {setNameOptions.length === 0 ? (
                <option>No sets</option>
              ) : (
                <>
                  <option value="All">All</option>
                  {setNameOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Player */}
          <div className="flex items-center gap-1">
            <span className="text-gray-200 font-semibold">Player:</span>
            <select
              value={selectedPlayer}
              onChange={handlePlayerChange}
              className="bg-gray-800 text-gray-200 rounded px-1 py-0.5"
              disabled={playerNameOptions.length === 0}
            >
              {playerNameOptions.length === 0 ? (
                <option>No players</option>
              ) : (
                <>
                  <option value="All">All</option>
                  {playerNameOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Exclude special serials */}
          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={excludeSpecialSerials}
              onChange={toggleExcludeSpecialSerials}
            />
            <label className="text-gray-200">
              Exclude #1, last, or jersey match
            </label>
          </div>
        </div>
      )}

      {/* Grid of Moments */}
      {paginatedMoments.length > 0 ? (
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
      ) : (
        seriesOptions.length > 0 && (
          <p className="text-gray-400 mt-4 text-sm">
            No moments match your filters. Try adjusting them.
          </p>
        )
      )}

      {/* Pagination */}
      {renderPaginationButtons()}
    </div>
  );
};

export default MomentSelection;
