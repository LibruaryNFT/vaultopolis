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
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [productsTimeout, setProductsTimeout] = useState(null);
  const [toolsTimeout, setToolsTimeout] = useState(null);
  const [resourcesTimeout, setResourcesTimeout] = useState(null);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const buttonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const productsDropdownRef = useRef(null);
  const toolsDropdownRef = useRef(null);
  const resourcesDropdownRef = useRef(null);
  const location = useLocation();

  /* ───────── helpers ───────── */
  // 1) Profile must *always* go to the parent
  const parentAddress = accountData?.parentAddress || user?.addr || "";

  // 2) User-button shows whichever account is active for swapping
  const userButtonAddr = selectedAccount || parentAddress;

  const isHome = location.pathname === "/";

  const toggleMenu = () => setIsMenuOpen((p) => !p);
  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    
    // Reset all collapsible sections when opening menu
    if (newState) {
      setMobileProductsOpen(false);
      setMobileToolsOpen(false);
      setMobileResourcesOpen(false);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setMobileProductsOpen(false);
    setMobileToolsOpen(false);
    setMobileResourcesOpen(false);
  };
  const connectWallet = () => fcl.authenticate();

  /* ───────── dropdown helpers ───────── */
  const closeDropdownWithDelay = (setter, timeoutSetter, timeoutValue) => {
    if (timeoutValue) {
      clearTimeout(timeoutValue);
    }
    const timeout = setTimeout(() => setter(false), 300);
    timeoutSetter(timeout);
  };

  const openDropdown = (setter, closeOther1, closeOther2, timeoutSetter1, timeoutSetter2) => {
    // Clear any pending timeouts for other dropdowns
    if (timeoutSetter1) timeoutSetter1(null);
    if (timeoutSetter2) timeoutSetter2(null);
    
    closeOther1(false);
    closeOther2(false);
    setter(true);
  };

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
      if (resourcesDropdownRef.current && !resourcesDropdownRef.current.contains(e.target)) {
        setIsResourcesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* cleanup timeouts on unmount */
  useEffect(() => {
    return () => {
      if (productsTimeout) clearTimeout(productsTimeout);
      if (toolsTimeout) clearTimeout(toolsTimeout);
      if (resourcesTimeout) clearTimeout(resourcesTimeout);
    };
  }, [productsTimeout, toolsTimeout, resourcesTimeout]);

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
        <nav 
          className="hidden md:flex items-center space-x-4 flex-grow justify-center"
          onMouseLeave={() => {
            closeDropdownWithDelay(setIsProductsDropdownOpen, setProductsTimeout, productsTimeout);
            closeDropdownWithDelay(setIsToolsDropdownOpen, setToolsTimeout, toolsTimeout);
            closeDropdownWithDelay(setIsResourcesDropdownOpen, setResourcesTimeout, resourcesTimeout);
          }}
        >
          <NavLink 
            to="/" 
            isActive={isHome}
            onMouseEnter={() => {
              setIsProductsDropdownOpen(false);
              setIsToolsDropdownOpen(false);
              setIsResourcesDropdownOpen(false);
            }}
          >
            Swap
          </NavLink>
          
          {/* Products Dropdown */}
          <div 
            className="relative" 
            ref={productsDropdownRef}
            onMouseEnter={() => openDropdown(setIsProductsDropdownOpen, setIsToolsDropdownOpen, setIsResourcesDropdownOpen, setToolsTimeout, setResourcesTimeout)}
            onMouseLeave={() => closeDropdownWithDelay(setIsProductsDropdownOpen, setProductsTimeout, productsTimeout)}
          >
            <button
              className="flex items-center py-2 px-4 rounded-md whitespace-nowrap hover:opacity-80 select-none text-brand-text"
            >
              Products <FaChevronDown size={12} className="ml-1" />
            </button>
            {isProductsDropdownOpen && (
              <>
                {/* Invisible bridge to prevent menu from closing */}
                <div className="absolute top-full left-0 w-48 h-1 bg-transparent" />
                <div
                  className="absolute top-full left-0 w-48 bg-brand-secondary rounded-md shadow-lg shadow-black/50 border border-brand-border transition-all duration-200 ease-in-out overflow-hidden"
                  onMouseEnter={() => setIsProductsDropdownOpen(true)}
                  onMouseLeave={() => closeDropdownWithDelay(setIsProductsDropdownOpen, setProductsTimeout, productsTimeout)}
                >
                  <DropdownItem to="/tshot" isActive={location.pathname === "/tshot"}>
                    TSHOT
                  </DropdownItem>
                </div>
              </>
            )}
          </div>

          {/* Tools Dropdown */}
          <div 
            className="relative" 
            ref={toolsDropdownRef}
            onMouseEnter={() => openDropdown(setIsToolsDropdownOpen, setIsProductsDropdownOpen, setIsResourcesDropdownOpen, setProductsTimeout, setResourcesTimeout)}
            onMouseLeave={() => closeDropdownWithDelay(setIsToolsDropdownOpen, setToolsTimeout, toolsTimeout)}
          >
            <button
              className="flex items-center py-2 px-4 rounded-md whitespace-nowrap hover:opacity-80 select-none text-brand-text"
            >
              Tools <FaChevronDown size={12} className="ml-1" />
            </button>
            {isToolsDropdownOpen && (
              <>
                {/* Invisible bridge to prevent menu from closing */}
                <div className="absolute top-full left-0 w-48 h-1 bg-transparent" />
                <div
                  className="absolute top-full left-0 w-48 bg-brand-secondary rounded-md shadow-lg shadow-black/50 border border-brand-border transition-all duration-200 ease-in-out overflow-hidden"
                  onMouseEnter={() => setIsToolsDropdownOpen(true)}
                  onMouseLeave={() => closeDropdownWithDelay(setIsToolsDropdownOpen, setToolsTimeout, toolsTimeout)}
                >
                  <DropdownItem to="/transfer" isActive={location.pathname === "/transfer"}>
                    Transfer Hub
                  </DropdownItem>
                </div>
              </>
            )}
          </div>

          <NavLink 
            to="/analytics" 
            isActive={location.pathname === "/analytics"}
            onMouseEnter={() => {
              setIsProductsDropdownOpen(false);
              setIsToolsDropdownOpen(false);
              setIsResourcesDropdownOpen(false);
            }}
          >
            Analytics
          </NavLink>
          {/* Resources Dropdown */}
          <div 
            className="relative" 
            ref={resourcesDropdownRef}
            onMouseEnter={() => openDropdown(setIsResourcesDropdownOpen, setIsProductsDropdownOpen, setIsToolsDropdownOpen, setProductsTimeout, setToolsTimeout)}
            onMouseLeave={() => closeDropdownWithDelay(setIsResourcesDropdownOpen, setResourcesTimeout, resourcesTimeout)}
          >
            <button
              className="flex items-center py-2 px-4 rounded-md whitespace-nowrap hover:opacity-80 select-none text-brand-text"
            >
              Resources <FaChevronDown size={12} className="ml-1" />
            </button>
            {isResourcesDropdownOpen && (
              <>
                {/* Invisible bridge to prevent menu from closing */}
                <div className="absolute top-full left-0 w-48 h-1 bg-transparent" />
                <div
                  className="absolute top-full left-0 w-48 bg-brand-secondary rounded-md shadow-lg shadow-black/50 border border-brand-border transition-all duration-200 ease-in-out overflow-hidden"
                  onMouseEnter={() => setIsResourcesDropdownOpen(true)}
                  onMouseLeave={() => closeDropdownWithDelay(setIsResourcesDropdownOpen, setResourcesTimeout, resourcesTimeout)}
                >
                  <DropdownItem to="/guides" isActive={location.pathname === "/guides"}>
                    All Guides
                  </DropdownItem>
                  <DropdownItem to="/guides/faq" isActive={location.pathname === "/guides/faq"}>
                    FAQ
                  </DropdownItem>
                  <DropdownItem to="/guides/quick-start" isActive={location.pathname === "/guides/quick-start"}>
                    Quick Start Guide
                  </DropdownItem>
                </div>
              </>
            )}
          </div>
          <NavLink 
            to="/about" 
            isActive={location.pathname === "/about"}
            onMouseEnter={() => {
              setIsProductsDropdownOpen(false);
              setIsToolsDropdownOpen(false);
              setIsResourcesDropdownOpen(false);
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
            <div className="flex flex-col">
              <MobileNavLink
                to="/"
                isActive={isHome}
                onClick={toggleMobileMenu}
              >
                Swap
              </MobileNavLink>
              
              {/* Products Section */}
              <MobileSection
                title="Products"
                isOpen={mobileProductsOpen}
                onToggle={() => setMobileProductsOpen(!mobileProductsOpen)}
              >
                <MobileNavLink
                  to="/tshot"
                  isActive={location.pathname === "/tshot"}
                  onClick={closeMobileMenu}
                  className="pl-8"
                >
                  TSHOT
                </MobileNavLink>
              </MobileSection>
              
              {/* Tools Section */}
              <MobileSection
                title="Tools"
                isOpen={mobileToolsOpen}
                onToggle={() => setMobileToolsOpen(!mobileToolsOpen)}
              >
                <MobileNavLink
                  to="/transfer"
                  isActive={location.pathname === "/transfer"}
                  onClick={closeMobileMenu}
                  className="pl-8"
                >
                  Transfer Hub
                </MobileNavLink>
                <MobileNavLink
                  to="/analytics"
                  isActive={location.pathname === "/analytics"}
                  onClick={closeMobileMenu}
                  className="pl-8"
                >
                  Analytics
                </MobileNavLink>
              </MobileSection>
              
              {/* Resources Section */}
              <MobileSection
                title="Resources"
                isOpen={mobileResourcesOpen}
                onToggle={() => setMobileResourcesOpen(!mobileResourcesOpen)}
              >
                <MobileNavLink
                  to="/guides"
                  isActive={location.pathname === "/guides"}
                  onClick={closeMobileMenu}
                  className="pl-8"
                >
                  All Guides
                </MobileNavLink>
                <MobileNavLink
                  to="/guides/faq"
                  isActive={location.pathname === "/guides/faq"}
                  onClick={closeMobileMenu}
                  className="pl-8"
                >
                  FAQ
                </MobileNavLink>
                <MobileNavLink
                  to="/guides/quick-start"
                  isActive={location.pathname === "/guides/quick-start"}
                  onClick={closeMobileMenu}
                  className="pl-8"
                >
                  Quick Start Guide
                </MobileNavLink>
              </MobileSection>
              
              <MobileNavLink
                to="/about"
                isActive={location.pathname === "/about"}
                onClick={closeMobileMenu}
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

const DropdownItem = ({ to, isActive, children, className = "" }) => (
  <Link
    to={to}
    className={`
      block w-full py-3 px-4 text-brand-text hover:bg-brand-primary/20 hover:text-brand-accent transition-all duration-200 border-b border-brand-border/30 last:border-b-0 first:rounded-t-md last:rounded-b-md
      ${isActive ? "bg-brand-primary/30 text-brand-accent font-semibold" : ""} ${className}
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

const MobileSection = ({ title, isOpen, onToggle, children }) => (
  <div className="border-b border-brand-border/30">
    <button
      onClick={onToggle}
      className="w-full relative py-4 px-4 text-brand-text hover:bg-brand-primary/20 transition-colors"
    >
      <span className="font-medium text-center block">{title}</span>
      <FaChevronDown 
        size={16} 
        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    {isOpen && (
      <div className="bg-brand-primary/10">
        {children}
      </div>
    )}
  </div>
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
