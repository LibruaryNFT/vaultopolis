import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import MomentCard from "./MomentCard";
import * as fcl from "@onflow/fcl";
import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import { FaArrowRight } from "react-icons/fa";
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import TransactionModal from "./TransactionModal";

const ExchangePanel = () => {
  const {
    user,
    tshotBalance,
    nftDetails = [],
    selectedNFTs = [],
    dispatch,
    showModal,
    transactionInfo,
    refreshBalances,
  } = useContext(UserContext);

  const [isReversed, setIsReversed] = useState(false);
  const [tshotAmount, setTshotAmount] = useState(0);
  const [excludeSpecialSerials, setExcludeSpecialSerials] = useState(true);
  const [eligibleMoments, setEligibleMoments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalCommons, setTotalCommons] = useState(0);

  const handleSwapDirection = () => {
    setIsReversed((prev) => !prev);
    setTshotAmount(0);
    dispatch({ type: "SET_SELECTED_NFTS", payload: [] });
  };

  const handleCommit = async () => {
    if (isReversed && tshotAmount <= 0) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: "Error: Please enter a valid TSHOT amount.",
      });
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      return;
    }

    if (!isReversed && (!selectedNFTs || selectedNFTs.length === 0)) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: "Error: No NFTs selected for the swap.",
      });
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      return;
    }

    try {
      dispatch({ type: "TOGGLE_MODAL", payload: true });

      if (isReversed) {
        dispatch({
          type: "SET_TRANSACTION_INFO",
          payload: `Processing commit transaction with ${tshotAmount} TSHOT...`,
        });

        const txId = await fcl.mutate({
          cadence: commitSwap,
          args: (arg, t) => [arg(tshotAmount.toFixed(1), t.UFix64)],
          proposer: fcl.authz,
          payer: fcl.authz,
          authorizations: [fcl.authz],
          limit: 9999,
        });

        await fcl.tx(txId).onceSealed();

        // Refresh TSHOT balance after commit
        await refreshBalances();

        dispatch({
          type: "SET_TRANSACTION_INFO",
          payload: `Commit transaction completed. ${tshotAmount} TSHOT committed.\nTransaction ID: ${txId}`,
        });
      } else {
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

        // Refresh balances after swap
        await refreshBalances();
        dispatch({ type: "RESET_SELECTED_NFTS" }); // Reset selected NFTs after swap

        dispatch({
          type: "SET_TRANSACTION_INFO",
          payload: `Swap transaction completed. ${selectedNFTs.length} NFT(s) exchanged for TSHOT.\nTransaction ID: ${txId}`,
        });
      }

      // Optionally, close the modal after a delay
      setTimeout(() => {
        dispatch({ type: "TOGGLE_MODAL", payload: false });
      }, 3000); // Adjust the delay as needed
    } catch (error) {
      console.error("Transaction error:", error);

      let errorMessage = "Transaction failed.";
      const errMsg = error?.message || error?.toString() || "";

      if (errMsg.includes("Declined") || errMsg.includes("rejected")) {
        errorMessage = "Transaction failed: User rejected the request.";
      } else if (errMsg.includes("authz")) {
        errorMessage =
          "Transaction failed: Authorization error. Please try again.";
      } else {
        errorMessage = `Transaction failed: ${errMsg}`;
      }

      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: errorMessage,
      });
    }
  };

  const handleReveal = async () => {
    try {
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: "Revealing transaction...",
      });

      const txId = await fcl.mutate({
        cadence: revealSwap,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });
      await fcl.tx(txId).onceSealed();

      // Refresh balances after reveal
      await refreshBalances();

      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Reveal transaction completed.\nTransaction ID: ${txId}`,
      });

      // Optionally, close the modal after a delay
      setTimeout(() => {
        dispatch({ type: "TOGGLE_MODAL", payload: false });
      }, 3000);
    } catch (error) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Reveal transaction failed: ${error.message}`,
      });
    }
  };

  const handleTshotChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTshotAmount(parseInt(value, 10) || 0);
    }
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
        .filter((nft) => !selectedNFTs.includes(nft.id)) // Exclude selected NFTs
        .sort((a, b) => b.serialNumber - a.serialNumber);

      setEligibleMoments(eligible);
    };

    if (user.loggedIn && nftDetails.length > 0) {
      updateMomentVisibility();
    }
  }, [user, nftDetails, excludeSpecialSerials, selectedNFTs]);

  // Calculate total commons regardless of filters
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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const paginatedMoments = eligibleMoments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(eligibleMoments.length / itemsPerPage);

  return (
    <div className="w-full mx-auto p-6 rounded-lg shadow-xl font-inter max-w-screen-lg mt-12 bg-gray-800">
      <TransactionModal />
      <div className="bg-gray-700 p-6 rounded-lg text-center text-white mb-6">
        <div className="flex items-center justify-center">
          {isReversed ? (
            <>
              <div className="flex flex-col items-center border-2 border-gray-700 p-4 rounded-lg text-center w-1/2 mx-1">
                <div className="text-gray-400 mb-2">Give</div>
                <input
                  type="number"
                  value={tshotAmount || ""}
                  onChange={handleTshotChange}
                  className="text-xl font-bold text-white bg-gray-800 border-2 border-gray-600 rounded-lg text-center px-2 py-1"
                  style={{ width: "70px" }}
                />
                <div className="text-gray-400 mt-2">$TSHOT</div>
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
              <div className="flex flex-col items-center border-2 border-gray-700 p-4 rounded-lg text-center w-1/2 mx-1">
                <div className="text-gray-400 mb-2">Receive</div>
                <div className="text-xl font-bold text-white">
                  {tshotAmount || 0} Random Moment
                </div>
                <small className="text-gray-500 mt-1">
                  Balance: {totalCommons} Top Shot Commons
                </small>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center border-2 border-gray-700 p-4 rounded-lg text-center w-1/2 mx-1">
                <div className="text-gray-400 mb-2">Give</div>
                <div className="text-xl font-bold text-white">
                  {selectedNFTs.length || 0}
                </div>
                <div className="text-gray-400 mt-2">Top Shot Common</div>
                <small className="text-gray-500 mt-1">
                  Balance: {totalCommons} Commons
                </small>
              </div>
              <div
                className="text-2xl cursor-pointer mx-4"
                onClick={handleSwapDirection}
                title="Click to swap direction"
              >
                <FaArrowRight />
              </div>
              <div className="flex flex-col items-center border-2 border-gray-700 p-4 rounded-lg text-center w-1/2 mx-1">
                <div className="text-gray-400 mb-2">Receive</div>
                <div className="text-xl font-bold text-white">
                  {selectedNFTs.length || 0}
                </div>
                <div className="text-gray-400 mt-2">$TSHOT</div>
                <small className="text-gray-500 mt-1">
                  Balance: {parseFloat(tshotBalance || 0).toFixed(2)} $TSHOT
                </small>
              </div>
            </>
          )}
        </div>

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
                  ? "bg-blue-500"
                  : "bg-gray-500 cursor-not-allowed"
                : "bg-green-500"
            }`}
          >
            {user.loggedIn
              ? selectedNFTs.length
                ? "Swap"
                : "Select Moments to Swap"
              : "Connect Wallet"}
          </button>
        )}

        {user.loggedIn && !isReversed && (
          <>
            <div className="bg-gray-900 p-4 rounded-lg mt-6">
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
