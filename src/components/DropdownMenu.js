import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaSpinner, FaSun, FaMoon } from "react-icons/fa";
import * as fcl from "@onflow/fcl";

import { UserDataContext } from "../context/UserContext";

/* tiny Cadence scripts */
import { getFLOWBalance } from "../flow/getFLOWBalance";
import { getTSHOTBalance } from "../flow/getTSHOTBalance";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionLength";
import { getChildren } from "../flow/getChildren";

/* ─── small helper ─── */
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

/* ─── component ─── */
const DropdownMenu = ({ closeMenu, buttonRef }) => {
  const navigate = useNavigate();
  const { user, dispatch, accountData } = useContext(UserDataContext);

  const parentAddr = accountData.parentAddress || user?.addr;
  const loggedIn = !!parentAddr;

  /* quick totals ---------------------------------------------------- */
  const [stats, setStats] = useState({
    loading: true,
    flow: 0,
    tshot: 0,
    moments: 0,
  });

  useEffect(() => {
    if (!loggedIn) return;
    let mounted = true;

    (async () => {
      try {
        /* child addresses (if any) */
        let childAddrs = [];
        try {
          childAddrs = await fcl.query({
            cadence: getChildren,
            args: (arg, t) => [arg(parentAddr, t.Address)],
          });
        } catch {
          childAddrs = [];
        }

        const addresses = [parentAddr, ...childAddrs];

        /* run 3 tiny scripts per address in parallel */
        const per = await Promise.all(
          addresses.map(async (addr) => {
            const [flow, tshot, moms] = await Promise.all([
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
            return { flow: +flow, tshot: +tshot, moments: +moms };
          })
        );

        const totals = per.reduce(
          (a, c) => ({
            flow: a.flow + c.flow,
            tshot: a.tshot + c.tshot,
            moments: a.moments + c.moments,
          }),
          { flow: 0, tshot: 0, moments: 0 }
        );

        mounted && setStats({ loading: false, ...totals });
      } catch (e) {
        console.error("quick-stats:", e);
        mounted && setStats({ loading: false, flow: 0, tshot: 0, moments: 0 });
      }
    })();

    return () => (mounted = false);
  }, [loggedIn, parentAddr]);

  /* theme toggle ---------------------------------------------------- */
  const [theme, setTheme] = useState(
    () => localStorage.getItem("themeMode") || "dark"
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("themeMode", theme);
  }, [theme]);

  /* click-outside to close ----------------------------------------- */
  const popRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (
        popRef.current &&
        !popRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [closeMenu, buttonRef]);

  /* actions -------------------------------------------------------- */
  const logout = () => {
    fcl.unauthenticate();
    dispatch({ type: "RESET_STATE" });
    closeMenu();
  };

  const openProfile = () => {
    closeMenu();
    const path = loggedIn ? `/profile/${parentAddr}` : "/profile";
    navigate(path);
  };

  /* render --------------------------------------------------------- */
  return (
    <div
      ref={popRef}
      className="
        absolute top-12 right-0 mt-2
        w-[calc(100vw-32px)] md:w-80
        rounded-lg border-2 border-brand-primary
        shadow-xl bg-brand-primary text-brand-text z-50
      "
    >
      {/* header row */}
      <div className="flex justify-between items-center px-4 py-2 bg-brand-secondary border-b border-brand-border">
        {/* theme toggle */}
        <div className="flex items-center space-x-2">
          <span className="font-medium">Theme:</span>
          <button
            onClick={() => setTheme("light")}
            className={`p-1 rounded text-sm ${
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
            className={`p-1 rounded text-sm ${
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
            title="Disconnect"
            className="p-1 rounded text-red-500 hover:text-white hover:bg-red-600"
          >
            <FaSignOutAlt size={16} />
          </button>
        </div>
      </div>

      {/* portfolio */}
      <div className="px-4 py-4">
        <h4 className="text-lg font-semibold mb-3">Portfolio</h4>
        <div className="flex justify-around items-center">
          <div className="text-center">
            <p className="text-sm m-0">Flow</p>
            <ValueOrSkeleton
              value={stats.loading ? undefined : stats.flow.toFixed(2)}
              className="text-xl font-semibold"
            />
          </div>
          <div className="text-center">
            <p className="text-sm m-0">Moments</p>
            <ValueOrSkeleton
              value={stats.loading ? undefined : stats.moments}
              className="text-xl font-semibold"
            />
          </div>
          <div className="text-center">
            <p className="text-sm m-0">TSHOT</p>
            <ValueOrSkeleton
              value={stats.loading ? undefined : stats.tshot.toFixed(1)}
              className="text-xl font-semibold"
            />
          </div>
        </div>

        <button
          onClick={openProfile}
          className="w-full mt-5 py-2 rounded text-sm font-medium
                     bg-brand-accent text-white hover:opacity-90"
        >
          View full profile →
        </button>
      </div>
    </div>
  );
};

export default DropdownMenu;
