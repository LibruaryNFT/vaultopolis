import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserCircle, Menu, X, Trophy, ArrowRightLeft, Layers, Send } from "lucide-react";
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
  const navigate = useNavigate();

  /* ───────── helpers ───────── */
  const parentAddress = accountData?.parentAddress || user?.addr || "";
  const userButtonAddr = selectedAccount || parentAddress;

  // Determine if we should show sub-navigation
  const isVaultsPage = location.pathname.startsWith("/vaults/") || location.pathname === "/vault-contents";
  const isBountiesPage = location.pathname.startsWith("/bounties");
  const isProfilePage = location.pathname.startsWith("/profile");
  
  // Determine active sub-item
  const activeVaultSubItem = location.pathname.includes("topshotgrails") 
    ? "topshotgrails" 
    : location.pathname.includes("alldaygrails")
    ? "alldaygrails"
    : "tshot";
  
  const activeBountySubItem = location.pathname.includes("/allday") ? "allday" : "topshot";
  
  // Determine active Profile sub-item from URL search params
  const profileTab = new URLSearchParams(location.search).get('tab') || 'portfolio';
  const activeProfileSubItem = profileTab === 'collection' ? 'collection' : 'portfolio';

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
      <div className="px-3 py-2.5 flex items-center justify-between relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-brand-border" />
        {/* ── Left: logo + hamburger ── */}
        <div className="flex items-center">
          <button 
            onClick={toggleMobileMenu} 
            className="lg:hidden"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
        <nav 
          className="hidden lg:flex items-end space-x-0 flex-grow justify-center gap-6 relative" 
          style={{ alignSelf: 'stretch' }}
          role="navigation"
          aria-label="Main navigation"
        >
          <NavLink 
            to="/swap" 
            isActive={location.pathname === "/swap"}
          >
            <ArrowRightLeft className="w-4 h-4 sm:w-4 sm:h-4" />
            <span>Swap</span>
          </NavLink>

          <div className="w-px h-6 bg-white/20" />

          <NavLink 
            to="/vaults/tshot" 
            isActive={location.pathname === "/vault-contents" || location.pathname === "/vaults/tshot" || location.pathname === "/vaults/treasury" || location.pathname === "/vaults/topshotgrails" || location.pathname === "/vaults/alldaygrails"}
          >
            <Layers className="w-4 h-4 sm:w-4 sm:h-4" />
            <span>Vaults</span>
          </NavLink>

          <div className="w-px h-6 bg-white/20" />

          <NavLink 
            to="/bounties/topshot" 
            isActive={location.pathname.startsWith("/bounties")}
          >
            <Trophy className="w-4 h-4 sm:w-4 sm:h-4" />
            <span>Grail Bounties</span>
          </NavLink>

          <div className="w-px h-6 bg-white/20" />

          <NavLink 
            to="/transfer" 
            isActive={location.pathname === "/transfer"}
          >
            <Send className="w-4 h-4 sm:w-4 sm:h-4" />
            <span>Bulk Transfer</span>
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
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
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
              className="
                inline-flex items-center justify-center gap-2
                rounded-lg px-6 py-2
                bg-opolis/20 border-2 border-opolis/40
                text-white font-bold
                shadow-md hover:shadow-lg
                hover:bg-opolis/30 hover:border-opolis
                transition-all duration-200
              "
              aria-label="Connect Flow wallet"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* ── Sub-Navigation Bar ── */}
      {(isVaultsPage || isBountiesPage || isProfilePage) && (
        <div className="border-b border-brand-border bg-brand-primary relative z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 pb-0">
            <nav className="flex items-center gap-2 sm:gap-6 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-hide">
              {isVaultsPage && (
                <>
                  <SubNavLink
                    to="/vaults/tshot"
                    isActive={activeVaultSubItem === "tshot"}
                  >
                    <img src="https://storage.googleapis.com/vaultopolis/TSHOT.png" alt="TSHOT" className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>TSHOT</span>
                  </SubNavLink>
                  <div className="w-px h-3 sm:h-4 bg-white/20 flex-shrink-0" />
                  <SubNavLink
                    to="/vaults/topshotgrails"
                    isActive={activeVaultSubItem === "topshotgrails"}
                  >
                    <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>TopShot Grails</span>
                  </SubNavLink>
                  <div className="w-px h-3 sm:h-4 bg-white/20 flex-shrink-0" />
                  <SubNavLink
                    to="/vaults/alldaygrails"
                    isActive={activeVaultSubItem === "alldaygrails"}
                  >
                    <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>AllDay Grails</span>
                  </SubNavLink>
                </>
              )}
              {isBountiesPage && (
                <>
                  <SubNavButton
                    onClick={() => navigate("/bounties/topshot")}
                    isActive={activeBountySubItem === "topshot"}
                  >
                    <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Top Shot Bounties</span>
                  </SubNavButton>
                  <div className="w-px h-3 sm:h-4 bg-white/20 flex-shrink-0" />
                  <SubNavButton
                    onClick={() => navigate("/bounties/allday")}
                    isActive={activeBountySubItem === "allday"}
                  >
                    <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>All Day Bounties</span>
                  </SubNavButton>
                </>
              )}
              {isProfilePage && (
                <>
                  <SubNavButton
                    onClick={() => {
                      const currentPath = location.pathname;
                      const newParams = new URLSearchParams(location.search);
                      newParams.set('tab', 'portfolio');
                      navigate(`${currentPath}?${newParams.toString()}`);
                    }}
                    isActive={activeProfileSubItem === "portfolio"}
                  >
                    <UserCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Portfolio</span>
                  </SubNavButton>
                  <div className="w-px h-3 sm:h-4 bg-white/20 flex-shrink-0" />
                  <SubNavButton
                    onClick={() => {
                      const currentPath = location.pathname;
                      const newParams = new URLSearchParams(location.search);
                      newParams.set('tab', 'collection');
                      navigate(`${currentPath}?${newParams.toString()}`);
                    }}
                    isActive={activeProfileSubItem === "collection"}
                  >
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>My Collection</span>
                  </SubNavButton>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* ── Mobile drawer ── */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed top-[60px] inset-x-0 bottom-0 bg-black/40 z-[70]" />
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className="absolute top-[60px] left-0 w-full lg:hidden bg-brand-secondary text-brand-text shadow-md shadow-black/50 z-[70]"
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex flex-col">
              <MobileNavLink to="/swap" isActive={location.pathname === "/swap"} onClick={closeMobileMenu}>
                <ArrowRightLeft className="w-4 h-4 sm:w-4 sm:h-4" />
                <span>Swap</span>
              </MobileNavLink>
              <div className="w-full h-px bg-white/20" />
              <MobileNavLink to="/vaults/tshot" isActive={location.pathname === "/vault-contents" || location.pathname === "/vaults/tshot" || location.pathname === "/vaults/treasury" || location.pathname === "/vaults/topshotgrails" || location.pathname === "/vaults/alldaygrails"} onClick={closeMobileMenu}>
                <Layers className="w-4 h-4 sm:w-4 sm:h-4" />
                <span>Vaults</span>
              </MobileNavLink>
              <div className="w-full h-px bg-white/20" />
              <MobileNavLink to="/bounties/topshot" isActive={location.pathname.startsWith("/bounties")} onClick={closeMobileMenu}>
                <Trophy className="w-4 h-4 sm:w-4 sm:h-4" />
                <span>Grail Bounties</span>
              </MobileNavLink>
              <div className="w-full h-px bg-white/20" />
              <MobileNavLink to="/transfer" isActive={location.pathname === "/transfer"} onClick={closeMobileMenu}>
                <Send className="w-4 h-4 sm:w-4 sm:h-4" />
                <span>Bulk Transfer</span>
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
    className={`py-1 px-2.5 whitespace-nowrap select-none font-semibold text-base flex items-center justify-center gap-1.5 relative ${isActive ? "opacity-100 font-bold text-opolis" : "opacity-70 hover:opacity-100 text-brand-text"} transition-opacity duration-200 ${className}`}
  >
    {children}
    {isActive && <div className="absolute left-0 right-0 h-1.5 bg-opolis" style={{ bottom: '-10px' }} />}
  </Link>
);

const SubNavLink = ({ to, isActive, children, className = "" }) => (
  <Link
    to={to}
    className={`inline-flex items-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-1.5 sm:px-2.5 whitespace-nowrap select-none font-semibold text-xs sm:text-base relative flex-shrink-0 ${isActive ? "opacity-100 font-bold text-opolis" : "opacity-70 hover:opacity-100 text-brand-text"} transition-opacity duration-200 ${className}`}
  >
    {children}
    {isActive && <div className="absolute left-0 right-0 h-1 sm:h-1.5 bg-opolis" style={{ bottom: 0 }} />}
  </Link>
);

const SubNavButton = ({ onClick, isActive, children, className = "" }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-1.5 sm:px-2.5 whitespace-nowrap select-none font-semibold text-xs sm:text-base relative flex-shrink-0 ${isActive ? "opacity-100 font-bold text-opolis" : "opacity-70 hover:opacity-100 text-brand-text"} transition-opacity duration-200 ${className}`}
  >
    {children}
    {isActive && <div className="absolute left-0 right-0 h-1 sm:h-1.5 bg-opolis" style={{ bottom: 0 }} />}
  </button>
);

const MobileNavLink = ({ to, isActive, children, onClick, className = "" }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`w-full py-4 hover:opacity-80 select-none text-sm flex items-center justify-center gap-1.5 relative ${isActive ? "font-bold text-opolis" : "text-brand-text"} ${className}`}
  >
    {children}
    {isActive && <div className="absolute left-0 right-0 bottom-0 h-1 bg-opolis" />}
  </Link>
);


const UserButton = React.forwardRef(({ onClick, activeAddress, ...props }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className="flex items-center px-3 py-2 rounded bg-brand-secondary text-brand-text text-sm shadow-md shadow-black/30 hover:shadow-lg hover:shadow-black/50"
    title={activeAddress || "Profile"}
    aria-label={`Open profile menu for ${activeAddress || "your account"}`}
    {...props}
  >
    <UserCircle size={18} className="mr-2" aria-hidden="true" />
    <span>Profile</span>
  </button>
));

export default Header;