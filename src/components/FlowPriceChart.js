import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const FloorPriceChart = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://flowconnectbackend-864654c6a577.herokuapp.com/api/floor-price?limit=100"
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();

      const formattedData = result
        .map((item) => ({
          timestamp: new Date(item.timestamp).toLocaleString(),
          floorPriceUSD: item.floorPriceUSD,
          flowPriceUSD: item.flowPriceUSD,
          floorPriceInFlow: item.pricePerFloorNFTFlow,
          vaultopolisRateUSD: item.onchainFlowPerNFT * item.flowPriceUSD,
        }))
        .reverse();

      setData(formattedData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-gray-800 p-2 border border-gray-700 rounded-lg text-sm">
        <p className="text-gray-400">{new Date(label).toLocaleDateString()}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg w-full">
      <h2 className="text-lg font-bold text-white mb-4">Historical Data</h2>
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 40, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="timestamp"
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingBottom: "20px" }}
            />
            <Line
              type="monotone"
              dataKey="floorPriceUSD"
              name="Floor Price"
              stroke="#60A5FA"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="vaultopolisRateUSD"
              name="Vaultopolis Rate"
              stroke="#F59E0B"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="flowPriceUSD"
              name="FLOW Price"
              stroke="#10B981"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FloorPriceChart;
