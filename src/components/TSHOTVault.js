// src/components/TSHOTVault.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import MomentCard, { tierStyles } from "./MomentCard";

const ALL_TIER_OPTIONS = ["common", "fandom", "rare", "legendary", "ultimate"];

/**
 * Returns the display name for an NFT.
 * If the NFT's fullName is "Unknown Player", it falls back to playerName then teamAtMoment.
 */
function getDisplayedName(nft) {
  const forcedUnknowns = ["Unknown Player", "unknown player"];
  let candidate = nft?.fullName || nft?.FullName;
  if (candidate && forcedUnknowns.includes(candidate.trim())) {
    candidate = null;
  }
  return candidate || nft?.playerName || nft?.teamAtMoment || "Unknown Player";
}

/**
 * Enrich vault data with metadata (jerseyNumber, subedition fields, etc.) from a cache or endpoint.
 */
async function enrichVaultMoments(vaultNfts) {
  let metadataCache = {};
  try {
    const cached = localStorage.getItem("topshotMetadata");
    if (cached) {
      metadataCache = JSON.parse(cached);
    } else {
      const resp = await fetch(
        "https://flowconnectbackend-864654c6a577.herokuapp.com/topshot-data"
      );
      if (!resp.ok) {
        throw new Error(`HTTP error: ${resp.status}`);
      }
      const data = await resp.json();
      metadataCache = data.reduce((acc, item) => {
        const key = `${item.setID}-${item.playID}`;
        acc[key] = item;
        return acc;
      }, {});
      localStorage.setItem("topshotMetadata", JSON.stringify(metadataCache));
    }
  } catch (err) {
    console.error("Error loading metadata for vault enrichment:", err);
  }
  return vaultNfts.map((nft) => {
    const key = `${nft.setID}-${nft.playID}`;
    const meta = metadataCache[key];
    if (!meta) return nft;
    return {
      ...nft,
      tier: meta.tier || nft.tier,
      fullName:
        meta.FullName ||
        meta.fullName ||
        nft.fullName ||
        nft.playerName ||
        "Unknown Player",
      momentCount: Number(meta.momentCount) || nft.momentCount,
      jerseyNumber:
        (nft.jerseyNumber != null ? parseInt(nft.jerseyNumber, 10) : null) ||
        (meta.JerseyNumber != null ? parseInt(meta.JerseyNumber, 10) : null),
      series: meta.series !== undefined ? meta.series : nft.series,
      name: meta.name || nft.name,
      subeditionID: nft.subeditionID || meta.subeditionID || null,
      subeditionMaxMint:
        nft.subeditionMaxMint || meta.subeditionMaxMint || null,
      teamAtMoment: meta.TeamAtMoment || nft.teamAtMoment,
    };
  });
}

function TSHOTVault() {
  const [allNfts, setAllNfts] = useState([]);
  const [loadingVault, setLoadingVault] = useState(false);
  const [vaultError, setVaultError] = useState("");

  // Fetch vault data and enrich metadata on mount
  useEffect(() => {
    async function fetchVaultData() {
      setLoadingVault(true);
      setVaultError("");
      try {
        const response = await fetch(
          "https://flowconnectbackend-864654c6a577.herokuapp.com/tshot-vault"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const nfts = Array.isArray(data) ? data : data.data || [];
        const enrichedNfts = await enrichVaultMoments(nfts);
        setAllNfts(enrichedNfts);
      } catch (err) {
        setVaultError(err.message || "Failed to fetch vault data");
      } finally {
        setLoadingVault(false);
      }
    }
    fetchVaultData();
  }, []);

  // ========== Filter State ==========
  const [selectedTiers, setSelectedTiers] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [selectedSetName, setSelectedSetName] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState("All");
  const [onlySpecialSerials, setOnlySpecialSerials] = useState(false);

  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // 1) Tiers
  const existingTiers = useMemo(() => {
    const found = new Set();
    allNfts.forEach((nft) => {
      if (nft?.tier) {
        found.add(nft.tier.toLowerCase());
      }
    });
    return ALL_TIER_OPTIONS.filter((t) => found.has(t));
  }, [allNfts]);

  useEffect(() => {
    // If we have actual tiers and haven't selected any yet, auto-select them
    if (existingTiers.length && selectedTiers.length === 0) {
      setSelectedTiers(existingTiers);
    }
  }, [existingTiers, selectedTiers]);

  const toggleTier = (tierVal) => {
    setSelectedTiers((prev) =>
      prev.includes(tierVal)
        ? prev.filter((t) => t !== tierVal)
        : [...prev, tierVal]
    );
    setCurrentPage(1);
  };

  // 2) Series
  const seriesOptions = useMemo(() => {
    const s = new Set(
      allNfts.map((n) => {
        const val = Number(n.series);
        return Number.isNaN(val) ? null : val;
      })
    );
    s.delete(null);
    return [...s].sort((a, b) => a - b);
  }, [allNfts]);

  useEffect(() => {
    if (seriesOptions.length && selectedSeries.length === 0) {
      setSelectedSeries(seriesOptions);
    }
  }, [seriesOptions, selectedSeries]);

  const toggleSeries = (val) => {
    setSelectedSeries((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
    setCurrentPage(1);
  };

  const handleAllSeriesToggle = (checked) => {
    if (checked) {
      setSelectedSeries(seriesOptions);
    } else {
      setSelectedSeries([]);
    }
    setCurrentPage(1);
  };

  // 3) Set Name
  const setNameOptions = useMemo(() => {
    const s = new Set(allNfts.map((n) => n.name).filter(Boolean));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [allNfts]);

  // 4) Player
  const subsetForPlayers = useMemo(() => {
    return allNfts.filter((n) => {
      const t = n?.tier?.toLowerCase();
      if (!selectedTiers.includes(t)) return false;
      const s = Number(n.series);
      if (Number.isNaN(s) || !selectedSeries.includes(s)) return false;
      if (selectedSetName !== "All" && n.name !== selectedSetName) return false;
      if (onlySpecialSerials) {
        const sn = parseInt(n.serialNumber, 10);
        const effectiveMax =
          n.subeditionID && n.subeditionMaxMint
            ? parseInt(n.subeditionMaxMint, 10)
            : parseInt(n.momentCount, 10);
        const jersey =
          n.jerseyNumber != null ? parseInt(n.jerseyNumber, 10) : null;
        const isSpecial =
          sn === 1 || sn === effectiveMax || (jersey !== null && jersey === sn);
        if (!isSpecial) return false;
      }
      return true;
    });
  }, [
    allNfts,
    selectedTiers,
    selectedSeries,
    selectedSetName,
    onlySpecialSerials,
  ]);

  const playerOptions = useMemo(() => {
    const forcedUnknowns = new Set(["unknown player"]);
    const p = new Set(
      subsetForPlayers
        .map((n) => getDisplayedName(n).trim())
        .filter((val) => val && !forcedUnknowns.has(val.toLowerCase()))
    );
    return [...p].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
  }, [subsetForPlayers]);

  // Reset selected set/player if no longer valid
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
      !playerOptions
        .map((p) => p.toLowerCase())
        .includes(selectedPlayer.toLowerCase())
    ) {
      setSelectedPlayer("All");
    }
  }, [selectedPlayer, playerOptions]);

  // Actual filtering
  const filteredNfts = useMemo(() => {
    if (!allNfts.length) return [];
    return allNfts.filter((n) => {
      const tier = n?.tier?.toLowerCase();
      if (!selectedTiers.includes(tier)) return false;
      const numSeries = Number(n.series);
      if (Number.isNaN(numSeries) || !selectedSeries.includes(numSeries)) {
        return false;
      }
      if (selectedSetName !== "All" && n.name !== selectedSetName) return false;
      if (
        selectedPlayer !== "All" &&
        getDisplayedName(n).toLowerCase() !== selectedPlayer.toLowerCase()
      ) {
        return false;
      }
      if (onlySpecialSerials) {
        const sn = parseInt(n.serialNumber, 10);
        const effectiveMax =
          n.subeditionID && n.subeditionMaxMint
            ? parseInt(n.subeditionMaxMint, 10)
            : parseInt(n.momentCount, 10);
        const jersey =
          n.jerseyNumber != null ? parseInt(n.jerseyNumber, 10) : null;
        const isSpecial =
          sn === 1 || sn === effectiveMax || (jersey && jersey === sn);
        if (!isSpecial) return false;
      }
      return true;
    });
  }, [
    allNfts,
    selectedTiers,
    selectedSeries,
    selectedSetName,
    selectedPlayer,
    onlySpecialSerials,
  ]);

  // Sorting & Pagination
  const sortedNfts = useMemo(() => {
    return [...filteredNfts].sort(
      (a, b) => parseInt(a.serialNumber, 10) - parseInt(b.serialNumber, 10)
    );
  }, [filteredNfts]);

  const totalPages = Math.ceil(sortedNfts.length / itemsPerPage);
  const paginatedNfts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedNfts.slice(start, start + itemsPerPage);
  }, [sortedNfts, currentPage, itemsPerPage]);

  // Renders pagination
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
                  ? "bg-brand-secondary text-brand-text"
                  : "bg-brand-primary text-brand-text/80"
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

  return (
    <div className="bg-brand-primary text-brand-text p-3 rounded-lg">
      <h3 className="text-lg font-bold mb-2">TSHOT Vault Contents</h3>

      <div className="flex justify-between items-center mb-2">
        {loadingVault ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-brand-text/70" />
            <p className="text-sm text-brand-text/70">Loading vault data...</p>
          </div>
        ) : (
          <p className="text-sm text-brand-text/70">
            {sortedNfts.length} Moments match your filters. (Vault contents
            refresh every 5 minutes)
          </p>
        )}
      </div>

      {vaultError && <p className="text-red-500 mb-2">Error: {vaultError}</p>}

      {/* FILTER UI */}
      {!loadingVault && !vaultError && (
        <div className="flex flex-wrap items-center gap-4 text-sm bg-brand-secondary p-2 rounded mb-2">
          {/* Tier Filter */}
          {existingTiers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Tiers:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {existingTiers.map((tierVal) => {
                  const label =
                    tierVal.charAt(0).toUpperCase() + tierVal.slice(1);
                  const textClass = tierStyles[tierVal] || "text-brand-text";
                  return (
                    <label key={tierVal} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={selectedTiers.includes(tierVal)}
                        onChange={() => toggleTier(tierVal)}
                      />
                      <span className={textClass}>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Series Filter */}
          {seriesOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Series:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectedSeries.length === seriesOptions.length}
                    onChange={(e) => handleAllSeriesToggle(e.target.checked)}
                  />
                  All
                </label>
                {seriesOptions.map((val) => (
                  <label key={val} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={selectedSeries.includes(val)}
                      onChange={() => toggleSeries(val)}
                    />
                    {val}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Set Name Filter */}
          {setNameOptions.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="font-semibold">Set:</span>
              <select
                value={selectedSetName}
                onChange={(e) => {
                  setSelectedSetName(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-brand-primary text-brand-text rounded px-1 py-0.5"
              >
                <option value="All" className="text-brand-text">
                  All
                </option>
                {setNameOptions.map((name) => (
                  <option key={name} value={name} className="text-brand-text">
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Player Filter */}
          {playerOptions.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="font-semibold">Player:</span>
              <select
                value={selectedPlayer}
                onChange={(e) => {
                  setSelectedPlayer(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-brand-primary text-brand-text rounded px-1 py-0.5"
              >
                <option value="All" className="text-brand-text">
                  All
                </option>
                {playerOptions.map((p) => (
                  <option key={p} value={p} className="text-brand-text">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Special Serials Filter */}
          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={onlySpecialSerials}
              onChange={() => {
                setOnlySpecialSerials((prev) => !prev);
                setCurrentPage(1);
              }}
            />
            <label>Show only #1, jersey match, or last mint</label>
          </div>
        </div>
      )}

      {/* NFT GRID */}
      {!loadingVault && !vaultError && (
        <>
          {paginatedNfts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {paginatedNfts.map((nft) => (
                <MomentCard key={nft.id} nft={nft} isVault disableHover />
              ))}
            </div>
          ) : (
            <p className="text-brand-text/70 mt-4 text-sm">
              No moments match your filters.
            </p>
          )}

          {renderPaginationButtons()}
        </>
      )}
    </div>
  );
}

export default TSHOTVault;
