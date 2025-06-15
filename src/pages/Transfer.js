// src/components/Transfer.js
import React, { useState, useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserDataContext } from "../context/UserContext";
import { batchTransfer } from "../flow/batchTransfer";
import { bridgeEVM } from "../flow/bridgeEVM";
import AccountSelection from "../components/AccountSelection";
import MomentSelection from "../components/MomentSelection";
import TransactionModal from "../components/TransactionModal";
import { Helmet } from "react-helmet-async";
import MomentCard from "../components/MomentCard";
import { Info } from "lucide-react";

const MAX_FLOW_TRANSFER_COUNT = 500; // Flow → Flow
const MAX_EVM_BRIDGE_COUNT = 9; // Flow → EVM

const Transfer = () => {
  /* ───────── context ───────── */
  const {
    user,
    accountData,
    selectedAccount,
    selectedNFTs,
    dispatch,
    isRefreshing,
    isLoadingChildren,
    parentAddr,
    loadAllUserData,
  } = useContext(UserDataContext);

  /* ───────── local UI state ───────── */
  const [destinationType, setDestinationType] = useState("flow"); // flow | evm
  const [recipient, setRecipient] = useState("0x"); // Flow → Flow only
  const [showModal, setShowModal] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const [txMsg, setTxMsg] = useState("");
  const [txHash, setTxHash] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);

  /* ───────── auth check ───────── */
  const isLoggedIn = Boolean(user?.loggedIn);

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <button
          onClick={() => fcl.authenticate()}
          className="w-full p-4 text-lg font-bold rounded-lg bg-opolis text-white hover:bg-opolis-dark"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  /* active account (parent or child) */
  const activeAccountData =
    accountData.childrenData?.find((c) => c.addr === selectedAccount) ||
    accountData;

  /* only NFTs owned by that account */
  const selectedNftsInAccount = selectedNFTs.filter((id) =>
    (activeAccountData.nftDetails || []).some((nft) => nft.id === id)
  );

  const maxTransferCount =
    destinationType === "evm" ? MAX_EVM_BRIDGE_COUNT : MAX_FLOW_TRANSFER_COUNT;

  const transferDisabled =
    !selectedNftsInAccount.length ||
    (destinationType === "flow" && recipient === "0x") ||
    (destinationType === "evm" &&
      selectedNftsInAccount.length > MAX_EVM_BRIDGE_COUNT) ||
    isRefreshing;

  /* ───────── button label / disabled ───────── */
  let transferButtonLabel =
    destinationType === "evm" ? "Bridge to EVM" : "Transfer to Flow Account";

  if (selectedNftsInAccount.length > maxTransferCount) {
    transferButtonLabel = `Max ${maxTransferCount} Moments`;
  }

  /* ───────── helpers ───────── */
  const closeModal = () => {
    setShowModal(false);
    setTxStatus("");
    setTxMsg("");
    setTxHash("");
  };

  const handleTransfer = async () => {
    if (transferDisabled) return;

    setShowModal(true);
    setTxStatus("pending");
    setTxMsg("Preparing transaction...");

    try {
      let tx;
      if (destinationType === "evm") {
        // Bridge to EVM
        tx = await bridgeEVM(selectedNftsInAccount);
      } else {
        // Transfer to Flow
        tx = await batchTransfer(selectedNftsInAccount, recipient);
      }

      setTxHash(tx);
      setTxStatus("success");
      setTxMsg("Transaction submitted!");

      // Refresh user data
      await loadAllUserData(parentAddr, {
        forceCollectionRefresh: true,
        forceGlobalMetaRefresh: true,
      });
    } catch (err) {
      console.error(err);
      setTxStatus("error");
      setTxMsg(err.message);
    }
  };

  const renderSelectedMoments = () => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm text-brand">Selected Moments:</h4>
        <span className="text-brand-text/70 text-sm">
          {selectedNftsInAccount.length}/
          {destinationType === "evm" ? "9" : "500"}
        </span>
      </div>
      <div className="h-[280px] overflow-y-auto pr-1">
        {selectedNftsInAccount.length ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-2 justify-items-center">
            {selectedNftsInAccount.map((id) => {
              const nft = (activeAccountData.nftDetails || []).find(
                (item) => Number(item.id) === Number(id)
              );
              return nft ? (
                <MomentCard
                  key={id}
                  nft={nft}
                  handleNFTSelection={() =>
                    dispatch({ type: "SET_SELECTED_NFTS", payload: id })
                  }
                  isSelected
                />
              ) : null;
            })}
          </div>
        ) : (
          <p className="text-sm text-brand text-center">
            No Moments selected yet.
          </p>
        )}
      </div>
    </div>
  );

  /* ───────── JSX ───────── */
  return (
    <>
      <Helmet>
        <title>Transfer | Vaultopolis</title>
      </Helmet>

      {/* 1) Top panel */}
      <div className="max-w-md mx-auto mt-2 mb-2">
        <div className="bg-brand-primary shadow-md shadow-black/30 rounded-lg p-3 min-h-[180px]">
          <label className="block mb-1 text-brand font-semibold">
            Transfer Destination:
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="flow"
                checked={destinationType === "flow"}
                onChange={() => setDestinationType("flow")}
              />
              <span className="ml-2">Cadence</span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                value="evm"
                checked={destinationType === "evm"}
                onChange={() => setDestinationType("evm")}
              />
              <span className="ml-2">Flow EVM</span>
            </label>
          </div>

          <p className="text-xs mt-1 text-gray-400">
            {destinationType === "evm"
              ? "You can bridge up to 9 Moments per transaction (gas-efficient limit)."
              : `You can transfer up to ${MAX_FLOW_TRANSFER_COUNT} Moments per transaction.`}
          </p>

          {destinationType === "flow" ? (
            <div className="mt-3">
              <label className="block mb-1 text-brand">
                Recipient Address (Cadence)
              </label>
              <input
                type="text"
                placeholder="0xRecipient"
                className="w-full p-2 rounded text-black"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          ) : (
            <div className="mt-3 bg-brand-secondary p-2 text-sm text-brand-text rounded">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p>
                    Bridging deposits your Moments into the Flow EVM COA for
                    this wallet. Max 9 per bridge.
                  </p>
                </div>
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="p-1 hover:bg-brand-primary rounded-full transition-colors"
                  aria-label="Learn more about TSHOT"
                >
                  <Info size={18} className="text-brand-text/70" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="mt-2 shadow-md shadow-black/30 rounded-lg p-0">
          <button
            onClick={handleTransfer}
            disabled={transferDisabled}
            className={`
              w-full p-4 text-lg rounded-lg font-bold transition-colors select-none
              shadow-md shadow-black/40
              ${
                transferDisabled
                  ? "cursor-not-allowed bg-brand-primary text-brand-text/50"
                  : "bg-opolis text-white hover:bg-opolis-dark"
              }
            `}
          >
            {transferButtonLabel}
          </button>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-brand-primary p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">About TSHOT</h3>
            <div className="space-y-3 text-sm">
              <p>
                TSHOT (Top Shot) is a token that represents ownership of Top
                Shot Moments on the Flow EVM network.
              </p>
              <p>When you bridge your Moments to Flow EVM:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Your Moments are deposited into the Flow EVM COA (Collection
                  of Assets)
                </li>
                <li>You receive TSHOT tokens representing your Moments</li>
                <li>You can trade these tokens on Flow EVM DEXs</li>
                <li>You can bridge back to Flow Mainnet at any time</li>
              </ul>
              <p className="text-xs text-brand-text/70 mt-4">
                Note: A maximum of 9 Moments can be bridged per transaction for
                gas efficiency.
              </p>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-6 w-full bg-opolis text-white py-2 rounded-lg hover:bg-opolis-dark transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 2) Main area */}
      <div className="w-full">
        <div className="space-y-2">
          <div className="bg-brand-primary shadow-md p-2 rounded w-full">
            {renderSelectedMoments()}
          </div>

          <div className="bg-brand-primary shadow-md px-1 py-2 rounded flex flex-wrap gap-2 w-full">
            <AccountSelection
              parentAccount={{
                addr: accountData?.parentAddress,
                ...accountData,
              }}
              childrenAddresses={accountData?.childrenAddresses}
              childrenAccounts={accountData?.childrenData}
              selectedAccount={selectedAccount}
              onSelectAccount={(addr) => {
                const isChild = accountData?.childrenAddresses?.includes(addr);
                dispatch({
                  type: "SET_SELECTED_ACCOUNT",
                  payload: {
                    address: addr,
                    type: isChild ? "child" : "parent",
                  },
                });
              }}
              onRefresh={() =>
                accountData?.parentAddress &&
                loadAllUserData(accountData?.parentAddress, {
                  forceCollectionRefresh: true,
                  forceGlobalMetaRefresh: true,
                })
              }
              isRefreshing={isRefreshing}
              isLoadingChildren={isLoadingChildren}
            />
          </div>

          <div className="bg-brand-primary shadow-md rounded-lg w-full">
            <MomentSelection />
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        show={showModal}
        onClose={closeModal}
        status={txStatus}
        message={txMsg}
        txHash={txHash}
      />
    </>
  );
};

export default Transfer;
