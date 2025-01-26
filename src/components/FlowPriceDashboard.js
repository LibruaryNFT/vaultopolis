import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

const FloorPriceDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://flowconnectbackend-864654c6a577.herokuapp.com/api/floor-price"
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
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
    const interval = setInterval(fetchData, 60000);
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

  const premiumPercentage = calculatePremium(
    data.onchainFlowPerNFT,
    data.pricePerFloorNFTFlow
  );
  const vaultopolisUSD = data.onchainFlowPerNFT * data.flowPriceUSD;

  const ValueDisplay = ({ usd, flow, label }) => (
    <div>
      <div className="text-lg font-bold text-white">USD {formatUSD(usd)}</div>
      {flow !== 1 && (
        <div className="text-sm font-medium text-flow-light">
          {formatNumber(flow)} FLOW
        </div>
      )}
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-bold text-white">TopShot Dashboard</h1>
        <div className="text-xs text-gray-400">
          Updated: {lastUpdated?.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid gap-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-700 rounded-lg p-3 col-span-1">
            <div className="text-sm text-gray-300 mb-2">FLOW Price</div>
            <ValueDisplay
              usd={data.flowPriceUSD}
              flow={1}
              label="Market price"
            />
          </div>

          <div className="bg-gray-700 rounded-lg p-3 col-span-2">
            <div className="text-sm text-gray-300 mb-2">
              <span className="text-vault">Vault</span>
              <span className="text-opolis">opolis</span>
              <span> Rate</span>
              <span className="text-gray-400 ml-2">
                ({premiumPercentage}% above floor)
              </span>
            </div>
            <ValueDisplay
              usd={vaultopolisUSD}
              flow={data.onchainFlowPerNFT}
              label="Exchange rate per moment"
            />
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-sm text-gray-300 mb-2">Market Floor Price</div>
          <ValueDisplay
            usd={data.floorPriceUSD}
            flow={data.pricePerFloorNFTFlow}
            label="Excluding bottom 100 listings"
          />
        </div>

        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-sm text-gray-300">Total Listings Under $1</div>
          <div className="text-lg font-bold text-white">
            {data.totalListings.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">On 3rd party marketplaces</div>
        </div>
      </div>

      <button
        onClick={fetchData}
        className="mt-3 px-2 py-1 bg-opolis hover:bg-opolis-dark text-white text-xs rounded-lg flex items-center gap-1 transition-colors"
      >
        <RefreshCw className="h-3 w-3" />
        Refresh
      </button>
    </div>
  );
};

export default FloorPriceDashboard;
