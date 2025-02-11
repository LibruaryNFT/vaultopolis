import React, { useContext, useEffect, useRef } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { FaClipboard, FaWallet, FaCube } from "react-icons/fa";

const DropdownMenu = ({ closeMenu, buttonRef }) => {
  const { user, accountData, dispatch } = useContext(UserContext);
  const { parentAddress, flowBalance, nftDetails, childrenData } = accountData;
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
    // Delay adding the event listener so that a click on the button doesn't immediately trigger close
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

  // Helper: compute total TopShot moments from an array of NFT details.
  const calculateTotalTopShotCounts = (nfts) => (nfts ? nfts.length : 0);

  // Compute aggregated totals for parent and children.
  const calculateAllAccountTotals = () => {
    const totalFlow =
      parseFloat(flowBalance || 0) +
      childrenData.reduce(
        (sum, child) => sum + parseFloat(child.flowBalance || 0),
        0
      );
    const totalTopShotCounts =
      calculateTotalTopShotCounts(nftDetails) +
      childrenData.reduce(
        (sum, child) => sum + calculateTotalTopShotCounts(child.nftDetails),
        0
      );
    return { totalFlow, totalTopShotCounts };
  };

  const { totalFlow, totalTopShotCounts } = calculateAllAccountTotals();

  // Helper: compute tier breakdown from an array of NFTs.
  const calculateTierBreakdown = (nfts) => {
    return (nfts || []).reduce((acc, nft) => {
      const tier = nft.tier ? nft.tier.toLowerCase() : "unknown";
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});
  };

  // Mapping of tier names to Tailwind text colour classes.
  const tierTextColors = {
    common: "text-gray-400",
    rare: "text-blue-500",
    fandom: "text-lime-400",
    legendary: "text-orange-500",
    ultimate: "text-pink-500",
  };

  // Render the tier breakdown vertically as text lines.
  // If the count is 1, use the singular "Moment"; otherwise, use "Moments".
  const renderBreakdownVertical = (breakdown) => {
    const tiers = ["common", "fandom", "rare", "legendary", "ultimate"];
    return tiers
      .filter((t) => breakdown[t])
      .map((t) => (
        <p key={t} className="text-sm mb-1 whitespace-nowrap">
          {breakdown[t]}{" "}
          <span className={tierTextColors[t]}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </span>{" "}
          <span className="text-gray-400">
            {breakdown[t] === 1 ? "Moment" : "Moments"}
          </span>
        </p>
      ));
  };

  // Aggregate breakdown for all accounts.
  const aggregatedBreakdown = { ...calculateTierBreakdown(nftDetails) };
  childrenData.forEach((child) => {
    const childBreakdown = calculateTierBreakdown(child.nftDetails);
    Object.keys(childBreakdown).forEach((tier) => {
      aggregatedBreakdown[tier] =
        (aggregatedBreakdown[tier] || 0) + childBreakdown[tier];
    });
  });

  // Build a unified array of accounts for display.
  const allAccounts = [
    {
      label: "Parent Account",
      address: parentAddress,
      flowBalance,
      topShotCount: calculateTotalTopShotCounts(nftDetails),
      breakdown: calculateTierBreakdown(nftDetails),
    },
    ...childrenData.map((child, index) => ({
      label: `Child Account ${index + 1}`,
      address: child.addr,
      flowBalance: child.flowBalance,
      topShotCount: calculateTotalTopShotCounts(child.nftDetails),
      breakdown: calculateTierBreakdown(child.nftDetails),
    })),
  ];

  return (
    <div
      ref={popoutRef}
      className="absolute top-12 right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700"
    >
      {/* Header Section */}
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <FaWallet className="text-white text-xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-300 font-medium">
                {user.addr}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold text-red-500 hover:text-white hover:bg-red-600 rounded transition-colors"
            title="Disconnect"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Portfolio Summary Section */}
      <div className="px-4 py-3">
        <div className="flex">
          {/* Left Column: Totals (30% width) */}
          <div className="w-[30%]">
            <p className="text-sm text-gray-400 mb-1">Total Flow</p>
            <p className="text-2xl font-bold text-white">
              {parseFloat(totalFlow || 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-400 mt-3 mb-1">TopShot Total</p>
            <p className="text-2xl font-bold text-white">
              {totalTopShotCounts}
            </p>
          </div>
          {/* Right Column: Tier Breakdown (70% width) */}
          {totalTopShotCounts > 0 &&
            Object.keys(aggregatedBreakdown).length > 0 && (
              <div className="w-[70%] pl-2">
                {renderBreakdownVertical(aggregatedBreakdown)}
              </div>
            )}
        </div>
      </div>

      {/* Individual Accounts Section */}
      <div className="px-4 pb-4">
        <div className="space-y-3">
          {allAccounts.map((account) => (
            <div
              key={account.address}
              className="bg-gray-700 rounded-lg p-3 hover:bg-gray-650 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className="text-lg font-medium text-white">
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
              <div className="bg-gray-800 p-3 rounded-lg mb-2">
                <div className="flex">
                  {/* Left Column: Account Totals (30% width) */}
                  <div className="w-[30%]">
                    <p className="text-xs text-gray-400 mb-1">Flow Balance</p>
                    <p className="text-sm font-semibold text-white">
                      {parseFloat(account.flowBalance || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-3 mb-1">
                      TopShot Total
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {account.topShotCount}
                    </p>
                  </div>
                  {/* Right Column: Account Tier Breakdown (70% width) */}
                  {account.topShotCount > 0 &&
                    Object.keys(account.breakdown).length > 0 && (
                      <div className="w-[70%] pl-2">
                        {renderBreakdownVertical(account.breakdown)}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DropdownMenu;
