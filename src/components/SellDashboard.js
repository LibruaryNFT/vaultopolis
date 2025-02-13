import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import * as fcl from "@onflow/fcl";
import { getFlowPricePerNFT } from "../flow/getFlowPricePerNFT";

const SellDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Helper to query onchain for Flow per NFT using the Cadence script.
  const fetchOnchainFlowPerNFT = async () => {
    try {
      const result = await fcl.query({
        cadence: getFlowPricePerNFT,
        args: (arg, t) => [], // no arguments required
      });
      return Number(result); // convert result to a number
    } catch (error) {
      console.error("Error fetching onchain Flow per NFT:", error);
      return null;
    }
  };

  // Fetch API data and merge with onchain Flow per NFT value.
  const fetchData = async () => {
    try {
      // Fetch API data
      const response = await fetch(
        "https://flowconnectbackend-864654c6a577.herokuapp.com/api/floor-price"
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();

      // Fetch onchain Flow per NFT and override the API value.
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Formatter functions
  // Format FLOW numbers to exactly 2 decimal places.
  const formatNumber = (num) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

  // Format USD values to 2 decimal places with a currency symbol.
  const formatUSD = (num) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

  // Calculate premium percentage based on Vaultopolis Buy Price vs. Common Floor Price (both in FLOW)
  const calculatePremium = (vaultopolisBuyPrice, commonFloorPriceFlow) => {
    const premium =
      ((vaultopolisBuyPrice - commonFloorPriceFlow) / commonFloorPriceFlow) *
      100;
    return premium.toFixed(1);
  };

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

  // For premium calculation:
  // - data.onchainFlowPerNFT is the Vaultopolis Buy Price (in FLOW)
  // - data.pricePerFloorNFTFlow is the Common Floor Price in FLOW
  const premiumPercentage = calculatePremium(
    data.onchainFlowPerNFT,
    data.pricePerFloorNFTFlow
  );

  // Compute the USD equivalent of the Vaultopolis Buy Price.
  // (Vaultopolis Buy Price is in FLOW so we multiply by the current FLOW token price in USD.)
  const vaultopolisBuyPriceUSD = data.onchainFlowPerNFT * data.flowPriceUSD;

  return (
    <div className="p-2 max-w-4xl mx-auto px-1">
      {/* Dashboard Header */}
      <div className="mb-1">
        <p className="text-sm text-gray-400 text-center">
          Metrics for moments in the{" "}
          <span className="text-gray-400 font-semibold">Common</span>/
          <span className="text-lime-400 font-semibold">Fandom</span> tier
        </p>
      </div>

      {/* Use a responsive grid: 1 column on mobile, 3 on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
        {/* Vaultopolis Buy Price */}
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-sm mb-1 text-center h-8 flex flex-wrap items-center justify-center">
            <span className="text-vault font-bold">Vault</span>
            <span className="text-opolis font-bold">opolis</span>
            <span className="text-gray-300 ml-2">Buy Price</span>
          </div>
          <div className="text-lg font-bold text-white text-center">
            {formatNumber(data.onchainFlowPerNFT)} FLOW
          </div>
          <div className="text-sm font-normal text-gray-400 text-center">
            {formatUSD(vaultopolisBuyPriceUSD)} USD
          </div>
          <div
            className={`text-xs font-medium mt-1 text-center ${
              premiumPercentage >= 0 ? "text-opolis" : "text-red-500"
            }`}
          >
            {premiumPercentage}% above floor
          </div>
        </div>

        {/* Floor Price */}
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-sm mb-1 text-gray-300 text-center h-8 flex items-center justify-center">
            Floor Price
          </div>
          <div className="text-lg font-bold text-white text-center">
            {formatNumber(data.pricePerFloorNFTFlow)} FLOW
          </div>
          <div className="text-sm font-normal text-gray-400 text-center">
            {formatUSD(data.floorPriceUSD)} USD
          </div>
        </div>

        {/* FLOW Price */}
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-sm mb-1 text-gray-300 text-center h-8 flex items-center justify-center">
            FLOW Price
          </div>
          <div className="text-lg font-bold text-white text-center">
            {formatUSD(data.flowPriceUSD)} USD
          </div>
        </div>
      </div>

      {/* Bottom row: Updated time and Refresh button */}
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs text-gray-400">
          Updated: {lastUpdated?.toLocaleTimeString()}
        </div>
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
};

export default SellDashboard;
