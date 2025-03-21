// src/components/Header.jsx

import React, { useContext, useState, useRef, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useLocation } from "react-router-dom";
import DropdownMenu from "../components/DropdownMenu";
import { FaUserCircle, FaBars } from "react-icons/fa";
import * as fcl from "@onflow/fcl";

const Header = () => {
  const { user, selectedAccount } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();
  const buttonRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const activeAddress = selectedAccount || user?.addr;

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const connectWallet = () => {
    fcl.authenticate();
  };

  // Close mobile menu if user clicks outside of it
  useEffect(() => {
    function handleClickOutside(e) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    }
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className="
        w-full
        relative
        z-50
        shadow-md
        shadow-black/30

        bg-brand-primary
        text-brand-text
      "
    >
      <div
        className="
          border-b
          border-brand-border
          px-4
          py-4
          flex
          items-center
          justify-between
          w-full
        "
      >
        {/* Left container: Hamburger + Logo */}
        <div className="flex items-center">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden focus:outline-none"
          >
            <FaBars size={20} />
          </button>

          {/* Logo */}
          <Link to="/" className="ml-2 flex items-center">
            <img
              src="https://storage.googleapis.com/vaultopolis/Vaultopolis.png"
              alt="Vaultopolis Logo"
              className="max-h-8"
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-4 flex-grow justify-center">
          <NavLink to="/swap" isActive={location.pathname === "/swap"}>
            Swap
          </NavLink>
          <NavLink to="/tshot" isActive={location.pathname === "/tshot"}>
            TSHOT
          </NavLink>
          <NavLink to="/transfer" isActive={location.pathname === "/transfer"}>
            Bulk Transfer
          </NavLink>
        </nav>

        {/* Right container: connect or user menu */}
        <div className="flex items-center space-x-4">
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
              className="
                px-4
                py-2
                rounded
                transition-colors
                bg-brand-accent
                text-white
                hover:opacity-80
              "
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* 
        Mobile Navigation + Overlay 
        (Only visible if isMobileMenuOpen=true) 
      */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay: click anywhere to close */}
          <div
            className="
              fixed
              inset-0
              bg-black
              bg-opacity-40
              z-40
            "
          />
          {/* Actual mobile menu content */}
          <div
            ref={mobileMenuRef}
            className="
              absolute
              top-[68px]
              left-0
              w-full
              shadow-md
              shadow-black/50
              md:hidden
              bg-brand-secondary
              text-brand-text
              z-50
            "
          >
            <div className="flex flex-col items-center divide-y divide-brand-border">
              <MobileNavLink
                to="/swap"
                isActive={location.pathname === "/swap"}
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
            </div>
          </div>
        </>
      )}
    </header>
  );
};

/** NavLink for desktop menu */
const NavLink = ({ to, isActive, children, onClick, external }) =>
  external ? (
    <a
      href={to}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
      className="
        block
        px-4
        py-2
        transition-colors
        hover:opacity-80
        text-brand-text
      "
    >
      {children}
    </a>
  ) : (
    <Link
      to={to}
      onClick={onClick}
      className={`
        py-2
        px-4
        rounded-md
        whitespace-nowrap
        transition-colors
        text-brand-text
        hover:opacity-80
        ${isActive ? "font-bold" : ""}
      `}
    >
      {children}
    </Link>
  );

/** MobileNavLink for mobile menu */
const MobileNavLink = ({ to, isActive, children, onClick, external }) =>
  external ? (
    <a
      href={to}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
      className="
        w-full
        text-center
        py-4
        transition-colors
        hover:opacity-80
        text-brand-text
      "
    >
      {children}
    </a>
  ) : (
    <Link
      to={to}
      onClick={onClick}
      className={`
        w-full
        text-center
        py-4
        transition-colors
        hover:opacity-80
        text-brand-text
        ${isActive ? "font-bold" : ""}
      `}
    >
      {children}
    </Link>
  );

/**
 * Updated:
 * UserButton for a logged-in user (address at top-right)
 * with a stronger shadow effect on the button
 */
const UserButton = React.forwardRef(({ onClick, activeAddress }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className="
      flex
      items-center
      px-4
      py-2
      rounded
      transition-all
      bg-brand-secondary
      text-brand-text
      shadow-md
      shadow-black/30
      hover:shadow-lg
      hover:shadow-black/50
      focus:outline-none
    "
  >
    <FaUserCircle className="mr-2" size={20} />
    <span className="truncate max-w-[120px]">{activeAddress}</span>
  </button>
));

export default Header;
