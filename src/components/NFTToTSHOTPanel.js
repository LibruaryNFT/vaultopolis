// src/components/NFTToTSHOTPanel.js
import React, { useContext } from "react";
import { UserContext } from "./UserContext";
import { FaArrowDown, FaExchangeAlt } from "react-icons/fa";
import * as fcl from "@onflow/fcl";
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";

const NFTToTSHOTPanel = ({ isNFTToTSHOT, setIsNFTToTSHOT }) => {
  const {
    user,
    tshotBalance,
    selectedNFTs,
    dispatch,
    refreshBalances,
    tierCounts,
  } = useContext(UserContext);

  const totalTopShotCommons = user.loggedIn ? tierCounts?.common || 0 : 0;

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
      setTimeout(
        () => dispatch({ type: "TOGGLE_MODAL", payload: false }),
        3000
      );
    } catch (error) {
      dispatch({
        type: "SET_TRANSACTION_INFO",
        payload: `Transaction failed: ${error.message}`,
      });
    }
  };

  return (
    <div className="flex flex-col space-y-1">
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

      {/* Swap Button with Conditional Text */}
      <button
        onClick={handleSwap}
        className="w-full p-3 text-lg rounded-lg font-bold bg-flow-dark text-white hover:bg-flow-darkest"
      >
        {user.loggedIn ? "Swap" : "Connect Wallet"}
      </button>
    </div>
  );
};

export default NFTToTSHOTPanel;
