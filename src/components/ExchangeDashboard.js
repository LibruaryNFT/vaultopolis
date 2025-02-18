import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import * as fcl from "@onflow/fcl";
import { getFlowPricePerNFT } from "../flow/getFlowPricePerNFT";

// -- Format helpers
const formatNumber = (num) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

const formatUSD = (num) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

/**
 * ExchangeDashboard
 *
 * Props:
 *   mode: "NFT_TO_TSHOT" | "TSHOT_TO_NFT" | "NFT_TO_FLOW" | null
 *
 * Behavior:
 * - For "NFT_TO_TSHOT" or "TSHOT_TO_NFT":
 *    3 boxes:
 *      [1] TSHOT Price (placeholder = floor)
 *      [2] Floor Price
 *      [3] Flow Price
 *    Then a "What is TSHOT?" title + 3 boxes describing TSHOT benefits
 *
 * - For "NFT_TO_FLOW":
 *    3 boxes:
 *      [1] Vaultopolis Rate
 *      [2] Floor Price
 *      [3] Flow Price
 *    Premium % displayed if vault > floor.
 *    Then a small disclaimer about experimental liquidity.
 *
 * - Shared fetch logic from your floor-price API + on-chain flow per NFT.
 */
const ExchangeDashboard = ({ mode }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 1) Fetch on-chain flow per NFT
  const fetchOnchainFlowPerNFT = async () => {
    try {
      const result = await fcl.query({
        cadence: getFlowPricePerNFT,
        args: (arg, t) => [],
      });
      return Number(result);
    } catch (err) {
      console.error("Error fetching onchain Flow per NFT:", err);
      return null;
    }
  };

  // 2) Fetch from your API
  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://flowconnectbackend-864654c6a577.herokuapp.com/api/floor-price"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data from API");
      }
      const result = await response.json();

      // override with onchain flow
      const onchainFlow = await fetchOnchainFlowPerNFT();
      if (onchainFlow !== null) {
        result.onchainFlowPerNFT = onchainFlow;
      }

      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3) useEffect to fetch + poll
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // -- Render states
  if (loading || !data) {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-gray-700 rounded-lg">
        <RefreshCw className="animate-spin h-6 w-6 text-flow-light" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-2 text-red-400 bg-gray-700 rounded-lg border border-red-500 text-sm">
        Error: {error}
      </div>
    );
  }

  // Data fields
  const flowPriceUSD = data.flowPriceUSD; // Price of 1 FLOW in USD
  const floorPriceFLOW = data.pricePerFloorNFTFlow;
  const floorPriceUSD = data.floorPriceUSD;
  const vaultFlow = data.onchainFlowPerNFT; // "Vaultopolis" buy price in FLOW
  const vaultUsd = vaultFlow * flowPriceUSD; // in USD

  // Premium vs floor
  const premiumPercentage = (() => {
    if (!floorPriceFLOW) return 0;
    const premium = ((vaultFlow - floorPriceFLOW) / floorPriceFLOW) * 100;
    return premium.toFixed(1);
  })();

  const lastUpdatedStr = lastUpdated ? lastUpdated.toLocaleTimeString() : "";

  // TSHOT placeholder = same as floor
  // => TSHOT in Flow = floorPriceFLOW, TSHOT in USD = floorPriceUSD
  const tshotFlow = floorPriceFLOW;
  const tshotUsd = floorPriceUSD;

  // -------------
  // TSHOT benefits
  // -------------
  const renderTshotBenefits = () => {
    return (
      <>
        <div className="mt-4 mb-2 text-white font-semibold text-sm">
          What is TSHOT?
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="bg-gray-700 rounded-lg p-2">
            <div className="text-sm mb-1 text-gray-300 text-center">
              TSHOT Benefit #1
            </div>
            <div className="text-xs text-white text-center">
              Swap TSHOT for random <br />
              TopShot Commons or Fandom <br />
              (possibly something better!)
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-2">
            <div className="text-sm mb-1 text-gray-300 text-center">
              TSHOT Benefit #2
            </div>
            <div className="text-xs text-white text-center">
              Stake TSHOT on external DEXes <br />
              like increment.fi or kitty punch <br />
              to earn rewards
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-2">
            <div className="text-sm mb-1 text-gray-300 text-center">
              TSHOT Benefit #3
            </div>
            <div className="text-xs text-white text-center">
              Instant liquidity <br />
              Exchange TSHOT for FLOW <br />
              on 3rd-party DEXes
            </div>
          </div>
        </div>
      </>
    );
  };

  // NFT->FLOW disclaimer
  const renderNftToFlowDisclaimer = () => (
    <div className="bg-gray-700 rounded p-2 mt-4 text-sm text-gray-200">
      <p>
        <strong>Experimental Mode:</strong> This buying option provides instant
        liquidity for Moments, but is subject to change in the future.
      </p>
    </div>
  );

  // -------------
  // "NFT_TO_TSHOT" or "TSHOT_TO_NFT"
  // => 3 boxes: TSHOT Price, Floor Price, Flow Price, plus TSHOT benefits
  // -------------
  if (mode === "NFT_TO_TSHOT" || mode === "TSHOT_TO_NFT") {
    return (
      <div className="p-2 max-w-4xl mx-auto">
        {/* 3 boxes in a grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Box 1: TSHOT Price (same as floor) */}
          <div className="bg-gray-700 rounded-lg p-2">
            <div className="text-sm mb-1 text-center text-gray-300">
              TSHOT Price
            </div>
            <div className="text-lg font-bold text-white text-center">
              {formatNumber(tshotFlow)} FLOW
            </div>
            <div className="text-sm font-normal text-gray-400 text-center">
              {formatUSD(tshotUsd)}
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              (Same as floor)
            </div>
          </div>

          {/* Box 2: Floor Price */}
          <div className="bg-gray-700 rounded-lg p-2">
            <div className="text-sm mb-1 text-gray-300 text-center">
              Floor Price
            </div>
            <div className="text-lg font-bold text-white text-center">
              {formatNumber(floorPriceFLOW)} FLOW
            </div>
            <div className="text-sm font-normal text-gray-400 text-center">
              {formatUSD(floorPriceUSD)}
            </div>
          </div>

          {/* Box 3: Flow Price */}
          <div className="bg-gray-700 rounded-lg p-2">
            <div className="text-sm mb-1 text-gray-300 text-center">
              FLOW Price
            </div>
            <div className="text-lg font-bold text-white text-center">
              {formatUSD(flowPriceUSD)}
            </div>
          </div>
        </div>

        {/* TSHOT description/benefits */}
        {renderTshotBenefits()}

        {/* Footer row (updated + refresh) */}
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-400">Updated: {lastUpdatedStr}</div>
          <button
            onClick={fetchData}
            className="px-2 py-1 bg-opolis hover:bg-opolis-dark text-white text-xs rounded-lg flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // -------------
  // "NFT_TO_FLOW"
  // => 3 boxes: Vaultopolis Rate (Box 1), Floor Price (Box 2), Flow Price (Box 3)
  // => Show premium % above floor, disclaimers
  // -------------
  if (mode === "NFT_TO_FLOW") {
    return (
      <div className="p-2 max-w-4xl mx-auto">
        {/* 3 boxes in a grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Box 1: Vaultopolis Rate */}
          <div className="bg-gray-700 rounded-lg p-2">
            <div className="text-sm mb-1 text-center text-gray-300 h-6 flex items-center justify-center">
              <span className="text-vault font-bold">Vault</span>
              <span className="text-opolis font-bold">opolis</span>
              <span className="text-gray-300 ml-1">Rate</span>
            </div>
            <div className="text-lg font-bold text-white text-center">
              {formatNumber(vaultFlow)} FLOW
            </div>
            <div className="text-sm font-normal text-gray-400 text-center">
              {formatUSD(vaultUsd)}
            </div>
            <div
              className={`text-xs font-medium mt-1 text-center ${
                premiumPercentage >= 0 ? "text-opolis" : "text-red-500"
              }`}
            >
              {premiumPercentage}% above floor
            </div>
          </div>

          {/* Box 2: Floor Price */}
          <div className="bg-gray-700 rounded-lg p-2">
            <div className="text-sm mb-1 text-gray-300 text-center">
              Floor Price
            </div>
            <div className="text-lg font-bold text-white text-center">
              {formatNumber(floorPriceFLOW)} FLOW
            </div>
            <div className="text-sm font-normal text-gray-400 text-center">
              {formatUSD(floorPriceUSD)}
            </div>
          </div>

          {/* Box 3: Flow Price */}
          <div className="bg-gray-700 rounded-lg p-2">
            <div className="text-sm mb-1 text-gray-300 text-center">
              FLOW Price
            </div>
            <div className="text-lg font-bold text-white text-center">
              {formatUSD(flowPriceUSD)}
            </div>
          </div>
        </div>

        {/* Experimental disclaimer */}
        {renderNftToFlowDisclaimer()}

        {/* Footer row */}
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-400">Updated: {lastUpdatedStr}</div>
          <button
            onClick={fetchData}
            className="px-2 py-1 bg-opolis hover:bg-opolis-dark text-white text-xs rounded-lg flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // -------------
  // No recognized mode => no UI
  // -------------
  return null;
};

export default ExchangeDashboard;
