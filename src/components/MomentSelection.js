// src/components/MomentSelection.js
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

/**
 * MomentSelection
 *
 * Props:
 * - allowAllTiers: boolean => whether to show all tier checkboxes or just common/fandom
 * - excludeIds: array of string IDs => if an NFT's id is in this list, exclude it from display
 */
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

  // 2) Filtering States
  const tierOptions = useMemo(
    () => (allowAllTiers ? allPossibleTiers : defaultTiers),
    [allowAllTiers]
  );
  const [selectedTiers, setSelectedTiers] = useState(tierOptions);
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);

  // For pagination
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // For series
  const [selectedSeries, setSelectedSeries] = useState([]);

  // For Set & Player
  const [selectedSetName, setSelectedSetName] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState("All");

  // Identify the active account
  const activeAccount =
    accountData?.childrenData?.find(
      (child) => child.addr === selectedAccount
    ) || accountData;
  const { nftDetails = [] } = activeAccount;

  // 3) Build seriesOptions
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

  // 4) On mount, if no selectedSeries, select them all
  useEffect(() => {
    if (seriesOptions.length && selectedSeries.length === 0) {
      setSelectedSeries(seriesOptions);
    }
  }, [seriesOptions, selectedSeries]);

  // "All Series" checkbox
  const handleAllSeriesToggle = (checked) => {
    if (checked) {
      setSelectedSeries(seriesOptions);
    } else {
      setSelectedSeries([]);
    }
    setCurrentPage(1);
  };

  // Subset ignoring the set filter (for set dropdown)
  const subsetForSets = useMemo(() => {
    return nftDetails.filter((n) => {
      // Must match selectedSeries
      if (!selectedSeries.includes(Number(n.series))) return false;
      // Must match tier
      const t = n.tier?.toLowerCase();
      if (!selectedTiers.includes(t)) return false;
      // If a player is selected
      if (selectedPlayer !== "All" && n.fullName !== selectedPlayer)
        return false;
      // Exclude special if needed
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

  // Subset ignoring the player filter (for player dropdown)
  const subsetForPlayers = useMemo(() => {
    return nftDetails.filter((n) => {
      // Must match selectedSeries
      if (!selectedSeries.includes(Number(n.series))) return false;
      // Must match tier
      const t = n.tier?.toLowerCase();
      if (!selectedTiers.includes(t)) return false;
      // If a set is selected
      if (selectedSetName !== "All" && n.name !== selectedSetName) return false;
      // Exclude special if needed
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

  // 8) Final eligibleMoments
  const eligibleMoments = useMemo(() => {
    if (!nftDetails.length) return [];

    return nftDetails
      .filter((n) => {
        // 1) Exclude if in excludeIds
        if (excludeIds.includes(String(n.id))) return false;

        // 2) locked?
        if (n.isLocked) return false;

        // 3) tier?
        const t = n.tier?.toLowerCase();
        if (!selectedTiers.includes(t)) return false;

        // 4) series
        if (!selectedSeries.includes(Number(n.series))) return false;

        // 5) set name?
        if (selectedSetName !== "All" && n.name !== selectedSetName) {
          return false;
        }

        // 6) player?
        if (selectedPlayer !== "All" && n.fullName !== selectedPlayer) {
          return false;
        }

        // 7) exclude special serial
        if (excludeSpecialSerials) {
          const sn = parseInt(n.serialNumber, 10);
          const edSize = parseInt(n.momentCount, 10);
          const jersey = n.jerseyNumber ? parseInt(n.jerseyNumber, 10) : null;
          const isSpecial =
            sn === 1 || sn === edSize || (jersey && jersey === sn);
          if (isSpecial) return false;
        }

        // 8) already selected?
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

  // 9) Pagination
  const totalPages = Math.ceil(eligibleMoments.length / itemsPerPage);
  const paginatedMoments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return eligibleMoments.slice(start, start + itemsPerPage);
  }, [eligibleMoments, currentPage, itemsPerPage]);

  // 10) Early return if not logged in
  if (!user?.loggedIn) {
    return <p className="text-gray-400">Please log in.</p>;
  }

  // 11) Handlers
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

  // "All Series" checkbox
  const allSeriesChecked =
    selectedSeries.length > 0 && selectedSeries.length === seriesOptions.length;

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
        {pages.map((p) => (
          <button
            key={p}
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

  // 12) Render
  return (
    <div className="w-full bg-gray-700 p-2 rounded-lg">
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

      {seriesOptions.length === 0 && (
        <p className="text-gray-400">
          You have no NFTs in this account. No Series available.
        </p>
      )}

      {seriesOptions.length > 0 && (
        <div className="mb-2 space-y-2">
          {/* Filter by Series */}
          <div>
            <p className="text-gray-300 text-sm font-semibold">
              Filter by Series:
            </p>
            <div className="flex items-center mb-2">
              <label className="text-gray-300 text-sm flex items-center">
                <input
                  type="checkbox"
                  checked={allSeriesChecked}
                  onChange={(e) => handleAllSeriesToggle(e.target.checked)}
                  className="mr-1"
                />
                All Series
              </label>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {seriesOptions.map((val) => (
                <label
                  key={val}
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
            <p className="text-gray-300 text-sm font-semibold">
              Filter by Tier:
            </p>
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

          {/* Filter by Set Name */}
          <div>
            <p className="text-gray-300 text-sm font-semibold">
              Filter by Set Name:
            </p>
            <select
              value={selectedSetName}
              onChange={handleSetNameChange}
              className="bg-gray-800 text-gray-300 text-sm p-1 rounded"
              disabled={setNameOptions.length === 0}
            >
              {setNameOptions.length === 0 ? (
                <option>No sets available</option>
              ) : (
                <>
                  <option key="All" value="All">
                    All Sets
                  </option>
                  {setNameOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Filter by Player */}
          <div>
            <p className="text-gray-300 text-sm font-semibold">
              Filter by Player:
            </p>
            <select
              value={selectedPlayer}
              onChange={handlePlayerChange}
              className="bg-gray-800 text-gray-300 text-sm p-1 rounded"
              disabled={playerNameOptions.length === 0}
            >
              {playerNameOptions.length === 0 ? (
                <option>No players available</option>
              ) : (
                <>
                  <option key="All" value="All">
                    All Players
                  </option>
                  {playerNameOptions.map((player) => (
                    <option key={player} value={player}>
                      {player}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>
      )}

      {/* Exclude special serials */}
      {seriesOptions.length > 0 && (
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
          <p className="text-gray-400 mt-4">
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
