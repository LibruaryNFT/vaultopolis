import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import MomentCard from "./MomentCard";
import * as fcl from "@onflow/fcl";
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import { FaArrowRight } from "react-icons/fa";
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";

const ExchangePanel = () => {
  const {
    user,
    tshotBalance,
    nftDetails = [],
    selectedNFTs = [],
    dispatch,
  } = useContext(UserContext);

  const [isReversed, setIsReversed] = useState(false);
  const [tshotAmount, setTshotAmount] = useState(0);
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);
  const [eligibleMoments, setEligibleMoments] = useState([]);
  const [ineligibleMoments, setIneligibleMoments] = useState([]);
  const [showIneligible, setShowIneligible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const handleSwapDirection = () => {
    setIsReversed((prev) => !prev);
    setTshotAmount(0);
    dispatch({ type: "SET_SELECTED_NFTS", payload: [] });
  };

  const handleCommit = async () => {
    const formattedAmount =
      tshotAmount % 1 === 0 ? `${tshotAmount}.0` : `${tshotAmount}`;

    if (tshotAmount <= 0) return;

    try {
      await fcl.mutate({
        cadence: commitSwap,
        args: (arg, t) => [arg(formattedAmount, t.UFix64)],
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

  const handleTshotChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const integerValue = parseInt(value, 10);
      setTshotAmount(isNaN(integerValue) ? 0 : integerValue);
    }
  };

  const SwapDisplayBox = ({ label, value, tokenName, balance }) => (
    <div className="flex flex-col border-2 border-gray-700 p-4 rounded-lg text-center w-1/2 mx-1">
      <div className="text-gray-400 mb-2">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-gray-400">{tokenName}</div>
      {balance && (
        <small className="text-gray-500 mt-1">Balance: {balance}</small>
      )}
    </div>
  );

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

      const visibleSelectedNFTs = selectedNFTs.filter((id) =>
        eligible.some((nft) => nft.id === id)
      );
      dispatch({ type: "SET_SELECTED_NFTS", payload: visibleSelectedNFTs });
    };

    if (user.loggedIn && nftDetails.length > 0) {
      updateMomentVisibility();
    }
  }, [user, nftDetails, excludeSpecialSerials, dispatch]);

  const handleNFTSelection = (id) => {
    dispatch({
      type: "SELECT_NFT",
      payload: id,
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const paginatedMoments = (
    showIneligible ? ineligibleMoments : eligibleMoments
  ).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(
    (showIneligible ? ineligibleMoments : eligibleMoments).length / itemsPerPage
  );

  const eligibleCommonsCount = eligibleMoments.length;

  return (
    <div className="w-full mx-auto p-6 rounded-lg shadow-xl font-inter max-w-screen-lg mt-12 bg-gray-800">
      {/* Swap Interface */}
      <div className="bg-gray-700 p-6 rounded-lg text-center text-white mb-6">
        <div className="flex items-center justify-center">
          {isReversed ? (
            <>
              <div className="flex flex-col items-center border-2 border-gray-700 p-4 rounded-lg text-center w-1/2 mx-1">
                <div className="text-gray-400 mb-2">Give</div>
                <div className="flex items-center justify-center">
                  <input
                    type="number"
                    value={tshotAmount || ""}
                    onChange={handleTshotChange}
                    className="text-xl font-bold text-white bg-gray-800 border-2 border-gray-600 rounded-lg text-center px-2 py-1"
                    style={{ width: "70px" }}
                  />
                  <span className="text-gray-400 ml-2">$TSHOT</span>
                </div>
                <small className="text-gray-500 mt-1">
                  Balance: {parseFloat(tshotBalance || 0).toFixed(2)} $TSHOT
                </small>
              </div>
              <div
                className="text-2xl cursor-pointer mx-4"
                onClick={handleSwapDirection}
                title="Click to swap direction"
              >
                <FaArrowRight />
              </div>
              <SwapDisplayBox
                label="Receive"
                value={`${tshotAmount || 0} Random Moment${
                  tshotAmount === 1 ? "" : "s"
                }`}
                tokenName="TopShot Common"
              />
            </>
          ) : (
            <>
              <SwapDisplayBox
                label="Give"
                value={selectedNFTs.length || 0}
                tokenName="TopShot Common"
                balance={`${eligibleCommonsCount} Commons`}
              />
              <div
                className="text-2xl cursor-pointer mx-4"
                onClick={handleSwapDirection}
                title="Click to swap direction"
              >
                <FaArrowRight />
              </div>
              <SwapDisplayBox
                label="Receive"
                value={selectedNFTs.length || 0}
                tokenName="$TSHOT"
                balance={`${parseFloat(tshotBalance || 0).toFixed(2)} $TSHOT`}
              />
            </>
          )}
        </div>

        {/* Conditional rendering based on swap direction */}
        {isReversed ? (
          <div className="flex space-x-4 mt-4">
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
        ) : (
          <button
            onClick={user.loggedIn ? handleCommit : () => fcl.authenticate()}
            disabled={!selectedNFTs.length}
            className={`mt-6 w-full p-3 text-lg rounded-lg font-bold ${
              user.loggedIn
                ? selectedNFTs.length
                  ? "bg-blue-500 text-white"
                  : "bg-gray-500 text-white cursor-not-allowed"
                : "bg-green-500 text-white"
            }`}
          >
            {user.loggedIn
              ? selectedNFTs.length
                ? "Swap"
                : "Select Moments to Swap"
              : "Connect Wallet"}
          </button>
        )}

        {/* Conditionally render Selected Moments and Available Eligible Moments when not reversed */}
        {user.loggedIn && !isReversed && (
          <>
            <div className="bg-gray-900 p-4 rounded-lg mb-4 mt-6">
              <h2 className="text-white text-lg font-semibold">
                Selected Moments
              </h2>
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

            <div className="bg-gray-900 p-4 rounded-lg mb-4">
              <h2 className="text-white text-lg font-semibold">
                Available Eligible Moments
              </h2>
              <div className="flex items-center mb-4">
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

              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={excludeSpecialSerials}
                  onChange={() => setExcludeSpecialSerials((prev) => !prev)}
                  className="mr-2"
                />
                <label className="text-gray-300">
                  Exclude special serials (#1 or last serial)
                </label>
              </div>

              <button
                onClick={() => setShowIneligible((prev) => !prev)}
                className="bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded mb-4"
              >
                Show Ineligible Moments (Debug)
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

              {/* Pagination controls */}
              <div className="flex justify-center items-center mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-600 text-white rounded mr-2"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-600 text-white rounded ml-2"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExchangePanel;
