import React, { useContext, useEffect, useRef } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import useTransaction from "../hooks/useTransaction";
import { exchangeNFTForTSHOT } from "../flow/exchangeNFTForTSHOT";
import { exchangeNFTForTSHOT_child } from "../flow/exchangeNFTForTSHOT_child";
import MomentCard from "./MomentCard";

const tierTextColors = {
  common: "text-gray-400",
  rare: "text-blue-500",
  fandom: "text-lime-400",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

const NFTToTSHOTPanel = ({ onTransactionStart }) => {
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

  // useRef to track changes in active account
  const prevAddrRef = useRef(null);
  const activeAccountAddr = selectedAccount || user?.addr;
  const isParentAccount = selectedAccountType === "parent";

  // Retrieve active account data (for parent or child)
  const activeAccountData = isParentAccount
    ? accountData
    : accountData?.childrenData?.find(
        (child) => child.addr === selectedAccount
      );

  // Destructure Moments details and $TSHOT balance from the active account data
  const { nftDetails = [], tshotBalance = 0 } = activeAccountData || {};

  // Refresh balances when the active account changes
  useEffect(() => {
    if (activeAccountAddr) {
      const prevAddr = prevAddrRef.current;
      if (prevAddr !== activeAccountAddr) {
        dispatch({ type: "RESET_SELECTED_NFTS" });
        prevAddrRef.current = activeAccountAddr;
      }
    }
  }, [activeAccountAddr, dispatch]);

  const handleMomentClick = (momentId) => {
    dispatch({ type: "SET_SELECTED_NFTS", payload: momentId });
  };

  const handleManualRefresh = async () => {
    if (!activeAccountAddr) return;
    await refreshBalances(activeAccountAddr);
  };

  const { sendTransaction } = useTransaction();

  const handleSwap = async () => {
    if (!user.loggedIn) {
      fcl.authenticate();
      return;
    }
    if (selectedNFTs.length === 0) {
      alert("No moments selected for exchange.");
      return;
    }

    // Ensure active account address is valid.
    if (!activeAccountAddr || !activeAccountAddr.startsWith("0x")) {
      console.error("Invalid active account address:", activeAccountAddr);
      alert(
        "Error: Invalid account address. Please log in again or select a valid account."
      );
      return;
    }

    const momentCount = selectedNFTs.length;
    const tshotAmount = momentCount; // 1:1 conversion

    const cadenceScript =
      selectedAccountType === "child"
        ? exchangeNFTForTSHOT_child
        : exchangeNFTForTSHOT;

    try {
      onTransactionStart({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount: momentCount,
        tshotAmount,
        swapType: "MOMENTS_TO_TSHOT",
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
            nftCount: momentCount,
            tshotAmount,
            swapType: "MOMENTS_TO_TSHOT",
          });
        },
      });

      await refreshBalances(activeAccountAddr);
      dispatch({ type: "RESET_SELECTED_NFTS" });
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  // Render an account box using only the account's own data.
  const renderAccountBox = (label, accountAddr, accountData, isSelected) => {
    const { nftDetails = [], tshotBalance = 0 } = accountData || {};
    // Compute tier counts from this account's moments (nftDetails)
    const tierCounts = nftDetails.reduce((acc, nft) => {
      const tier = nft.tier ? nft.tier.toLowerCase() : "common";
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});

    return (
      <div
        key={accountAddr}
        onClick={() => setSelectedAccount(accountAddr)}
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
          {Object.entries(tierCounts).length > 0 &&
            Object.entries(tierCounts).map(([tier, count]) => (
              <p key={tier} className="text-sm">
                <span className="font-bold text-white">{count}</span>{" "}
                <span className={tierTextColors[tier] || "text-gray-400"}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </span>{" "}
                <span className="text-gray-400">
                  {count === 1 ? "Moment" : "Moments"}
                </span>
              </p>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* (Old toggle removed—mode is now controlled externally) */}

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
            {selectedNFTs.map((momentId) => {
              const moment = nftDetails.find((item) => item.id === momentId);
              return (
                <MomentCard
                  key={momentId}
                  nft={moment}
                  handleNFTSelection={handleMomentClick}
                  isSelected={true}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* $TSHOT Amount Section */}
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
      {user.loggedIn && (
        <div>
          <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-white">
              Account Selection
            </h3>
            <div className="flex items-center text-white">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${
                  isRefreshing
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <span className={isRefreshing ? "animate-spin" : ""}>⟳</span>
                {isRefreshing ? "Refreshing..." : "Refresh Collection"}
              </button>
            </div>
            <p className="text-sm text-yellow-400">
              Note: $TSHOT will be sent to the parent account.
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

export default NFTToTSHOTPanel;
