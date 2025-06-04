// src/components/Transfer.js
import React, { useState, useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserDataContext } from "../context/UserContext"; // Ensure smartRefreshUserData is exported and imported if used

import { batchTransfer } from "../flow/batchTransfer";
import { batchTransfer_child } from "../flow/batchTransfer_child";
import { bridgeEVM } from "../flow/bridgeEVM";
import { bridgeEVM_child } from "../flow/bridgeEVM_child";

import AccountSelection from "../components/AccountSelection";
import MomentSelection from "../components/MomentSelection";
import MomentCard from "../components/MomentCard";
import TransactionModal from "../components/TransactionModal";
import { Helmet } from "react-helmet-async";

const MAX_FLOW_TRANSFER_COUNT = 500; // Flow → Flow
const MAX_EVM_BRIDGE_COUNT = 12; // Flow → EVM

const Transfer = () => {
  const {
    user,
    accountData,
    selectedAccount,
    selectedAccountType,
    selectedNFTs,
    dispatch,
    loadAllUserData,
    loadChildData,
    smartRefreshUserData, // Make sure this is available from UserDataContext
    isRefreshing,
    isLoadingChildren,
  } = useContext(UserDataContext);

  /* ───────── local UI state ───────── */
  const [destinationType, setDestinationType] = useState("flow"); // flow | evm
  const [recipient, setRecipient] = useState("0x"); // Flow → Flow only
  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});
  const [excludedNftIds, setExcludedNftIds] = useState([]);

  /* ───────── auth check ───────── */
  const isLoggedIn = Boolean(user?.loggedIn);
  const parentAddr = accountData?.parentAddress;
  const childSelected = selectedAccountType === "child";

  if (!isLoggedIn) {
    return (
      <div className="p-4 text-brandGrey-light">
        <p>Please log in to transfer NFTs.</p>
      </div>
    );
  }

  /* active account (parent or child) */
  const activeAccountData =
    accountData.childrenData?.find((c) => c.addr === selectedAccount) ||
    accountData;

  /* only NFTs owned by that account */
  const selectedNftsInAccount = selectedNFTs.filter((id) =>
    (activeAccountData.nftDetails || []).some(
      (nft) => Number(nft.id) === Number(id)
    )
  );

  const nftCount = selectedNftsInAccount.length;
  const maxAllowed =
    destinationType === "evm" ? MAX_EVM_BRIDGE_COUNT : MAX_FLOW_TRANSFER_COUNT;

  /* ───────── button label / disabled ───────── */
  let transferButtonLabel =
    destinationType === "evm"
      ? `Bridge ${nftCount} Moment${nftCount === 1 ? "" : "s"}`
      : `Transfer ${nftCount} Moment${nftCount === 1 ? "" : "s"}`;

  let transferDisabled = false;
  if (nftCount === 0) {
    transferButtonLabel = "Select Moments";
    transferDisabled = true;
  } else if (destinationType === "flow" && recipient === "0x") {
    transferButtonLabel = "Enter Recipient";
    transferDisabled = true;
  } else if (nftCount > maxAllowed) {
    transferButtonLabel = `Max ${maxAllowed} allowed`;
    transferDisabled = true;
  }

  /* ───────── helpers ───────── */
  const closeModal = () => {
    setShowModal(false);
    setTransactionData({});
  };

  const handleTransfer = async () => {
    if (transferDisabled) return;

    let cadenceScript, argsFn;
    let swapType = "BATCH_TRANSFER";

    if (destinationType === "flow") {
      cadenceScript = childSelected ? batchTransfer_child : batchTransfer;
      argsFn = childSelected
        ? (arg, t) => [
            arg(selectedAccount, t.Address),
            arg(recipient, t.Address),
            arg(selectedNftsInAccount.map(String), t.Array(t.UInt64)),
          ]
        : (arg, t) => [
            arg(recipient, t.Address),
            arg(selectedNftsInAccount.map(String), t.Array(t.UInt64)),
          ];
    } else {
      const typeIdentifier = "A.0b2a3299cc857e29.TopShot.NFT";
      if (childSelected) {
        cadenceScript = bridgeEVM_child;
        argsFn = (arg, t) => [
          arg(selectedAccount, t.Address),
          arg(typeIdentifier, t.String),
          arg(selectedNftsInAccount.map(String), t.Array(t.UInt64)),
        ];
      } else {
        cadenceScript = bridgeEVM;
        argsFn = (arg, t) => [
          arg(typeIdentifier, t.String),
          arg(selectedNftsInAccount.map(String), t.Array(t.UInt64)),
        ];
      }
      swapType = "BRIDGE_TO_EVM";
    }

    setShowModal(true);
    setTransactionData({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      nftCount,
      swapType,
      transactionAction: "BATCH_TRANSFER",
      recipient: destinationType === "flow" ? recipient : null,
    });

    try {
      const txId = await fcl.mutate({
        cadence: cadenceScript,
        args: argsFn,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });

      setTransactionData((prev) => ({ ...prev, status: "Pending", txId }));

      const unsub = fcl.tx(txId).subscribe((txStatus) => {
        let newStatus = "Processing...";
        switch (txStatus.statusString) {
          case "PENDING":
            newStatus = "Pending";
            break;
          case "FINALIZED":
            newStatus = "Finalized";
            break;
          case "EXECUTED":
            newStatus = "Executed";
            break;
          case "SEALED":
            newStatus = "Sealed";
            break;
          default:
            newStatus = txStatus.statusString || "Processing...";
            break;
        }

        const error = txStatus.errorMessage?.length
          ? txStatus.errorMessage
          : null;

        setTransactionData((prev) => ({ ...prev, status: newStatus, error }));

        if (txStatus.status === 4) {
          // Sealed
          if (error == null) {
            dispatch({ type: "RESET_SELECTED_NFTS" });
            setExcludedNftIds((prev) => [
              ...prev,
              ...selectedNftsInAccount.map(String),
            ]);
          }
          unsub();
        }
      });

      await fcl.tx(txId).onceSealed();
      console.log("[Transfer] Transaction sealed. Triggering data refresh. 🧾");

      // --- BEGIN MODIFIED REFRESH LOGIC ---
      const refreshOptions = {
        forceCollectionRefresh: true,
        forceGlobalMetaRefresh: false,
      };

      if (childSelected && selectedAccount) {
        // Case 1: A child account performed the transfer/bridge.
        console.log(
          `[Transfer] Child account ${selectedAccount} operation. Refreshing its data...`
        );
        await loadChildData(selectedAccount, refreshOptions); // Child's NFT list changed.

        if (
          destinationType === "flow" &&
          recipient?.toLowerCase() === parentAddr?.toLowerCase()
        ) {
          // Case 1a: Child transferred NFTs to its parent. Parent's NFT list also changed.
          console.log(
            `[Transfer] Child transferred to parent ${parentAddr}. Refreshing parent's data (collection only)...`
          );
          await loadAllUserData(parentAddr, {
            ...refreshOptions,
            skipChildLoad: true,
          });
        }
      } else if (parentAddr && user?.addr === parentAddr) {
        // Case 2: The parent account (current logged-in user) transferred/bridged NFTs.
        console.log(
          `[Transfer] Parent account ${parentAddr} (current user) operation. Calling smartRefreshUserData...`
        );
        if (smartRefreshUserData) {
          // Ensure smartRefreshUserData is available
          await smartRefreshUserData();
        } else {
          console.warn(
            "[Transfer] smartRefreshUserData not available, using loadAllUserData as fallback."
          );
          await loadAllUserData(parentAddr, refreshOptions); // Fallback if smartRefreshUserData is not on context
        }
      } else if (parentAddr) {
        // Case 2b: Fallback if parentAddr is set but isn't the current logged-in user (less common for this component's flow).
        console.log(
          `[Transfer] Parent account ${parentAddr} operation (contextual parent). Refreshing its data fully...`
        );
        await loadAllUserData(parentAddr, refreshOptions);
      } else {
        console.warn(
          "[Transfer] Could not determine account for refresh. User logged in:",
          isLoggedIn,
          "Selected Account:",
          selectedAccount,
          "Parent Addr:",
          parentAddr
        );
      }
      // --- END MODIFIED REFRESH LOGIC ---
    } catch (err) {
      console.error("transfer tx failed:", err);
      setTransactionData((prev) => ({
        ...prev,
        status: "Error",
        error: err?.message || String(err),
      }));
    }
  };

  const renderSelectedMoments = () => (
    <div>
      <h4 className="text-sm mb-2 text-brand">Selected Moments:</h4>
      {selectedNftsInAccount.length ? (
        <div className="flex flex-wrap gap-2">
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
        <p className="text-sm text-brand">No Moments selected yet.</p>
      )}
    </div>
  );

  /* ───────── JSX ───────── */
  return (
    <>
      <Helmet>
        <title>Bulk NFT Transfer & Bridge | Vaultopolis</title>
        <meta
          name="description"
          content="Bulk-transfer NBA Top Shot Moments between Flow wallets or bridge up to 12 at a time to Flow EVM."
        />
        <link rel="canonical" href="https://vaultopolis.com/transfer" />
      </Helmet>

      <h1 className="sr-only">
        Bulk NFT Transfer and Flow EVM Bridge for Top Shot Moments
      </h1>

      {/* 1) Top panel */}
      <div className="max-w-md mx-auto mt-8 space-y-4">
        <div className="bg-brand-primary shadow-md shadow-black/30 rounded-lg p-4">
          <label className="block mb-2 text-brand font-semibold">
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
              <span className="ml-2">Flow Cadence</span>
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
              ? `You can bridge up to ${MAX_EVM_BRIDGE_COUNT} Moments per transaction (gas-efficient limit).`
              : `You can transfer up to ${MAX_FLOW_TRANSFER_COUNT} Moments per transaction.`}
          </p>

          {destinationType === "flow" ? (
            <div className="mt-4">
              <label className="block mb-1 text-brand">
                Recipient Address (Flow)
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
            <div className="mt-4 bg-brand-secondary p-2 text-sm text-brand-text rounded">
              <p>
                Bridging deposits your Moments into the{" "}
                <strong>Flow EVM COA</strong> for this wallet.&nbsp;
                <em>Max {MAX_EVM_BRIDGE_COUNT} per bridge</em>.
              </p>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="shadow-md shadow-black/30 rounded-lg p-0">
          <button
            onClick={handleTransfer}
            disabled={transferDisabled}
            className={`
              w-full p-4 text-lg rounded-lg font-bold transition-colors
              shadow-md shadow-black/40
              ${
                transferDisabled
                  ? "cursor-not-allowed bg-brand-primary text-brand-text/50"
                  : "bg-flow-light text-white hover:bg-flow-dark"
              }
            `}
          >
            {transferButtonLabel}
          </button>
        </div>
      </div>

      {/* 2) Main area */}
      <div className="w-full p-4 space-y-4">
        <div className="bg-brand-primary shadow-md p-2 rounded w-full h-64 overflow-y-auto">
          {renderSelectedMoments()}
        </div>

        <div className="bg-brand-primary shadow-md p-2 rounded inline-flex flex-wrap gap-2">
          <AccountSelection
            parentAccount={{ addr: parentAddr, ...accountData }}
            childrenAddresses={accountData.childrenAddresses}
            childrenAccounts={accountData.childrenData}
            selectedAccount={selectedAccount}
            onSelectAccount={(addr) => {
              const isChild = accountData.childrenAddresses.includes(addr);
              dispatch({
                type: "SET_SELECTED_ACCOUNT",
                payload: { address: addr, type: isChild ? "child" : "parent" },
              });
            }}
            onRefresh={() =>
              parentAddr &&
              loadAllUserData(parentAddr, {
                forceCollectionRefresh: true,
                forceGlobalMetaRefresh: true,
              })
            } // Added force options to manual refresh
            isRefreshing={isRefreshing}
            isLoadingChildren={isLoadingChildren}
          />
        </div>

        <div className="bg-brand-primary shadow-md p-2 rounded-lg w-full">
          <MomentSelection allowAllTiers excludeIds={excludedNftIds} />
        </div>
      </div>

      {showModal && transactionData.status && (
        <TransactionModal {...transactionData} onClose={closeModal} />
      )}
    </>
  );
};

export default Transfer;
