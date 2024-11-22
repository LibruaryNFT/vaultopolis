import React, { useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import { FaArrowDown } from "react-icons/fa";
import * as fcl from "@onflow/fcl";
import useTransaction from "../hooks/useTransaction";
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import { exchangeNFTForTSHOT_child } from "../flow/exchangeNFTForTSHOT_child";

const NFTToTSHOTPanel = ({
  isNFTToTSHOT,
  setIsNFTToTSHOT,
  onTransactionStart,
}) => {
  const {
    user,
    tshotBalance,
    selectedNFTs,
    nftDetails,
    dispatch,
    refreshBalances,
    tierCounts,
    hasChildren,
    childrenAddresses,
    activeAccount,
    setActiveAccount,
  } = useContext(UserContext);

  useEffect(() => {
    if (activeAccount) {
      dispatch({ type: "RESET_SELECTED_NFTS" });
      refreshBalances(activeAccount);
    }
  }, [activeAccount]);

  const handleMomentClick = (momentId) => {
    dispatch({ type: "SELECT_NFT", payload: momentId });
  };

  const totalTopShotCommons = tierCounts?.common || 0;

  const { sendTransaction } = useTransaction();

  const handleSwap = async () => {
    if (!user.loggedIn) {
      console.log("User not logged in. Redirecting to authentication.");
      fcl.authenticate();
      return;
    }

    if (selectedNFTs.length === 0) {
      console.log("No NFTs selected for exchange.");
      alert("No NFTs selected for exchange.");
      return;
    }

    const nftCount = selectedNFTs.length;
    const tshotAmount = nftCount;

    const isChildAccount = activeAccount !== user.addr; // Determine if child account is active
    const cadenceScript = isChildAccount
      ? exchangeNFTForTSHOT_child
      : exchangeNFTForTSHOT;

    try {
      onTransactionStart({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount,
        tshotAmount,
        swapType: "NFT_TO_TSHOT",
      });

      await sendTransaction({
        cadence: cadenceScript,
        args: (arg, t) =>
          isChildAccount
            ? [
                arg(activeAccount, t.Address), // Child account address
                arg(selectedNFTs, t.Array(t.UInt64)), // Selected NFTs
              ]
            : [
                arg(selectedNFTs, t.Array(t.UInt64)), // Parent NFTs
              ],
        limit: 9999,
        onUpdate: (transactionData) => {
          console.log("Transaction Update:", transactionData);
          onTransactionStart({
            ...transactionData,
            nftCount,
            tshotAmount,
            swapType: "NFT_TO_TSHOT",
          });
        },
      });

      console.log("Transaction successfully sent.");
      await refreshBalances(activeAccount);
      dispatch({ type: "RESET_SELECTED_NFTS" });
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      {/* Eligible Moments */}
      <div className="eligible-moments">
        {nftDetails.map((moment) => (
          <div
            key={moment.id}
            className={`moment-item ${
              selectedNFTs.includes(moment.id) ? "selected" : ""
            }`}
            onClick={() => handleMomentClick(moment.id)}
          >
            <span>{moment.name}</span>
          </div>
        ))}
      </div>

      {/* Swap Mode Section */}
      <div className="flex items-center justify-center space-x-4 mb-2">
        <span
          className={`text-gray-400 font-semibold ${
            isNFTToTSHOT ? "text-white" : ""
          }`}
        >
          Moment to $TSHOT
        </span>
        <div
          className="relative w-12 h-6 bg-gray-700 rounded-full cursor-pointer"
          onClick={() => setIsNFTToTSHOT(!isNFTToTSHOT)}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-flow-dark rounded-full transition-transform ${
              isNFTToTSHOT ? "translate-x-0.5" : "translate-x-6"
            }`}
          />
        </div>
        <span
          className={`text-gray-400 font-semibold ${
            !isNFTToTSHOT ? "text-white" : ""
          }`}
        >
          $TSHOT to Moment
        </span>
      </div>

      {/* Sell Section */}
      <div className="bg-gray-800 p-2 rounded-lg flex flex-col items-start">
        <div className="text-gray-400 mb-1">Sell</div>
        <div className="text-3xl font-bold text-white">
          {selectedNFTs.length || 0} TopShot Commons
        </div>
        <small className="text-gray-500">
          Balance: {totalTopShotCommons} TopShot Commons
        </small>
      </div>

      {/* Centered Down Arrow */}
      <div
        className="flex justify-center rounded-lg bg-gray-800 py-5 cursor-pointer"
        onClick={() => setIsNFTToTSHOT(false)}
      >
        <FaArrowDown className="text-white text-2xl" />
      </div>

      {/* Buy Section */}
      <div className="bg-gray-800 p-2 rounded-lg flex flex-col items-start mb-1">
        <div className="text-gray-400 mb-1">Buy</div>
        <div className="text-3xl font-bold text-white">
          {selectedNFTs.length || 0} $TSHOT
        </div>
        <small className="text-gray-500">
          Balance: {parseFloat(tshotBalance || 0).toFixed(2)} $TSHOT
        </small>
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        className={`w-full p-3 text-lg rounded-lg font-bold text-white ${
          selectedNFTs.length === 0
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-flow-dark hover:bg-flow-darkest"
        }`}
        disabled={selectedNFTs.length === 0}
      >
        {user.loggedIn ? "Swap" : "Connect Wallet"}
      </button>

      {/* Active Account Selector */}
      <div className="mb-4">
        <label htmlFor="account-selector" className="text-white font-semibold">
          Collection Selector:
        </label>
        {hasChildren ? (
          <select
            id="account-selector"
            value={activeAccount}
            onChange={(e) => setActiveAccount(e.target.value)}
            className="w-full p-2 mt-2 rounded-lg bg-gray-700 text-white"
          >
            <option value={user?.addr}>Parent Account ({user?.addr})</option>
            {childrenAddresses.map((child) => (
              <option key={child} value={child}>
                Child Account ({child})
              </option>
            ))}
          </select>
        ) : (
          <div className="text-white mt-2">Parent Account ({user?.addr})</div>
        )}
        {activeAccount !== user.addr && (
          <div className="mt-2 text-sm text-yellow-400">
            Note: $TSHOT received will be deposited into the signer's account.
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTToTSHOTPanel;
