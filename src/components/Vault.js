import React, { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import { getVaultCollection } from "../flow/getVaultCollection";

const Vault = () => {
  const [totalMoments, setTotalMoments] = useState(null);
  const [loading, setLoading] = useState(true);
  const address = "0x332ffc0ae9bba9c1";

  useEffect(() => {
    const fetchTotalMoments = async () => {
      try {
        const result = await fcl.query({
          cadence: getVaultCollection,
          args: (arg, t) => [arg(address, t.Address)],
        });
        setTotalMoments(result);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch total moments:", error);
      }
    };

    // Initial fetch
    fetchTotalMoments();

    // Polling interval to recheck every 10 seconds
    const intervalId = setInterval(fetchTotalMoments, 10000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-2">Vault Collection</h1>
      <p className="text-center text-gray-400 text-xl mb-4">
        {loading
          ? "Loading Total Moments..."
          : `Total Moments in Vault: ${totalMoments ?? "N/A"}`}
      </p>
    </div>
  );
};

export default Vault;
