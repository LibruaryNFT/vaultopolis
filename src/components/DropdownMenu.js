import React, { useContext, useEffect, useRef } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { FaSignOutAlt, FaClipboard } from "react-icons/fa";

const DropdownMenu = ({ closeMenu, buttonRef }) => {
  const { user, tshotBalance, network, tierCounts, dispatch } =
    useContext(UserContext);
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

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(user.addr);
    closeMenu();
  };

  const handleLogout = () => {
    fcl.unauthenticate();
    dispatch({ type: "RESET_STATE" });
    closeMenu();
  };

  const totalTopShotMoments = Object.values(tierCounts || {}).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div
      ref={popoutRef}
      className="absolute top-12 right-0 mt-2 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 p-4"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col text-left">
          <span
            className="cursor-pointer hover:underline flex items-center text-blue-400"
            onClick={handleCopyAddress}
          >
            {user.addr} <FaClipboard className="ml-2" />
          </span>
          <span className="text-gray-400 text-sm">{network}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-white hover:bg-red-600 p-2 rounded-full"
          title="Disconnect"
        >
          <FaSignOutAlt size={20} />
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <BalanceInfo
          tshotBalance={tshotBalance}
          totalTopShotMoments={totalTopShotMoments}
        />
        <PricingInfo />
      </div>
    </div>
  );
};

const BalanceInfo = ({ tshotBalance, totalTopShotMoments }) => (
  <>
    <div className="block p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">
      <p className="text-lg font-semibold text-white">
        {parseFloat(tshotBalance || 0).toFixed(1)} $TSHOT
      </p>
      <p className="text-sm text-gray-400">
        ${(parseFloat(tshotBalance || 0) * 0.25).toFixed(2)} USD (Approx.)
      </p>
    </div>
    <div className="block p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">
      <p className="text-lg font-semibold text-white">
        {totalTopShotMoments} Common Moments
      </p>
      <p className="text-sm text-gray-400">
        ${(totalTopShotMoments * 0.25).toFixed(2)} USD (Approx.)
      </p>
    </div>
  </>
);

const PricingInfo = () => (
  <div className="p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">
    <h4 className="text-lg font-semibold text-blue-400">Pricing Information</h4>
    <ul className="text-sm text-gray-300 mt-2 space-y-1">
      <li>1 $TSHOT ≈ $0.25 USD</li>
      <li>1 Common TopShot Moment ≈ $0.25 USD</li>
    </ul>
  </div>
);

export default DropdownMenu;
