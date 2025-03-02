import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Repeat,
  CircleDollarSign,
  DollarSign,
  ShieldCheck,
  Dice5,
} from "lucide-react";
import * as fcl from "@onflow/fcl";
import { getFlowPricePerNFT } from "../flow/getFlowPricePerNFT";
import { getFLOWBalance } from "../flow/getFLOWBalance";

// ---------- Formatting Helpers ----------
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
 * We fetch floor-price data from your backend + some on-chain queries.
 * While reloading, we keep the old data on screen to avoid layout flickers.
 */
const ExchangeDashboard = ({ mode }) => {
  // The main "displayed" data
  const [data, setData] = useState(null);

  // A separate loading state for background fetch
  // so we don't clear out "data" mid-load.
  const [isFetching, setIsFetching] = useState(true);

  // If an error occurs, store it
  const [error, setError] = useState(null);

  // Track last updated time
  const [lastUpdated, setLastUpdated] = useState(null);

  // Collapsible TSHOT info: hidden by default
  const [showTshotInfo, setShowTshotInfo] = useState(false);

  // ---------- On-chain queries ----------
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

  const fetchVaultopolisBalance = async () => {
    try {
      const balance = await fcl.query({
        cadence: getFLOWBalance,
        args: (arg, t) => [arg("0xb1788d64d512026d", t.Address)],
      });
      return Number(balance);
    } catch (err) {
      console.error("Error fetching Vaultopolis Flow balance:", err);
      return null;
    }
  };

  // ---------- Fetch entire data set ----------
  const fetchData = async () => {
    setIsFetching(true);
    try {
      // 1) get floor data from your backend
      const response = await fetch(
        "https://flowconnectbackend-864654c6a577.herokuapp.com/api/floor-price"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data from API");
      }
      const result = await response.json();

      // 2) override with on-chain flow-per-NFT
      const onchainFlow = await fetchOnchainFlowPerNFT();
      if (onchainFlow !== null) {
        result.onchainFlowPerNFT = onchainFlow;
      }

      // 3) fetch Vaultopolis's Flow balance
      const vaultBalance = await fetchVaultopolisBalance();
      result.vaultBalance = vaultBalance;

      // set final data
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError(err.message);
    } finally {
      setIsFetching(false);
    }
  };

  // on mount, fetch once. then poll every 60s
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  // If we never got any data (first load is still going or error)
  if (!data && !error) {
    return (
      <div className="w-full h-24 flex items-center justify-center bg-gray-700 rounded-lg">
        <RefreshCw className="animate-spin h-5 w-5 text-flow-light" />
      </div>
    );
  }
  if (error && !data) {
    // If we have no data at all
    return (
      <div className="w-full p-2 text-red-400 bg-gray-700 rounded-lg border border-red-500 text-xs">
        Error: {error}
      </div>
    );
  }

  // If we reach here: we have *some* data (maybe from a previous load),
  // and we might be in the middle of a new load (isFetching could be true/false).

  // ---------- Data Fields ----------
  const flowPriceUSD = data.flowPriceUSD || 0;
  const floorPriceFLOW = data.pricePerFloorNFTFlow || 0;
  const floorPriceUSD = data.floorPriceUSD || 0;
  const vaultFlow = data.onchainFlowPerNFT || 0;
  const vaultUsd = vaultFlow * flowPriceUSD;
  const vaultBalance = data.vaultBalance || 0;

  // premium above floor
  const premiumPercentage = floorPriceFLOW
    ? (((vaultFlow - floorPriceFLOW) / floorPriceFLOW) * 100).toFixed(1)
    : 0;

  const lastUpdatedStr = lastUpdated ? lastUpdated.toLocaleTimeString() : "";

  // TSHOT
  const tshotFlow = floorPriceFLOW;
  const tshotUsd = floorPriceUSD;

  // ---------- Sub-Components ----------
  const TshotUsageBoxes = () => (
    <div
      className={`transition-all ${
        showTshotInfo ? "mt-2" : "h-0"
      } overflow-hidden`}
    >
      {showTshotInfo && (
        <div className="bg-gray-700 p-4 rounded-lg mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1) Minted 1:1 */}
            <div className="bg-gray-600 p-3 rounded flex flex-col items-center text-center">
              <ShieldCheck className="w-10 h-10 text-purple-400 mb-2" />
              <h4 className="font-semibold mb-1 text-white text-sm">
                Minted 1:1 & Backed
              </h4>
              <p className="text-xs text-gray-100">
                TSHOT is only created by depositing
                <br />
                Common/Fandom Moments, ensuring
                <br />a fully backed 1:1 ratio.
              </p>
            </div>

            {/* 2) Swap TSHOT for random moments */}
            <div className="bg-gray-600 p-3 rounded flex flex-col items-center text-center">
              <div className="flex items-center space-x-1 mb-2">
                <Repeat className="w-7 h-7 text-yellow-300" />
                <Dice5 className="w-7 h-7 text-purple-300" />
              </div>
              <h4 className="font-semibold mb-1 text-white text-sm">
                Swap for Moments
              </h4>
              <p className="text-xs text-gray-100">
                Exchange TSHOT for random <br />
                Common/Fandom Moments <br />
                with on-chain randomness.
              </p>
            </div>

            {/* 3) Earn Yield */}
            <div className="bg-gray-600 p-3 rounded flex flex-col items-center text-center">
              <CircleDollarSign className="w-10 h-10 text-green-400 mb-2" />
              <h4 className="font-semibold mb-1 text-white text-sm">
                Earn Yield
              </h4>
              <p className="text-xs text-gray-100 mb-2">
                Provide liquidity & stake TSHOT <br />
                on 3rd-party DEXes for rewards
              </p>
              <div className="text-xs space-y-1">
                <a
                  href="https://app.increment.fi/liquidity"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-3 py-1 bg-green-500 hover:bg-green-600 rounded"
                >
                  Increment.fi
                </a>
                <a
                  href="https://swap.kittypunch.xyz/?tab=liquidity&mode=add"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-3 py-1 bg-green-500 hover:bg-green-600 rounded"
                >
                  KittyPunch
                </a>
              </div>
            </div>

            {/* 4) Instant Liquidity */}
            <div className="bg-gray-600 p-3 rounded flex flex-col items-center text-center">
              <DollarSign className="w-10 h-10 text-blue-400 mb-2" />
              <h4 className="font-semibold mb-1 text-white text-sm">
                Instant Liquidity
              </h4>
              <p className="text-xs text-gray-100">
                Convert TSHOT to FLOW (or others) <br />
                on external DEXes anytime.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const NftToFlowDisclaimer = () => (
    <div className="bg-gray-700 rounded p-2 mt-3 text-xs text-gray-200">
      <p>
        <strong>Experimental Mode:</strong> This option provides instant
        liquidity for Moments but is subject to change in the future.
      </p>
    </div>
  );

  // ============== NFT_TO_TSHOT or TSHOT_TO_NFT ==============
  if (mode === "NFT_TO_TSHOT" || mode === "TSHOT_TO_NFT") {
    return (
      <div className="max-w-xl mx-auto p-3 bg-gray-800 bg-opacity-70 rounded-lg space-y-3">
        {/* Boxes: TSHOT, Floor, FLOW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* TSHOT Price */}
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-300 text-center mb-1">
              TSHOT Price
            </div>
            <div className="text-lg font-bold text-white text-center">
              {formatNumber(tshotFlow)} FLOW
            </div>
            <div className="text-xs font-normal text-gray-400 text-center">
              {formatUSD(tshotUsd)}
            </div>
          </div>

          {/* Floor Price */}
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-300 text-center mb-1">
              Floor Price
            </div>
            <div className="text-lg font-bold text-white text-center">
              {formatNumber(floorPriceFLOW)} FLOW
            </div>
            <div className="text-xs font-normal text-gray-400 text-center">
              {formatUSD(floorPriceUSD)}
            </div>
          </div>

          {/* Flow Price */}
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-300 text-center mb-1">
              FLOW Price
            </div>
            <div className="text-lg font-bold text-white text-center">
              {formatUSD(flowPriceUSD)}
            </div>
          </div>
        </div>

        {/* Collapsible TSHOT info section */}
        <div>
          <button
            onClick={() => setShowTshotInfo(!showTshotInfo)}
            className="text-xs font-bold text-purple-400 hover:text-purple-300"
          >
            {showTshotInfo ? "Hide" : "What is TSHOT?"}
          </button>
          <TshotUsageBoxes />
        </div>

        {/* Footer row w/ last updated */}
        <div className="flex justify-between items-center text-xs mt-1 text-gray-400">
          <div className="flex items-center gap-1">
            Updated: {lastUpdatedStr}
            {isFetching && (
              <RefreshCw className="inline-block h-3 w-3 animate-spin text-flow-light" />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============== NFT_TO_FLOW ==============
  if (mode === "NFT_TO_FLOW") {
    return (
      <div className="max-w-xl mx-auto p-3 bg-gray-800 bg-opacity-70 rounded-lg space-y-3">
        {/* 4 boxes: Vault Rate, Vault Flow Balance, Floor Price, Flow Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Vaultopolis Rate */}
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-300 text-center mb-1 h-5 flex items-center justify-center">
              <span className="text-vault font-bold">Vault</span>
              <span className="text-opolis font-bold">opolis</span>
              <span className="text-gray-300 ml-1">Rate</span>
            </div>
            <div className="text-lg font-bold text-white text-center">
              {formatNumber(vaultFlow)} FLOW
            </div>
            <div className="text-xs font-normal text-gray-400 text-center">
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

          {/* Vaultopolis Flow Balance */}
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-300 text-center mb-1 h-5 flex items-center justify-center">
              <span className="text-vault font-bold">Vault</span>
              <span className="text-opolis font-bold">opolis</span>
              <span className="text-gray-300 ml-1">Balance</span>
            </div>
            <div className="text-lg font-bold text-white text-center">
              {formatNumber(vaultBalance)} FLOW
            </div>
            <div className="text-xs font-normal text-gray-400 text-center">
              {formatUSD(vaultBalance * flowPriceUSD)}
            </div>
            <div className="text-xs font-medium mt-1 text-center text-gray-400">
              For Buying Moments
            </div>
          </div>

          {/* Floor Price */}
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-300 text-center mb-1">
              Floor Price
            </div>
            <div className="text-lg font-bold text-white text-center">
              {formatNumber(floorPriceFLOW)} FLOW
            </div>
            <div className="text-xs font-normal text-gray-400 text-center">
              {formatUSD(floorPriceUSD)}
            </div>
          </div>

          {/* Flow Price */}
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-300 text-center mb-1">
              FLOW Price
            </div>
            <div className="text-lg font-bold text-white text-center">
              {formatUSD(flowPriceUSD)}
            </div>
          </div>
        </div>

        {/* Experimental Disclaimer */}
        <NftToFlowDisclaimer />

        {/* Footer row w/ last updated */}
        <div className="flex justify-between items-center text-xs mt-1 text-gray-400">
          <div className="flex items-center gap-1">
            Updated: {lastUpdatedStr}
            {isFetching && (
              <RefreshCw className="inline-block h-3 w-3 animate-spin text-flow-light" />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============== No mode selected ==============
  return null;
};

export default ExchangeDashboard;
