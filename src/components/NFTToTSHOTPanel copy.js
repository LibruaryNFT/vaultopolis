// src/components/NFTToTSHOTPanel.js
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import MomentCard from "./MomentCard";
import * as fcl from "@onflow/fcl";
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import { FaArrowRight } from "react-icons/fa";

const NFTToTSHOTPanel = () => {
  const {
    user,
    tshotBalance,
    nftDetails = [],
    selectedNFTs = [],
    dispatch,
    refreshBalances,
  } = useContext(UserContext);

  const [eligibleMoments, setEligibleMoments] = useState([]);
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);
  const [totalCommons, setTotalCommons] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedSeries, setSelectedSeries] = useState([]); // Multi-select series filter
  const [sortBy, setSortBy] = useState("serialNumber"); // Sorting preference

  useEffect(() => {
    const updateMomentVisibility = () => {
      let eligible = nftDetails
        .filter((nft) => {
          const isSpecialSerial =
            nft.serialNumber === 1 ||
            nft.serialNumber === nft.numMomentsInEdition ||
            (nft.jerseyNumber &&
              parseInt(nft.jerseyNumber) === nft.serialNumber); // Check for jersey match

          const isSeriesSelected =
            selectedSeries.length === 0 ||
            selectedSeries.includes(parseInt(nft.seriesID));

          return (
            nft.tier.toLowerCase() === "common" &&
            !nft.isLocked &&
            (!excludeSpecialSerials || !isSpecialSerial) &&
            isSeriesSelected
          );
        })
        .filter((nft) => !selectedNFTs.includes(nft.id));

      // Apply sorting
      if (sortBy === "series") {
        eligible = eligible.sort((a, b) => {
          if (b.seriesID === a.seriesID) {
            return b.serialNumber - a.serialNumber;
          }
          return b.seriesID - a.seriesID;
        });
      } else if (sortBy === "serialNumber") {
        eligible = eligible.sort((a, b) => {
          if (b.serialNumber === a.serialNumber) {
            return b.seriesID - a.seriesID;
          }
          return b.serialNumber - a.serialNumber;
        });
      }

      setEligibleMoments(eligible);
    };

    if (user.loggedIn && nftDetails.length > 0) {
      updateMomentVisibility();
    }
  }, [
    user,
    nftDetails,
    excludeSpecialSerials,
    selectedNFTs,
    selectedSeries,
    sortBy,
  ]);

  useEffect(() => {
    const countTotalCommons = () => {
      const commons = nftDetails.filter(
        (nft) => nft.tier.toLowerCase() === "common" && !nft.isLocked
      );
      setTotalCommons(commons.length);
    };

    if (user.loggedIn && nftDetails.length > 0) {
      countTotalCommons();
    }
  }, [user, nftDetails]);

  const handleNFTSelection = (id) => {
    dispatch({ type: "SELECT_NFT", payload: id });
  };

  const handleSwap = async () => {
    if (!user.loggedIn) {
      fcl.authenticate();
      return;
    }

    if (selectedNFTs.length === 0) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: "Error: No NFTs selected for the swap.",
      });
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      return;
    }

    try {
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Processing swap of ${selectedNFTs.length} NFT(s) for TSHOT...`,
      });

      const txId = await fcl.mutate({
        cadence: exchangeNFTForTSHOT,
        args: (arg, t) => [arg(selectedNFTs || [], t.Array(t.UInt64))],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });

      await fcl.tx(txId).onceSealed();

      await refreshBalances();
      dispatch({ type: "RESET_SELECTED_NFTS" });

      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Swap transaction completed. ${selectedNFTs.length} NFT(s) exchanged for TSHOT.\nTransaction ID: ${txId}`,
      });

      setTimeout(() => {
        dispatch({ type: "TOGGLE_MODAL", payload: false });
      }, 3000);
    } catch (error) {
      console.error("Transaction error:", error);
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Transaction failed: ${error.message}`,
      });
    }
  };

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleSeriesChange = (series) => {
    setSelectedSeries((prevSelected) =>
      prevSelected.includes(series)
        ? prevSelected.filter((s) => s !== series)
        : [...prevSelected, series]
    );
  };

  const paginatedMoments = eligibleMoments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(eligibleMoments.length / itemsPerPage);

  return (
    <>
      {/* Give and Receive sections with Arrow */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex flex-col items-center w-1/3">
          <div className="text-gray-400">Give</div>
          <div className="text-xl font-bold text-white">
            {selectedNFTs.length || 0} TopShot Commons
          </div>
          <small className="text-gray-500">
            Balance: {totalCommons} Commons
          </small>
        </div>

        <FaArrowRight className="text-white text-2xl" />

        <div className="flex flex-col items-center w-1/3">
          <div className="text-gray-400">Receive</div>
          <div className="text-xl font-bold text-white">
            {selectedNFTs.length || 0} $TSHOT
          </div>
          <small className="text-gray-500">
            Balance: {parseFloat(tshotBalance || 0).toFixed(2)} $TSHOT
          </small>
        </div>
      </div>

      {/* Swap button */}
      <button
        onClick={handleSwap}
        disabled={!selectedNFTs.length}
        className={`w-full p-3 mb-6 text-lg rounded-lg font-bold ${
          user.loggedIn
            ? selectedNFTs.length
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-500 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        } text-white transition-colors duration-300`}
      >
        {user.loggedIn
          ? selectedNFTs.length
            ? "Swap"
            : "Select Moments to Swap"
          : "Connect Wallet"}
      </button>

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
          <p className="text-gray-400 mt-4">
            Select moments below to swap for $TSHOT.
          </p>
        )}
      </div>

      {/* Available Eligible Moments section */}
      <div className="bg-gray-900 p-4 rounded-lg mb-4">
        <h2 className="text-white text-lg font-semibold">
          Available Eligible Moments
        </h2>

        {/* Filter for Special Serials */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={excludeSpecialSerials}
            onChange={() => setExcludeSpecialSerials((prev) => !prev)}
            className="mr-2"
          />
          <label className="text-gray-300">
            Exclude special serials (#1, last serial, or jersey match)
          </label>
        </div>

        {/* Series Filter */}
        <div className="flex flex-wrap gap-4 mt-4">
          {[0, 2, 3, 4, 5, 6, 7].map((series) => (
            <label key={series} className="flex items-center text-gray-300">
              <input
                type="checkbox"
                checked={selectedSeries.includes(series)}
                onChange={() => handleSeriesChange(series)}
                className="mr-2"
              />
              Series {series}
            </label>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center mt-4">
          <label className="text-gray-300 mr-2">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-1 bg-gray-700 text-white rounded"
          >
            <option value="serialNumber">Serial (Descending)</option>
            <option value="series">Series (Descending)</option>
          </select>
        </div>

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

        <div className="flex flex-wrap mt-3">
          {paginatedMoments.map((nft) => (
            <MomentCard
              key={nft.id}
              nft={nft}
              handleNFTSelection={handleNFTSelection}
              isSelected={false}
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
    </>
  );
};

export default NFTToTSHOTPanel;
