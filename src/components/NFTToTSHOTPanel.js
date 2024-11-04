// src/components/NFTToTSHOTPanel.js
import React, { useContext } from "react";
import { UserContext } from "./UserContext";
import { FaArrowDown } from "react-icons/fa";
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
    <div className="flex flex-col space-y-4">
      {/* Give Section */}
      <div className="bg-gray-900 p-2 rounded-lg flex flex-col items-start mb-2">
        <div className="text-gray-400 mb-1">Give</div>
        <div className="text-lg font-bold text-white">
          {selectedNFTs.length || 0} TopShot Commons
        </div>
        <small className="text-gray-500">
          Balance: {totalTopShotCommons} TopShot Commons
        </small>
      </div>

      {/* Centered Down Arrow */}
      <div className="flex justify-center my-1">
        <FaArrowDown
          className="text-white text-2xl cursor-pointer"
          onClick={() => setIsNFTToTSHOT(false)}
        />
      </div>

      {/* Receive Section */}
      <div className="bg-gray-900 p-2 rounded-lg flex flex-col items-start mb-4">
        <div className="text-gray-400 mb-1">Receive</div>
        <div className="text-lg font-bold text-white">
          {selectedNFTs.length || 0} $TSHOT
        </div>
        <small className="text-gray-500">
          Balance: {parseFloat(tshotBalance || 0).toFixed(2)} $TSHOT
        </small>
      </div>

      {/* Swap Button with Conditional Text */}
      <button
        onClick={handleSwap}
        className="w-full p-3 text-lg rounded-lg font-bold bg-blue-500 text-white"
      >
        {user.loggedIn ? "Swap" : "Connect Wallet"}
      </button>
    </div>
  );
};

export default NFTToTSHOTPanel;
