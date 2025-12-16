import React, { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionIDs";
import { destroyMoments } from "../flow/destroyMoments";

const Admin = () => {
  const [collectionIDs, setCollectionIDs] = useState([]);
  const [selectedIDs, setSelectedIDs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Fetch the authenticated user's address
  const fetchUserCollectionIDs = async () => {
    try {
      setLoading(true);
      const currentUser = await fcl.currentUser().snapshot();
      if (!currentUser?.addr) {
        throw new Error("User is not authenticated or address not found.");
      }

      const ids = await fcl.query({
        cadence: getTopShotCollectionIDs,
        args: (arg, t) => [arg(currentUser.addr, t.Address)],
      });

      setCollectionIDs(ids);
    } catch (error) {
      console.error("Error fetching collection IDs:", error);
      alert("Failed to fetch collection IDs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCollectionIDs();
  }, []);

  // Pagination logic
  const paginatedIDs = collectionIDs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(collectionIDs.length / itemsPerPage);

  // Handle "Select All" for the current page
  const handleSelectAll = () => {
    const pageIDs = paginatedIDs.filter((id) => !selectedIDs.includes(id));
    setSelectedIDs([...selectedIDs, ...pageIDs]);
  };

  // Handle "Deselect All" for the current page
  const handleDeselectAll = () => {
    const pageIDs = paginatedIDs;
    setSelectedIDs(selectedIDs.filter((id) => !pageIDs.includes(id)));
  };

  // Handle individual ID selection
  const handleIDSelection = (id) => {
    setSelectedIDs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Destroy selected IDs
  const handleDestroyMoments = async () => {
    if (selectedIDs.length === 0) {
      alert("Please select at least one ID to destroy.");
      return;
    }
    setLoading(true);
    try {
      const txId = await fcl.mutate({
        cadence: destroyMoments,
        args: (arg, t) => [arg(selectedIDs, t.Array(t.UInt64))],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });
      await fcl.tx(txId).onceSealed();
      alert("Selected moments destroyed successfully.");
      setSelectedIDs([]);
    } catch (error) {
      console.error("Error destroying moments:", error);
      alert("Failed to destroy moments.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Admin - Manage Moments</h1>

      {/* Destroy Button */}
      <button
        onClick={handleDestroyMoments}
        disabled={selectedIDs.length === 0 || loading}
        className={`w-full p-3 mb-3 text-lg rounded-lg font-bold select-none ${
          selectedIDs.length
            ? "bg-red-500 hover:bg-red-600"
            : "bg-brand-primary/60 border border-brand-border/60 cursor-not-allowed opacity-60"
        } text-white transition-colors duration-300`}
      >
        {loading ? "Processing..." : "Destroy Selected Moments"}
      </button>

      {/* Display Collection IDs */}
      <div className="bg-gray-900 p-4 rounded-lg">
        <h2 className="text-white text-lg font-semibold">
          Collection IDs (Page {currentPage} of {totalPages})
        </h2>

        {/* Select/Deselect All */}
        <div className="flex justify-between my-2">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-blue-500 text-white rounded select-none"
          >
            Select All
          </button>
          <button
            onClick={handleDeselectAll}
            className="px-4 py-2 bg-brand-primary/60 border border-brand-border/60 text-white rounded-lg select-none opacity-60"
          >
            Deselect All
          </button>
        </div>

        {/* Display IDs */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {paginatedIDs.map((id) => (
            <div
              key={id}
              onClick={() => handleIDSelection(id)}
              className={`p-2 border rounded text-center cursor-pointer select-none ${
                selectedIDs.includes(id)
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {id}
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-600 text-white rounded mr-2 disabled:opacity-50 select-none"
          >
            Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-600 text-white rounded ml-2 disabled:opacity-50 select-none"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
