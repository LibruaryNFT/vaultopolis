import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import * as fcl from "@onflow/fcl";
import { getFlowPricePerNFT } from "../flow/getFlowPerNFT";

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

  // Fetch API data and merge with onchainFlowPerNFT value.
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

  const formatNumber = (num) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(num);

  const formatUSD = (num) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

  const calculatePremium = (vaultopolisRate, floorPrice) => {
    const premium = ((vaultopolisRate - floorPrice) / floorPrice) * 100;
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

  // Calculate premium and vaultopolis rate.
  const premiumPercentage = calculatePremium(
    data.onchainFlowPerNFT,
    data.pricePerFloorNFTFlow
  );

  return (
    <div className="p-2 max-w-4xl mx-auto px-1">
      {/* Top row: Always 3 columns horizontally */}
      <div className="grid grid-cols-3 gap-1">
        {/* Vaultopolis Rate */}
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-sm mb-1">
            <span className="text-vault font-bold">Vault</span>
            <span className="text-opolis font-bold">opolis</span>
            <span className="text-gray-300"> Rate</span>
          </div>
          <div className="text-lg font-bold text-white">
            {formatNumber(data.onchainFlowPerNFT)} FLOW
          </div>
          <div
            className={`text-xs font-medium mt-1 ${
              premiumPercentage >= 0 ? "text-opolis" : "text-red-500"
            }`}
          >
            {premiumPercentage}% above floor
          </div>
        </div>

        {/* Market Floor Price */}
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-sm mb-1 text-gray-300">Market Floor Price</div>
          <div className="text-lg font-bold text-white">
            {formatUSD(data.floorPriceUSD)}
          </div>
        </div>

        {/* FLOW Price */}
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-sm mb-1 text-gray-300">FLOW Price</div>
          <div className="text-lg font-bold text-white">
            {formatUSD(data.flowPriceUSD)}
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
