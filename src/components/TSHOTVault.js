import React, { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";

/** Tier color mapping (for filter labels and moment cards) */
const tierStyles = {
  common: "text-gray-400", // Common
  fandom: "text-lime-400", // Fandom
  rare: "text-blue-500", // Rare
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

const ALL_TIER_OPTIONS = ["common", "fandom", "rare", "legendary", "ultimate"];

/** Single NFT Card */
function NftCard({ nft }) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (nft?.setID && nft?.playID) {
      setImageUrl(
        `https://storage.googleapis.com/flowconnect/topshot/images_small/${nft.setID}_${nft.playID}.jpg`
      );
    }
  }, [nft?.setID, nft?.playID]);

  const displayName =
    nft?.fullName || nft?.FullName || nft?.playerName || "Unknown Player";

  const tierClass = nft?.tier
    ? tierStyles[nft.tier.toLowerCase()] || "text-gray-400"
    : "text-gray-400";

  const tierLabel = nft?.tier
    ? nft.tier.charAt(0).toUpperCase() + nft.tier.slice(1).toLowerCase()
    : "Unknown Tier";

  return (
    <div
      className="border bg-black rounded relative p-1 font-inter text-white border-gray-600 overflow-hidden"
      style={{ width: "7rem", height: "12rem" }}
    >
      {imageUrl && (
        <div
          className="relative overflow-hidden rounded mx-auto"
          style={{ height: "80px", width: "80px" }}
        >
          <img
            src={imageUrl}
            alt={`${displayName} moment`}
            className="object-cover w-full h-full transform scale-150"
            style={{ objectPosition: "center" }}
          />
        </div>
      )}
      <h3 className="text-center text-white mt-1 text-xs font-semibold truncate whitespace-nowrap">
        {displayName}
      </h3>
      <p className="text-center text-xs text-gray-400 truncate whitespace-nowrap">
        Series {nft?.series ?? "?"}
      </p>
      <p
        className={`text-center ${tierClass} text-xs truncate whitespace-nowrap`}
      >
        {tierLabel}
      </p>
      <p className="text-center text-xs text-gray-400 truncate whitespace-nowrap">
        {nft?.serialNumber ?? "?"} / {nft?.momentCount ?? "?"}
      </p>
      <p className="text-center text-gray-400 text-xs truncate whitespace-nowrap">
        {nft?.name || "Unknown Set"}
      </p>
    </div>
  );
}

/**
 * Enrich vault data with metadata (jerseyNumber, etc.) from a cache or endpoint.
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
      const data = await resp.json(); // Should be an array
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
        meta.JerseyNumber || meta.jerseyNumber || nft.jerseyNumber || null,
      series: meta.series !== undefined ? meta.series : nft.series,
      name: meta.name || nft.name,
    };
  });
}

function TSHOTVault() {
  // Vault data states
  const [allNfts, setAllNfts] = useState([]);
  const [loadingVault, setLoadingVault] = useState(false);
  const [vaultError, setVaultError] = useState("");

  // Fetch vault data on mount & enrich with metadata
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

  // Tiers
  const existingTiers = useMemo(() => {
    const found = new Set();
    for (const nft of allNfts) {
      if (nft?.tier) {
        found.add(nft.tier.toLowerCase());
      }
    }
    return ALL_TIER_OPTIONS.filter((t) => found.has(t));
  }, [allNfts]);

  const [selectedTiers, setSelectedTiers] = useState([]);
  useEffect(() => {
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

  // Series
  const seriesOptions = useMemo(() => {
    const s = new Set(
      allNfts.map((n) => {
        const val = Number(n.series);
        return Number.isNaN(val) ? null : val;
      })
    );
    s.delete(null);
    return Array.from(s).sort((a, b) => a - b);
  }, [allNfts]);

  const [selectedSeries, setSelectedSeries] = useState([]);
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

  // Set Name
  const [selectedSetName, setSelectedSetName] = useState("All");
  const setNameOptions = useMemo(() => {
    const s = new Set(allNfts.map((n) => n.name).filter(Boolean));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [allNfts]);

  // Player
  const [selectedPlayer, setSelectedPlayer] = useState("All");
  const playerOptions = useMemo(() => {
    const p = new Set(allNfts.map((n) => n.fullName).filter(Boolean));
    return Array.from(p).sort((a, b) => a.localeCompare(b));
  }, [allNfts]);

  // Special Serials
  const [onlySpecialSerials, setOnlySpecialSerials] = useState(false);
  const toggleOnlySpecialSerials = () => {
    setOnlySpecialSerials((prev) => !prev);
    setCurrentPage(1);
  };

  // Pagination
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter the NFTs
  const filteredNfts = useMemo(() => {
    if (!allNfts.length) return [];
    return allNfts.filter((n) => {
      const tier = n?.tier?.toLowerCase();
      if (!selectedTiers.includes(tier)) return false;

      const numSeries = Number(n.series);
      if (Number.isNaN(numSeries) || !selectedSeries.includes(numSeries)) {
        return false;
      }

      if (selectedSetName !== "All" && n.name !== selectedSetName) {
        return false;
      }

      if (selectedPlayer !== "All" && n.fullName !== selectedPlayer) {
        return false;
      }

      // special serial check
      const sn = parseInt(n.serialNumber, 10);
      const edSize = parseInt(n.momentCount, 10);
      const jersey = n.jerseyNumber ? parseInt(n.jerseyNumber, 10) : null;
      const isSpecial = sn === 1 || sn === edSize || (jersey && jersey === sn);

      if (onlySpecialSerials && !isSpecial) return false;
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

  // Sort by serialNumber ascending
  const sortedNfts = useMemo(() => {
    return [...filteredNfts].sort(
      (a, b) => parseInt(a.serialNumber, 10) - parseInt(b.serialNumber, 10)
    );
  }, [filteredNfts]);

  // Paginate
  const totalPages = Math.ceil(sortedNfts.length / itemsPerPage);
  const paginatedNfts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedNfts.slice(start, start + itemsPerPage);
  }, [sortedNfts, currentPage, itemsPerPage]);

  // Render Pagination
  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
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

  return (
    <div className="bg-gray-700 p-3 rounded-lg">
      <h3 className="text-lg font-bold text-white mb-2">
        TSHOT Vault Contents
      </h3>

      <div className="flex justify-between items-center mb-2">
        {loadingVault ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <p className="text-gray-400 text-sm">Loading vault data...</p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            {sortedNfts.length} Moments match your filters. (Vault contents
            refresh every 5 minutes)
          </p>
        )}
      </div>

      {vaultError && <p className="text-red-500 mb-2">Error: {vaultError}</p>}

      {/* FILTERS (compact layout) */}
      {!loadingVault && !vaultError && (
        <div className="flex flex-wrap items-center gap-4 text-sm bg-gray-600 p-2 rounded mb-2">
          {/* Tiers */}
          {existingTiers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-200 font-semibold">Tiers:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {existingTiers.map((tierVal) => {
                  const label =
                    tierVal.charAt(0).toUpperCase() + tierVal.slice(1);
                  const textClass = tierStyles[tierVal] || "text-gray-200";
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

          {/* Series */}
          {seriesOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-200 font-semibold">Series:</span>
              <div className="flex items-center gap-2 flex-wrap">
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

          {/* Set Name */}
          {setNameOptions.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-gray-200 font-semibold">Set:</span>
              <select
                value={selectedSetName}
                onChange={(e) => {
                  setSelectedSetName(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-gray-800 text-gray-200 rounded px-1 py-0.5"
              >
                <option value="All">All</option>
                {setNameOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Player */}
          {playerOptions.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-gray-200 font-semibold">Player:</span>
              <select
                value={selectedPlayer}
                onChange={(e) => {
                  setSelectedPlayer(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-gray-800 text-gray-200 rounded px-1 py-0.5"
              >
                <option value="All">All</option>
                {playerOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Special Serials */}
          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={onlySpecialSerials}
              onChange={toggleOnlySpecialSerials}
            />
            <label className="text-gray-200">
              Show only #1, jersey match, or last mint
            </label>
          </div>
        </div>
      )}

      {/* NFT GRID */}
      {!loadingVault && !vaultError && (
        <>
          {paginatedNfts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {paginatedNfts.map((nft) => (
                <NftCard key={nft.id} nft={nft} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 mt-4 text-sm">
              No moments match your filters.
            </p>
          )}

          {/* Pagination */}
          {renderPaginationButtons()}
        </>
      )}
    </div>
  );
}

export default TSHOTVault;
