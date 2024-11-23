import React, { useContext, useEffect, useRef } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { FaSignOutAlt, FaClipboard } from "react-icons/fa";

const DropdownMenu = ({ closeMenu, buttonRef }) => {
  const { user, accountData, dispatch } = useContext(UserContext);
  const { parentAddress, tshotBalance, tierCounts, childrenData } = accountData;

  const popoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoutRef.current &&
        !popoutRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };
    setTimeout(
      () => document.addEventListener("mousedown", handleClickOutside),
      0
    );

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMenu, buttonRef]);

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    closeMenu();
  };

  const handleLogout = () => {
    fcl.unauthenticate();
    dispatch({ type: "RESET_STATE" });
    closeMenu();
  };

  const calculateTotalMoments = (tierCounts) =>
    Object.values(tierCounts || {}).reduce((sum, count) => sum + count, 0);

  const getTierBreakdown = (tierCounts) => {
    const tiers = ["common", "fandom", "rare", "legendary", "ultimate"];
    return tiers
      .filter((tier) => tierCounts[tier] > 0)
      .map((tier) => ({
        label: tier.charAt(0).toUpperCase() + tier.slice(1),
        count: tierCounts[tier],
      }));
  };

  const calculateAllAccountTotals = () => {
    const totalTshot =
      parseFloat(tshotBalance || 0) +
      childrenData.reduce(
        (sum, child) => sum + parseFloat(child.tshotBalance || 0),
        0
      );

    const combinedTierCounts = { ...tierCounts };

    childrenData.forEach((child) => {
      for (const tier in child.tierCounts) {
        combinedTierCounts[tier] =
          (combinedTierCounts[tier] || 0) + (child.tierCounts[tier] || 0);
      }
    });

    const totalMoments = calculateTotalMoments(combinedTierCounts);

    return { totalTshot, totalMoments, combinedTierCounts };
  };

  const { totalTshot, totalMoments, combinedTierCounts } =
    calculateAllAccountTotals();

  const allAccounts = [
    {
      label: "Parent Account",
      address: parentAddress,
      tshotBalance,
      tierCounts,
    },
    ...childrenData.map((child, index) => ({
      label: `Child Account ${index + 1}`,
      address: child.addr,
      tshotBalance: child.tshotBalance,
      tierCounts: child.tierCounts,
    })),
  ];

  return (
    <div
      ref={popoutRef}
      className="absolute top-12 right-0 mt-2 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 p-2"
    >
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col text-left">
          <span
            className="cursor-pointer hover:underline flex items-center text-blue-400 text-sm"
            onClick={() => handleCopyAddress(user.addr)}
          >
            {user.addr} <FaClipboard className="ml-1" />
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-white bg-red-600 hover:bg-red-700 rounded-full p-2 shadow-md"
          title="Disconnect"
        >
          <FaSignOutAlt size={16} />
        </button>
      </div>

      {/* All Accounts Summary */}
      <div className="p-3 rounded-md bg-gray-700 mt-3">
        <h4 className="text-xl font-bold text-blue-400">All Accounts</h4>
        <div className="mt-1">
          <p className="text-base font-semibold text-white">
            {parseFloat(totalTshot || 0).toFixed(1)} $TSHOT
          </p>
          <p className="text-base font-semibold text-white">
            {totalMoments} Total Moments
          </p>
        </div>
        <div className="mt-2 text-sm text-gray-300">
          {getTierBreakdown(combinedTierCounts).map((tier) => (
            <p key={tier.label}>
              {tier.label}: {tier.count}
            </p>
          ))}
        </div>
      </div>

      {/* Individual Accounts */}
      <div className="mt-2 space-y-2">
        {allAccounts.map((account) => (
          <div
            key={account.address}
            className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <h5 className="text-sm font-semibold text-blue-400">
              {account.label}
            </h5>
            <p className="text-xs text-gray-400 truncate">
              Address: {account.address}
            </p>
            <div className="mt-1">
              <p className="text-base font-semibold text-white">
                {parseFloat(account.tshotBalance || 0).toFixed(1)} $TSHOT
              </p>
              <p className="text-base font-semibold text-white">
                {calculateTotalMoments(account.tierCounts)} Total Moments
              </p>
            </div>
            <div className="mt-2 text-sm text-gray-300">
              {getTierBreakdown(account.tierCounts).map((tier) => (
                <p key={tier.label}>
                  {tier.label}: {tier.count}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;
