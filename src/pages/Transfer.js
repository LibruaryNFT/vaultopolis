// src/components/Transfer.js
import React, { useState, useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";

// Your two transaction scripts
import { batchTransfer } from "../flow/batchTransfer";
import { batchTransfer_child } from "../flow/batchTransfer_child";

import AccountSelection from "../components/AccountSelection";
import MomentSelection from "../components/MomentSelection";
import MomentCard from "../components/MomentCard";
import TransactionModal from "../components/TransactionModal";

const MAX_TRANSFER_COUNT = 500; // Limit to 500 Moments at once

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
  } = useContext(UserContext);

  const [recipient, setRecipient] = useState("0x");
  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  // For excluding NFTs so we don't see them reappear in the selection mid-transaction
  const [excludedNftIds, setExcludedNftIds] = useState([]);

  const isLoggedIn = Boolean(user?.loggedIn);
  const parentAddr = accountData?.parentAddress;
  const childSelected = selectedAccountType === "child";

  // ---------------------------------------------------------------------
  // 1) Ensure the parent is actually logged in. If not, show an error.
  // ---------------------------------------------------------------------
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

  const closeModal = () => {
    setShowModal(false);
    setTransactionData({});
  };

  const handleTransfer = async () => {
    setErrorMessage("");

    // Basic validations
    if (selectedNFTs.length === 0) {
      setErrorMessage("Please select at least one Moment to transfer.");
      return;
    }
    if (selectedNFTs.length > MAX_TRANSFER_COUNT) {
      setErrorMessage(
        `You cannot transfer more than ${MAX_TRANSFER_COUNT} Moments at once.`
      );
      return;
    }
    if (!recipient.startsWith("0x")) {
      setErrorMessage("Recipient address must start with 0x.");
      return;
    }
    if (!isLoggedIn) {
      setErrorMessage("You must log in as the parent account first.");
      return;
    }

    // ---------------------------------------------------------------------
    // 2) Choose which script to run, based on parent vs child
    //    BUT the parent is always the FCL signer (fcl.authz).
    // ---------------------------------------------------------------------
    const cadenceScript = childSelected ? batchTransfer_child : batchTransfer;

    // Show transaction modal in "Awaiting Approval"
    setShowModal(true);
    setTransactionData({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      nftCount: selectedNFTs.length,
      swapType: "BATCH_TRANSFER",
      transactionAction: "BATCH_TRANSFER",
    });

    try {
      // Build transaction arguments:
      const args = childSelected
        ? (arg, t) => [
            arg(selectedAccount, t.Address), // the child's address as "source"
            arg(recipient, t.Address),
            arg(selectedNFTs.map(String), t.Array(t.UInt64)),
          ]
        : (arg, t) => [
            arg(recipient, t.Address),
            arg(selectedNFTs.map(String), t.Array(t.UInt64)),
          ];

      // ---------------------------------------------------------------------
      // 3) Use the parent to sign, same as TSHOTToNFTPanel does
      //    (fcl.authz => the currently logged-in account => the parent).
      // ---------------------------------------------------------------------
      const txId = await fcl.mutate({
        cadence: cadenceScript,
        args,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz], // only the parent
        limit: 9999,
      });

      // Immediately reset selection to avoid confusion
      dispatch({ type: "RESET_SELECTED_NFTS" });
      setExcludedNftIds((prev) => [...prev, ...selectedNFTs.map(String)]);

      // Update modal to "Pending"
      setTransactionData((prev) => ({ ...prev, status: "Pending", txId }));

      // Subscribe to transaction status
      const unsub = fcl.tx(txId).subscribe((txStatus) => {
        let newStatus = "Processing transaction...";
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

      // Wait for seal
      await fcl.tx(txId).onceSealed();

      // ---------------------------------------------------------------------
      // 4) Refresh parent's data. If child transfer, also refresh child.
      // ---------------------------------------------------------------------
      if (parentAddr) {
        await loadAllUserData(parentAddr);
      }
      if (childSelected && selectedAccount) {
        await loadChildData(selectedAccount);
      }
    } catch (err) {
      console.error("Failed to submit transfer tx:", err);
      setTransactionData((prev) => ({
        ...prev,
        status: "Error",
        error: err?.message || String(err),
      }));
      setErrorMessage(err?.message ?? String(err));
    }
  };

  // If user not logged in at all
  if (!isLoggedIn) {
    return (
      <div className="p-4 text-gray-300">
        <p>Please log in to transfer NFTs.</p>
      </div>
    );
  }

  // Active account’s data (could be parent or the currently selected child)
  const activeAccountData =
    accountData.childrenData?.find((c) => c.addr === selectedAccount) ||
    accountData;

  // Filter selected NFTs so we only show the ones from whichever account is active
  const selectedNftsInAccount = selectedNFTs.filter((id) =>
    (activeAccountData.nftDetails || []).some(
      (nft) => Number(nft.id) === Number(id)
    )
  );

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-white">Transfer</h2>
      <p className="text-gray-300">
        Select an account (parent or child) for NFTs, choose Moments, and
        transfer to another address. The parent account (logged in) will sign
        every time.
      </p>

      {/* Account Selection */}
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

      {/* Selected NFTs section */}
      {selectedNftsInAccount.length > 0 && (
        <div className="bg-gray-600 p-2 rounded">
          <h4 className="text-white text-sm mb-2">Selected Moments:</h4>
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
                  isSelected={true}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of all Moments (excluding any we just transferred) */}
      <MomentSelection allowAllTiers excludeIds={excludedNftIds} />

      {/* Error message if any */}
      {errorMessage && (
        <div className="text-red-500 bg-red-100 p-2 rounded">
          {errorMessage}
        </div>
      )}

      {/* Recipient Address */}
      <div>
        <label className="block text-white mb-1">Recipient Address</label>
        <input
          type="text"
          placeholder="0xRecipient"
          className="w-full p-2 rounded text-black"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </div>

      {/* Transfer Button */}
      <button
        onClick={handleTransfer}
        className={`w-full p-4 text-lg rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 mt-2 ${
          selectedNFTs.length === 0 || selectedNFTs.length > MAX_TRANSFER_COUNT
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
        disabled={
          selectedNFTs.length === 0 || selectedNFTs.length > MAX_TRANSFER_COUNT
        }
      >
        Transfer Selected NFTs
      </button>

      {/* Transaction Modal */}
      {showModal && transactionData?.status && (
        <TransactionModal {...transactionData} onClose={closeModal} />
      )}
    </div>
  );
};

export default Transfer;
