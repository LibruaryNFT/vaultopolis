import React, { useEffect, useMemo, useState } from "react";
import * as fcl from "@onflow/fcl";
import {
  Repeat,
  CircleDollarSign,
  DollarSign,
  ShieldCheck,
  Dice5,
  Coins,
  Loader2,
  Globe2,
} from "lucide-react";

import { getTSHOTSupply } from "../flow/getTSHOTSupply";
import { getTSHOTPrice } from "../flow/getTSHOTPrice";

// Tier color mapping
const tierStyles = {
  common: "text-gray-400",
  fandom: "text-lime-400",
  rare: "text-blue-500",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

const ALL_TIER_OPTIONS = ["common", "fandom", "rare", "legendary", "ultimate"];

// Helper for USD
const formatUSD = (val) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val);
};

function Vaults() {
  // ---------------- TSHOT supply & price --------------
  const [tshotSupply, setTshotSupply] = useState(null);
  const [loadingSupply, setLoadingSupply] = useState(true);

  const [priceFlow, setPriceFlow] = useState(null);
  const [priceUSD, setPriceUSD] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);

  useEffect(() => {
    async function fetchSupply() {
      setLoadingSupply(true);
      try {
        const supply = await fcl.query({ cadence: getTSHOTSupply });
        setTshotSupply(Number(supply));
      } catch (err) {
        console.error("Failed to fetch TSHOT supply:", err);
      } finally {
        setLoadingSupply(false);
      }
    }

    async function fetchPrice() {
      setLoadingPrice(true);
      try {
        // TSHOT => FLOW
        const flowVal = await fcl.query({ cadence: getTSHOTPrice });
        const flowPerTshot = Number(flowVal);
        setPriceFlow(flowPerTshot);

        // fetch flowPriceUSD
        const res = await fetch(
          "https://flowconnectbackend-864654c6a577.herokuapp.com/api/floor-price"
        );
        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`);
        }
        const data = await res.json();
        const flowPriceUSD = Number(data.flowPriceUSD || 0);

        setPriceUSD(flowPerTshot * flowPriceUSD);
      } catch (err) {
        console.error("Failed to fetch TSHOT price or Flow->USD:", err);
      } finally {
        setLoadingPrice(false);
      }
    }

    fetchSupply();
    fetchPrice();
  }, []);

  // ---------------- Vault data (Moments) -------------
  const [allNfts, setAllNfts] = useState([]);
  const [loadingVault, setLoadingVault] = useState(false);
  const [vaultError, setVaultError] = useState("");

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
        setAllNfts(nfts);
      } catch (err) {
        setVaultError(err.message || "Failed to fetch vault data");
      } finally {
        setLoadingVault(false);
      }
    }
    fetchVaultData();
  }, []);

  // ---------------- Filters & Pagination -------------
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

  const seriesOptions = useMemo(() => {
    const setSeries = new Set(
      allNfts.map((n) => {
        const val = Number(n.series);
        return Number.isNaN(val) ? null : val;
      })
    );
    setSeries.delete(null);
    return Array.from(setSeries).sort((a, b) => a - b);
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

  const [selectedSetName, setSelectedSetName] = useState("All");
  const setNameOptions = useMemo(() => {
    const s = new Set(allNfts.map((n) => n.name).filter(Boolean));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [allNfts]);

  const [selectedPlayer, setSelectedPlayer] = useState("All");
  const playerOptions = useMemo(() => {
    const p = new Set(allNfts.map((n) => n.fullName).filter(Boolean));
    return Array.from(p).sort((a, b) => a.localeCompare(b));
  }, [allNfts]);

  const [onlySpecialSerials, setOnlySpecialSerials] = useState(false);
  const toggleOnlySpecialSerials = () => {
    setOnlySpecialSerials((prev) => !prev);
    setCurrentPage(1);
  };

  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredNfts = useMemo(() => {
    if (!allNfts.length) return [];
    return allNfts.filter((n) => {
      // tier
      const tier = n?.tier?.toLowerCase();
      if (!selectedTiers.includes(tier)) return false;

      // series
      const numSeries = Number(n.series);
      if (Number.isNaN(numSeries) || !selectedSeries.includes(numSeries)) {
        return false;
      }

      // set name
      if (selectedSetName !== "All" && n.name !== selectedSetName) {
        return false;
      }

      // player
      if (selectedPlayer !== "All" && n.fullName !== selectedPlayer) {
        return false;
      }

      // special serial
      const sn = parseInt(n.serialNumber, 10);
      const edSize = parseInt(n.momentCount, 10);
      const jersey = n.jerseyNumber ? parseInt(n.jerseyNumber, 10) : null;
      const isSpecial = sn === 1 || sn === edSize || (jersey && jersey === sn);
      if (onlySpecialSerials && !isSpecial) {
        return false;
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

  // NFT Card
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
      nft?.FullName || nft?.fullName || nft?.playerName || "Unknown Player";

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
    <div className="w-full text-white space-y-4">
      {/* TSHOT Icon (4x bigger than 24px => 96px) + Title */}
      <div className="flex items-center gap-2 mb-2 justify-center">
        <img
          src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
          alt="TSHOT Icon"
          style={{ width: "96px", height: "96px" }}
        />
        <h2 className="text-2xl font-bold">What is TSHOT?</h2>
      </div>

      {/* ============== 6 squares ============== */}
      <div className="bg-gray-700 p-3 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center">
          {/* 1) Minted 1:1 & Backed */}
          <div className="bg-gray-600 p-3 rounded flex flex-col items-center">
            <div className="flex items-center justify-center text-base font-bold text-white mb-1">
              <ShieldCheck className="w-5 h-5 text-purple-400 mr-1" />
              Minted 1:1 &amp; Backed
            </div>
            <p className="text-xs text-gray-100">
              TSHOT is only created by depositing Common/Fandom Moments into the
              TSHOT Vault, ensuring a 1:1 backing.
            </p>
          </div>

          {/* 2) Swap for Random Moments */}
          <div className="bg-gray-600 p-3 rounded flex flex-col items-center">
            <div className="flex items-center justify-center text-base font-bold text-white mb-1">
              <Repeat className="w-5 h-5 text-yellow-300 mr-1" />
              Swap for Random Moments
            </div>
            <p className="text-xs text-gray-100">
              Exchange TSHOT for random Common/Fandom Moments from the TSHOT
              Vault with on-chain randomness.
            </p>
          </div>

          {/* 3) Instant Liquidity */}
          <div className="bg-gray-600 p-3 rounded flex flex-col items-center">
            <div className="flex items-center justify-center text-base font-bold text-white mb-1">
              <Globe2 className="w-5 h-5 text-pink-400 mr-1" />
              Instant Liquidity
            </div>
            <p className="text-xs text-gray-100 mb-2">
              Swap TSHOT to FLOW or other tokens instantly.
            </p>
            <a
              href="https://app.increment.fi/swap?in=A.05b67ba314000b2d.TSHOT&out=A.1654653399040a61.FlowToken"
              target="_blank"
              rel="noreferrer"
              className="bg-pink-500 hover:bg-pink-600 rounded text-xs font-bold px-2 py-1"
              style={{ width: "auto", margin: "0 auto" }}
            >
              Swap Now
            </a>
          </div>

          {/* 4) Earn Yield */}
          <div className="bg-gray-600 p-3 rounded flex flex-col items-center">
            <div className="flex items-center justify-center text-base font-bold text-white mb-1">
              <CircleDollarSign className="w-5 h-5 text-green-400 mr-1" />
              Earn Yield
            </div>
            <p className="text-xs text-gray-100 mb-2">
              Provide liquidity & stake TSHOT to earn additional rewards.
            </p>
            <div className="flex gap-1 mt-auto">
              <a
                href="https://app.increment.fi/liquidity/add"
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 hover:bg-green-600 rounded text-xs font-bold px-2 py-1"
                style={{ width: "auto" }}
              >
                Add Liquidity
              </a>
              <a
                href="https://app.increment.fi/farm"
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 hover:bg-green-600 rounded text-xs font-bold px-2 py-1"
                style={{ width: "auto" }}
              >
                Farm
              </a>
            </div>
          </div>

          {/* 5) TSHOT Supply */}
          <div className="bg-gray-600 p-3 rounded flex flex-col items-center justify-center">
            <div className="flex items-center justify-center text-base font-bold text-white mb-1">
              <Coins className="w-5 h-5 text-blue-300 mr-1" />
              TSHOT Supply
            </div>
            {loadingSupply ? (
              <Loader2 className="h-5 w-5 text-gray-300 animate-spin" />
            ) : tshotSupply !== null ? (
              <p className="text-sm text-blue-300 text-center">
                {Math.floor(tshotSupply)}
              </p>
            ) : (
              <p className="text-xs text-gray-300">Error?</p>
            )}
          </div>

          {/* 6) TSHOT Price */}
          <div className="bg-gray-600 p-3 rounded flex flex-col items-center justify-center">
            <div className="flex items-center justify-center text-base font-bold text-white mb-1">
              <DollarSign className="w-5 h-5 text-lime-300 mr-1" />
              TSHOT Price
            </div>
            {loadingPrice ? (
              <Loader2 className="h-5 w-5 text-gray-300 animate-spin" />
            ) : priceFlow !== null ? (
              <p className="text-sm text-lime-300 text-center">
                {priceFlow.toFixed(4)} FLOW |{" "}
                {priceUSD ? formatUSD(priceUSD) + " USD" : ""}
              </p>
            ) : (
              <p className="text-xs text-gray-300">Error?</p>
            )}
          </div>
        </div>
      </div>

      {/* ~~~~~~~~~~ TSHOT Vault Contents + Filter ~~~~~~~~~~ */}
      <div className="bg-gray-700 p-3 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-1">
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
              {sortedNfts.length} Moments match your filters.
            </p>
          )}
        </div>

        {vaultError && <p className="text-red-500 mb-2">Error: {vaultError}</p>}

        {!loadingVault && !vaultError && (
          <>
            {/* Filter by Tier */}
            {existingTiers.length > 0 && (
              <div className="mb-2">
                <p className="text-gray-300 text-sm font-semibold">
                  Filter by Tier:
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {existingTiers.map((tierVal) => {
                    const label =
                      tierVal.charAt(0).toUpperCase() + tierVal.slice(1);
                    return (
                      <label
                        key={tierVal}
                        className="text-sm flex items-center text-white"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTiers.includes(tierVal)}
                          onChange={() => toggleTier(tierVal)}
                          className="mr-1"
                        />
                        <span
                          className={tierStyles[tierVal] || "text-gray-400"}
                        >
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter by Series */}
            {seriesOptions.length > 0 && (
              <div className="mb-2">
                <p className="text-gray-300 text-sm font-semibold">
                  Filter by Series:
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {seriesOptions.map((val) => (
                    <label
                      key={val}
                      className="text-sm flex items-center text-white"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSeries.includes(val)}
                        onChange={() => toggleSeries(val)}
                        className="mr-1"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Set Name */}
            {setNameOptions.length > 0 && (
              <div className="mb-2">
                <p className="text-gray-300 text-sm font-semibold">
                  Filter by Set Name:
                </p>
                <select
                  value={selectedSetName}
                  onChange={(e) => {
                    setSelectedSetName(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-gray-800 text-gray-200 text-sm p-1 rounded"
                >
                  <option value="All">All Sets</option>
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
              <div className="mb-2">
                <p className="text-gray-300 text-sm font-semibold">
                  Filter by Player:
                </p>
                <select
                  value={selectedPlayer}
                  onChange={(e) => {
                    setSelectedPlayer(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-gray-800 text-gray-200 text-sm p-1 rounded"
                >
                  <option value="All">All Players</option>
                  {playerOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Special Serials */}
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={onlySpecialSerials}
                onChange={toggleOnlySpecialSerials}
                className="mr-2"
              />
              <label className="text-gray-300 text-sm">
                Show only special serials (#1, last, or jersey match)
              </label>
            </div>

            {/* NFT Cards */}
            {paginatedNfts.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
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
    </div>
  );
}

export default Vaults;
