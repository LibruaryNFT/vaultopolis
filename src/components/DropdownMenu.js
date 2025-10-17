import React, { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaCopy, FaUser } from "react-icons/fa";
import * as fcl from "@onflow/fcl";

import { UserDataContext } from "../context/UserContext";


/* ------------ component ------------ */
const DropdownMenu = ({ closeMenu, buttonRef }) => {
  const navigate = useNavigate();
  const { user, dispatch, accountData } = useContext(UserDataContext);

  const parentAddr = accountData.parentAddress || user?.addr;
  const childrenAccounts = accountData.childrenData || [];



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



  const navigateTo = (path) => {
    closeMenu();
    navigate(path);
  };

  /* render --------------------------------------------------------- */
  return (
    <div
      ref={popRef}
      className="
        fixed top-[68px] left-0 w-screen
        md:absolute md:top-12 md:right-0 md:left-auto md:w-80
        mt-0
        rounded-lg border border-brand-border
        shadow-xl shadow-black/70
        bg-brand-secondary text-brand-text z-60
      "
    >
      {/* Tier 1: Identity & Status Header */}
      <div className="px-4 py-3 bg-brand-primary border-b border-brand-border">
        {/* Parent Account */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="flex-shrink-0">
            <img
              src="https://cdn.prod.website-files.com/68d31a12d30c3ba3a0928e1d/68d31a12d30c3ba3a092902a_Group%2047467.png"
              alt="Flow Wallet"
              className="w-8 h-8"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium truncate">
                {parentAddr.slice(0, 6)}...{parentAddr.slice(-4)}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(parentAddr)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Copy address"
              >
                <FaCopy className="text-xs" />
              </button>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-400">Connected</span>
            </div>
          </div>
        </div>

        {/* Child Account (if exists) */}
        {childrenAccounts.length > 0 && (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {childrenAccounts[0].displayName ? (
                <svg fill="none" viewBox="0 0 53 54" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" aria-label="Dapper Wallet">
                  <g fill="none" fillRule="evenodd" transform="translate(.197 .704)">
                    <path fill="#F5E3F7" d="M52.803 26.982C52.803 12.412 40.983.6 26.4.6 11.82.6 0 12.41 0 26.982v13.789c0 6.462 5.291 11.75 11.758 11.75h29.287c6.466 0 11.758-5.288 11.758-11.75V26.982z"></path>
                    <g>
                      <path fill="#FF5A9D" d="M45.92 22.847c0-4.049-1.191-19.768-16.434-22.15-13.545-2.116-24.77 2.144-27.628 15.72-2.859 13.576-.239 26.199 9.765 27.39 10.004 1.19 12.861.714 23.341.238 10.48-.477 10.956-17.149 10.956-21.198" transform="translate(3.2 5.333)"></path>
                      <path fill="#FFF" d="M32.763 11.307c-4.457 0-8.255 2.82-9.709 6.772-1.453-3.953-5.252-6.772-9.709-6.772-5.712 0-10.342 4.63-10.342 10.342 0 5.712 4.63 10.342 10.342 10.342 4.457 0 8.256-2.82 9.71-6.772 1.453 3.952 5.251 6.772 9.708 6.772 5.712 0 10.342-4.63 10.342-10.342 0-5.712-4.63-10.342-10.342-10.342" transform="translate(3.2 5.333)"></path>
                      <path fill="#7320D3" d="M13.556 14.364c-3.73 0-6.753 3.023-6.753 6.754 0 3.73 3.023 6.753 6.753 6.753s6.754-3.023 6.754-6.753-3.023-6.754-6.754-6.754M32.552 14.364c-3.73 0-6.754 3.023-6.754 6.754 0 3.73 3.024 6.753 6.754 6.753 3.73 0 6.754-3.023 6.754-6.753s-3.024-6.754-6.754-6.754" transform="translate(3.2 5.333)"></path>
                      <path fill="#FFF" d="M19.427 16.27c0 1.64-1.33 2.968-2.969 2.968-1.639 0-2.968-1.329-2.968-2.968s1.33-2.968 2.968-2.968c1.64 0 2.969 1.33 2.969 2.968M39.214 16.27c0 1.64-1.33 2.968-2.968 2.968-1.64 0-2.968-1.329-2.968-2.968s1.328-2.968 2.968-2.968c1.638 0 2.968 1.33 2.968 2.968" transform="translate(3.2 5.333)"></path>
                    </g>
                  </g>
                </svg>
              ) : (
                <img
                  src="https://cdn.prod.website-files.com/68d31a12d30c3ba3a0928e1d/68d31a12d30c3ba3a092902a_Group%2047467.png"
                  alt="Flow Wallet"
                  className="w-8 h-8"
                />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium truncate">
                  {childrenAccounts[0].addr.slice(0, 6)}...{childrenAccounts[0].addr.slice(-4)}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(childrenAccounts[0].addr)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Copy address"
                >
                  <FaCopy className="text-xs" />
                </button>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">Connected</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tier 2: Primary Navigation */}
      <div className="py-2">
        <button
          onClick={() => navigateTo('/profile')}
          className="w-full px-4 py-2 text-left hover:bg-white/5 transition-colors flex items-center space-x-3"
        >
          <FaUser className="text-brand-accent" />
          <span>My Profile</span>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-brand-border"></div>

      {/* Tier 3: Account & Wallet Management */}
      <div className="py-2">
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-left hover:bg-white/5 transition-colors flex items-center space-x-3"
        >
          <FaSignOutAlt className="text-red-400" />
          <span className="text-red-400">Disconnect</span>
        </button>
      </div>
    </div>
  );
};

export default DropdownMenu;
