import React, { useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
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
    accountData,
    selectedAccount,
    selectedAccountType,
    selectedNFTs,
    dispatch,
    refreshBalances,
    setSelectedAccount,
  } = useContext(UserContext);

  const activeAccountAddr = selectedAccount || user?.addr;
  const isParentAccount = selectedAccountType === "parent";

  const activeAccountData = isParentAccount
    ? accountData
    : accountData.childrenData.find((child) => child.addr === selectedAccount);

  const {
    nftDetails = [],
    tierCounts = {},
    tshotBalance = 0,
  } = activeAccountData || {};

  useEffect(() => {
    if (activeAccountAddr) {
      dispatch({ type: "RESET_SELECTED_NFTS" });
      refreshBalances(activeAccountAddr);
    }
  }, [activeAccountAddr]);

  const handleMomentClick = (momentId) => {
    dispatch({ type: "SET_SELECTED_NFTS", payload: momentId });
  };

  const { sendTransaction } = useTransaction();

  const handleSwap = async () => {
    if (!user.loggedIn) {
      fcl.authenticate();
      return;
    }

    if (selectedNFTs.length === 0) {
      alert("No NFTs selected for exchange.");
      return;
    }

    const nftCount = selectedNFTs.length;
    const tshotAmount = nftCount;
    const cadenceScript =
      selectedAccountType === "child"
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
          selectedAccountType === "child"
            ? [
                arg(selectedAccount, t.Address),
                arg(selectedNFTs, t.Array(t.UInt64)),
              ]
            : [arg(selectedNFTs, t.Array(t.UInt64))],
        limit: 9999,
        onUpdate: (transactionData) => {
          onTransactionStart({
            ...transactionData,
            nftCount,
            tshotAmount,
            swapType: "NFT_TO_TSHOT",
          });
        },
      });

      await refreshBalances(activeAccountAddr);
      dispatch({ type: "RESET_SELECTED_NFTS" });
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const renderAccountBox = (label, accountAddr, accountData, isSelected) => {
    const { tshotBalance = 0, tierCounts = {} } = accountData;
    const commonMoments = tierCounts.common || 0;

    return (
      <div
        key={accountAddr}
        onClick={() =>
          setSelectedAccount(
            accountAddr,
            accountAddr === user.addr ? "parent" : "child"
          )
        }
        className={`p-2 w-48 flex-shrink-0 text-center rounded-lg border-4 ${
          isSelected
            ? "border-green-500 bg-gray-700"
            : "border-gray-500 bg-gray-800"
        } cursor-pointer hover:bg-gray-600 transition-colors`}
      >
        <h4
          className={`text-sm font-semibold ${
            isSelected ? "text-green-400" : "text-white"
          }`}
        >
          {label}
        </h4>
        <p className="text-xs text-gray-400 truncate">{accountAddr}</p>
        <div className="mt-2">
          <p className="text-base font-semibold text-white">
            {parseFloat(tshotBalance).toFixed(1)} $TSHOT
          </p>
          <p className="text-base font-semibold text-white">
            {commonMoments} Common Moments
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-2">
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

      {/* Horizontal Layout: Give, Receive, Swap */}
      <div className="flex items-center space-x-4">
        {/* Give Section */}
        <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-start w-1/3">
          <div className="text-gray-400 mb-1">Give</div>
          <div className="text-2xl font-bold text-white">
            {selectedNFTs.length || 0} Commons
          </div>
        </div>

        {/* Receive Section */}
        <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-start w-1/3">
          <div className="text-gray-400 mb-1">Receive</div>
          <div className="text-2xl font-bold text-white">
            {selectedNFTs.length || 0} $TSHOT
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className={`w-1/3 p-4 text-lg rounded-lg font-bold text-white ${
            selectedNFTs.length === 0
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-flow-dark hover:bg-flow-darkest"
          }`}
          disabled={selectedNFTs.length === 0}
        >
          {user.loggedIn ? "Swap" : "Connect Wallet"}
        </button>
      </div>

      {/* Account Selector Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Account Selection
        </h3>
        <div className="flex space-x-2 overflow-auto">
          {renderAccountBox(
            "Parent Account",
            user?.addr,
            accountData,
            activeAccountAddr === user?.addr
          )}

          {accountData.childrenData.map((child) =>
            renderAccountBox(
              "Child Account",
              child.addr,
              child,
              activeAccountAddr === child.addr
            )
          )}
        </div>
        {selectedAccountType === "child" && (
          <p className="text-sm text-yellow-400 mt-2">
            Note: $TSHOT earned will appear in the parent account.
          </p>
        )}
      </div>
    </div>
  );
};

export default NFTToTSHOTPanel;
