// src/components/MomentSelection.js

import React, { useContext, useMemo, useState, useEffect, useRef } from "react";
import { UserDataContext } from "../context/UserContext";
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
  } = useContext(UserDataContext);

  // Identify the active account
  const activeAccount =
    accountData?.childrenData?.find(
      (child) => child.addr === selectedAccount
    ) || accountData;

  const { nftDetails = [], hasCollection } = activeAccount || {};

  // 1) Tiers: always show common/fandom; if allowAllTiers => add rare/legendary/ultimate
  const tierOptions = useMemo(
    () => (allowAllTiers ? allPossibleTiers : defaultTiers),
    [allowAllTiers]
  );
  const [selectedTiers, setSelectedTiers] = useState(tierOptions);

  // 2) Series: always show 0,2,3,4,5,6,7 plus any from user's NFTs
  const seriesOptions = useMemo(() => {
    // Define forced series inside the memo to prevent unnecessary rerenders
    const forcedSeries = [0, 2, 3, 4, 5, 6, 7];

    // Combine forced series + actual series from user's NFT details
    const setOfSeries = new Set(forcedSeries);
    (nftDetails || []).forEach((n) => {
      const val = Number(n.series);
      if (!Number.isNaN(val)) {
        setOfSeries.add(val);
      }
    });
    return [...setOfSeries].sort((a, b) => a - b);
  }, [nftDetails]); // Only nftDetails as dependency

  const [selectedSeries, setSelectedSeries] = useState([]);

  // Track if this is initial load - only set defaults on first load
  const initialLoadDone = useRef(false);
  const prevSeriesOptions = useRef([]);

  // On mount or when seriesOptions change, handle default selection
  useEffect(() => {
    // Case 1: First load - select all series by default
    if (!initialLoadDone.current && seriesOptions.length > 0) {
      setSelectedSeries([...seriesOptions]);
      initialLoadDone.current = true;
      prevSeriesOptions.current = [...seriesOptions];
    }
    // Case 2: New series options appeared (and we weren't manually cleared)
    else if (
      seriesOptions.length > prevSeriesOptions.current.length &&
      selectedSeries.length > 0
    ) {
      // Find new options that weren't in the previous set
      const newOptions = seriesOptions.filter(
        (option) => !prevSeriesOptions.current.includes(option)
      );

      // Add only new options to selection
      setSelectedSeries((prev) => [...prev, ...newOptions]);
      prevSeriesOptions.current = [...seriesOptions];
    }
  }, [seriesOptions, selectedSeries]);

  // For "Select All" or "Unselect All" series
  const allSeriesChecked =
    selectedSeries.length > 0 && selectedSeries.length === seriesOptions.length;

  const handleAllSeriesToggle = (checked) => {
    if (checked) {
      // User checked "All" => select all series
      setSelectedSeries([...seriesOptions]);
    } else {
      // User unchecked "All" => deselect everything => no results
      setSelectedSeries([]);
    }
    setCurrentPage(1);
  };

  // Additional toggles
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);
  const [excludeLowSerials, setExcludeLowSerials] = useState(true);

  // Set & Player
  const [selectedSetName, setSelectedSetName] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState("All");

  // 3) Subset for building setNameOptions
  const subsetForSets = useMemo(() => {
    // If no series is selected => no need to filter further
    if (selectedSeries.length === 0) return [];
    return (nftDetails || []).filter((n) => {
      const s = Number(n.series);
      if (!selectedSeries.includes(s)) return false;

      const t = n.tier?.toLowerCase();
      if (!selectedTiers.includes(t)) return false;

      if (selectedPlayer !== "All") {
        if (!n.fullName || n.fullName !== selectedPlayer) return false;
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

  // 4) Subset for building playerNameOptions
  const subsetForPlayers = useMemo(() => {
    // If no series is selected => no need to filter further
    if (selectedSeries.length === 0) return [];
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

  // 5) Build setNameOptions
  const setNameOptions = useMemo(() => {
    const s = new Set(subsetForSets.map((n) => n.name).filter(Boolean));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [subsetForSets]);

  // 6) Build playerNameOptions
  const playerNameOptions = useMemo(() => {
    const p = new Set(
      subsetForPlayers.map((n) => n.fullName).filter((val) => val && val !== "")
    );
    return [...p].sort((a, b) => a.localeCompare(b));
  }, [subsetForPlayers]);

  // 7) Ensure selectedSetName/player remain valid
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

  // 8) Build final list => eligibleMoments
  const eligibleMoments = useMemo(() => {
    if (!nftDetails?.length) return [];

    // If no series is selected => short-circuit to "no results"
    if (selectedSeries.length === 0) {
      return [];
    }

    return nftDetails
      .filter((n) => {
        if (excludeIds.includes(String(n.id))) return false;
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
        if (selectedPlayer !== "All") {
          if (!n.fullName || n.fullName !== selectedPlayer) {
            return false;
          }
        }

        // Exclude special serials
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

        // Exclude low serials
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

  // 9) Pagination - 30 items/page
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
            className={`
              px-3 py-1 mx-1 rounded
              ${
                p === currentPage
                  ? "bg-flow-dark text-white"
                  : "bg-brand-secondary text-brand-text/80"
              }
              ${p === "..." ? "pointer-events-none" : "hover:opacity-80"}
            `}
          >
            {p}
          </button>
        ))}
      </div>
    );
  };

  // Early return: Not logged in
  if (!user?.loggedIn) {
    return <p className="text-brand-text/70 px-2">Please log in.</p>;
  }

  // Early return: No TopShot collection
  if (!hasCollection) {
    return (
      <div className="bg-brand-primary p-2 rounded-lg">
        <p className="text-brand-text/80 text-sm">
          This account does not have a TopShot collection.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-brand-primary text-brand-text rounded-lg">
      {/* (A) Count + "Loading" status row */}
      <div className="flex justify-between items-center mb-2 px-2 pt-2">
        <div>
          {selectedSeries.length === 0 ? (
            <p className="text-brand-text/70 font-semibold">
              Please select at least one Series to view available Moments.
            </p>
          ) : eligibleMoments.length === 0 ? (
            <p className="text-brand-text/70">No Moments match your filters.</p>
          ) : (
            <p className="text-brand-text/70">
              {eligibleMoments.length} Moments match your filters.
            </p>
          )}
          <p className="text-xs text-brand-text/60 mt-1">
            Note: Only unlocked Common and Fandom are eligible to be swapped for
            TSHOT.
          </p>
        </div>

        {isRefreshing && (
          <span className="text-brand-text/70">
            <span className="animate-spin inline-block mr-2">⟳</span>
            Loading...
          </span>
        )}
      </div>

      {/* (B) If we have NFT details, but no recognized series? */}
      {seriesOptions.length === 0 && nftDetails.length > 0 && (
        <p className="text-brand-text/70 px-2">
          You have no NFTs in this account. No Series available.
        </p>
      )}

      {/* (C) Filters row */}
      {seriesOptions.length > 0 && (
        <div
          className="
            flex flex-wrap items-center gap-4 text-sm
            bg-brand-secondary
            p-2
            rounded
            mb-2
            mx-2
          "
        >
          {/* Tiers */}
          <div className="flex items-center gap-2">
            <span className="text-brand-text font-semibold">Tiers:</span>
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
            <span className="text-brand-text font-semibold">Series:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-1 text-brand-text">
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
                  className="flex items-center gap-1 text-brand-text"
                >
                  <input
                    type="checkbox"
                    checked={selectedSeries.includes(val)}
                    onChange={() => {
                      // Handle individual checkbox toggle
                      const newSelectedSeries = selectedSeries.includes(val)
                        ? selectedSeries.filter((x) => x !== val)
                        : [...selectedSeries, val];

                      setSelectedSeries(newSelectedSeries);
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
            <span className="text-brand-text font-semibold">Set:</span>
            <select
              value={selectedSetName}
              onChange={(e) => {
                setSelectedSetName(e.target.value);
                setCurrentPage(1);
              }}
              className="
                bg-brand-primary
                text-brand-text
                rounded
                px-1
                py-0.5
              "
              disabled={setNameOptions.length === 0}
            >
              {setNameOptions.length === 0 ? (
                <option>No sets</option>
              ) : (
                <>
                  <option value="All">All</option>
                  {setNameOptions.map((name) => (
                    <option key={name} value={name} className="text-brand-text">
                      {name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Player */}
          <div className="flex items-center gap-1">
            <span className="text-brand-text font-semibold">Player:</span>
            <select
              value={selectedPlayer}
              onChange={(e) => {
                setSelectedPlayer(e.target.value);
                setCurrentPage(1);
              }}
              className="
                bg-brand-primary
                text-brand-text
                rounded
                px-1
                py-0.5
              "
              disabled={playerNameOptions.length === 0}
            >
              {playerNameOptions.length === 0 ? (
                <option>No players</option>
              ) : (
                <>
                  <option value="All">All</option>
                  {playerNameOptions.map((p) => (
                    <option key={p} value={p} className="text-brand-text">
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
            <label className="text-brand-text">
              Exclude #1, last, or jersey
            </label>
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
            <label className="text-brand-text">Exclude serials ≤ 4000</label>
          </div>
        </div>
      )}

      {/* (D) - Main grid of unselected Moments */}
      {paginatedMoments.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-2 px-2 pb-2">
          {paginatedMoments.map((nft) => (
            <MomentCard
              key={nft.id}
              nft={nft}
              handleNFTSelection={handleNFTSelection}
              isSelected={selectedNFTs.includes(nft.id)}
            />
          ))}
        </div>
      ) : // Only show message if we have series options and no series is selected
      selectedSeries.length === 0 ? (
        <p className="text-brand-text/70 mt-4 text-sm px-2 pb-2">
          Please select at least one Series to view available Moments.
        </p>
      ) : (
        // Only show "no matches" text if we do have some series & NFT data
        seriesOptions.length > 0 &&
        nftDetails.length > 0 && (
          <p className="text-brand-text/70 mt-4 text-sm px-2 pb-2">
            No moments match your filters. Try adjusting them.
          </p>
        )
      )}

      {renderPaginationButtons()}
    </div>
  );
};

export default MomentSelection;
