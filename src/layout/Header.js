import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import * as fcl from "@onflow/fcl";

import { UserDataContext } from "../context/UserContext";
import DropdownMenu from "../components/DropdownMenu";
import NotificationCenter from "../components/NotificationCenter";

const Header = () => {
  const { user, selectedAccount, accountData } = useContext(UserDataContext);

  /* ───────── local state ───────── */
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Refs for UI elements
  const buttonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  const location = useLocation();

  /* ───────── helpers ───────── */
  const parentAddress = accountData?.parentAddress || user?.addr || "";
  const userButtonAddr = selectedAccount || parentAddress;

  const toggleMenu = () => setIsMenuOpen((p) => !p);
  const connectWallet = () => fcl.authenticate();
  
  /* ─── Mobile Menu Logic ─── */
  const toggleMobileMenu = () => setIsMobileMenuOpen((p) => !p);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  /* ─── Mobile Menu Effects ─── */
  // Close mobile drawer on outside click
  useEffect(() => {
    const handler = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        closeMobileMenu();
      }
    };
    if (isMobileMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobileMenuOpen]);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);


  return (
    <header className="w-full relative z-50 shadow-md shadow-black/30 bg-brand-primary text-brand-text">
      <div className="border-b border-brand-border px-3 py-4 flex items-center justify-between">
        {/* ── Left: logo + hamburger ── */}
        <div className="flex items-center">
          <button onClick={toggleMobileMenu} className="lg:hidden">
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <Link to="/" className="ml-2 flex items-center">
            <img
              src="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png"
              alt="Vaultopolis Icon"
              className="w-8 h-8 block sm:hidden object-contain"
            />
            <img
              src="https://storage.googleapis.com/vaultopolis/Vaultopolis.png"
              alt="Vaultopolis Logo"
              className="w-44 object-contain hidden sm:block"
            />
          </Link>
        </div>

        {/* ── Desktop nav ── */}
        <nav className="hidden lg:flex items-center space-x-0 flex-grow justify-center h-10">
          <NavLink 
            to="/swap" 
            isActive={location.pathname === "/swap"}
          >
            Swap
          </NavLink>

          <div className="w-px h-6 bg-white/20 mx-2" />

          <NavLink 
            to="/vaults/tshot" 
            isActive={location.pathname === "/vault-contents" || location.pathname === "/vaults/tshot" || location.pathname === "/vaults/treasury" || location.pathname === "/vaults/topshotgrails" || location.pathname === "/vaults/alldaygrails"}
          >
            Vaults
          </NavLink>

          <div className="w-px h-6 bg-white/20 mx-2" />

          <NavLink 
            to="/bounties/topshot" 
            isActive={location.pathname.startsWith("/bounties")}
          >
            Grail Bounties
          </NavLink>

        </nav>

        {/* ── Right: notifications + connect / account ── */}
        <div className="flex items-center space-x-2">
          <NotificationCenter />
          
          {user.loggedIn ? (
            <div className="relative">
              <UserButton
                ref={buttonRef}
                onClick={toggleMenu}
                activeAddress={userButtonAddr}
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
              className="px-4 py-2 rounded bg-brand-accent text-white hover:opacity-80"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed top-[68px] inset-x-0 bottom-0 bg-black/40" />
          <div
            ref={mobileMenuRef}
            className="absolute top-[68px] left-0 w-full lg:hidden bg-brand-secondary text-brand-text shadow-md shadow-black/50"
          >
            <div className="flex flex-col">
              {/* Primary Actions */}
              <MobileNavLink to="/swap" isActive={location.pathname === "/swap"} onClick={toggleMobileMenu}>
                Swap
              </MobileNavLink>
              <div className="w-full h-px bg-white/20" />
              <MobileNavLink to="/vaults/tshot" isActive={location.pathname === "/vault-contents" || location.pathname === "/vaults/tshot" || location.pathname === "/vaults/treasury" || location.pathname === "/vaults/topshotgrails" || location.pathname === "/vaults/alldaygrails"} onClick={closeMobileMenu}>
                Vaults
              </MobileNavLink>
              <div className="w-full h-px bg-white/20" />
              <MobileNavLink to="/bounties/topshot" isActive={location.pathname.startsWith("/bounties")} onClick={closeMobileMenu}>
                Grail Bounties
              </MobileNavLink>
              
              {/* Separator between primary and secondary */}
              <div className="w-full h-0.5 bg-white/30 my-2" />
              
              {/* Secondary Items */}
              <MobileNavLink to="/tshot" isActive={location.pathname === "/tshot"} onClick={closeMobileMenu}>
                TSHOT
              </MobileNavLink>
              <div className="w-full h-px bg-white/20" />
              <MobileNavLink to="/guides" isActive={(location.pathname === "/guides" || location.pathname.startsWith("/guides/")) && location.pathname !== "/guides/faq"} onClick={closeMobileMenu}>
                Guides
              </MobileNavLink>
              <div className="w-full h-px bg-white/20" />
              <MobileNavLink to="/about" isActive={location.pathname === "/about"} onClick={closeMobileMenu}>
                About
              </MobileNavLink>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

/* ── helper components ── */

const NavLink = ({ to, isActive, children, className = "" }) => (
  <Link
    to={to}
    className={`py-2 px-4 rounded-md whitespace-nowrap select-none font-semibold text-brand-text transition-all duration-200 h-10 flex items-center justify-center ${isActive ? "opacity-100 font-bold" : "opacity-70 hover:opacity-100"} ${className}`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, isActive, children, onClick, className = "" }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`w-full py-4 hover:opacity-80 select-none text-brand-text flex items-center justify-center ${isActive ? "font-bold" : ""} ${className}`}
  >
    {children}
  </Link>
);


const UserButton = React.forwardRef(({ onClick, activeAddress }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className="flex items-center px-3 py-2 rounded bg-brand-secondary text-brand-text text-sm shadow-md shadow-black/30 hover:shadow-lg hover:shadow-black/50"
    title={activeAddress || "Profile"}
    aria-label="Open profile menu"
  >
    <FaUserCircle size={18} className="mr-2" />
    <span>Profile</span>
  </button>
));

export default Header;