import React, { useContext, useState, useRef } from "react";
import { UserContext } from "./UserContext";
import { Link, useLocation } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import {
  FaUserCircle,
  FaBars,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import * as fcl from "@onflow/fcl";

const Header = () => {
  const { user } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStakingOpen, setIsStakingOpen] = useState(false); // Mobile Staking toggle
  const location = useLocation();
  const buttonRef = useRef(null); // Reference to profile button

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const toggleStaking = () => setIsStakingOpen((prev) => !prev);

  return (
    <header className="bg-transparent text-white py-4 w-full flex items-center justify-between relative z-50">
      {/* Logo and Mobile Menu Icon */}
      <div className="flex items-center space-x-4 pl-4">
        <Link to="/" className="flex-shrink-0">
          {/* Show "MS" text on small screens, full logo on larger screens */}
          <span className="text-2xl font-bold md:hidden">MS</span>
          <img
            src="https://storage.googleapis.com/momentswap/images/MomentSwapWhite.png"
            alt="MomentSwap Logo"
            className="hidden md:block max-h-8"
          />
        </Link>
        {/* Hamburger Icon next to Logo on Mobile */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden focus:outline-none"
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex space-x-4">
        <NavLink to="/" isActive={location.pathname === "/"}>
          Swap
        </NavLink>
        <NavLink to="/vault" isActive={location.pathname === "/vault"}>
          Vault
        </NavLink>
        <NavLink to="/earn" isActive={location.pathname === "/earn"}>
          Overview
        </NavLink>

        {/* Staking Dropdown for Desktop */}
        <div className="relative group">
          <button className="flex items-center space-x-2 py-2 px-4 rounded-md text-gray-400 hover:text-white">
            <span>Staking & Liquidity</span>
            <FaChevronDown size={14} />
          </button>
          {/* Dropdown menu positioned directly below the button */}
          <div className="absolute top-full left-0 bg-gray-800 rounded-md shadow-lg w-48 flex-col hidden group-hover:flex group-hover:flex-col z-10">
            <NavLink to="https://app.increment.fi/" external>
              Flow Cadence
            </NavLink>
            <NavLink to="https://www.kittypunch.xyz/" external>
              Flow EVM
            </NavLink>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-gray-800 text-white flex flex-col items-start p-4 md:hidden">
          <NavLink
            to="/"
            isActive={location.pathname === "/"}
            onClick={toggleMobileMenu}
          >
            Swap
          </NavLink>
          <NavLink
            to="/vault"
            isActive={location.pathname === "/vault"}
            onClick={toggleMobileMenu}
          >
            Vault
          </NavLink>
          <NavLink
            to="/earn"
            isActive={location.pathname === "/earn"}
            onClick={toggleMobileMenu}
          >
            Overview
          </NavLink>

          {/* Staking Expandable Menu for Mobile */}
          <div
            onClick={toggleStaking}
            className="flex items-center justify-between w-full py-2 px-4 cursor-pointer"
          >
            <span>Staking & Liquidity</span>
            <span className="-ml-2">
              {isStakingOpen ? (
                <FaChevronDown size={14} />
              ) : (
                <FaChevronRight size={14} />
              )}
            </span>
          </div>
          {isStakingOpen && (
            <div className="ml-6 flex flex-col">
              <NavLink to="https://app.increment.fi/" external>
                Flow Cadence
              </NavLink>
              <NavLink to="https://www.kittypunch.xyz/" external>
                Flow EVM
              </NavLink>
            </div>
          )}
        </div>
      )}

      {/* User Profile and Connect Button */}
      <div className="flex justify-end items-center pr-4">
        {user.loggedIn ? (
          <div className="relative">
            <UserButton ref={buttonRef} onClick={toggleMenu} user={user} />
            {isMenuOpen && (
              <DropdownMenu
                closeMenu={() => setIsMenuOpen(false)}
                buttonRef={buttonRef}
              />
            )}
          </div>
        ) : (
          <button
            onClick={() => fcl.authenticate()}
            className="px-4 py-2 bg-flow-dark rounded hover:bg-flow-darkest focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Connect
          </button>
        )}
      </div>
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
      } hover:text-white transition-colors py-2 px-4 rounded-md`}
      style={{ pointerEvents: "auto", zIndex: 50, position: "relative" }} // Ensures link is clickable
    >
      {children}
    </Link>
  );

const UserButton = React.forwardRef(({ onClick, user }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className="flex items-center px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
    style={{ zIndex: 50 }} // Ensures profile button is above other elements
  >
    <FaUserCircle className="mr-2" size={20} />
    {user.addr}
  </button>
));

export default Header;
