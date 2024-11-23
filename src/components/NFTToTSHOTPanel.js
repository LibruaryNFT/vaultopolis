import React, { useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import useTransaction from "../hooks/useTransaction";
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import { exchangeNFTForTSHOT_child } from "../flow/exchangeNFTForTSHOT_child";
import MomentCard from "./MomentCard";

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
        className={`p-4 w-full sm:w-60 flex-shrink-0 text-left rounded-lg border-2 ${
          isSelected
            ? "border-green-500 bg-gray-700"
            : "border-gray-500 bg-gray-800"
        } cursor-pointer hover:bg-gray-600 transition-all`}
      >
        <div className="mb-2">
          <h4
            className={`text-sm font-semibold ${
              isSelected ? "text-green-400" : "text-white"
            }`}
          >
            {label}
          </h4>
          <p className="text-xs text-gray-400 truncate">{accountAddr}</p>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-300">
            <span className="font-bold text-white">
              {parseFloat(tshotBalance).toFixed(1)}
            </span>{" "}
            $TSHOT
          </p>
          <p className="text-sm text-gray-300">
            <span className="font-bold text-white">{commonMoments}</span> Common
            Moments
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Swap Mode Section */}
      <div className="flex items-center justify-center space-x-4 mb-4">
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

      {/* Selected Moments Section */}
      <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-start w-full">
        <div className="text-white mb-1 font-semibold">Give</div>
        <p className="text-gray-400 mb-2">
          Selected Moments:{" "}
          {selectedNFTs.length > 0
            ? selectedNFTs.length
            : "None. Select moments below."}
        </p>
        {selectedNFTs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedNFTs.map((nftId) => {
              const nft = nftDetails.find((item) => item.id === nftId);
              return (
                <MomentCard
                  key={nftId}
                  nft={nft}
                  handleNFTSelection={handleMomentClick}
                  isSelected={true}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* TSHOT Amount Section */}
      <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-start w-full">
        <div className="text-white text-sm font-semibold mb-2">Receive</div>
        <p className="text-2xl font-bold text-white">
          {selectedNFTs.length || 0} $TSHOT
        </p>
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        className={`w-full p-4 text-lg rounded-lg font-bold text-white ${
          selectedNFTs.length === 0
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-flow-dark hover:bg-flow-darkest"
        }`}
        disabled={selectedNFTs.length === 0}
      >
        {user.loggedIn ? "Swap" : "Connect Wallet"}
      </button>

      {/* Account Selector Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">
          Account Selection
        </h3>
        <p className="text-sm text-yellow-400 mb-3">
          Note: $TSHOT will be sent to the parent account.
        </p>
        <div className="flex flex-wrap gap-2">
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
      </div>
    </div>
  );
};

export default NFTToTSHOTPanel;
