import React, { useContext, useEffect, useRef } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import useTransaction from "../hooks/useTransaction";
import { exchangeNFTForFLOW } from "../flow/exchangeNFTForFLOW";
import { exchangeNFTForFLOW_child } from "../flow/exchangeNFTForFLOW_child";
import MomentCard from "./MomentCard";

const NFTToFLOWPanel = ({ onTransactionStart }) => {
  const {
    user,
    accountData,
    selectedAccount,
    selectedAccountType,
    selectedNFTs,
    dispatch,
    refreshBalances,
    setSelectedAccount,
    isRefreshing,
  } = useContext(UserContext);

  // Track the previously used address so we only refresh if address changes
  const prevAddrRef = useRef(null);
  const activeAccountAddr = selectedAccount || user?.addr;
  const isParentAccount = selectedAccountType === "parent";

  // If you track a separate flowBalance, rename the variable or adapt:
  const activeAccountData = isParentAccount
    ? accountData
    : accountData.childrenData.find((child) => child.addr === selectedAccount);

  const {
    nftDetails = [],
    tierCounts = {},
    // If you store flowBalance in your context, rename below:
    // flowBalance = 0,
  } = activeAccountData || {};

  // Refresh on address change
  useEffect(() => {
    if (activeAccountAddr) {
      const prevAddr = prevAddrRef.current;
      if (prevAddr !== activeAccountAddr) {
        dispatch({ type: "RESET_SELECTED_NFTS" });
        refreshBalances(activeAccountAddr);
        prevAddrRef.current = activeAccountAddr;
      }
    }
  }, [activeAccountAddr, dispatch, refreshBalances]);

  const handleMomentClick = (momentId) => {
    // Toggle select/deselect for the NFT
    dispatch({ type: "SET_SELECTED_NFTS", payload: momentId });
  };

  const handleManualRefresh = async () => {
    if (!activeAccountAddr) return;
    await refreshBalances(activeAccountAddr);
  };

  const { sendTransaction } = useTransaction();

  // Main swap function: NFTs -> FLOW
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
    // If 1 NFT => 1 FLOW (or any other rate), you can set this:
    const flowAmount = nftCount;

    // Pick the correct script depending on parent vs child
    const cadenceScript = isParentAccount
      ? exchangeNFTForFLOW
      : exchangeNFTForFLOW_child;

    try {
      // Let the parent know the transaction is about to start
      onTransactionStart?.({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount,
        flowAmount,
        swapType: "NFT_TO_FLOW",
      });

      await sendTransaction({
        cadence: cadenceScript,
        args: (arg, t) =>
          isParentAccount
            ? [arg(selectedNFTs, t.Array(t.UInt64))]
            : [
                arg(selectedAccount, t.Address),
                arg(selectedNFTs, t.Array(t.UInt64)),
              ],
        limit: 9999,
        onUpdate: (transactionData) => {
          // This is optional if you want to show real-time transaction status
          onTransactionStart?.({
            ...transactionData,
            nftCount,
            flowAmount,
            swapType: "NFT_TO_FLOW",
          });
        },
      });

      // Refresh balances and reset selected NFTs
      await refreshBalances(activeAccountAddr);
      dispatch({ type: "RESET_SELECTED_NFTS" });
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  // Renders an account box for parent/child selection
  const renderAccountBox = (label, accountAddr, data, isSelected) => {
    const { flowBalance = 0, tierCounts = {} } = data;
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
            ? "border-opolis bg-gray-700"
            : "border-gray-500 bg-gray-700"
        } cursor-pointer hover:bg-gray-800 transition-all`}
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
              {parseFloat(flowBalance).toFixed(2)}
            </span>{" "}
            $FLOW
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
    <div className="flex flex-col space-y-1">
      {/* Selected Moments Section */}
      <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-start w-full">
        <div className="text-white text-sm mb-1 font-semibold">Give</div>
        <p className="text-gray-400 mb-1">
          Selected Moments:{" "}
          {selectedNFTs.length > 0 ? selectedNFTs.length : "0"}
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

      {/* FLOW Amount Section */}
      <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-start w-full">
        <div className="text-white text-sm font-semibold mb-2">Receive</div>
        <p className="text-2xl font-bold text-white">
          {(selectedNFTs.length * 0.5).toFixed(1)} FLOW
        </p>
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        className={`w-full p-4 text-lg rounded-lg font-bold text-white ${
          selectedNFTs.length === 0
            ? "bg-opolis cursor-not-allowed"
            : "bg-opolis hover:bg-opolis-dark"
        }`}
        disabled={selectedNFTs.length === 0}
      >
        {user.loggedIn ? "Sell" : "Connect Wallet"}
      </button>

      {/* Account Selector Section */}
      {user.loggedIn && (
        <div>
          <div className="flex flex-col space-y-1">
            <h3 className="text-lg font-semibold text-white">
              Account and Moment Selection
            </h3>
            <div className="flex items-center text-white">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${
                  isRefreshing
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-800"
                }`}
              >
                <span className={isRefreshing ? "animate-spin" : ""}>⟳</span>
                {isRefreshing ? "Refreshing..." : "Refresh Collection"}
              </button>
            </div>
            <p className="text-sm text-yellow-400">
              Note: FLOW will always be deposited to the parent account.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
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
      )}
    </div>
  );
};

export default NFTToFLOWPanel;
