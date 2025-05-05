/*  src/components/DropdownMenu.jsx
    ------------------------------------------------------------
    Lightweight wallet pop-over (no full UserContext refresh)
    ------------------------------------------------------------
*/
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import * as fcl from "@onflow/fcl";

/* Cadence scripts (tiny reads) */
import { getFLOWBalance } from "../flow/getFLOWBalance";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionLength";
import { getChildren } from "../flow/getChildren";

import { FaSignOutAlt, FaSpinner, FaSun, FaMoon } from "react-icons/fa";

/* ---------- skeleton helper ---------- */
const ValueOrSkeleton = ({
  value,
  className = "",
  skeletonWidth = "w-20",
  skeletonHeight = "h-6",
}) =>
  value !== undefined && value !== null ? (
    <span className={className}>{value}</span>
  ) : (
    <div
      className={`${skeletonWidth} ${skeletonHeight} bg-brand-secondary animate-pulse rounded`}
    />
  );

const DropdownMenu = ({ closeMenu, buttonRef }) => {
  const navigate = useNavigate();
  const { user, dispatch, accountData } = useContext(UserDataContext);

  /* ---------- parent address ---------- */
  const parentAddr = accountData.parentAddress || user?.addr;
  const loggedIn = !!parentAddr;

  /* ---------- quick stats state ---------- */
  const [stats, setStats] = useState({
    loading: true,
    flow: 0,
    tshot: 0,
    moments: 0,
  });

  /* ---------- fetch quick stats ---------- */
  useEffect(() => {
    if (!loggedIn) return;

    let mounted = true;

    const fetchTotals = async () => {
      try {
        /* 1️⃣ get child addresses (may throw if no custody set up) */
        let childAddrs = [];
        try {
          childAddrs = await fcl.query({
            cadence: getChildren,
            args: (arg, t) => [arg(parentAddr, t.Address)],
          });
        } catch (_) {
          childAddrs = [];
        }

        const addresses = [parentAddr, ...childAddrs];

        /* 2️⃣ run three tiny scripts for every address in parallel */
        const perAddr = await Promise.all(
          addresses.map(async (addr) => {
            const [flow, tshot, moments] = await Promise.all([
              fcl.query({
                cadence: getFLOWBalance,
                args: (arg, t) => [arg(addr, t.Address)],
              }),
              fcl.query({
                cadence: getTSHOTBalance,
                args: (arg, t) => [arg(addr, t.Address)],
              }),
              fcl.query({
                cadence: getTopShotCollectionIDs,
                args: (arg, t) => [arg(addr, t.Address)],
              }),
            ]);
            return {
              flow: Number(flow),
              tshot: Number(tshot),
              moments: Number(moments),
            };
          })
        );

        /* 3️⃣ aggregate totals */
        const totals = perAddr.reduce(
          (acc, cur) => ({
            flow: acc.flow + cur.flow,
            tshot: acc.tshot + cur.tshot,
            moments: acc.moments + cur.moments,
          }),
          { flow: 0, tshot: 0, moments: 0 }
        );

        if (mounted) setStats({ loading: false, ...totals });
      } catch (err) {
        console.error("Dropdown quick-stats error:", err);
        if (mounted)
          setStats({ loading: false, flow: 0, tshot: 0, moments: 0 });
      }
    };

    fetchTotals();
    return () => {
      mounted = false;
    };
  }, [parentAddr, loggedIn]);

  /* ---------- theme (local) ---------- */
  const [theme, setTheme] = useState(
    () => localStorage.getItem("themeMode") || "dark"
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("themeMode", theme);
  }, [theme]);

  /* ---------- click-outside ---------- */
  const popoutRef = useRef(null);
  useEffect(() => {
    const handleClick = (e) => {
      if (
        popoutRef.current &&
        !popoutRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [closeMenu, buttonRef]);

  /* ---------- actions ---------- */
  const logout = () => {
    fcl.unauthenticate();
    dispatch({ type: "RESET_STATE" });
    closeMenu();
  };
  const openProfile = () => {
    closeMenu();
    navigate("/profile");
  };

  /* ---------- render ---------- */
  return (
    <div
      ref={popoutRef}
      className="
        absolute top-12 right-0 mt-2
        w-[calc(100vw-32px)] md:w-80
        z-50 rounded-lg shadow-xl
        border-2 border-brand-primary
        bg-brand-primary text-brand-text
      "
    >
      {/* header: theme + spinner + logout */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border bg-brand-secondary">
        {/* theme toggle */}
        <div className="flex items-center space-x-2">
          <span className="font-medium">Theme:</span>
          <button
            onClick={() => setTheme("light")}
            className={`text-sm p-1 rounded ${
              theme === "light"
                ? "bg-brand-accent text-white"
                : "hover:opacity-80"
            }`}
            title="Light mode"
          >
            <FaSun />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`text-sm p-1 rounded ${
              theme === "dark"
                ? "bg-brand-accent text-white"
                : "hover:opacity-80"
            }`}
            title="Dark mode"
          >
            <FaMoon />
          </button>
        </div>

        {/* spinner + logout */}
        <div className="flex items-center space-x-3">
          {stats.loading && <FaSpinner className="animate-spin" size={16} />}
          <button
            onClick={logout}
            className="text-red-500 hover:text-white hover:bg-red-600 p-1 rounded"
            title="Disconnect"
          >
            <FaSignOutAlt size={16} />
          </button>
        </div>
      </div>

      {/* headline totals */}
      <div className="px-4 py-4">
        <h4 className="text-lg font-semibold mb-3">Portfolio</h4>
        <div className="flex items-center justify-around">
          {/* Flow */}
          <div className="text-center">
            <p className="text-sm m-0">Flow</p>
            <ValueOrSkeleton
              value={stats.loading ? undefined : stats.flow.toFixed(2)}
              className="text-xl font-semibold"
            />
          </div>
          {/* Moments */}
          <div className="text-center">
            <p className="text-sm m-0">Moments</p>
            <ValueOrSkeleton
              value={stats.loading ? undefined : stats.moments}
              className="text-xl font-semibold"
            />
          </div>
          {/* TSHOT */}
          <div className="text-center">
            <p className="text-sm m-0">TSHOT</p>
            <ValueOrSkeleton
              value={stats.loading ? undefined : stats.tshot.toFixed(1)}
              className="text-xl font-semibold"
            />
          </div>
        </div>

        {/* CTA → full profile */}
        <button
          onClick={openProfile}
          className="w-full mt-5 bg-brand-accent hover:opacity-90 text-white py-2 rounded text-sm font-medium"
        >
          View full profile →
        </button>
      </div>
    </div>
  );
};

export default DropdownMenu;
