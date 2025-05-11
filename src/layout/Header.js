import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import * as fcl from "@onflow/fcl";

import { UserDataContext } from "../context/UserContext";
import DropdownMenu from "../components/DropdownMenu";

/* ────────────────────────────────────────────────────────── */

const Header = () => {
  const { user, selectedAccount } = useContext(UserDataContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const buttonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const location = useLocation();

  /* -------- profile helpers -------- */
  const activeAddress = selectedAccount || user?.addr;
  const profilePath = `/profile/${activeAddress}`;
  const profileActive = location.pathname.startsWith("/profile/");

  /* -------- nav helpers -------- */
  const isHome = location.pathname === "/";

  const toggleMenu = () => setIsMenuOpen((p) => !p);
  const toggleMobileMenu = () => setIsMobileMenuOpen((p) => !p);
  const connectWallet = () => fcl.authenticate();

  /* close mobile drawer on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobileMenuOpen]);

  /* ───────── render ───────── */
  return (
    <header className="w-full relative z-50 shadow-md shadow-black/30 bg-brand-primary text-brand-text">
      <div className="border-b border-brand-border px-3 py-4 flex items-center justify-between">
        {/* ── Left: logo + hamburger ── */}
        <div className="flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden focus:outline-none"
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          <Link to="/" className="ml-2 flex items-center">
            <img
              src="https://storage.googleapis.com/vaultopolis/Vaultopolis.png"
              alt="Vaultopolis Logo"
              className="max-h-8"
            />
          </Link>
        </div>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center space-x-4 flex-grow justify-center">
          <NavLink to="/" isActive={isHome}>
            Swap
          </NavLink>
          <NavLink to="/tshot" isActive={location.pathname === "/tshot"}>
            TSHOT
          </NavLink>
          <NavLink to="/transfer" isActive={location.pathname === "/transfer"}>
            Bulk Transfer
          </NavLink>

          {/* Profile only when wallet connected */}
          {user.loggedIn && (
            <NavLink to={profilePath} isActive={profileActive}>
              Profile
            </NavLink>
          )}
        </nav>

        {/* ── Right: connect / account ── */}
        <div className="flex items-center space-x-2">
          {user.loggedIn ? (
            <div className="relative">
              <UserButton
                ref={buttonRef}
                onClick={toggleMenu}
                activeAddress={activeAddress}
              />
              {isMenuOpen && (
                <DropdownMenu
                  closeMenu={() => setIsMenuOpen(false)}
                  buttonRef={buttonRef}
                />
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-2 rounded bg-brand-accent text-white transition-colors hover:opacity-80"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed top-[68px] inset-x-0 bottom-0 bg-black/40 z-40" />
          <div
            ref={mobileMenuRef}
            className="
              absolute top-[68px] left-0 w-full md:hidden z-50
              bg-brand-secondary text-brand-text
              shadow-md shadow-black/50
            "
          >
            <div className="flex flex-col divide-y divide-brand-border dark:divide-gray-700">
              <MobileNavLink
                to="/"
                isActive={isHome}
                onClick={toggleMobileMenu}
              >
                Swap
              </MobileNavLink>
              <MobileNavLink
                to="/tshot"
                isActive={location.pathname === "/tshot"}
                onClick={toggleMobileMenu}
              >
                TSHOT
              </MobileNavLink>
              <MobileNavLink
                to="/transfer"
                isActive={location.pathname === "/transfer"}
                onClick={toggleMobileMenu}
              >
                Bulk Transfer
              </MobileNavLink>

              {/* Profile only when wallet connected */}
              {user.loggedIn && (
                <MobileNavLink
                  to={profilePath}
                  isActive={profileActive}
                  onClick={toggleMobileMenu}
                >
                  Profile
                </MobileNavLink>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

/* ---------- helpers ---------- */

const NavLink = ({ to, isActive, children }) => (
  <Link
    to={to}
    className={`
      py-2 px-4 rounded-md whitespace-nowrap
      transition-colors hover:opacity-80
      text-brand-text ${isActive ? "font-bold" : ""}
    `}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, isActive, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`
      w-full text-center py-4
      transition-colors hover:opacity-80
      text-brand-text ${isActive ? "font-bold" : ""}
    `}
  >
    {children}
  </Link>
);

const UserButton = React.forwardRef(({ onClick, activeAddress }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className="
      flex items-center px-3 py-2 rounded
      bg-brand-secondary text-brand-text text-sm
      shadow-md shadow-black/30
      transition-all hover:shadow-lg hover:shadow-black/50
    "
  >
    <FaUserCircle className="mr-2" size={18} />
    <span className="truncate max-w-[80px]">{activeAddress}</span>
  </button>
));

export default Header;
