import React, { useEffect, useMemo, useState } from "react";

// Tier style config
const tierStyles = {
  common: "text-gray-400",
  rare: "text-blue-500",
  fandom: "text-lime-400",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

// All possible tier options
const ALL_TIER_OPTIONS = ["common", "fandom", "rare", "legendary", "ultimate"];

function Vaults() {
  const [allNfts, setAllNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch data once
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          "https://flowconnectbackend-864654c6a577.herokuapp.com/tshot-vault"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // If data is array => store directly
        // If it's { total, data }, store data
        const nfts = Array.isArray(data) ? data : data.data || [];
        setAllNfts(nfts);
      } catch (err) {
        setError(err.message || "Failed to fetch vault data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ----------------------------------------------------------------
  // Tiers that actually appear in the data
  // ----------------------------------------------------------------
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

  // ----------------------------------------------------------------
  // Series
  // Make sure we parse them as numbers so 0 is included and sorted numerically
  // ----------------------------------------------------------------
  const seriesOptions = useMemo(() => {
    // Convert `n.series` to number. Then gather unique numeric values.
    const seriesSet = new Set(
      allNfts.map((n) => {
        // parse or coerce to number
        const val = Number(n.series);
        return Number.isNaN(val) ? null : val;
      })
    );
    // Remove null/undefined
    seriesSet.delete(null);
    // Convert to array, sort numerically
    const arr = Array.from(seriesSet).sort((a, b) => a - b);
    return arr;
  }, [allNfts]);

  const [selectedSeries, setSelectedSeries] = useState([]);
  useEffect(() => {
    if (seriesOptions.length && selectedSeries.length === 0) {
      setSelectedSeries(seriesOptions);
    }
  }, [seriesOptions, selectedSeries]);

  // ----------------------------------------------------------------
  // Exclude special serials
  // ----------------------------------------------------------------
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);

  // ----------------------------------------------------------------
  // Pagination
  // ----------------------------------------------------------------
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // ----------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------
  const handleToggleTier = (tierVal) => {
    setSelectedTiers((prev) =>
      prev.includes(tierVal)
        ? prev.filter((val) => val !== tierVal)
        : [...prev, tierVal]
    );
    setCurrentPage(1);
  };

  const handleToggleSeries = (seriesVal) => {
    setSelectedSeries((prev) =>
      prev.includes(seriesVal)
        ? prev.filter((val) => val !== seriesVal)
        : [...prev, seriesVal]
    );
    setCurrentPage(1);
  };

  const toggleExcludeSpecialSerials = () => {
    setExcludeSpecialSerials((prev) => !prev);
    setCurrentPage(1);
  };

  // ----------------------------------------------------------------
  // Filter Logic
  // ----------------------------------------------------------------
  const filteredNfts = useMemo(() => {
    if (!allNfts || !allNfts.length) return [];
    return allNfts.filter((nft) => {
      // Tier filter
      const nftTier = nft?.tier?.toLowerCase();
      if (!selectedTiers.includes(nftTier)) return false;

      // Series filter
      const numericSeries = Number(nft.series);
      if (
        Number.isNaN(numericSeries) ||
        !selectedSeries.includes(numericSeries)
      ) {
        return false;
      }

      // Exclude special serial if toggled
      const serialNumber = parseInt(nft.serialNumber, 10);
      const editionSize = parseInt(nft.momentCount, 10);
      const jerseyNumber = nft.JerseyNumber
        ? parseInt(nft.JerseyNumber, 10)
        : null;
      const isSpecial =
        serialNumber === 1 ||
        serialNumber === editionSize ||
        (jerseyNumber && jerseyNumber === serialNumber);

      if (excludeSpecialSerials && isSpecial) {
        return false;
      }

      return true;
    });
  }, [allNfts, selectedTiers, selectedSeries, excludeSpecialSerials]);

  // Sort descending by serialNumber
  const sortedNfts = useMemo(() => {
    return [...filteredNfts].sort(
      (a, b) => parseInt(b.serialNumber, 10) - parseInt(a.serialNumber, 10)
    );
  }, [filteredNfts]);

  // Pagination
  const totalPages = Math.ceil(sortedNfts.length / itemsPerPage);
  const paginatedNfts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedNfts.slice(start, start + itemsPerPage);
  }, [sortedNfts, currentPage, itemsPerPage]);

  // ----------------------------------------------------------------
  // Pagination Buttons
  // ----------------------------------------------------------------
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

  // ----------------------------------------------------------------
  // Card
  // ----------------------------------------------------------------
  const NftCard = ({ nft }) => {
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
      if (nft?.setID && nft?.playID) {
        setImageUrl(
          `https://storage.googleapis.com/flowconnect/topshot/images_small/${nft.setID}_${nft.playID}.jpg`
        );
      }
    }, [nft?.setID, nft?.playID]);

    const displayName =
      nft?.FullName || nft?.fullName || nft?.playerName || "Unknown Player";

    const tierClass = nft?.tier
      ? tierStyles[nft.tier.toLowerCase()] || "text-gray-400"
      : "text-gray-400";

    const tierLabel = nft?.tier
      ? nft.tier.charAt(0).toUpperCase() + nft.tier.slice(1).toLowerCase()
      : "Unknown Tier";

    return (
      <div
        className="
          border
          bg-black
          rounded
          relative
          p-1
          font-inter
          text-white
          border-gray-600
          overflow-hidden
        "
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

        {/* Player Name */}
        <h3 className="text-center text-white mt-1 text-xs font-semibold truncate whitespace-nowrap">
          {displayName}
        </h3>

        {/* Series */}
        <p className="text-center text-xs text-gray-400 truncate whitespace-nowrap">
          Series {nft?.series ?? "?"}
        </p>

        {/* Tier */}
        <p
          className={`text-center ${tierClass} text-xs truncate whitespace-nowrap`}
        >
          {tierLabel}
        </p>

        {/* Serial Number / Edition Size */}
        <p className="text-center text-xs text-gray-400 truncate whitespace-nowrap">
          {nft?.serialNumber ?? "?"} / {nft?.momentCount ?? "?"}
        </p>

        {/* Set Name */}
        <p className="text-center text-gray-400 text-xs truncate whitespace-nowrap">
          {nft?.name || "Unknown Set"}
        </p>
      </div>
    );
  };

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  if (loading) {
    return <p className="text-white">Loading vault data...</p>;
  }
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="w-full text-white">
      {/* Title & Subtext */}
      <h1 className="text-2xl mb-2 font-semibold">TSHOT Vault Contents</h1>
      <p className="mb-4 text-sm text-gray-300">
        You can swap in TSHOT for a chance at any of these vault contents.
      </p>

      <div className="bg-gray-700 p-2 rounded-lg">
        {/* Top section: total count */}
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-400">
            Total Moments Filtered: {sortedNfts.length}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mb-2 space-y-2">
          {/* Series Filter */}
          {seriesOptions.length > 0 && (
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
          )}

          {/* Tier Filter */}
          {existingTiers.length > 0 && (
            <div>
              <p className="text-gray-300 text-sm font-semibold">
                Filter by Tier:
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {existingTiers.map((val) => (
                  <label
                    key={`tier-${val}`}
                    className="text-sm flex items-center"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTiers.includes(val)}
                      onChange={() => handleToggleTier(val)}
                      className="mr-1"
                    />
                    <span
                      className={
                        tierStyles[val.toLowerCase()] || "text-gray-400"
                      }
                    >
                      {val.charAt(0).toUpperCase() + val.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
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

        {/* Display the NFT moments (paginated) */}
        <div className="flex flex-wrap gap-2 mt-2">
          {paginatedNfts.map((nft) => (
            <NftCard key={nft.id} nft={nft} />
          ))}
        </div>

        {/* Pagination controls */}
        {renderPaginationButtons()}
      </div>
    </div>
  );
}

export default Vaults;
