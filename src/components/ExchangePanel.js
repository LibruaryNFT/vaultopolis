import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import MomentCard from "./MomentCard";
import * as fcl from "@onflow/fcl";
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";

const ExchangePanel = () => {
  const {
    user,
    nftDetails = [],
    selectedNFTs = [],
    dispatch,
  } = useContext(UserContext);

  const [isReversed, setIsReversed] = useState(true);
  const [tshotAmount, setTshotAmount] = useState(0);
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);
  const [eligibleMoments, setEligibleMoments] = useState([]);
  const [ineligibleMoments, setIneligibleMoments] = useState([]);
  const [showIneligible, setShowIneligible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const handleTshotChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const integerValue = parseInt(value, 10);
      setTshotAmount(isNaN(integerValue) ? "" : integerValue);
    }
  };

  const handleCommit = async () => {
    const filteredSelectedNFTs = selectedNFTs.filter((id) =>
      eligibleMoments.some((nft) => nft.id === id)
    );
    if (filteredSelectedNFTs.length === 0) return;

    try {
      await fcl.mutate({
        cadence: commitSwap,
        args: (arg, t) => [arg(filteredSelectedNFTs, t.Array(t.UInt64))],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });
      console.log("Commit transaction successful.");
    } catch (error) {
      console.error("Commit transaction failed:", error);
    }
  };

  const handleReveal = async () => {
    try {
      await fcl.mutate({
        cadence: revealSwap,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });
      console.log("Reveal transaction successful.");
    } catch (error) {
      console.error("Reveal transaction failed:", error);
    }
  };

  const handleExcludeSpecialSerialsToggle = () => {
    setExcludeSpecialSerials((prev) => !prev);
  };

  useEffect(() => {
    const updateMomentVisibility = () => {
      const eligible = nftDetails
        .filter((nft) => {
          const isSpecialSerial =
            nft.serialNumber === 1 ||
            nft.serialNumber === nft.numMomentsInEdition;
          return (
            nft.tier.toLowerCase() === "common" &&
            !nft.isLocked &&
            (!excludeSpecialSerials || !isSpecialSerial)
          );
        })
        .sort((a, b) => b.serialNumber - a.serialNumber);

      const ineligible = nftDetails.filter((nft) => !eligible.includes(nft));

      setEligibleMoments(eligible);
      setIneligibleMoments(ineligible);

      // Ensure selectedNFTs only contains eligible moments
      const visibleSelectedNFTs = selectedNFTs.filter((id) =>
        eligible.some((nft) => nft.id === id)
      );
      dispatch({ type: "SET_SELECTED_NFTS", payload: visibleSelectedNFTs });
    };

    if (user.loggedIn && nftDetails.length > 0) {
      updateMomentVisibility();
    }
    // Removed selectedNFTs from dependencies to prevent infinite loop
  }, [user, nftDetails, excludeSpecialSerials, dispatch]);

  const handleNFTSelection = (id) => {
    dispatch({
      type: "SELECT_NFT", // Always dispatch "SELECT_NFT"
      payload: id,
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const paginatedMoments = (
    showIneligible ? ineligibleMoments : eligibleMoments
  ).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full mx-auto p-6 rounded-lg shadow-xl font-inter max-w-screen-lg mt-12 bg-gray-800">
      <div className="flex justify-center space-x-8 mb-4">
        <div
          onClick={() => setIsReversed(true)}
          className={`cursor-pointer flex items-center justify-center p-4 text-center rounded-lg ${
            isReversed ? "border-4 border-green-500" : "border border-gray-600"
          } bg-gray-700 text-white hover:bg-gray-600`}
        >
          Moments → Tokens
        </div>
        <div
          onClick={() => setIsReversed(false)}
          className={`cursor-pointer flex items-center justify-center p-4 text-center rounded-lg ${
            !isReversed ? "border-4 border-green-500" : "border border-gray-600"
          } bg-gray-700 text-white hover:bg-gray-600`}
        >
          Tokens → Moments
        </div>
      </div>

      {isReversed ? (
        <>
          <div className="mb-4 p-4 bg-gray-700 rounded-lg text-center text-white">
            <div className="text-xl font-bold">
              You are exchanging {selectedNFTs.length || "0"} Moments
            </div>
            <span className="text-gray-400 block mt-2">
              You will receive {selectedNFTs.length} Tokens
            </span>
          </div>

          <button
            onClick={handleCommit}
            disabled={!selectedNFTs.length}
            className={`p-3 mb-6 text-lg rounded-lg font-bold ${
              selectedNFTs.length
                ? "bg-blue-500 text-white"
                : "bg-gray-500 text-gray-400 cursor-not-allowed"
            }`}
          >
            Swap
          </button>

          <div className="bg-gray-900 p-4 rounded-lg mb-4">
            <h2 className="text-white text-lg font-semibold">
              Selected Moments
            </h2>
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
          </div>

          <div className="bg-gray-900 p-4 rounded-lg mb-4">
            <h2 className="text-white text-lg font-semibold">
              Available Eligible Moments
            </h2>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={excludeSpecialSerials}
                onChange={handleExcludeSpecialSerialsToggle}
                className="mr-2"
              />
              <label className="text-gray-300">
                Exclude special serials (#1 or last serial)
              </label>
            </div>

            <button
              onClick={() => setShowIneligible((prev) => !prev)}
              className="bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded mb-4 flex items-center"
            >
              <span className="mr-1">Show Ineligible Moments (Debug)</span>
              <i className="fas fa-info-circle"></i>
            </button>

            <div className="flex flex-wrap mt-3">
              {paginatedMoments
                .filter((nft) => !selectedNFTs.includes(nft.id))
                .map((nft) => (
                  <MomentCard
                    key={nft.id}
                    nft={nft}
                    handleNFTSelection={handleNFTSelection}
                    isSelected={false}
                  />
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between mt-4 items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded"
              >
                Previous
              </button>
              <span className="text-white">
                Page {currentPage} of{" "}
                {Math.ceil(
                  (showIneligible
                    ? ineligibleMoments.length
                    : eligibleMoments.length) / itemsPerPage
                )}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage ===
                  Math.ceil(
                    (showIneligible
                      ? ineligibleMoments.length
                      : eligibleMoments.length) / itemsPerPage
                  )
                }
                className="bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded"
              >
                Next
              </button>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                className="bg-gray-700 text-white p-2 rounded ml-2"
              >
                <option value={10}>Show 10</option>
                <option value={25}>Show 25</option>
                <option value={50}>Show 50</option>
                <option value={100}>Show 100</option>
              </select>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="border-2 border-gray-700 p-4 rounded-lg mb-6">
            <label className="block text-gray-400 mb-2">Amount of TSHOT</label>
            <input
              type="number"
              value={tshotAmount || ""}
              onChange={handleTshotChange}
              className="w-full p-3 mt-2 border rounded-lg text-lg bg-gray-700 text-white"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleCommit}
              className="p-3 text-lg rounded-lg font-bold bg-blue-500 text-white"
              disabled={tshotAmount <= 0}
            >
              Commit
            </button>

            <button
              onClick={handleReveal}
              className="p-3 text-lg rounded-lg font-bold bg-green-500 text-white"
            >
              Reveal
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExchangePanel;
