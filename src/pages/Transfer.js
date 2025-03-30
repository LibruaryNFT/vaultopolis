// src/components/Transfer.js

import React, { useState, useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserDataContext } from "../context/UserContext";

// Scripts for Flow -> Flow transfer
import { batchTransfer } from "../flow/batchTransfer";
import { batchTransfer_child } from "../flow/batchTransfer_child";

// Bridging script (parent-only)
import { bridgeEVM } from "../flow/bridgeEVM";

import AccountSelection from "../components/AccountSelection";
import MomentSelection from "../components/MomentSelection";
import MomentCard from "../components/MomentCard";
import TransactionModal from "../components/TransactionModal";

const MAX_TRANSFER_COUNT = 500;

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
    isRefreshing,
    isLoadingChildren,
  } = useContext(UserDataContext);

  // Destination type: "flow" or "evm"
  const [destinationType, setDestinationType] = useState("flow");
  // Recipient is only relevant for Flow->Flow
  const [recipient, setRecipient] = useState("0x");

  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});
  // Track any NFT IDs we've already transferred so we can exclude them from selection
  const [excludedNftIds, setExcludedNftIds] = useState([]);

  // Basic checks
  const isLoggedIn = Boolean(user?.loggedIn);
  const parentAddr = accountData?.parentAddress;
  const childSelected = selectedAccountType === "child";

  // If user mismatch
  if (isLoggedIn && user.addr !== parentAddr) {
    return (
      <div className="p-4 text-red-500">
        <p>
          You are logged in as <strong>{user.addr}</strong>, but the parent
          address is <strong>{parentAddr}</strong>. Please log in as the parent
          account.
        </p>
      </div>
    );
  }

  // If user not logged in
  if (!isLoggedIn) {
    return (
      <div className="p-4 text-brandGrey-light">
        <p>Please log in to transfer NFTs.</p>
      </div>
    );
  }

  // Identify the active account’s data (parent or selected child)
  const activeAccountData =
    accountData.childrenData?.find((c) => c.addr === selectedAccount) ||
    accountData;

  // Filter selected NFTs to only those from the active account
  const selectedNftsInAccount = selectedNFTs.filter((id) =>
    (activeAccountData.nftDetails || []).some(
      (nft) => Number(nft.id) === Number(id)
    )
  );

  // ===== Decide the button label & disabled logic =====
  let transferButtonLabel = "";
  const nftCount = selectedNftsInAccount.length;

  if (destinationType === "evm") {
    // Bridging
    transferButtonLabel = `Bridge ${nftCount} Moment${
      nftCount === 1 ? "" : "s"
    }`;
  } else {
    // Flow->Flow
    transferButtonLabel = `Transfer ${nftCount} Moment${
      nftCount === 1 ? "" : "s"
    }`;
  }

  let transferDisabled = false;

  // If no NFTs selected
  if (nftCount === 0) {
    transferButtonLabel = "Select Moments";
    transferDisabled = true;
  }
  // If Flow->Flow but no valid recipient
  else if (destinationType === "flow" && recipient === "0x") {
    transferButtonLabel = "Enter Recipient";
    transferDisabled = true;
  }
  // If over limit
  else if (nftCount > MAX_TRANSFER_COUNT) {
    transferButtonLabel = `Max ${MAX_TRANSFER_COUNT} allowed`;
    transferDisabled = true;
  }
  // If bridging from child
  else if (destinationType === "evm" && childSelected) {
    transferButtonLabel = "Bridging only on parent";
    transferDisabled = true;
  }

  // Close transaction modal
  const closeModal = () => {
    setShowModal(false);
    setTransactionData({});
  };

  // ===== Transfer (Flow->Flow) or Bridge (Flow->EVM) =====
  const handleTransfer = async () => {
    if (transferDisabled) return;

    let cadenceScript;
    let argsFn;
    let swapType = "BATCH_TRANSFER"; // default for flow->flow

    if (destinationType === "flow") {
      // Flow -> Flow
      cadenceScript = childSelected ? batchTransfer_child : batchTransfer;
      argsFn = childSelected
        ? (arg, t) => [
            arg(selectedAccount, t.Address), // child address
            arg(recipient, t.Address),
            arg(selectedNftsInAccount.map(String), t.Array(t.UInt64)),
          ]
        : (arg, t) => [
            arg(recipient, t.Address),
            arg(selectedNftsInAccount.map(String), t.Array(t.UInt64)),
          ];
    } else {
      // EVM bridging (parent-only)
      cadenceScript = bridgeEVM;
      // Hardcode the known type for TopShot:
      // A.0b2a3299cc857e29.TopShot.NFT
      const typeIdentifier = "A.0b2a3299cc857e29.TopShot.NFT";

      argsFn = (arg, t) => [
        arg(typeIdentifier, t.String),
        arg(selectedNftsInAccount.map(String), t.Array(t.UInt64)),
      ];
      swapType = "BRIDGE_TO_EVM";
    }

    // Show transaction modal
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
      // 1) Send transaction
      const txId = await fcl.mutate({
        cadence: cadenceScript,
        args: argsFn,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });

      // 2) Immediately reset selection
      dispatch({ type: "RESET_SELECTED_NFTS" });
      setExcludedNftIds((prev) => [
        ...prev,
        ...selectedNftsInAccount.map(String),
      ]);

      // 3) Update modal to "Pending"
      setTransactionData((prev) => ({ ...prev, status: "Pending", txId }));

      // 4) Subscribe to transaction status
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
            break;
        }
        const error = txStatus.errorMessage?.length
          ? txStatus.errorMessage
          : null;
        setTransactionData((prev) => ({ ...prev, status: newStatus, error }));
        if (txStatus.status === 4) {
          unsub();
        }
      });

      // 5) Wait for the transaction to seal
      await fcl.tx(txId).onceSealed();

      // ======== REFRESH LOGIC AFTER SEAL ========
      if (childSelected && selectedAccount) {
        // If child -> parent address
        if (recipient?.toLowerCase() === parentAddr?.toLowerCase()) {
          // Child sent to parent => refresh both
          await loadChildData(selectedAccount);
          await loadAllUserData(parentAddr, { skipChildLoad: true });
        } else {
          // Child -> random => refresh just child
          await loadChildData(selectedAccount);
        }
      } else {
        // Parent is sending => refresh parent
        await loadAllUserData(parentAddr);
      }
    } catch (err) {
      console.error("Failed to submit transfer tx:", err);
      setTransactionData((prev) => ({
        ...prev,
        status: "Error",
        error: err?.message || String(err),
      }));
    }
  };

  // Render the currently selected Moments
  const renderSelectedMoments = () => (
    <div>
      <h4 className="text-sm mb-2 text-brand">Selected Moments:</h4>
      {selectedNftsInAccount.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedNftsInAccount.map((momentId) => {
            const nft = (activeAccountData.nftDetails || []).find(
              (item) => Number(item.id) === Number(momentId)
            );
            if (!nft) return null;
            return (
              <MomentCard
                key={momentId}
                nft={nft}
                handleNFTSelection={() =>
                  dispatch({
                    type: "SET_SELECTED_NFTS",
                    payload: momentId,
                  })
                }
                isSelected
              />
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-brand">No Moments selected yet.</p>
      )}
    </div>
  );

  return (
    <>
      {/* 1) TOP PANEL (like Swap: max-w-md) */}
      <div className="max-w-md mx-auto mt-8 space-y-4">
        {/* (A) Transfer Destination Panel */}
        <div className="bg-brand-primary shadow-md shadow-black/30 rounded-lg p-4">
          <label className="block mb-2 text-brand font-semibold">
            Transfer Destination:
          </label>
          <div className="flex items-center space-x-4">
            {/* FLOW RADIO */}
            <label className="flex items-center">
              <input
                type="radio"
                value="flow"
                checked={destinationType === "flow"}
                onChange={() => setDestinationType("flow")}
              />
              <span className="ml-2">Flow Cadence</span>
            </label>

            {/* EVM RADIO (only parent) */}
            <label
              className="flex items-center"
              title="Bridging is only supported on the parent account."
            >
              <input
                type="radio"
                value="evm"
                checked={destinationType === "evm"}
                onChange={() => setDestinationType("evm")}
                disabled={childSelected}
              />
              <span className="ml-2">Flow EVM</span>
            </label>
          </div>
          <p className="text-xs mt-1 text-gray-400">
            You can transfer up to {MAX_TRANSFER_COUNT} Moments per transaction.
          </p>

          {/* If flow->flow => show recipient; else bridging explanation */}
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
                Bridging these NFTs will deposit them into your{" "}
                <strong>Flow EVM COA on Flow</strong>. No separate recipient
                address is required.
              </p>
            </div>
          )}
        </div>

        {/* (B) Transfer Button => remove BG behind it, so it fills that container */}
        <div className="shadow-md shadow-black/30 rounded-lg p-0">
          <button
            onClick={handleTransfer}
            disabled={transferDisabled}
            className={`
              w-full
              p-4
              text-lg
              rounded-lg
              font-bold
              transition-colors
              shadow-md
              shadow-black/40
              ${
                transferDisabled
                  ? /* Disabled style */
                    "cursor-not-allowed bg-brand-primary text-brand-text/50"
                  : /* Normal style */
                    "bg-flow-light text-white hover:bg-flow-dark"
              }
            `}
          >
            {transferButtonLabel}
          </button>
        </div>
      </div>

      {/* 2) MAIN AREA => w-full, same as swap => "p-4 space-y-4" */}
      <div className="w-full p-4 space-y-4">
        {/* (A) Selected Moments */}
        <div className="bg-brand-primary shadow-md p-2 rounded w-full">
          {renderSelectedMoments()}
        </div>

        {/* (B) Account Selection => inline-flex, narrower, left-aligned */}
        <div className="bg-brand-primary shadow-md p-2 rounded inline-flex flex-wrap gap-2">
          <AccountSelection
            parentAccount={{
              addr: parentAddr,
              ...accountData,
            }}
            childrenAddresses={accountData.childrenAddresses}
            childrenAccounts={accountData.childrenData}
            selectedAccount={selectedAccount}
            onSelectAccount={(addr) => {
              const isChild = accountData.childrenAddresses.includes(addr);
              dispatch({
                type: "SET_SELECTED_ACCOUNT",
                payload: {
                  address: addr,
                  type: isChild ? "child" : "parent",
                },
              });
            }}
            onRefresh={() => parentAddr && loadAllUserData(parentAddr)}
            isRefreshing={isRefreshing}
            isLoadingChildren={isLoadingChildren}
          />
        </div>

        {/* (C) Moment Selection */}
        <div className="bg-brand-primary shadow-md p-2 rounded-lg w-full">
          <MomentSelection allowAllTiers excludeIds={excludedNftIds} />
        </div>
      </div>

      {/* Transaction Modal */}
      {showModal && transactionData?.status && (
        <TransactionModal {...transactionData} onClose={closeModal} />
      )}
    </>
  );
};

export default Transfer;
