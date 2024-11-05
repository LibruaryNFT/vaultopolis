import React, { useContext, useEffect, useRef } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { FaSignOutAlt, FaClipboard } from "react-icons/fa";
import { setupTopShotCollection } from "../flow/setupTopShotCollection";
import { setupTSHOTVault } from "../flow/setupTSHOTVault";

const DropdownMenu = ({ closeMenu, buttonRef }) => {
  const {
    user,
    tshotBalance,
    network,
    tierCounts,
    hasCollection,
    hasVault,
    dispatch,
  } = useContext(UserContext);
  const popoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside both the dropdown and button
      if (
        popoutRef.current &&
        !popoutRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    // Add event listener with a slight delay after opening to avoid re-triggering
    setTimeout(
      () => document.addEventListener("mousedown", handleClickOutside),
      0
    );

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMenu, buttonRef]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(user.addr);
    closeMenu(); // Close the menu after copying the address
  };

  const handleLogout = () => {
    fcl.unauthenticate();
    dispatch({ type: "RESET_STATE" });
    closeMenu();
  };

  const setupCollection = async () => {
    try {
      const transactionId = await fcl.mutate({
        cadence: setupTopShotCollection,
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 100,
      });
      await fcl.tx(transactionId).onceSealed();
      dispatch({ type: "SET_COLLECTION_STATUS", payload: true });
    } catch (error) {
      console.error("Error setting up collection:", error);
    }
  };

  const setupVault = async () => {
    try {
      const transactionId = await fcl.mutate({
        cadence: setupTSHOTVault,
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 100,
      });
      await fcl.tx(transactionId).onceSealed();
      dispatch({ type: "SET_VAULT_STATUS", payload: true });
    } catch (error) {
      console.error("Error setting up vault:", error);
    }
  };

  const totalTopShotMoments = Object.values(tierCounts || {}).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div
      ref={popoutRef}
      className="absolute top-12 right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 p-4"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col text-left">
          <span
            className="cursor-pointer hover:underline flex items-center"
            onClick={handleCopyAddress}
          >
            {user.addr} <FaClipboard className="ml-2" />
          </span>
          <span>{network}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-white hover:bg-red-600 p-2 rounded-full"
          title="Disconnect"
        >
          <FaSignOutAlt size={20} />
        </button>
      </div>

      <div className="flex flex-col space-y-2 mt-4">
        {hasCollection === false && (
          <ActionButton onClick={setupCollection} text="Setup Collection" />
        )}
        {hasVault === false && (
          <ActionButton onClick={setupVault} text="Setup TSHOT Vault" />
        )}
        <BalanceInfo
          tshotBalance={tshotBalance}
          totalTopShotMoments={totalTopShotMoments}
          tierCounts={tierCounts}
        />
      </div>
    </div>
  );
};

const ActionButton = ({ onClick, text }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    {text}
  </button>
);

const BalanceInfo = ({ tshotBalance, totalTopShotMoments, tierCounts }) => (
  <>
    <div className="block p-2 hover:bg-gray-700 rounded-md transition-colors">
      <p>{parseFloat(tshotBalance || 0).toFixed(1)} $TSHOT</p>
      <p className="text-gray-400">
        ${(parseFloat(tshotBalance || 0) * 0.2).toFixed(2)} USD
      </p>
    </div>
    <div className="block p-2 hover:bg-gray-700 rounded-md transition-colors">
      <p>Total TopShot Moments</p>
      <p>{totalTopShotMoments} Moments</p>
    </div>
    {["common", "rare", "fandom", "legendary", "ultimate"].map((tier) => (
      <div
        key={tier}
        className="block p-2 hover:bg-gray-700 rounded-md transition-colors"
      >
        <p>{`TopShot ${tier.charAt(0).toUpperCase() + tier.slice(1)}`}</p>
        <p>{tierCounts?.[tier] || 0} Moments</p>
      </div>
    ))}
  </>
);

export default DropdownMenu;
