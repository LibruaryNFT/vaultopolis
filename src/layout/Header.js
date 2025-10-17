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
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  
  // Refs for UI elements
  const buttonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  // Use a ref for the timeout to prevent re-renders when it's set or cleared
  const dropdownTimeoutRef = useRef(null);
  
  const location = useLocation();

  /* ───────── helpers ───────── */
  const parentAddress = accountData?.parentAddress || user?.addr || "";
  const userButtonAddr = selectedAccount || parentAddress;
  const isHome = location.pathname === "/";

  const toggleMenu = () => setIsMenuOpen((p) => !p);
  const connectWallet = () => fcl.authenticate();
  
  /* ─── Mobile Menu Logic ─── */
  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    if (newState) {
      setMobileResourcesOpen(false);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setMobileResourcesOpen(false);
  };

  /* ───────── Desktop Dropdown Helpers ───────── */
  const handleDropdownEnter = (dropdownName) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(dropdownName);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

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
            to="/" 
            isActive={isHome}
            onMouseEnter={() => setActiveDropdown(null)}
          >
            Swap
          </NavLink>

          <div className="w-px h-6 bg-white/20 mx-2" />

          <NavLink 
            to="/treasury-bids" 
            isActive={location.pathname === "/treasury-bids" || location.pathname === "/offers"}
            onMouseEnter={() => setActiveDropdown(null)}
          >
            Treasury Bids
          </NavLink>

          <div className="w-px h-6 bg-white/20 mx-2" />

          <NavLink 
            to="/vaults/tshot" 
            isActive={location.pathname === "/vault-contents" || location.pathname === "/vaults/tshot" || location.pathname === "/vaults/treasury"}
            onMouseEnter={() => setActiveDropdown(null)}
          >
            Vaults
          </NavLink>

          <div className="w-px h-6 bg-white/20 mx-2" />

          <NavLink 
            to="/tshot" 
            isActive={location.pathname === "/tshot"}
            onMouseEnter={() => setActiveDropdown(null)}
          >
            TSHOT
          </NavLink>

          <div className="w-px h-6 bg-white/20 mx-2" />
          {/* More Dropdown */}
          <div 
            className="relative" 
            onMouseEnter={() => handleDropdownEnter('more')}
            onMouseLeave={handleDropdownLeave}
          >
            <button className="flex items-center py-2 px-4 rounded-md whitespace-nowrap select-none font-semibold text-brand-text opacity-70 hover:opacity-100 transition-all duration-200 min-w-[90px] h-10 justify-center">
              More <FaChevronDown size={12} className="ml-1" />
            </button>
            {activeDropdown === 'more' && (
              <div className="absolute top-full left-0 w-56 bg-brand-secondary rounded-md shadow-lg shadow-black/50 border border-brand-border overflow-hidden">
                <DropdownItem to="/analytics" isActive={location.pathname === "/analytics"}>
                  Protocol Stats
                </DropdownItem>
                <DropdownItem to="/transfer" isActive={location.pathname === "/transfer"}>
                  Transfer Hub
                </DropdownItem>
                <DropdownItem to="/guides" isActive={location.pathname === "/guides"}>
                  Guides
                </DropdownItem>
                <DropdownItem to="/guides/faq" isActive={location.pathname === "/guides/faq"}>
                  FAQ
                </DropdownItem>
                <DropdownItem to="/about" isActive={location.pathname === "/about"}>
                  About
                </DropdownItem>
              </div>
            )}
          </div>
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
              <MobileNavLink to="/" isActive={isHome} onClick={toggleMobileMenu}>
                Swap
              </MobileNavLink>
              <div className="w-full h-px bg-white/20" />
              <MobileNavLink to="/treasury-bids" isActive={location.pathname === "/treasury-bids" || location.pathname === "/offers"} onClick={closeMobileMenu}>
                Treasury Bids
              </MobileNavLink>
              <div className="w-full h-px bg-white/20" />
              <MobileNavLink to="/vaults/tshot" isActive={location.pathname === "/vault-contents" || location.pathname === "/vaults/tshot" || location.pathname === "/vaults/treasury"} onClick={closeMobileMenu}>
                Vaults
              </MobileNavLink>
              <div className="w-full h-px bg-white/20" />
              <MobileNavLink to="/tshot" isActive={location.pathname === "/tshot"} onClick={closeMobileMenu}>
                TSHOT
              </MobileNavLink>
              <div className="w-full h-px bg-white/20" />
              <MobileSection title="More" isOpen={mobileResourcesOpen} onToggle={() => setMobileResourcesOpen(!mobileResourcesOpen)}>
                <MobileNavLink to="/analytics" isActive={location.pathname === "/analytics"} onClick={closeMobileMenu} className="pl-8">
                  Protocol Stats
                </MobileNavLink>
                <MobileNavLink to="/transfer" isActive={location.pathname === "/transfer"} onClick={closeMobileMenu} className="pl-8">
                  Transfer Hub
                </MobileNavLink>
                <MobileNavLink to="/guides" isActive={location.pathname === "/guides"} onClick={closeMobileMenu} className="pl-8">
                  Guides
                </MobileNavLink>
                <MobileNavLink to="/guides/faq" isActive={location.pathname === "/guides/faq"} onClick={closeMobileMenu} className="pl-8">
                  FAQ
                </MobileNavLink>
                <MobileNavLink to="/about" isActive={location.pathname === "/about"} onClick={closeMobileMenu} className="pl-8">
                  About
                </MobileNavLink>
              </MobileSection>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

/* ── helper components ── */

const NavLink = ({ to, isActive, children, className = "", onMouseEnter }) => (
  <Link
    to={to}
    onMouseEnter={onMouseEnter}
    className={`py-2 px-4 rounded-md whitespace-nowrap select-none font-semibold text-brand-text transition-all duration-200 h-10 flex items-center justify-center ${isActive ? "opacity-100 font-bold" : "opacity-70 hover:opacity-100"} ${className}`}
  >
    {children}
  </Link>
);

const DropdownItem = ({ to, isActive, children, className = "" }) => (
  <Link
    to={to}
    className={`block w-full py-3 px-4 font-semibold text-brand-text hover:bg-brand-primary/20 hover:text-brand-accent transition-all duration-200 border-b border-brand-border/30 last:border-b-0 first:rounded-t-md last:rounded-b-md ${isActive ? "bg-brand-primary/30 text-brand-accent" : ""} ${className}`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, isActive, children, onClick, className = "" }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`w-full text-center py-4 hover:opacity-80 select-none text-brand-text ${isActive ? "font-bold" : ""} ${className}`}
  >
    {children}
  </Link>
);

const MobileSection = ({ title, isOpen, onToggle, children }) => (
  <div>
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
    className="flex items-center px-3 py-2 rounded bg-brand-secondary text-brand-text text-sm shadow-md shadow-black/30 hover:shadow-lg hover:shadow-black/50"
    title={activeAddress || "Profile"}
    aria-label="Open profile menu"
  >
    <FaUserCircle size={18} className="mr-2" />
    <span>Profile</span>
  </button>
));

export default Header;