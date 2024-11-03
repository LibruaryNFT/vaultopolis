import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import MomentCard from "./MomentCard";
import * as fcl from "@onflow/fcl";
import { destroyMoments } from "../flow/destroyMoments";
import { transferMoments } from "../flow/transferMoments";

const Admin = () => {
  const {
    user,
    nftDetails = [],
    selectedNFTs = [],
    dispatch,
  } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState(""); // Recipient address for transfer
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Select or Deselect NFT
  const handleNFTSelection = (id) => {
    dispatch({ type: "SELECT_NFT", payload: id });
  };

  // Destroy selected moments
  const handleDestroyMoments = async () => {
    if (selectedNFTs.length === 0) {
      alert("Please select at least one moment to destroy.");
      return;
    }
    setLoading(true);
    try {
      const txId = await fcl.mutate({
        cadence: destroyMoments,
        args: (arg, t) => [arg(selectedNFTs, t.Array(t.UInt64))],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });
      await fcl.tx(txId).onceSealed();
      alert("Moments destroyed successfully.");
      dispatch({ type: "RESET_SELECTED_NFTS" });
    } catch (error) {
      console.error("Error destroying moments:", error);
      alert("Failed to destroy moments.");
    } finally {
      setLoading(false);
    }
  };

  // Transfer selected moments
  const handleTransferMoments = async () => {
    if (selectedNFTs.length === 0) {
      alert("Please select at least one moment to transfer.");
      return;
    }
    if (!recipientAddress) {
      alert("Please enter a recipient address.");
      return;
    }
    setLoading(true);
    try {
      const txId = await fcl.mutate({
        cadence: transferMoments,
        args: (arg, t) => [
          arg(recipientAddress, t.Address),
          arg(selectedNFTs, t.Array(t.UInt64)),
        ],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });
      await fcl.tx(txId).onceSealed();
      alert("Moments transferred successfully.");
      dispatch({ type: "RESET_SELECTED_NFTS" });
      setRecipientAddress("");
    } catch (error) {
      console.error("Error transferring moments:", error);
      alert("Failed to transfer moments.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const handlePageChange = (newPage) => setCurrentPage(newPage);
  const paginatedMoments = nftDetails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(nftDetails.length / itemsPerPage);

  return (
    <div>
      <h1>Admin - Manage Moments</h1>

      {/* Destroy Button */}
      <button
        onClick={handleDestroyMoments}
        disabled={selectedNFTs.length === 0 || loading}
        className={`w-full p-3 mb-3 text-lg rounded-lg font-bold ${
          selectedNFTs.length
            ? "bg-red-500 hover:bg-red-600"
            : "bg-gray-500 cursor-not-allowed"
        } text-white transition-colors duration-300`}
      >
        {loading ? "Processing..." : "Destroy Selected Moments"}
      </button>

      {/* Transfer Section */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Enter recipient address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className="p-2 w-full mb-2 text-gray-900 rounded-lg"
        />
        <button
          onClick={handleTransferMoments}
          disabled={selectedNFTs.length === 0 || !recipientAddress || loading}
          className={`w-full p-3 text-lg rounded-lg font-bold ${
            selectedNFTs.length && recipientAddress
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-500 cursor-not-allowed"
          } text-white transition-colors duration-300`}
        >
          {loading ? "Processing..." : "Transfer Selected Moments"}
        </button>
      </div>

      {/* Display Selected Moments */}
      <div className="bg-gray-900 p-4 rounded-lg mt-6">
        <h2 className="text-white text-lg font-semibold">Selected Moments</h2>
        {selectedNFTs.length ? (
          <div className="flex flex-wrap mt-2">
            {selectedNFTs.map((id) => {
              const nft = nftDetails.find((n) => n.id === id);
              return (
                <MomentCard
                  key={id}
                  nft={nft}
                  handleNFTSelection={handleNFTSelection}
                  isSelected={true}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 mt-4">Select moments below to manage.</p>
        )}
      </div>

      {/* Available Moments Section */}
      <div className="bg-gray-900 p-4 rounded-lg mb-4">
        <h2 className="text-white text-lg font-semibold">Available Moments</h2>

        {/* Items per Page Dropdown */}
        <div className="flex items-center justify-center mt-4">
          <label className="mr-2 text-gray-300">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="p-1 bg-gray-700 text-white rounded"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Display Moments with Pagination */}
        <div className="flex flex-wrap mt-3">
          {paginatedMoments.map((nft) => (
            <MomentCard
              key={nft.id}
              nft={nft}
              handleNFTSelection={handleNFTSelection}
              isSelected={selectedNFTs.includes(nft.id)}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-600 text-white rounded mr-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-600 text-white rounded ml-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
