// src/components/DropdownMenu.jsx

import React, { useContext, useEffect, useRef, useState } from "react";
import { UserDataContext } from "../context/UserContext";
import * as fcl from "@onflow/fcl";
import {
  FaClipboard,
  FaSignOutAlt,
  FaSpinner,
  FaSun,
  FaMoon,
} from "react-icons/fa";

/** Helper for skeleton placeholders */
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
      className={`${skeletonWidth} ${skeletonHeight} bg-brand-secondary animate-pulse rounded`}
    />
  );
};

const DropdownMenu = ({ closeMenu, buttonRef }) => {
  const {
    accountData,
    isRefreshing,
    isLoadingChildren,
    dispatch,
    user,
    refreshUserData,
  } = useContext(UserDataContext);

  const {
    parentAddress,
    flowBalance,
    nftDetails,
    tshotBalance,
    childrenData,
    hasCollection,
  } = accountData;

  const popoutRef = useRef(null);

  // THEME
  const [themeMode, setThemeMode] = useState(null);

  useEffect(() => {
    let storedMode = localStorage.getItem("themeMode");
    if (!storedMode) {
      storedMode = "dark";
      localStorage.setItem("themeMode", "dark");
    }
    setThemeMode(storedMode);
  }, []);

  useEffect(() => {
    if (themeMode === null) return;
    applyTheme(themeMode);
  }, [themeMode]);

  const applyTheme = (mode) => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("themeMode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("themeMode", "light");
    }
  };
  const setTheme = (mode) => setThemeMode(mode);

  // click outside => close
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMenu, buttonRef]);

  // Logout
  const handleLogout = () => {
    fcl.unauthenticate();
    dispatch({ type: "RESET_STATE" });
    closeMenu();
  };

  // Summaries
  const calculateTotalTopShotCounts = (nfts) => (nfts ? nfts.length : 0);

  const calculateAllAccountTotals = () => {
    const totalFlow =
      parseFloat(flowBalance || 0) +
      childrenData.reduce((sum, c) => sum + parseFloat(c.flowBalance || 0), 0);

    const totalTopShotCounts =
      calculateTotalTopShotCounts(nftDetails) +
      childrenData.reduce(
        (sum, c) => sum + calculateTotalTopShotCounts(c.nftDetails),
        0
      );

    const totalTSHOT =
      parseFloat(tshotBalance || 0) +
      childrenData.reduce((sum, c) => sum + parseFloat(c.tshotBalance || 0), 0);

    return { totalFlow, totalTopShotCounts, totalTSHOT };
  };

  const { totalFlow, totalTopShotCounts, totalTSHOT } =
    calculateAllAccountTotals();

  // Tier text colors
  const tierTextColors = {
    common: "text-gray-400",
    fandom: "text-lime-400",
    rare: "text-blue-500",
    legendary: "text-orange-500",
    ultimate: "text-pink-500",
  };

  const calculateTierBreakdown = (nfts) =>
    (nfts || []).reduce((acc, nft) => {
      const tier = nft.tier?.toLowerCase() || "unknown";
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});

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

  // aggregated breakdown
  const aggregatedBreakdown = { ...calculateTierBreakdown(nftDetails) };
  childrenData.forEach((child) => {
    const childBreakdown = calculateTierBreakdown(child.nftDetails);
    Object.keys(childBreakdown).forEach((tier) => {
      aggregatedBreakdown[tier] =
        (aggregatedBreakdown[tier] || 0) + childBreakdown[tier];
    });
  });

  // Determine label for child accounts
  const childLabel = (index, totalChildren) => {
    if (totalChildren === 1) {
      return "Child Account";
    }
    return `Child Account ${index + 1}`;
  };

  // Build array for rendering
  const totalChildren = childrenData.length;
  const allAccounts = [
    {
      label: "Parent Account",
      address: parentAddress,
      flowBalance,
      tshotBalance,
      nftDetails,
      hasCollection,
    },
    ...childrenData.map((child, index) => ({
      label: childLabel(index, totalChildren),
      address: child.addr,
      flowBalance: child.flowBalance,
      tshotBalance: child.tshotBalance,
      nftDetails: child.nftDetails,
      hasCollection: child.hasCollection,
    })),
  ];

  // Manual "Refresh Data" button
  const handleRefresh = async () => {
    if (user?.addr?.startsWith("0x")) {
      await refreshUserData();
    }
  };

  return (
    <div
      ref={popoutRef}
      className="
        absolute
        top-12
        right-0
        mt-2
        w-[calc(100vw-32px)]
        md:w-96
        z-50
        rounded-lg
        shadow-xl
        border-2
        border-brand-primary
        bg-brand-primary
        text-brand-text
      "
    >
      {/* HEADER: THEME + REFRESH + LOGOUT */}
      <div
        className="
          flex
          items-center
          justify-between
          px-4
          py-2
          border-b
          border-brand-border
          bg-brand-secondary
        "
      >
        {/* Left: Theme */}
        <div className="flex items-center space-x-2">
          <span className="font-medium">Theme:</span>
          {/* Light */}
          <button
            onClick={() => setTheme("light")}
            className={`
              text-sm px-2 py-1 rounded transition-colors
              ${
                themeMode === "light"
                  ? "bg-brand-accent text-white"
                  : "bg-brand-primary text-brand-text hover:opacity-80"
              }
            `}
            title="Light Mode"
            disabled={themeMode === null}
          >
            <FaSun />
          </button>
          {/* Dark */}
          <button
            onClick={() => setTheme("dark")}
            className={`
              text-sm px-2 py-1 rounded transition-colors
              ${
                themeMode === "dark"
                  ? "bg-brand-accent text-white"
                  : "bg-brand-primary text-brand-text hover:opacity-80"
              }
            `}
            title="Dark Mode"
            disabled={themeMode === null}
          >
            <FaMoon />
          </button>
        </div>

        {/* Right: Loading + Refresh + Logout */}
        <div className="flex items-center space-x-2">
          {(isRefreshing || isLoadingChildren) && (
            <>
              <FaSpinner className="animate-spin" size={16} />
              <span className="text-sm">
                {isRefreshing && isLoadingChildren
                  ? "Loading parent & children..."
                  : isRefreshing
                  ? "Loading parent..."
                  : "Loading children..."}
              </span>
            </>
          )}

          <button
            onClick={handleRefresh}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
          >
            Refresh Data
          </button>

          <button
            onClick={handleLogout}
            className="
              text-red-500
              hover:text-white
              hover:bg-red-600
              transition-colors
              p-1
              rounded
            "
            title="Disconnect"
          >
            <FaSignOutAlt size={16} />
          </button>
        </div>
      </div>

      {/* PORTFOLIO SUMMARY */}
      <div className="px-4 py-3 border-b border-brand-border">
        {/* Clear heading */}
        <h4 className="text-lg font-semibold mb-2">Portfolio Summary</h4>

        {/* Row for Flow, TopShot, TSHOT */}
        <div className="flex items-center justify-around">
          {/* Flow */}
          <div className="text-center">
            <p className="text-sm m-0">Flow</p>
            <ValueOrSkeleton
              value={
                isRefreshing || isLoadingChildren
                  ? undefined
                  : parseFloat(totalFlow).toFixed(2)
              }
              className="text-xl font-semibold"
              skeletonWidth="w-16"
              skeletonHeight="h-7"
            />
          </div>
          {/* TopShot */}
          <div className="text-center">
            <p className="text-sm m-0">TopShot</p>
            <ValueOrSkeleton
              // If loading, skeleton => undefined
              // Otherwise, show total (can be 0)
              value={
                isRefreshing || isLoadingChildren
                  ? undefined
                  : totalTopShotCounts
              }
              className="text-xl font-semibold"
              skeletonWidth="w-16"
              skeletonHeight="h-7"
            />
          </div>
          {/* TSHOT */}
          <div className="text-center">
            <p className="text-sm m-0">TSHOT</p>
            <ValueOrSkeleton
              value={
                isRefreshing || isLoadingChildren
                  ? undefined
                  : parseFloat(totalTSHOT).toFixed(1)
              }
              className="text-xl font-semibold"
              skeletonWidth="w-16"
              skeletonHeight="h-7"
            />
          </div>
        </div>

        {/* Tier breakdown or "No TopShot Collection" */}
        <div className="mt-3">
          {totalTopShotCounts > 0 ? (
            renderBreakdownVertical(aggregatedBreakdown)
          ) : (
            <div className="italic">No TopShot Collection</div>
          )}
        </div>
      </div>

      {/* INDIVIDUAL ACCOUNTS */}
      <div className="py-3 pb-0">
        <h4 className="text-lg font-semibold px-4 mb-2">Accounts Breakdown</h4>
        {allAccounts.map((account, index) => {
          // Basic count, or 0 if empty
          const topShotCount = account.nftDetails?.length ?? 0;
          // Breakdown of tiers
          const breakdown = calculateTierBreakdown(account.nftDetails);
          // Determine if this is the last account
          const isLastAccount = index === allAccounts.length - 1;

          return (
            <div
              key={account.address}
              className={`w-full shadow-md ${!isLastAccount ? "mb-3" : ""}`}
            >
              <div className="bg-brand-secondary px-2 py-1 flex justify-between items-center">
                <h5 className="text-base md:text-lg font-medium m-0">
                  {account.label}
                </h5>
                <button
                  onClick={() => navigator.clipboard.writeText(account.address)}
                  className="text-xs hover:opacity-80 flex items-center"
                >
                  <span className="truncate max-w-[140px]">
                    {account.address}
                  </span>
                  <FaClipboard className="ml-2" />
                </button>
              </div>

              <div className="bg-brand-primary px-2 py-2">
                {/* Row for Flow, TopShot, TSHOT */}
                <div className="flex items-center justify-around">
                  {/* Flow */}
                  <div className="text-center">
                    <p className="text-sm m-0">Flow</p>
                    <ValueOrSkeleton
                      value={
                        isRefreshing || isLoadingChildren
                          ? undefined
                          : parseFloat(account.flowBalance).toFixed(2)
                      }
                      className="text-xl font-semibold"
                      skeletonWidth="w-16"
                      skeletonHeight="h-7"
                    />
                  </div>
                  {/* TopShot */}
                  <div className="text-center">
                    <p className="text-sm m-0">TopShot</p>
                    <ValueOrSkeleton
                      value={
                        isRefreshing || isLoadingChildren
                          ? undefined
                          : topShotCount
                      }
                      className="text-xl font-semibold"
                      skeletonWidth="w-16"
                      skeletonHeight="h-7"
                    />
                  </div>
                  {/* TSHOT */}
                  <div className="text-center">
                    <p className="text-sm m-0">TSHOT</p>
                    <ValueOrSkeleton
                      value={
                        isRefreshing || isLoadingChildren
                          ? undefined
                          : parseFloat(account.tshotBalance || 0).toFixed(1)
                      }
                      className="text-xl font-semibold"
                      skeletonWidth="w-16"
                      skeletonHeight="h-7"
                    />
                  </div>
                </div>

                {/* Tier breakdown or "No TopShot Collection" */}
                <div className="mt-3">
                  {account.hasCollection ? (
                    Object.keys(breakdown).length > 0 ? (
                      renderBreakdownVertical(breakdown)
                    ) : (
                      <div className="italic">No tier data</div>
                    )
                  ) : (
                    <div className="italic">No TopShot Collection</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DropdownMenu;
