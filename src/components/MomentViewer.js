import React, { useState, useEffect } from "react";
import { getMomentIDs_mainnet } from "../flow/getMomentIDs_mainnet";
import { getTier } from "../flow/getTier";
import * as fcl from "@onflow/fcl";

const MomentViewer = () => {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchMoments = async () => {
      try {
        console.log("Fetching moments...");
        const momentIDs = await fcl.query({
          cadence: getMomentIDs_mainnet,
          args: (arg, t) => [arg("0x58bdc3d07e83ba18", t.Address)],
        });
        console.log("Fetched moment IDs:", momentIDs);

        const momentData = momentIDs.map((id) => ({
          id: id,
          imageUrl: `https://assets.nbatopshot.com/media/${id}/image?width=500`,
          tier: null, // Initialize tier as null
        }));

        setMoments(momentData);
      } catch (error) {
        console.error("Error fetching moments:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMoments();
  }, []);

  // Calculate pagination values
  const totalPages = Math.ceil(moments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = moments.slice(indexOfFirstItem, indexOfLastItem);

  // Fetch tiers for current page
  useEffect(() => {
    console.log("Page changed to:", currentPage);
    const fetchTiers = async () => {
      console.log("Fetching tiers for current page...");
      const updatedMoments = [...moments];

      for (let item of currentItems) {
        if (!item.tier) {
          // Only fetch if tier is not already loaded
          try {
            console.log(`Fetching tier for moment ${item.id}`);
            const tier = await fcl.query({
              cadence: getTier,
              args: (arg, t) => [
                arg("0x58bdc3d07e83ba18", t.Address),
                arg(item.id, t.UInt64),
              ],
            });
            console.log(`Received tier for moment ${item.id}:`, tier);

            const index = updatedMoments.findIndex((m) => m.id === item.id);
            if (index !== -1) {
              updatedMoments[index] = { ...updatedMoments[index], tier };
            }
          } catch (error) {
            console.error(`Error fetching tier for moment ${item.id}:`, error);
          }
        }
      }

      setMoments(updatedMoments);
    };

    if (currentItems.length > 0) {
      fetchTiers();
    }
  }, [currentPage]); // Run when page changes

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-lg text-white">Loading moments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  // Helper function for tier color
  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case "legendary":
        return "text-purple-400";
      case "rare":
        return "text-blue-400";
      case "fandom":
        return "text-green-400";
      case "common":
        return "text-gray-400";
      case "ultimate":
        return "text-yellow-400";
      default:
        return "text-white";
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Your TopShot Moments
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentItems.map((moment) => (
          <div
            key={moment.id}
            className="bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-4"
          >
            <div className="aspect-square relative mb-2">
              <img
                src={moment.imageUrl}
                alt={`Moment #${moment.id}`}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  e.target.src = "/api/placeholder/400/400";
                }}
              />
            </div>
            <p className="text-lg font-medium text-center text-white">
              #{moment.id}
            </p>
            <p
              className={`text-center font-medium ${getTierColor(moment.tier)}`}
            >
              {moment.tier || "Loading tier..."}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8 space-x-2">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          Previous
        </button>

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          Next
        </button>
      </div>

      <div className="mt-4 text-sm text-white text-center">
        Page {currentPage} of {totalPages} (Total Moments: {moments.length})
      </div>
    </div>
  );
};

export default MomentViewer;
