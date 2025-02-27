// src/components/Transfer.js
import React, { useState, useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";
import { batchTransfer } from "../flow/batchTransfer";
import { batchTransfer_child } from "../flow/batchTransfer_child";
import AccountSelection from "./AccountSelection";
import MomentSelection from "./MomentSelection";
import MomentCard from "./MomentCard";
import TransactionModal from "./TransactionModal";

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

  // NEW: Keep track of NFT IDs that we want to exclude from MomentSelection
  const [excludedNftIds, setExcludedNftIds] = useState([]);

  const isLoggedIn = Boolean(user?.loggedIn);
  const parentAddr = accountData.parentAddress;
  const childSelected = selectedAccountType === "child";

  // If logged in but addresses don't match => invalid
  if (isLoggedIn && user.addr !== parentAddr) {
    return (
      <div className="p-4 text-red-500">
        <p>
          You are logged in as {user.addr}, but the parent address is{" "}
          {parentAddr}. Please log in as the parent account.
        </p>
      </div>
    );
  }

  const closeModal = () => {
    setShowModal(false);
    setTransactionData({});
  };

  const handleTransfer = async () => {
    if (selectedNFTs.length === 0) {
      alert("Please select at least one Moment to transfer.");
      return;
    }
    if (!recipient.startsWith("0x")) {
      alert("Recipient must be a valid Flow address (start with 0x).");
      return;
    }
    if (!isLoggedIn) {
      alert("You must log in as the parent account first.");
      return;
    }

    // Pick which script to run (child vs parent)
    const cadenceScript = childSelected ? batchTransfer_child : batchTransfer;

    // Show transaction modal in "Awaiting Approval" state
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
      // Build transaction arguments
      const args = childSelected
        ? (arg, t) => [
            arg(selectedAccount, t.Address),
            arg(recipient, t.Address),
            arg(selectedNFTs.map(String), t.Array(t.UInt64)),
          ]
        : (arg, t) => [
            arg(recipient, t.Address),
            arg(selectedNFTs.map(String), t.Array(t.UInt64)),
          ];

      // Submit transaction
      const txId = await fcl.mutate({
        cadence: cadenceScript,
        args,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });

      // Optimistic RESET: Clear selected NFTs immediately
      dispatch({ type: "RESET_SELECTED_NFTS" });

      // Also exclude them from MomentSelection so they won't appear if data refreshes mid-transaction
      setExcludedNftIds((prev) => [...prev, ...selectedNFTs.map(String)]);

      // Now update modal to show "Pending"
      setTransactionData((prev) => ({
        ...prev,
        status: "Pending",
        txId,
      }));

      // Subscribe to transaction status updates
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

        setTransactionData((prev) => ({
          ...prev,
          status: newStatus,
          error,
          txId,
        }));

        // If sealed, we can unsubscribe
        if (txStatus.status === 4) {
          unsub();
        }
      });

      // Wait for the transaction to seal
      await fcl.tx(txId).onceSealed();

      // Refresh parent's data
      if (parentAddr) {
        await loadAllUserData(parentAddr);
      }
      // If it's a child transfer, also refresh the child
      if (childSelected) {
        await loadChildData(selectedAccount);
      }

      // The newly transferred NFTs won't appear after re-fetch
      // because they've truly left this account on-chain.
      // We don't need to remove them from 'excludedNftIds' either,
      // since they're gone anyway.
    } catch (err) {
      console.error("Failed to submit transfer tx:", err);
      setTransactionData((prev) => ({
        ...prev,
        status: "Error",
        error: err?.message ?? String(err),
      }));

      // OPTIONAL: If you want to restore them if the TX fails:
      // setExcludedNftIds((prev) =>
      //   prev.filter((id) => !selectedNFTs.includes(id))
      // );
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="p-4 text-gray-300">
        <p>Please log in to transfer NFTs.</p>
      </div>
    );
  }

  // Active account's NFT data
  const activeAccountData =
    accountData.childrenData?.find((c) => c.addr === selectedAccount) ||
    accountData;

  // Determine which selected NFTs are actually in the active account
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
        transfer to another address. The parent account (logged in) will sign.
      </p>

      {/* Account Selection */}
      <AccountSelection
        parentAccount={{
          addr: accountData.parentAddress,
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

      {/* Selected NFTs */}
      {selectedNftsInAccount.length > 0 && (
        <div className="bg-gray-600 p-2 rounded">
          <h4 className="text-white text-sm mb-2">Selected Moments:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedNftsInAccount.map((momentId) => {
              const nft = (activeAccountData.nftDetails || []).find(
                (item) => Number(item.id) === Number(momentId)
              );
              // Safeguard: if not found, skip
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

      {/* Moment Grid - pass excludedNftIds here */}
      <MomentSelection allowAllTiers excludeIds={excludedNftIds} />

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
          selectedNFTs.length === 0 ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={selectedNFTs.length === 0}
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
