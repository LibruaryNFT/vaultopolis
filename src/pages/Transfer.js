// src/components/Transfer.js
import React, { useState, useContext } from "react";
import * as fcl from "@onflow/fcl";
// IMPORTANT: Accessing these from UserContext as confirmed by your UserContext.js code
import { UserDataContext } from "../context/UserContext";
import { batchTransfer } from "../flow/batchTransfer";
import { batchTransfer_child } from "../flow/batchTransfer_child";
import { bridgeEVM } from "../flow/bridgeEVM";
import { bridgeEVM_child } from "../flow/bridgeEVM_child"; // <--- RESTORED: This import is now back

import AccountSelection from "../components/AccountSelection";
import MomentSelection from "../components/MomentSelection";
import TransactionModal from "../components/TransactionModal";
import { Helmet } from "react-helmet-async";
import MomentCard from "../components/MomentCard";
import { Info } from "lucide-react"; // Re-add for info modal
import Button from "../components/Button";

const MAX_FLOW_TRANSFER_COUNT = 280; // Flow → Flow
const MAX_EVM_BRIDGE_COUNT = 9; // Flow → EVM

const Transfer = () => {
  /* ───────── context ───────── */
  const {
    user,
    accountData, // Contains parent data and childrenData
    selectedAccount, // The currently selected account's address in the AccountSelection UI
    selectedAccountType, // NOW USING THIS from UserContext
    selectedNFTs, // The IDs of NFTs globally selected for transfer
    dispatch, // For dispatching actions to UserContext
    isRefreshing, // Global refresh status from UserContext
    isLoadingChildren, // Global child loading status from UserContext
    parentAddr, // The main authenticated user's address (parent account)
    loadAllUserData, // Function to refresh ALL user data in UserContext
    loadChildData, // NOW USING THIS from UserContext (confirmed existing)
    smartRefreshUserData, // NOW USING THIS from UserContext (confirmed existing)
  } = useContext(UserDataContext);

  /* ───────── local UI state ───────── */
  const [destinationType, setDestinationType] = useState("flow"); // flow | evm
  const [recipient, setRecipient] = useState("0x"); // Flow → Flow only
  const [showModal, setShowModal] = useState(false);
  const [txStatus, setTxStatus] = useState(""); // Status for TransactionModal
  const [txMsg, setTxMsg] = useState(""); // Message for TransactionModal
  const [txHash, setTxHash] = useState(""); // Transaction hash for TransactionModal
  const [showInfoModal, setShowInfoModal] = useState(false); // For the EVM bridge info modal
  const [excludedNftIds, setExcludedNftIds] = useState([]); // IDs of NFTs successfully sent, to hide immediately
  const [txInitiatedNftCount, setTxInitiatedNftCount] = useState(0); // Store count for TransactionModal's nftCount prop

  /* ───────── auth check ───────── */
  const isLoggedIn = Boolean(user?.loggedIn);

  if (!isLoggedIn) {
    return (
      <div className="w-full max-w-md mx-auto mt-8">
        <button
          onClick={() => fcl.authenticate()}
          className="w-full p-4 text-lg font-bold rounded-lg bg-opolis text-white hover:bg-opolis-dark"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // Use `selectedAccountType` from context directly.
  const isSelectedAccountChild = selectedAccountType === "child";

  /* Get the data for the actively selected account (parent or a specific child) */
  const activeAccountData =
    accountData.childrenData?.find((c) => c.addr === selectedAccount) ||
    accountData;

  /* Filter selected NFTs to only include those owned by the active account
     and not already marked as excluded (i.e., successfully transacted) */
  const selectedNftsInAccount = selectedNFTs.filter((id) =>
    (activeAccountData.nftDetails || []).some(
      (nft) =>
        Number(nft.id) === Number(id) && !excludedNftIds.includes(String(id))
    )
  );

  const currentSelectionCount = selectedNftsInAccount.length;
  const maxTransferCount =
    destinationType === "evm" ? MAX_EVM_BRIDGE_COUNT : MAX_FLOW_TRANSFER_COUNT;

  const transferDisabled =
    currentSelectionCount === 0 ||
    (destinationType === "flow" && recipient === "0x") ||
    (destinationType === "evm" &&
      currentSelectionCount > MAX_EVM_BRIDGE_COUNT) ||
    isRefreshing;

  /* ───────── button label / disabled state ───────── */
  let transferButtonLabel =
    destinationType === "evm"
      ? "Bridge to Flow EVM"
      : "Transfer to Cadence Address";

  if (currentSelectionCount === 0) {
    transferButtonLabel = "Select Moments";
  } else if (destinationType === "flow" && recipient === "0x") {
    transferButtonLabel = "Enter Recipient";
  } else if (currentSelectionCount > maxTransferCount) {
    transferButtonLabel = `Max ${maxTransferCount} NFTs`;
  }

  /* ───────── helpers ───────── */
  const closeModal = () => {
    setShowModal(false);
    setTxStatus("");
    setTxMsg("");
    setTxHash("");
    setExcludedNftIds([]); // Clear exclusions when modal closes (user has seen the outcome)
    setTxInitiatedNftCount(0); // Reset for next transaction
  };

  const handleTransfer = async () => {
    if (transferDisabled) return;

    setTxInitiatedNftCount(currentSelectionCount);
    setShowModal(true);
    setTxStatus("Pending");
    setTxMsg("Preparing transaction...");

    const originalSelectedAccount = selectedAccount;
    const originalSelectedAccountType = selectedAccountType;

    try {
      let tx;
      if (destinationType === "evm") {
        if (isSelectedAccountChild) {
          // Child EVM bridge: using bridgeEVM_child, as per your reference code
          tx = await fcl.mutate({
            cadence: bridgeEVM_child, // <--- Using bridgeEVM_child
            args: (arg, t) => [
              arg(selectedAccount, t.Address), // Child's address
              arg("A.0b2a3299cc857e29.TopShot.NFT", t.String),
              arg(selectedNftsInAccount, t.Array(t.UInt64)),
            ],
            proposer: fcl.authz,
            payer: fcl.authz,
            authorizations: [fcl.authz],
            limit: 9999,
          });
        } else {
          // Parent EVM bridge
          tx = await fcl.mutate({
            cadence: bridgeEVM,
            args: (arg, t) => [
              arg("A.0b2a3299cc857e29.TopShot.NFT", t.String),
              arg(selectedNftsInAccount, t.Array(t.UInt64)),
            ],
            proposer: fcl.authz,
            payer: fcl.authz,
            authorizations: [fcl.authz],
            limit: 9999,
          });
        }
      } else {
        // destinationType === "flow" (Cadence transfer)
        if (isSelectedAccountChild) {
          tx = await fcl.mutate({
            cadence: batchTransfer_child,
            args: (arg, t) => [
              arg(selectedAccount, t.Address),
              arg(recipient, t.Address),
              arg(selectedNftsInAccount, t.Array(t.UInt64)),
            ],
            proposer: fcl.authz,
            payer: fcl.authz,
            authorizations: [fcl.authz],
            limit: 9999,
          });
        } else {
          tx = await fcl.mutate({
            cadence: batchTransfer,
            args: (arg, t) => [
              arg(recipient, t.Address),
              arg(selectedNftsInAccount, t.Array(t.UInt64)),
            ],
            proposer: fcl.authz,
            payer: fcl.authz,
            authorizations: [fcl.authz],
            limit: 9999,
          });
        }
      }

      setTxHash(tx);
      setTxStatus("Pending");
      setTxMsg(
        destinationType === "evm"
          ? "Bridging Moments..."
          : "Transferring Moments..."
      );

      let stuckTimerId = null;
      const startStuckTimer = (label) => {
        if (stuckTimerId) return;
        stuckTimerId = setTimeout(() => {
          console.warn("[Transfer] Tx appears stuck after 20s", {
            txId: tx,
            lastStatus: label,
            at: new Date().toISOString(),
            destinationType,
            selectedCount: selectedNftsInAccount.length,
          });
        }, 20_000);
      };
      const clearStuckTimer = () => {
        if (stuckTimerId) {
          clearTimeout(stuckTimerId);
          stuckTimerId = null;
        }
      };

      startStuckTimer("Pending");

      const unsub = fcl.tx(tx).subscribe((txStatusUpdate) => {
        let newStatus = "Processing...";
        switch (txStatusUpdate.statusString) {
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
            newStatus = txStatusUpdate.statusString || "Processing...";
            break;
        }

        setTxStatus(newStatus);
        if (newStatus === "Sealed") {
          clearStuckTimer();
        } else {
          clearStuckTimer();
          startStuckTimer(newStatus);
        }
        if (txStatusUpdate.errorMessage?.length) {
          setTxMsg(txStatusUpdate.errorMessage);
        } else if (newStatus === "Sealed") {
          setTxMsg(
            destinationType === "evm"
              ? "Bridged Moments"
              : "Transferred Moments"
          );
        }

        if (txStatusUpdate.status === 4) {
          if (!txStatusUpdate.errorMessage) {
            setExcludedNftIds((prev) => [
              ...prev,
              ...selectedNftsInAccount.map(String),
            ]);
          }
          clearStuckTimer();
          unsub();
        }
      });

      const sealedTx = await fcl.tx(tx).onceSealed();

      if (sealedTx.errorMessage) {
        throw new Error(sealedTx.errorMessage);
      }

      console.log("[Transfer] Transaction sealed. Triggering data refresh. 🧾");

      // Apply the nuanced refresh logic, directly mirroring NFTToTSHOTPanel's successful approach:
      if (isSelectedAccountChild) {
        // SCENARIO: Child account initiated the transfer (e.g., child to parent, or child to another address)
        console.log(
          `[Transfer] Child account (${originalSelectedAccount}) operation. Refreshing its data and parent's balances/snapshot.`
        );

        // 1. Refresh the parent's data. This will update its balances and collection snapshot.
        // This is crucial if parent received moments from child.
        await loadAllUserData(parentAddr, {
          skipChildLoad: true, // Optimization: Don't re-fetch all children during this parent refresh.
          forceCollectionRefresh: true, // Ensure parent's collection is re-scanned for incoming NFTs.
          forceGlobalMetaRefresh: false,
        });

        // 2. Explicitly refresh the child account that just sent NFTs. Its collection definitely changed.
        await loadChildData(originalSelectedAccount, {
          forceCollectionRefresh: true, // Force this child's collection to rebuild.
          forceGlobalMetaRefresh: false,
        });

        // 3. SPECIAL CASE: If the recipient was the parent itself, ensure the parent's data (especially collection)
        // is fully updated after receiving moments. This guards against edge cases where the initial
        // loadAllUserData didn't immediately reflect newly received NFTs.
        if (
          destinationType === "flow" &&
          recipient?.toLowerCase() === parentAddr?.toLowerCase()
        ) {
          console.log(
            `[Transfer] Child transferred to parent (${parentAddr}). Re-ensuring parent's full data is latest.`
          );
          await loadAllUserData(parentAddr, {
            forceCollectionRefresh: true, // Force re-check parent's collection for newly received items
            forceGlobalMetaRefresh: false,
            skipChildLoad: true, // Again, skip children as we just loaded the relevant one.
          });
        }
      } else {
        // SCENARIO: Parent account initiated the transfer (always use smartRefreshUserData)
        console.log(
          `[Transfer] Parent account (${parentAddr}) operation. Calling smartRefreshUserData.`
        );
        await smartRefreshUserData(); // This refreshes parent's data and all its children by default
      }

      // After data is (hopefully) refreshed in context, clear selected NFTs globally
      dispatch({ type: "RESET_SELECTED_NFTS" });

      // Explicitly restore the original selected account in the UI.
      dispatch({
        type: "SET_SELECTED_ACCOUNT",
        payload: {
          address: originalSelectedAccount,
          type: originalSelectedAccountType,
        },
      });

      if (destinationType === "flow") {
        setRecipient("0x");
      }
    } catch (err) {
      console.error("Transfer transaction failed:", err);
      setTxStatus("Error");
      setTxMsg(err.message || "Transaction failed.");
      setExcludedNftIds([]);
      setTxInitiatedNftCount(0);
      dispatch({ type: "RESET_SELECTED_NFTS" });
    }
  };

  const renderSelectedMoments = () => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm text-brand">Selected Moments:</h4>
        <span className="text-brand-text/70 text-sm">
          {currentSelectionCount}/
          {destinationType === "evm"
            ? MAX_EVM_BRIDGE_COUNT
            : MAX_FLOW_TRANSFER_COUNT}
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
        <title>Vaultopolis - Transfer</title>
        <meta name="description" content="Transfer multiple NBA Top Shot Moments between Flow accounts or bridge to Flow EVM. Bulk transfer functionality for efficient NFT management and cross-chain bridging." />
        <meta name="keywords" content="bulk transfer, nba top shot transfer, flow nft transfer, evm bridge, flow blockchain transfer, nft bridge, cross-chain transfer" />
        <link rel="canonical" href="https://vaultopolis.com/transfer" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Bulk Transfer NBA Top Shot Moments | Vaultopolis" />
        <meta property="og:description" content="Transfer multiple NBA Top Shot Moments between Flow accounts or bridge to Flow EVM. Efficient bulk transfer functionality." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/transfer" />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Bulk Transfer NBA Top Shot Moments" />
        <meta name="twitter:description" content="Transfer multiple NBA Top Shot Moments between Flow accounts or bridge to Flow EVM." />
        
        {/* Structured Data for Service */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Bulk Transfer Service",
            "description": "Transfer multiple NBA Top Shot Moments between Flow accounts or bridge to Flow EVM",
            "provider": {
              "@type": "Organization",
              "name": "Vaultopolis"
            },
            "serviceType": "NFT Transfer Service"
          })}
        </script>
      </Helmet>

      {/* Page Header with Description */}
      <div className="bg-brand-primary p-4 sm:p-6 rounded-lg mb-4">
        <div className="max-w-6xl mx-auto mx-2 sm:mx-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text mb-4">
            Bulk Transfer Tool
          </h1>
          <div className="space-y-3">
            <p className="text-base sm:text-lg text-brand-text/90 leading-relaxed">
              Transfer multiple NBA Top Shot Moments between Flow accounts or bridge them to Flow EVM. 
              This tool allows you to efficiently move large batches of digital collectibles in a single transaction, 
              saving time and transaction fees compared to transferring individually.
            </p>
            <div className="bg-brand-secondary/50 border border-brand-border rounded-lg p-3 sm:p-4">
              <p className="text-sm sm:text-base text-brand-text/80 font-semibold mb-2">
                Transfer Options:
              </p>
              <ul className="text-sm text-brand-text/70 space-y-1.5 list-disc list-inside">
                <li><strong>Bulk Transfer:</strong> Transfer up to 280 Moments between Flow accounts (Cadence addresses)</li>
                <li><strong>EVM Bridge:</strong> Bridge up to 9 Moments from Flow to Flow EVM for use in EVM-compatible applications</li>
              </ul>
            </div>
            <p className="text-sm text-brand-text/70">
              <strong>Note:</strong> Locked moments are automatically excluded from transfers. Only unlocked moments can be transferred.
            </p>
          </div>
        </div>
      </div>

      {/* 1) Top panel */}
      <div className="w-full max-w-md mx-auto mt-2 mb-2">
        <div className="bg-brand-primary shadow-md shadow-black/30 rounded-lg p-3 min-h-[180px]">
          <label className="block mb-1 text-brand font-semibold">
            Select Tool:
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="flow"
                checked={destinationType === "flow"}
                onChange={() => {
                  setDestinationType("flow");
                  setExcludedNftIds([]);
                  dispatch({ type: "RESET_SELECTED_NFTS" });
                  setRecipient("0x");
                }}
              />
              <span className="ml-2">Bulk Transfer</span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                value="evm"
                checked={destinationType === "evm"}
                onChange={() => {
                  setDestinationType("evm");
                  setExcludedNftIds([]);
                  dispatch({ type: "RESET_SELECTED_NFTS" });
                  setRecipient("0x");
                }}
              />
              <span className="ml-2">EVM Bridge</span>
            </label>
          </div>

          <p className="text-xs mt-1 text-gray-400">
            {destinationType === "evm"
              ? `You can bridge up to ${MAX_EVM_BRIDGE_COUNT} Moments per transaction.`
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
                    this wallet.
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
        <div className="mt-2">
          <Button
            onClick={handleTransfer}
            disabled={transferDisabled}
            variant={transferDisabled ? "secondary" : "opolis"}
            size="lg"
            className="w-full"
          >
            {transferButtonLabel}
          </Button>
        </div>
      </div>

      {/* Info Modal - only show for EVM bridge, now correctly linked */}
      {showInfoModal && destinationType === "evm" && (
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
                Note: A maximum of {MAX_EVM_BRIDGE_COUNT} Moments can be bridged
                per transaction for gas efficiency.
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
                hasCollection: accountData?.hasCollection,
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
                dispatch({ type: "RESET_SELECTED_NFTS" });
                setExcludedNftIds([]);
              }}
              onRefresh={() =>
                parentAddr &&
                loadAllUserData(parentAddr, {
                  forceCollectionRefresh: true,
                  forceGlobalMetaRefresh: true,
                })
              }
              isRefreshing={isRefreshing}
              isLoadingChildren={isLoadingChildren}
            />
          </div>

          <div className="bg-brand-primary shadow-md rounded-lg w-full">
            <MomentSelection
              allowAllTiers={true}
              restrictToCommonFandom={false}
              excludeIds={excludedNftIds}
              forceSortOrder="highest-serial"
              showLockedMoments={false}
            />
          </div>
        </div>
      </div>

      <TransactionModal
        show={showModal}
        onClose={closeModal}
        status={txStatus}
        message={txMsg}
        txId={txHash}
        nftCount={txInitiatedNftCount}
        swapType={
          destinationType === "evm" ? "BRIDGE_TO_EVM" : "BATCH_TRANSFER"
        }
        transactionAction="BATCH_TRANSFER"
        recipient={recipient}
      />
    </>
  );
};

export default Transfer;
