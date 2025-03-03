// src/components/TSHOTToNFTPanel.js
import React, { useContext } from "react";
import * as fcl from "@onflow/fcl";
import { UserContext } from "../context/UserContext";

import { commitSwap } from "../flow/commitSwap";
import { revealSwap } from "../flow/revealSwap";
import { getTopShotBatched } from "../flow/getTopShotBatched";

import AccountSelection from "./AccountSelection";

const TSHOT_LIMIT = 50;

function TSHOTToNFTPanel(props) {
  let { sellAmount = "0", depositDisabled, onTransactionStart } = props;
  if (!sellAmount) sellAmount = "0";

  const {
    user,
    accountData,
    selectedAccount,
    dispatch,
    loadAllUserData,
    loadChildData,
    metadataCache,
  } = useContext(UserContext);

  const isLoggedIn = Boolean(user?.loggedIn);
  if (!isLoggedIn) {
    return (
      <button
        onClick={() => fcl.authenticate()}
        className="w-full text-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest p-2"
      >
        Connect Wallet
      </button>
    );
  }

  // Step 1 => deposit; Step 2 => reveal
  const depositStep = !accountData?.hasReceipt;
  const revealStep = !!accountData?.hasReceipt;

  const userBalance = Math.floor(accountData?.tshotBalance ?? 0);

  let numericValue = parseInt(sellAmount, 10);
  if (Number.isNaN(numericValue) || numericValue < 0) {
    numericValue = 0;
  }

  const errors = [];
  if (numericValue > userBalance) {
    errors.push("Insufficient TSHOT balance.");
  }
  if (numericValue > TSHOT_LIMIT) {
    errors.push(`Cannot deposit more than ${TSHOT_LIMIT} TSHOT at once.`);
  }

  const enrichLocalMetadata = (rawNFTs) => {
    if (!metadataCache) return rawNFTs;
    return rawNFTs.map((nft) => {
      const key = `${nft.setID}-${nft.playID}`;
      const meta = metadataCache[key] || {};
      return {
        ...nft,
        fullName:
          meta.FullName ||
          meta.fullName ||
          nft.fullName ||
          nft.playerName ||
          "Unknown Player",
        momentCount: meta.momentCount
          ? Number(meta.momentCount)
          : nft.momentCount || 0,
        name: meta.name || nft.name,
      };
    });
  };

  // Step 1 => commitSwap
  const handleDeposit = async () => {
    if (errors.length > 0 || numericValue === 0) {
      return;
    }

    const parentAddr = accountData?.parentAddress || user?.addr;
    if (!parentAddr?.startsWith("0x")) {
      console.error("Invalid parent address for deposit");
      return;
    }

    const betAmount = numericValue.toString() + ".0";

    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      tshotAmount: betAmount,
      transactionAction: "COMMIT_SWAP",
      swapType: "TSHOT_TO_NFT", // pass swapType so we can track in Swap.js
    });

    try {
      const txId = await fcl.mutate({
        cadence: commitSwap,
        args: (arg, t) => [arg(betAmount, t.UFix64)],
        limit: 9999,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
      });

      onTransactionStart?.({
        status: "Pending",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "COMMIT_SWAP",
        swapType: "TSHOT_TO_NFT",
      });

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
            unsub();
            break;
          default:
            return;
        }
        const errMsg = txStatus.errorMessage || null;
        onTransactionStart?.({
          status: newStatus,
          txId,
          error: errMsg,
          tshotAmount: betAmount,
          transactionAction: "COMMIT_SWAP",
          swapType: "TSHOT_TO_NFT",
        });
      });

      await fcl.tx(txId).onceSealed();

      onTransactionStart?.({
        status: "Sealed",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "COMMIT_SWAP",
        swapType: "TSHOT_TO_NFT",
      });

      // Refresh
      await loadAllUserData(parentAddr);
      if (selectedAccount && selectedAccount !== parentAddr) {
        await loadChildData(selectedAccount);
      }
    } catch (err) {
      console.error("Deposit transaction failed:", err);
      onTransactionStart?.({
        status: "Error",
        error: err?.message || String(err),
        txId: null,
        tshotAmount: betAmount,
        transactionAction: "COMMIT_SWAP",
        swapType: "TSHOT_TO_NFT",
      });
    }
  };

  // Step 2 => revealSwap
  const handleReveal = async () => {
    if (!selectedAccount?.startsWith("0x")) {
      alert("Invalid receiving address for reveal.");
      return;
    }

    const betFromReceipt = accountData?.receiptDetails?.betAmount;
    const fallback = numericValue.toString();
    const betInteger = betFromReceipt || fallback;
    const betAmount = betInteger.includes(".") ? betInteger : betInteger + ".0";

    onTransactionStart?.({
      status: "Awaiting Approval",
      txId: null,
      error: null,
      tshotAmount: betAmount,
      transactionAction: "REVEAL_SWAP",
      swapType: "TSHOT_TO_NFT",
    });

    try {
      const txId = await fcl.mutate({
        cadence: revealSwap,
        args: (arg, t) => [arg(selectedAccount, t.Address)],
        limit: 9999,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
      });

      onTransactionStart?.({
        status: "Pending",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "REVEAL_SWAP",
        swapType: "TSHOT_TO_NFT",
      });

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
            unsub();
            break;
          default:
            return;
        }
        const errMsg = txStatus.errorMessage || null;
        onTransactionStart?.({
          status: newStatus,
          txId,
          error: errMsg,
          tshotAmount: betAmount,
          transactionAction: "REVEAL_SWAP",
          swapType: "TSHOT_TO_NFT",
        });
      });

      const sealedResult = await fcl.tx(txId).onceSealed();

      // Grab newly minted NFT IDs
      const depositEvents = sealedResult.events.filter(
        (evt) =>
          evt.type === "A.0b2a3299cc857e29.TopShot.Deposit" &&
          evt.data.to === selectedAccount
      );
      const receivedNFTIDs = depositEvents.map((evt) => evt.data.id);

      let revealedNFTDetails = [];
      if (receivedNFTIDs.length > 0) {
        revealedNFTDetails = await fcl.query({
          cadence: getTopShotBatched,
          args: (arg, t) => [
            arg(selectedAccount, t.Address),
            arg(receivedNFTIDs, t.Array(t.UInt64)),
          ],
        });
        revealedNFTDetails = enrichLocalMetadata(revealedNFTDetails);
      }

      onTransactionStart?.({
        status: "Sealed",
        txId,
        error: null,
        tshotAmount: betAmount,
        transactionAction: "REVEAL_SWAP",
        swapType: "TSHOT_TO_NFT",
        revealedNFTs: receivedNFTIDs,
        revealedNFTDetails,
      });

      // Refresh
      const parentAddr = accountData?.parentAddress || user?.addr;
      await loadAllUserData(parentAddr);
      if (selectedAccount && selectedAccount !== parentAddr) {
        await loadChildData(selectedAccount);
      }
    } catch (err) {
      console.error("Reveal transaction failed:", err);
      onTransactionStart?.({
        status: "Error",
        error: err?.message || String(err),
        txId: null,
        tshotAmount: betAmount,
        transactionAction: "REVEAL_SWAP",
        swapType: "TSHOT_TO_NFT",
      });
    }
  };

  // Render
  if (depositStep) {
    const hasErrors = errors.length > 0;
    const disableDeposit = depositDisabled || hasErrors || numericValue === 0;

    return (
      <div className="space-y-4 max-w-md mx-auto">
        {errors.map((errMsg, idx) => (
          <div key={idx} className="text-red-400 font-semibold">
            {errMsg}
          </div>
        ))}

        <button
          onClick={handleDeposit}
          disabled={disableDeposit}
          className={`w-full p-4 text-lg rounded-lg font-bold text-white ${
            disableDeposit
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-flow-dark hover:bg-flow-darkest"
          }`}
        >
          (Step 1 of 2) Swap TSHOT for Moments
        </button>
      </div>
    );
  }

  if (revealStep) {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <button
          onClick={handleReveal}
          className="w-full p-4 text-lg rounded-lg font-bold text-white bg-flow-dark hover:bg-flow-darkest"
        >
          (Step 2 of 2) Swap TSHOT for Moments
        </button>

        <div className="bg-gray-700 p-3 rounded">
          <h4 className="text-white mb-2 font-semibold">
            Select Receiving Account
          </h4>
          <AccountSelection
            parentAccount={
              accountData?.hasCollection
                ? {
                    addr: accountData.parentAddress || user?.addr,
                    ...accountData,
                  }
                : null
            }
            childrenAddresses={(accountData.childrenData || [])
              .filter((c) => c.hasCollection)
              .map((child) => child.addr)}
            childrenAccounts={(accountData.childrenData || []).filter(
              (c) => c.hasCollection
            )}
            selectedAccount={selectedAccount}
            onSelectAccount={(addr) =>
              dispatch({
                type: "SET_SELECTED_ACCOUNT",
                payload: {
                  address: addr,
                  type:
                    addr === (accountData.parentAddress || user?.addr)
                      ? "parent"
                      : "child",
                },
              })
            }
          />
          <p className="text-xs text-gray-300 mt-1">
            <em>Note:</em> You can only receive Moments in an account that
            already has a TopShot collection.
          </p>
        </div>
      </div>
    );
  }

  return <div className="text-gray-400 p-4">Loading...</div>;
}

export default TSHOTToNFTPanel;
