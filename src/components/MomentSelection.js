// src/components/MomentSelection.js
import React, { useContext, useMemo, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import MomentCard from "./MomentCard";

// If allowAllTiers=false => ["common","fandom"]
// If allowAllTiers=true  => ["common","fandom","rare","legendary","ultimate"]
const defaultTiers = ["common", "fandom"];
const allPossibleTiers = ["common", "fandom", "rare", "legendary", "ultimate"];

/** Tier color classes */
function getTierColorClass(tierVal) {
  switch (tierVal) {
    case "common":
      return "text-gray-400";
    case "rare":
      return "text-blue-500";
    case "fandom":
      return "text-lime-400";
    case "legendary":
      return "text-orange-500";
    case "ultimate":
      return "text-pink-500";
    default:
      return "";
  }
}

const MomentSelection = ({ allowAllTiers = false, excludeIds = [] }) => {
  const {
    user,
    accountData,
    selectedAccount,
    selectedNFTs,
    dispatch,
    isRefreshing,
  } = useContext(UserContext);

  // Identify the active account
  const activeAccount =
    accountData?.childrenData?.find(
      (child) => child.addr === selectedAccount
    ) || accountData;
  const { nftDetails = [], hasCollection } = activeAccount || {};

  // Tiers
  const tierOptions = useMemo(
    () => (allowAllTiers ? allPossibleTiers : defaultTiers),
    [allowAllTiers]
  );
  const [selectedTiers, setSelectedTiers] = useState(tierOptions);

  // Additional toggles
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);
  const [excludeLowSerials, setExcludeLowSerials] = useState(true);

  // Series
  const [selectedSeries, setSelectedSeries] = useState([]);
  const seriesOptions = useMemo(() => {
    const setOfSeries = new Set(
      (nftDetails || []).map((n) => {
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

  // Set & Player
  const [selectedSetName, setSelectedSetName] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState("All");

  // 1) Subset for building setNameOptions
  const subsetForSets = useMemo(() => {
    return (nftDetails || []).filter((n) => {
      const s = Number(n.series);
      if (!selectedSeries.includes(s)) return false;

      const t = n.tier?.toLowerCase();
      if (!selectedTiers.includes(t)) return false;

      if (selectedPlayer !== "All") {
        if (!n.fullName || n.fullName !== selectedPlayer) {
          return false;
        }
      }

      if (excludeSpecialSerials) {
        const sn = parseInt(n.serialNumber, 10);
        const effectiveMax =
          n.subeditionID && n.subeditionMaxMint
            ? parseInt(n.subeditionMaxMint, 10)
            : parseInt(n.momentCount, 10);

        const jersey = n.jerseyNumber ? parseInt(n.jerseyNumber, 10) : null;
        const isSpecial =
          sn === 1 || sn === effectiveMax || (jersey && jersey === sn);
        if (isSpecial) return false;
      }

      if (excludeLowSerials) {
        const sn = parseInt(n.serialNumber, 10);
        if (sn <= 4000) return false;
      }

      return true;
    });
  }, [
    nftDetails,
    selectedSeries,
    selectedTiers,
    selectedPlayer,
    excludeSpecialSerials,
    excludeLowSerials,
  ]);

  // 2) Subset for building playerNameOptions
  const subsetForPlayers = useMemo(() => {
    return (nftDetails || []).filter((n) => {
      const s = Number(n.series);
      if (!selectedSeries.includes(s)) return false;

      const t = n.tier?.toLowerCase();
      if (!selectedTiers.includes(t)) return false;

      if (selectedSetName !== "All" && n.name !== selectedSetName) {
        return false;
      }

      if (excludeSpecialSerials) {
        const sn = parseInt(n.serialNumber, 10);
        const effectiveMax =
          n.subeditionID && n.subeditionMaxMint
            ? parseInt(n.subeditionMaxMint, 10)
            : parseInt(n.momentCount, 10);

        const jersey = n.jerseyNumber ? parseInt(n.jerseyNumber, 10) : null;
        const isSpecial =
          sn === 1 || sn === effectiveMax || (jersey && jersey === sn);
        if (isSpecial) return false;
      }

      if (excludeLowSerials) {
        const sn = parseInt(n.serialNumber, 10);
        if (sn <= 4000) return false;
      }
      return true;
    });
  }, [
    nftDetails,
    selectedSeries,
    selectedTiers,
    selectedSetName,
    excludeSpecialSerials,
    excludeLowSerials,
  ]);

  // Build setNameOptions
  const setNameOptions = useMemo(() => {
    const s = new Set(subsetForSets.map((n) => n.name).filter(Boolean));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [subsetForSets]);

  // Build playerNameOptions
  const playerNameOptions = useMemo(() => {
    const p = new Set(
      subsetForPlayers.map((n) => n.fullName).filter((val) => val && val !== "")
    );
    return [...p].sort((a, b) => a.localeCompare(b));
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

  // Final list => eligibleMoments
  const eligibleMoments = useMemo(() => {
    if (!nftDetails.length) return [];

    return nftDetails
      .filter((n) => {
        if (excludeIds.includes(String(n.id))) return false;
        if (n.isLocked) return false;

        const t = n.tier?.toLowerCase();
        if (!selectedTiers.includes(t)) return false;

        const s = Number(n.series);
        if (!selectedSeries.includes(s)) return false;

        if (selectedSetName !== "All" && n.name !== selectedSetName) {
          return false;
        }

        if (selectedPlayer !== "All") {
          if (!n.fullName || n.fullName !== selectedPlayer) {
            return false;
          }
        }

        if (excludeSpecialSerials) {
          const sn = parseInt(n.serialNumber, 10);
          const effectiveMax =
            n.subeditionID && n.subeditionMaxMint
              ? parseInt(n.subeditionMaxMint, 10)
              : parseInt(n.momentCount, 10);
          const jersey = n.jerseyNumber ? parseInt(n.jerseyNumber, 10) : null;
          const isSpecial =
            sn === 1 || sn === effectiveMax || (jersey && jersey === sn);
          if (isSpecial) return false;
        }

        if (excludeLowSerials) {
          const sn = parseInt(n.serialNumber, 10);
          if (sn <= 4000) return false;
        }

        // Not already selected
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
    excludeLowSerials,
    selectedNFTs,
  ]);

  // Pagination - now 30 items per page
  const [itemsPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(eligibleMoments.length / itemsPerPage);
  const paginatedMoments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return eligibleMoments.slice(start, start + itemsPerPage);
  }, [eligibleMoments, currentPage, itemsPerPage]);

  // handle NFT selection
  const handleNFTSelection = (id) => {
    dispatch({ type: "SET_SELECTED_NFTS", payload: id });
  };

  // Render pagination
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

  // if user not logged in
  if (!user?.loggedIn) {
    return <p className="text-gray-400">Please log in.</p>;
  }

  // if account has no TopShot collection
  if (!hasCollection) {
    return (
      <div className="bg-gray-700 p-1 rounded-lg">
        <p className="text-gray-400 text-sm">
          This account does not have a TopShot collection.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-700 rounded-lg">
      {/* (A) Count + "Loading" status row */}
      <div className="flex justify-between items-center mb-2">
        <div>
          {eligibleMoments.length === 0 ? (
            <p className="text-gray-400">No Moments match your filters.</p>
          ) : (
            <p className="text-gray-400">
              {eligibleMoments.length} Moments match your filters.
            </p>
          )}
          {/* Same color => text-gray-400 */}
          <p className="text-xs text-gray-400 mt-1">
            Note: Only unlocked Common and Fandom are eligible to be swapped for
            TSHOT.
          </p>
        </div>

        {isRefreshing && (
          <span className="text-gray-400">
            <span className="animate-spin inline-block mr-2">⟳</span>
            Loading...
          </span>
        )}
      </div>

      {/* (B) If no series but we do have NFT details */}
      {seriesOptions.length === 0 && nftDetails.length > 0 && (
        <p className="text-gray-400">
          You have no NFTs in this account. No Series available.
        </p>
      )}

      {/* (C) Filters row, less padding => p-1 */}
      {seriesOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-sm bg-gray-600 p-1 rounded mb-2">
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
                      onChange={() => {
                        setSelectedTiers((prev) =>
                          prev.includes(tVal)
                            ? prev.filter((v) => v !== tVal)
                            : [...prev, tVal]
                        );
                        setCurrentPage(1);
                      }}
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
              <label className="flex items-center gap-1 text-gray-200">
                <input
                  type="checkbox"
                  checked={allSeriesChecked}
                  onChange={(e) => handleAllSeriesToggle(e.target.checked)}
                />
                All
              </label>
              {seriesOptions.map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-1 text-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedSeries.includes(val)}
                    onChange={() => {
                      setSelectedSeries((prev) =>
                        prev.includes(val)
                          ? prev.filter((x) => x !== val)
                          : [...prev, val]
                      );
                      setCurrentPage(1);
                    }}
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
              onChange={(e) => {
                setSelectedSetName(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-800 text-white rounded px-1 py-0.5"
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
              onChange={(e) => {
                setSelectedPlayer(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-800 text-white rounded px-1 py-0.5"
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

          {/* Exclude #1, last, or jersey */}
          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={excludeSpecialSerials}
              onChange={() => {
                setExcludeSpecialSerials((prev) => !prev);
                setCurrentPage(1);
              }}
            />
            <label className="text-gray-200">Exclude #1, last, or jersey</label>
          </div>

          {/* Exclude serials <= 4000 */}
          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={excludeLowSerials}
              onChange={() => {
                setExcludeLowSerials((prev) => !prev);
                setCurrentPage(1);
              }}
            />
            <label className="text-gray-200">Exclude serials ≤ 4000</label>
          </div>
        </div>
      )}

      {/* (D) - Main grid of unselected Moments */}
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
        seriesOptions.length > 0 &&
        nftDetails.length > 0 && (
          <p className="text-gray-400 mt-4 text-sm">
            No moments match your filters. Try adjusting them.
          </p>
        )
      )}

      {renderPaginationButtons()}
    </div>
  );
};

export default MomentSelection;
