import React, { useContext, useEffect, useRef } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { FaSignOutAlt, FaClipboard, FaWallet, FaCube } from "react-icons/fa";

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      className="absolute top-12 right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700"
    >
      {/* Header Section */}
      <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center">
              <FaWallet className="text-white text-lg" />
            </div>
            <div className="flex flex-col">
              <button
                onClick={() => handleCopyAddress(user.addr)}
                className="text-sm text-gray-300 hover:text-white flex items-center group"
              >
                <span className="truncate max-w-[180px]">{user.addr}</span>
                <FaClipboard className="ml-2 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Disconnect"
          >
            <FaSignOutAlt size={18} />
          </button>
        </div>
      </div>

      {/* Portfolio Summary Section */}
      <div className="px-6 py-5">
        <div className="flex items-center space-x-3 mb-3">
          <FaCube className="text-blue-400 text-lg" />
          <h4 className="text-lg font-medium text-white">Portfolio Summary</h4>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          {/* Summary Stats */}
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total TSHOT</p>
                <p className="text-xl font-bold text-white">
                  {parseFloat(totalTshot || 0).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Moments</p>
                <p className="text-xl font-bold text-white">{totalMoments}</p>
              </div>
            </div>
          </div>

          {/* Tier Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            {getTierBreakdown(combinedTierCounts).map((tier) => (
              <div key={tier.label} className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">{tier.label}</p>
                <p className="text-sm font-semibold text-white">{tier.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Accounts */}
      <div className="px-6 pb-6">
        <div className="space-y-4">
          {allAccounts.map((account) => (
            <div
              key={account.address}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <h5 className="text-sm font-medium text-white">
                  {account.label}
                </h5>
                <button
                  onClick={() => handleCopyAddress(account.address)}
                  className="text-xs text-gray-400 hover:text-white flex items-center"
                >
                  <span className="truncate max-w-[140px]">
                    {account.address}
                  </span>
                  <FaClipboard className="ml-2" />
                </button>
              </div>
              {/* Account Stats */}
              <div className="bg-gray-800 p-4 rounded-lg mb-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">TSHOT Balance</p>
                    <p className="text-sm font-semibold text-white">
                      {parseFloat(account.tshotBalance || 0).toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Total Moments</p>
                    <p className="text-sm font-semibold text-white">
                      {calculateTotalMoments(account.tierCounts)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {getTierBreakdown(account.tierCounts).map((tier) => (
                  <div key={tier.label} className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">{tier.label}</p>
                    <p className="text-sm font-semibold text-white">
                      {tier.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DropdownMenu;
