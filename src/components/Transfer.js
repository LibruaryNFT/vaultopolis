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

/**
 * Allows the user to:
 * 1) Pick an account (parent or child) to select Moments from.
 * 2) Enter a recipient address.
 * 3) Transfer the selected Moments.
 *
 * The parent must be logged in (fcl.currentUser).
 */
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

  // Check if user is logged in
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

  /**
   * Actually send the transaction. The parent signs, even if child was selected for NFT withdraw.
   */
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
      // Build arguments
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

      // Mutate
      const txId = await fcl.mutate({
        cadence: cadenceScript,
        args,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });

      // Immediately mark "Pending"
      setTransactionData((prev) => ({
        ...prev,
        status: "Pending",
        txId,
      }));

      // Subscribe to transaction updates for status
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

        const error =
          txStatus.errorMessage && txStatus.errorMessage.length
            ? txStatus.errorMessage
            : null;

        setTransactionData((prev) => ({
          ...prev,
          status: newStatus,
          error,
          txId,
        }));

        if (txStatus.status === 4) {
          unsub();
        }
      });

      // Wait for sealing
      await fcl.tx(txId).onceSealed();

      // Refresh parent data
      if (parentAddr) {
        await loadAllUserData(parentAddr);
      }
      // If it's a child transfer, refresh child
      if (childSelected) {
        await loadChildData(selectedAccount);
      }

      // Clear selected NFTs
      dispatch({ type: "RESET_SELECTED_NFTS" });
    } catch (err) {
      console.error("Failed to submit transfer tx:", err);
      setTransactionData((prev) => ({
        ...prev,
        status: "Error",
        error: err?.message ?? String(err),
      }));
    }
  };

  // If not logged in, prompt
  if (!isLoggedIn) {
    return (
      <div className="p-4 text-gray-300">
        <p>Please log in to transfer NFTs.</p>
      </div>
    );
  }

  // Active account's NFT data (child or parent)
  const activeAccountData =
    accountData.childrenData?.find((c) => c.addr === selectedAccount) ||
    accountData;

  // We'll skip rendering a "selected NFT" if we can't find it in the new data
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

      {/* Moment Grid */}
      <MomentSelection allowAllTiers />

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
