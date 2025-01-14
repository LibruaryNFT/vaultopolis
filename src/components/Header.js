import React, { useContext, useState, useEffect, useRef } from "react";
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
  const { user, selectedAccount, accountData } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStakingOpen, setIsStakingOpen] = useState(false);
  const location = useLocation();
  const buttonRef = useRef(null);

  const activeAddress = selectedAccount || user?.addr;

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const toggleStaking = () => setIsStakingOpen((prev) => !prev);

  const connectWallet = () => {
    fcl.authenticate();
  };

  return (
    <header className="bg-transparent text-white py-4 w-full relative z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo and Mobile Menu Icon */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold lg:hidden">MS</span>
            <img
              src="https://storage.googleapis.com/momentswap/images/Vaultopolis.png"
              alt="MomentSwap Logo"
              className="hidden lg:block max-h-8"
            />
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden focus:outline-none"
          >
            <FaBars size={20} />
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-2 flex-grow justify-center max-w-2xl">
          <div className="flex items-center space-x-2">
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
              <button className="flex items-center whitespace-nowrap space-x-2 py-2 px-4 rounded-md text-gray-400 hover:text-white">
                <span>Staking & Liquidity</span>
                <FaChevronDown size={14} />
              </button>
              <div className="absolute top-full left-0 bg-gray-800 rounded-md shadow-lg w-48 flex-col hidden group-hover:flex z-10">
                <NavLink to="https://app.increment.fi/liquidity" external>
                  Flow Cadence - Increment.fi
                </NavLink>
                <NavLink
                  to="https://swap.kittypunch.xyz/?tab=liquidity&mode=add"
                  external
                >
                  Flow EVM - KittyPunch
                </NavLink>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-gray-800 text-white lg:hidden">
            <div className="flex flex-col divide-y divide-gray-700">
              <MobileNavLink
                to="/"
                isActive={location.pathname === "/"}
                onClick={toggleMobileMenu}
              >
                Swap
              </MobileNavLink>
              <MobileNavLink
                to="/vault"
                isActive={location.pathname === "/vault"}
                onClick={toggleMobileMenu}
              >
                Vault
              </MobileNavLink>
              <MobileNavLink
                to="/earn"
                isActive={location.pathname === "/earn"}
                onClick={toggleMobileMenu}
              >
                Overview
              </MobileNavLink>

              <div className="w-full">
                <button
                  onClick={toggleStaking}
                  className="w-full flex items-center justify-between px-6 py-4 text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <span>Staking & Liquidity</span>
                  <span className="ml-2">
                    {isStakingOpen ? (
                      <FaChevronDown size={14} />
                    ) : (
                      <FaChevronRight size={14} />
                    )}
                  </span>
                </button>
                {isStakingOpen && (
                  <div className="bg-gray-700">
                    <MobileNavLink
                      to="https://app.increment.fi/liquidity"
                      external
                    >
                      Flow Cadence - Increment.fi
                    </MobileNavLink>
                    <MobileNavLink
                      to="https://swap.kittypunch.xyz/?tab=liquidity&mode=add"
                      external
                    >
                      Flow EVM - KittyPunch
                    </MobileNavLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Profile and Connect Button */}
        <div className="flex items-center">
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
              className="px-4 py-2 bg-flow-dark rounded hover:bg-flow-darkest focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Connect
            </button>
          )}
        </div>
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
    className="flex items-center px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
    style={{ zIndex: 50 }}
  >
    <FaUserCircle className="mr-2" size={20} />
    <span className="truncate max-w-[120px]">{activeAddress}</span>
  </button>
));

export default Header;
