import React, { useContext, useState, useRef } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useLocation } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import { FaUserCircle, FaBars } from "react-icons/fa";
import * as fcl from "@onflow/fcl";

const Header = () => {
  const { user, selectedAccount } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const buttonRef = useRef(null);

  const activeAddress = selectedAccount || user?.addr;

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const connectWallet = () => {
    fcl.authenticate();
  };

  return (
    <header className="bg-transparent text-white py-4 w-full relative z-50">
      {/* 
        Use a full-width container (remove `max-w-7xl mx-auto`).
        This ensures the header spans the entire screen width.
      */}
      <div className="px-2 md:px-4 flex items-center justify-between w-full">
        {/* Left container: Hamburger icon and Logo */}
        <div className="flex items-center">
          {/* Mobile Hamburger Icon (visible on mobile only) */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden focus:outline-none"
          >
            <FaBars size={20} />
          </button>

          {/* Logo (shown at all screen sizes; adjust if desired) */}
          <Link to="/" className="ml-2 flex items-center">
            <img
              src="https://storage.googleapis.com/vaultopolis/Vaultopolis.png"
              alt="Vaultopolis Logo"
              className="max-h-8"
            />
          </Link>
        </div>

        {/* Desktop Navigation Links (centered) */}
        <nav className="hidden md:flex items-center space-x-2 flex-grow justify-center">
          <div className="flex items-center space-x-2">
            <NavLink to="/swap" isActive={location.pathname === "/swap"}>
              Swap
            </NavLink>
          </div>
          <div className="flex items-center space-x-2">
            <NavLink to="/tshot" isActive={location.pathname === "/tshot"}>
              TSHOT
            </NavLink>
          </div>
        </nav>

        {/* Right container: User Profile/Connect Button */}
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
                  // If you want the dropdown to align right:
                  // className="absolute right-0 mt-2"
                />
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-flow-dark rounded hover:bg-flow-darkest focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-gray-800 text-white md:hidden">
          <div className="flex flex-col divide-y divide-gray-700">
            <MobileNavLink
              to="/swap"
              isActive={location.pathname === "/swap"}
              onClick={toggleMobileMenu}
            >
              Swap
            </MobileNavLink>
          </div>
          <div className="flex flex-col divide-y divide-gray-700">
            <MobileNavLink
              to="/tshot"
              isActive={location.pathname === "/tshot"}
              onClick={toggleMobileMenu}
            >
              TSHOT
            </MobileNavLink>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ to, isActive, children, onClick, external }) =>
  external ? (
    <a
      href={to}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-4 py-2 text-gray-400 hover:text-white transition-colors"
    >
      {children}
    </a>
  ) : (
    <Link
      to={to}
      onClick={onClick}
      className={`${
        isActive ? "text-white" : "text-gray-400"
      } hover:text-white transition-colors py-2 px-4 rounded-md whitespace-nowrap`}
    >
      {children}
    </Link>
  );

const MobileNavLink = ({ to, isActive, children, onClick, external }) =>
  external ? (
    <a
      href={to}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-6 py-4 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
    >
      {children}
    </a>
  ) : (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-6 py-4 ${
        isActive ? "text-white" : "text-gray-400"
      } hover:text-white hover:bg-gray-700 transition-colors`}
    >
      {children}
    </Link>
  );

const UserButton = React.forwardRef(({ onClick, activeAddress }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className="flex items-center px-4 py-2 bg-gray-700 rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
    style={{ zIndex: 50 }}
  >
    <FaUserCircle className="mr-2" size={20} />
    <span className="truncate max-w-[120px]">{activeAddress}</span>
  </button>
));

export default Header;
