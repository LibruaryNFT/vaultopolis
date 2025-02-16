// DropdownMenu.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { FaClipboard, FaSignOutAlt, FaSpinner } from "react-icons/fa";

// Helper component: If a value exists, display it; otherwise, render a skeleton placeholder.
const ValueOrSkeleton = ({
  value,
  className = "",
  skeletonWidth = "w-20",
  skeletonHeight = "h-6",
}) => {
  if (value !== undefined && value !== null) {
    return <span className={className}>{value}</span>;
  }
  return (
    <div
      className={`${skeletonWidth} ${skeletonHeight} bg-gray-600 rounded animate-pulse`}
    />
  );
};

const DropdownMenu = ({ closeMenu, buttonRef }) => {
  const { user, accountData, isRefreshing, dispatch } = useContext(UserContext);
  const {
    parentAddress,
    flowBalance,
    nftDetails,
    tshotBalance,
    childrenData,
    hasCollection,
  } = accountData;
  // Data is assumed to be in context; no artificial delay.
  const [isLoading, setIsLoading] = useState(false);
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

  // Copying an address should not close the dropdown.
  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
  };

  const handleLogout = () => {
    fcl.unauthenticate();
    dispatch({ type: "RESET_STATE" });
    closeMenu();
  };

  // --- Calculation Helpers ---
  const calculateTotalTopShotCounts = (nfts) => (nfts ? nfts.length : 0);

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
    const totalTSHOT =
      parseFloat(tshotBalance || 0) +
      childrenData.reduce(
        (sum, child) => sum + parseFloat(child.tshotBalance || 0),
        0
      );
    return { totalFlow, totalTopShotCounts, totalTSHOT };
  };

  const { totalFlow, totalTopShotCounts, totalTSHOT } =
    calculateAllAccountTotals();

  const calculateTierBreakdown = (nfts) => {
    return (nfts || []).reduce((acc, nft) => {
      const tier = nft.tier ? nft.tier.toLowerCase() : "unknown";
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});
  };

  const tierTextColors = {
    common: "text-gray-400",
    rare: "text-blue-500",
    fandom: "text-lime-400",
    legendary: "text-orange-500",
    ultimate: "text-pink-500",
  };

  const renderBreakdownVertical = (breakdown) => {
    const tiers = ["common", "fandom", "rare", "legendary", "ultimate"];
    return tiers
      .filter((t) => breakdown[t])
      .map((t) => (
        <div
          key={t}
          className="grid grid-cols-[3rem,auto] items-center gap-x-2 mb-1"
        >
          <div className="text-right">{breakdown[t]}</div>
          <div className={tierTextColors[t]}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        </div>
      ));
  };

  // Aggregate tier breakdown across all accounts
  const aggregatedBreakdown = { ...calculateTierBreakdown(nftDetails) };
  childrenData.forEach((child) => {
    const childBreakdown = calculateTierBreakdown(child.nftDetails);
    Object.keys(childBreakdown).forEach((tier) => {
      aggregatedBreakdown[tier] =
        (aggregatedBreakdown[tier] || 0) + childBreakdown[tier];
    });
  });

  // Include TSHOT balance and collection status for each account.
  const allAccounts = [
    {
      label: "Parent Account",
      address: parentAddress,
      flowBalance,
      topShotCount: calculateTotalTopShotCounts(nftDetails),
      tshotBalance,
      breakdown: calculateTierBreakdown(nftDetails),
      hasCollection,
    },
    ...childrenData.map((child, index) => ({
      label: `Child Account ${index + 1}`,
      address: child.addr,
      flowBalance: child.flowBalance,
      topShotCount: calculateTotalTopShotCounts(child.nftDetails),
      tshotBalance: child.tshotBalance,
      breakdown: calculateTierBreakdown(child.nftDetails),
      hasCollection: child.hasCollection,
    })),
  ];

  // Determine if at least one account has TopShot moments
  const hasAnyTopShot = totalTopShotCounts > 0;

  if (isLoading) {
    return (
      <div
        ref={popoutRef}
        className="absolute top-12 right-0 mt-2 w-[calc(100vw-32px)] md:w-96 bg-gray-800 shadow-xl overflow-hidden rounded-lg border border-gray-600/50 flex items-center justify-center p-4"
        aria-busy="true"
      >
        <FaSpinner className="animate-spin text-white text-2xl" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div
      ref={popoutRef}
      className="absolute top-12 right-0 mt-2 w-[calc(100vw-32px)] md:w-96 bg-gray-800 shadow-xl overflow-hidden rounded-lg border border-gray-600/50"
    >
      {/* Top Header with title and disconnect button */}
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
        <h4 className="text-lg font-medium text-white">
          Summary - All Accounts
        </h4>
        <div className="flex items-center">
          {isRefreshing && (
            <FaSpinner className="animate-spin text-white mr-2" size={16} />
          )}
          <button
            onClick={handleLogout}
            className="p-1 text-red-500 hover:text-white hover:bg-red-600 rounded transition-colors"
            title="Disconnect"
          >
            <FaSignOutAlt size={20} />
          </button>
        </div>
      </div>

      {/* Portfolio Summary Section */}
      <div className="px-4 py-2 border-b border-gray-700">
        <div className="flex">
          {/* Left Column: Totals */}
          <div className="w-1/3">
            <div>
              <p className="text-sm text-gray-400 m-0">Flow</p>
              <ValueOrSkeleton
                value={parseFloat(totalFlow).toFixed(2)}
                className="text-xl font-semibold text-white m-0"
                skeletonWidth="w-24"
                skeletonHeight="h-7"
              />
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-400 m-0">TopShot</p>
              <ValueOrSkeleton
                value={totalTopShotCounts}
                className="text-xl font-semibold text-white m-0"
                skeletonWidth="w-16"
                skeletonHeight="h-7"
              />
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-400 m-0">TSHOT</p>
              <ValueOrSkeleton
                value={parseFloat(totalTSHOT).toFixed(1)}
                className="text-xl font-semibold text-white m-0"
                skeletonWidth="w-24"
                skeletonHeight="h-7"
              />
            </div>
          </div>
          {/* Right Column: Tier Breakdown or Collection Status */}
          <div className="w-2/3 pl-4">
            {hasAnyTopShot ? (
              renderBreakdownVertical(aggregatedBreakdown)
            ) : (
              <div className="text-gray-400 italic">No TopShot Collection</div>
            )}
          </div>
        </div>
      </div>

      {/* Individual Accounts Section */}
      <div className="pb-0">
        <div className="divide-y divide-gray-700">
          {allAccounts.map((account) => (
            <div
              key={account.address}
              className="w-full hover:shadow-xl transition-shadow"
            >
              {/* Title Row with darker background */}
              <div className="bg-gray-900 px-2 py-1 flex justify-between items-center">
                <h5 className="text-base md:text-lg font-medium text-white m-0">
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
              {/* Details Section with background matching the portfolio summary */}
              <div className="bg-gray-800 px-2 py-2 w-full">
                <div className="flex w-full">
                  {/* Left Column: Flow, TopShot, and TSHOT Data */}
                  <div className="w-1/3">
                    <div>
                      <p className="text-sm text-gray-400 m-0">Flow</p>
                      <ValueOrSkeleton
                        value={parseFloat(account.flowBalance).toFixed(2)}
                        className="text-xl font-semibold text-white m-0"
                        skeletonWidth="w-24"
                        skeletonHeight="h-7"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400 m-0">TopShot</p>
                      <ValueOrSkeleton
                        value={account.topShotCount}
                        className="text-xl font-semibold text-white m-0"
                        skeletonWidth="w-16"
                        skeletonHeight="h-7"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400 m-0">TSHOT</p>
                      <ValueOrSkeleton
                        value={parseFloat(account.tshotBalance || 0).toFixed(1)}
                        className="text-xl font-semibold text-white m-0"
                        skeletonWidth="w-24"
                        skeletonHeight="h-7"
                      />
                    </div>
                  </div>
                  {/* Right Column: Tier Breakdown or Collection Status */}
                  <div className="w-2/3 pl-4">
                    {account.hasCollection ? (
                      Object.keys(account.breakdown).length > 0 ? (
                        renderBreakdownVertical(account.breakdown)
                      ) : (
                        <div className="text-gray-400 italic">No tier data</div>
                      )
                    ) : (
                      <div className="text-gray-400 italic">
                        No TopShot Collection
                      </div>
                    )}
                  </div>
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
