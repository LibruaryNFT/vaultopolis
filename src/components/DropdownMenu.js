// src/components/DropdownMenu.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
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
  const { accountData, isRefreshing, isLoadingChildren, dispatch } =
    useContext(UserContext);

  const {
    parentAddress,
    flowBalance,
    nftDetails,
    tshotBalance,
    childrenData,
    hasCollection,
  } = accountData;

  const popoutRef = useRef(null);

  // ===== THEME LOGIC (Light or Dark) =====
  const [themeMode, setThemeMode] = useState(null);

  useEffect(() => {
    let storedMode = localStorage.getItem("themeMode");
    if (!storedMode) {
      // default to 'dark'
      storedMode = "dark";
      localStorage.setItem("themeMode", "dark");
    }
    setThemeMode(storedMode);
  }, []);

  useEffect(() => {
    if (themeMode === null) return; // not loaded yet
    applyTheme(themeMode);
  }, [themeMode]);

  const applyTheme = (mode) => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("themeMode", "dark");
    } else {
      // light
      document.documentElement.classList.remove("dark");
      localStorage.setItem("themeMode", "light");
    }
  };

  const setTheme = (mode) => {
    setThemeMode(mode);
  };

  // ====== CLICK OUTSIDE => close ======
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

  // ====== LOGOUT ======
  const handleLogout = () => {
    fcl.unauthenticate();
    dispatch({ type: "RESET_STATE" });
    closeMenu();
  };

  // ====== ACCOUNT SUMMARY ======
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

  // Tier color mapping
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

  // Build aggregated breakdown
  const aggregatedBreakdown = { ...calculateTierBreakdown(nftDetails) };
  childrenData.forEach((child) => {
    const childBreakdown = calculateTierBreakdown(child.nftDetails);
    Object.keys(childBreakdown).forEach((tier) => {
      aggregatedBreakdown[tier] =
        (aggregatedBreakdown[tier] || 0) + childBreakdown[tier];
    });
  });

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
      label: `Child Account ${index + 1}`,
      address: child.addr,
      flowBalance: child.flowBalance,
      tshotBalance: child.tshotBalance,
      nftDetails: child.nftDetails,
      hasCollection: child.hasCollection,
    })),
  ];

  const hasAnyTopShot = totalTopShotCounts > 0;

  const handleCopyAddress = (addr) => {
    navigator.clipboard.writeText(addr);
  };

  // ====== RENDER ======
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
        border
        border-brand-border
        bg-brand-primary
        text-brand-text
      "
    >
      {/* THEME ROW (Light / Dark) + Loading indicator */}
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
        {/* Left: 'Theme' + Buttons */}
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

        {/* Right: Loading + Logout */}
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
      <div className="px-4 py-2 border-b border-brand-border">
        <div className="flex">
          <div className="w-1/3">
            <div>
              <p className="text-sm m-0">Flow</p>
              <ValueOrSkeleton
                value={parseFloat(totalFlow).toFixed(2)}
                className="text-xl font-semibold"
                skeletonWidth="w-24"
                skeletonHeight="h-7"
              />
            </div>
            <div className="mt-2">
              <p className="text-sm m-0">TopShot</p>
              <ValueOrSkeleton
                value={hasAnyTopShot ? totalTopShotCounts : null}
                className="text-xl font-semibold"
                skeletonWidth="w-16"
                skeletonHeight="h-7"
              />
            </div>
            <div className="mt-2">
              <p className="text-sm m-0">TSHOT</p>
              <ValueOrSkeleton
                value={parseFloat(totalTSHOT).toFixed(1)}
                className="text-xl font-semibold"
                skeletonWidth="w-24"
                skeletonHeight="h-7"
              />
            </div>
          </div>
          <div className="w-2/3 pl-4">
            {hasAnyTopShot ? (
              renderBreakdownVertical(aggregatedBreakdown)
            ) : (
              <div className="italic">No TopShot Collection</div>
            )}
          </div>
        </div>
      </div>

      {/* INDIVIDUAL ACCOUNTS */}
      <div className="pb-0">
        {allAccounts.map((account) => {
          const breakdown = calculateTierBreakdown(account.nftDetails);
          const hasNFTs = (account.nftDetails || []).length > 0;

          return (
            <div
              key={account.address}
              className="w-full hover:shadow-xl transition-shadow"
            >
              <div className="bg-brand-secondary px-2 py-1 flex justify-between items-center">
                <h5 className="text-base md:text-lg font-medium m-0">
                  {account.label}
                </h5>
                <button
                  onClick={() => handleCopyAddress(account.address)}
                  className="text-xs hover:opacity-80 flex items-center"
                >
                  <span className="truncate max-w-[140px]">
                    {account.address}
                  </span>
                  <FaClipboard className="ml-2" />
                </button>
              </div>
              <div className="bg-brand-primary px-2 py-2">
                <div className="flex">
                  <div className="w-1/3">
                    <div>
                      <p className="text-sm m-0">Flow</p>
                      <ValueOrSkeleton
                        value={parseFloat(account.flowBalance).toFixed(2)}
                        className="text-xl font-semibold"
                        skeletonWidth="w-24"
                        skeletonHeight="h-7"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-sm m-0">TopShot</p>
                      <ValueOrSkeleton
                        value={hasNFTs ? account.nftDetails.length : null}
                        className="text-xl font-semibold"
                        skeletonWidth="w-16"
                        skeletonHeight="h-7"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-sm m-0">TSHOT</p>
                      <ValueOrSkeleton
                        value={parseFloat(account.tshotBalance || 0).toFixed(1)}
                        className="text-xl font-semibold"
                        skeletonWidth="w-24"
                        skeletonHeight="h-7"
                      />
                    </div>
                  </div>
                  <div className="w-2/3 pl-4">
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DropdownMenu;
