import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import useTransaction from "../hooks/useTransaction";
import { exchangeNFTForFLOW } from "../flow/exchangeNFTForFLOW";
import { exchangeNFTForFLOW_child } from "../flow/exchangeNFTForFLOW_child";
import MomentCard from "./MomentCard";
import { getFlowPricePerNFT } from "../flow/getFlowPricePerNFT"; // Updated import

const NFTToFLOWPanel = ({ onTransactionStart }) => {
  const {
    user,
    accountData,
    selectedAccount,
    selectedAccountType,
    selectedNFTs,
    dispatch,
    refreshBalances,
    refreshAllBalances,
    setSelectedAccount,
    isRefreshing,
    isLoadingChildren,
  } = useContext(UserContext);

  // Use a default value until we fetch the on-chain FLOW per NFT.
  const [flowPerNFT, setFlowPerNFT] = useState(0.5);
  const activeAccountAddr = selectedAccount || user?.addr;
  const isParentAccount = selectedAccountType === "parent";

  const activeAccountData = isParentAccount
    ? accountData
    : accountData?.childrenData?.find(
        (child) => child?.addr === selectedAccount
      );
  const { nftDetails = [] } = activeAccountData || {};

  // Fetch the current on-chain FLOW per NFT value when the component mounts.
  useEffect(() => {
    const fetchFlowPerNFT = async () => {
      try {
        const result = await fcl.query({
          cadence: getFlowPricePerNFT,
          args: (arg, t) => [],
        });
        const price = Number(result);
        if (!isNaN(price)) {
          console.log("Fetched flow per NFT:", price);
          setFlowPerNFT(price);
        }
      } catch (error) {
        console.error("Error fetching onchain Flow per NFT:", error);
      }
    };

    fetchFlowPerNFT();
  }, []);

  const handleManualRefresh = async () => {
    if (!activeAccountAddr) return;
    console.log("Manual refresh triggered for account:", activeAccountAddr);
    await refreshBalances(activeAccountAddr);
  };

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
    const flowAmount = nftCount * flowPerNFT;
    const cadenceScript = isParentAccount
      ? exchangeNFTForFLOW
      : exchangeNFTForFLOW_child;

    try {
      onTransactionStart?.({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount,
        flowAmount,
        swapType: "NFT_TO_FLOW",
      });

      console.log("Sending transaction with details:", {
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
          console.log("Transaction update:", transactionData);
          onTransactionStart?.({
            ...transactionData,
            nftCount,
            flowAmount,
            swapType: "NFT_TO_FLOW",
          });
        },
      });

      console.log(
        "Transaction sealed. Waiting 10 seconds for blockchain update..."
      );
      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.log("Refreshing parent's account:", user.addr);
      await refreshBalances(user.addr);
      console.log("Parent account refreshed.");
      if (
        accountData &&
        accountData.childrenData &&
        accountData.childrenData.length > 0
      ) {
        console.log("Refreshing children accounts...");
        await Promise.all(
          accountData.childrenData.map((child) => {
            console.log("Refreshing child account:", child.addr);
            return refreshBalances(child.addr);
          })
        );
        console.log("Children accounts refreshed.");
      }
      dispatch({ type: "RESET_SELECTED_NFTS" });
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const renderAccountBox = (label, accountAddr, data, isSelected) => {
    const { flowBalance = 0, nftDetails = [] } = data || {};

    const tierCounts = nftDetails.reduce((acc, nft) => {
      const tier = nft.tier || "unknown";
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});

    return (
      <div
        key={accountAddr}
        onClick={() => setSelectedAccount(accountAddr)}
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
          {Object.entries(tierCounts).map(([tier, count]) => (
            <p key={tier} className="text-sm text-gray-300">
              <span className="font-bold text-white">{count}</span>{" "}
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Moments
            </p>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-1">
      {/* Give Section */}
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

      {/* Receive Section */}
      <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-start w-full">
        <div className="text-white text-sm font-semibold mb-2">Receive</div>
        <p className="text-2xl font-bold text-white">
          {(selectedNFTs.length * flowPerNFT).toFixed(1)} FLOW
        </p>
      </div>

      {/* Action Button */}
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

      {/* Account and Collection Section */}
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
            {isLoadingChildren ? (
              <div className="flex items-center justify-center p-4">
                <span className="animate-spin mr-2">⟳</span>
                Loading children...
              </div>
            ) : (
              accountData.childrenData.map((child) =>
                renderAccountBox(
                  "Child Account",
                  child.addr,
                  child,
                  activeAccountAddr === child.addr
                )
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTToFLOWPanel;
