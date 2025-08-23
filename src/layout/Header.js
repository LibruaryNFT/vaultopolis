/* src/layout/Header.jsx */
import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import * as fcl from "@onflow/fcl";

import { UserDataContext } from "../context/UserContext";
import DropdownMenu from "../components/DropdownMenu";

const Header = () => {
  const { user, selectedAccount, accountData } = useContext(UserDataContext);

  /* ───────── local state ───────── */
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const buttonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const productsDropdownRef = useRef(null);
  const toolsDropdownRef = useRef(null);
  const location = useLocation();

  /* ───────── helpers ───────── */
  // 1) Profile must *always* go to the parent
  const parentAddress = accountData?.parentAddress || user?.addr || "";

  // 2) User-button shows whichever account is active for swapping
  const userButtonAddr = selectedAccount || parentAddress;

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

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(e.target)) {
        setIsProductsDropdownOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target)) {
        setIsToolsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ───────── render ───────── */
  return (
    <header className="w-full relative z-50 shadow-md shadow-black/30 bg-brand-primary text-brand-text">
      <div className="border-b border-brand-border px-3 py-4 flex items-center justify-between">
        {/* ── Left: logo + hamburger ── */}
        <div className="flex items-center">
          <button onClick={toggleMobileMenu} className="md:hidden">
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          <Link to="/" className="ml-2 flex items-center">
            <img
              src="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png"
              alt="Vaultopolis Icon"
              className="w-8 h-8 max-[375px]:block hidden object-contain"
            />
            <img
              src="https://storage.googleapis.com/vaultopolis/Vaultopolis.png"
              alt="Vaultopolis Logo"
              className="w-44 object-contain max-[375px]:hidden block"
            />
          </Link>
        </div>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center space-x-4 flex-grow justify-center">
          <NavLink 
            to="/" 
            isActive={isHome}
            onMouseEnter={() => {
              setIsProductsDropdownOpen(false);
              setIsToolsDropdownOpen(false);
            }}
          >
            Swap
          </NavLink>
          
          {/* Products Dropdown */}
          <div className="relative" ref={productsDropdownRef}>
            <button
              onMouseEnter={() => {
                setIsToolsDropdownOpen(false);
                setIsProductsDropdownOpen(true);
              }}
              className="flex items-center py-2 px-4 rounded-md whitespace-nowrap hover:opacity-80 select-none text-brand-text"
            >
              Products <FaChevronDown size={12} className="ml-1" />
            </button>
            {isProductsDropdownOpen && (
              <div
                onMouseLeave={() => setIsProductsDropdownOpen(false)}
                className="absolute top-full left-0 mt-1 w-48 bg-brand-secondary rounded-md shadow-lg shadow-black/50 border border-brand-border transition-all duration-200 ease-in-out"
              >
                <NavLink to="/tshot" isActive={location.pathname === "/tshot"}>
                  TSHOT
                </NavLink>
              </div>
            )}
          </div>

          {/* Tools Dropdown */}
          <div className="relative" ref={toolsDropdownRef}>
            <button
              onMouseEnter={() => {
                setIsProductsDropdownOpen(false);
                setIsToolsDropdownOpen(true);
              }}
              className="flex items-center py-2 px-4 rounded-md whitespace-nowrap hover:opacity-80 select-none text-brand-text"
            >
              Tools <FaChevronDown size={12} className="ml-1" />
            </button>
            {isToolsDropdownOpen && (
              <div
                onMouseLeave={() => setIsToolsDropdownOpen(false)}
                className="absolute top-full left-0 mt-1 w-48 bg-brand-secondary rounded-md shadow-lg shadow-black/50 border border-brand-border transition-all duration-200 ease-in-out"
              >
                                 <NavLink to="/transfer" isActive={location.pathname === "/transfer"}>
                   Transfer Hub
                 </NavLink>
              </div>
            )}
          </div>

          <NavLink 
            to="/analytics" 
            isActive={location.pathname === "/analytics"}
            onMouseEnter={() => {
              setIsProductsDropdownOpen(false);
              setIsToolsDropdownOpen(false);
            }}
          >
            Analytics
          </NavLink>
          <NavLink 
            to="/guides" 
            isActive={location.pathname.startsWith("/guides")}
            onMouseEnter={() => {
              setIsProductsDropdownOpen(false);
              setIsToolsDropdownOpen(false);
            }}
          >
            Guides
          </NavLink>
          <NavLink 
            to="/about" 
            isActive={location.pathname === "/about"}
            onMouseEnter={() => {
              setIsProductsDropdownOpen(false);
              setIsToolsDropdownOpen(false);
            }}
          >
            About
          </NavLink>
        </nav>

        {/* ── Right: connect / account ── */}
        <div className="flex items-center space-x-2">
          {user.loggedIn ? (
            <div className="relative">
              <UserButton
                ref={buttonRef}
                onClick={toggleMenu}
                activeAddress={userButtonAddr}
              />
              {/* selected OR parent */}
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
            className="
              absolute top-[68px] left-0 w-full md:hidden
              bg-brand-secondary text-brand-text
              shadow-md shadow-black/50
            "
          >
            <div className="flex flex-col divide-y divide-brand-border">
              <MobileNavLink
                to="/"
                isActive={isHome}
                onClick={toggleMobileMenu}
              >
                Swap
              </MobileNavLink>
              
              {/* Products Section */}
              <div className="py-2 px-4 text-brand-text/70 text-sm font-medium">
                Products
              </div>
              <MobileNavLink
                to="/tshot"
                isActive={location.pathname === "/tshot"}
                onClick={toggleMobileMenu}
                className="pl-8"
              >
                TSHOT
              </MobileNavLink>
              
              {/* Tools Section */}
              <div className="py-2 px-4 text-brand-text/70 text-sm font-medium">
                Tools
              </div>
                             <MobileNavLink
                 to="/transfer"
                 isActive={location.pathname === "/transfer"}
                 onClick={toggleMobileMenu}
                 className="pl-8"
               >
                 Transfer Hub
               </MobileNavLink>
              
              <MobileNavLink
                to="/analytics"
                isActive={location.pathname === "/analytics"}
                onClick={toggleMobileMenu}
              >
                Analytics
              </MobileNavLink>
              <MobileNavLink
                to="/guides"
                isActive={location.pathname.startsWith("/guides")}
                onClick={toggleMobileMenu}
              >
                Guides
              </MobileNavLink>
              <MobileNavLink
                to="/about"
                isActive={location.pathname === "/about"}
                onClick={toggleMobileMenu}
              >
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
    className={`
      py-2 px-4 rounded-md whitespace-nowrap hover:opacity-80 select-none
      text-brand-text ${isActive ? "font-bold" : ""} ${className}
    `}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, isActive, children, onClick, className = "" }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`
      w-full text-center py-4 hover:opacity-80 select-none
      text-brand-text ${isActive ? "font-bold" : ""} ${className}
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
      shadow-md shadow-black/30 hover:shadow-lg hover:shadow-black/50
    "
  >
    <FaUserCircle size={18} className="mr-2" />
    <span className="truncate max-w-[80px]">{activeAddress}</span>
  </button>
));

export default Header;
