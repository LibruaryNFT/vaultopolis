// src/components/Transfer.js
import React, { useState, useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserDataContext } from "../context/UserContext";

// Your transaction scripts
import { batchTransfer } from "../flow/batchTransfer";
import { batchTransfer_child } from "../flow/batchTransfer_child";

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

  const [recipient, setRecipient] = useState("0x");
  const [showModal, setShowModal] = useState(false);
  const [transactionData, setTransactionData] = useState({});

  // Exclude any NFTs we’ve already transferred so they don’t reappear
  const [excludedNftIds, setExcludedNftIds] = useState([]);

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

  // Active account’s data
  const activeAccountData =
    accountData.childrenData?.find((c) => c.addr === selectedAccount) ||
    accountData;

  // Filter selected NFTs to only those from the active account
  const selectedNftsInAccount = selectedNFTs.filter((id) =>
    (activeAccountData.nftDetails || []).some(
      (nft) => Number(nft.id) === Number(id)
    )
  );

  // Decide the button label & whether it's disabled
  let transferButtonLabel = "Transfer Moments";
  let transferDisabled = false;

  if (selectedNftsInAccount.length === 0) {
    transferButtonLabel = "Select Moments";
    transferDisabled = true;
  } else if (recipient === "0x") {
    transferButtonLabel = "Enter Recipient";
    transferDisabled = true;
  } else if (selectedNftsInAccount.length > MAX_TRANSFER_COUNT) {
    // Over the 500 limit
    transferButtonLabel = `Max ${MAX_TRANSFER_COUNT} allowed`;
    transferDisabled = true;
  }

  const closeModal = () => {
    setShowModal(false);
    setTransactionData({});
  };

  const handleTransfer = async () => {
    // We assume the button is never clicked if disabled, so no further checks needed
    // except for the child vs. parent script logic below:

    // Pick the transaction script
    const cadenceScript = childSelected ? batchTransfer_child : batchTransfer;

    // Show transaction modal in "Awaiting Approval"
    setShowModal(true);
    setTransactionData({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      nftCount: selectedNftsInAccount.length,
      swapType: "BATCH_TRANSFER",
      transactionAction: "BATCH_TRANSFER",
    });

    try {
      const args = childSelected
        ? (arg, t) => [
            arg(selectedAccount, t.Address),
            arg(recipient, t.Address),
            arg(selectedNftsInAccount.map(String), t.Array(t.UInt64)),
          ]
        : (arg, t) => [
            arg(recipient, t.Address),
            arg(selectedNftsInAccount.map(String), t.Array(t.UInt64)),
          ];

      // Submit to Flow
      const txId = await fcl.mutate({
        cadence: cadenceScript,
        args,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });

      // Immediately reset selection
      dispatch({ type: "RESET_SELECTED_NFTS" });
      setExcludedNftIds((prev) => [
        ...prev,
        ...selectedNftsInAccount.map(String),
      ]);

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

      // Refresh data
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
    }
  };

  // =================== RENDERING ===================

  // 1) Selected Moments (full width)
  const renderSelectedMoments = () => {
    return (
      <div className="bg-brand-primary p-2 rounded">
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
                  isSelected={true}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-brand">No Moments selected yet.</p>
        )}
      </div>
    );
  };

  return (
    <>
      {/* 1) Selected Moments (FULL WIDTH) */}
      <div className="w-full p-4">
        <div className="max-w-screen-lg mx-auto">{renderSelectedMoments()}</div>
      </div>

      {/* 2) Recipient Address & 3) Transfer Button (centered, max-w-md) */}
      <div className="max-w-md mx-auto space-y-4 p-4 rounded bg-brand-primary">
        <div>
          <label className="block mb-1 text-brand">Recipient Address</label>
          <input
            type="text"
            placeholder="0xRecipient"
            className="w-full p-2 rounded text-black"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <button
          onClick={handleTransfer}
          disabled={transferDisabled}
          className={`
            w-full p-4 text-lg rounded-lg font-bold
            mt-2 transition-colors
            ${
              transferDisabled
                ? "bg-brand-secondary cursor-not-allowed opacity-60"
                : "bg-flow-light hover:bg-flow-dark"
            }
          `}
        >
          {transferButtonLabel}
        </button>
      </div>

      {/* 4) Account Selection (FULL WIDTH, brand-primary) + 5) Moment Selection */}
      <div className="w-full p-4">
        <div className="max-w-screen-lg mx-auto space-y-4">
          <div className="bg-brand-primary p-2 rounded">
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
