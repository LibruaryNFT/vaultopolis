import React, { useContext } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import useTransaction from "../hooks/useTransaction";
import { exchangeNFTForFLOW } from "../flow/exchangeNFTForFLOW";
import { exchangeNFTForFLOW_child } from "../flow/exchangeNFTForFLOW_child";
import MomentCard from "./MomentCard";
import AccountSelection from "./AccountSelection";

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
    isLoadingChildren,
  } = useContext(UserContext);

  // This panel is fixed to NFT-to-FLOW mode.
  const swapMode = "NFT_TO_FLOW";

  const activeAccountAddr = selectedAccount || user?.addr;
  const isParentAccount = selectedAccountType === "parent";
  const activeAccountData = isParentAccount
    ? accountData
    : accountData?.childrenData?.find(
        (child) => child?.addr === selectedAccount
      );
  const { nftDetails = [] } = activeAccountData || {};

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
    // Remove any FLOW conversion calculations since it's handled elsewhere.
    const cadenceScript = isParentAccount
      ? exchangeNFTForFLOW
      : exchangeNFTForFLOW_child;

    try {
      onTransactionStart?.({
        status: "Awaiting Approval",
        txId: null,
        error: null,
        nftCount,
        swapType: swapMode,
      });

      console.log("Sending transaction with details:", {
        nftCount,
        swapType: swapMode,
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
            swapType: swapMode,
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
      if (accountData?.childrenData?.length > 0) {
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
        {/* For now, we assume a 1:1 conversion. Update this if necessary. */}
        <p className="text-2xl font-bold text-white">
          {selectedNFTs.length} FLOW
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
        {user.loggedIn ? "Swap" : "Connect Wallet"}
      </button>

      {/* Account Selection Section */}
      {user.loggedIn && (
        <AccountSelection
          parentAccount={{ addr: user.addr, ...accountData }}
          childrenAccounts={accountData.childrenData || []}
          selectedAccount={activeAccountAddr}
          onSelectAccount={setSelectedAccount}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
          isLoadingChildren={isLoadingChildren}
        />
      )}
    </div>
  );
};

export default NFTToFLOWPanel;
