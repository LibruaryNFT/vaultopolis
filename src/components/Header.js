import React, { useContext, useState, useRef } from "react";
import { UserContext } from "./UserContext";
import { Link, useLocation } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import { FaUserCircle } from "react-icons/fa";
import * as fcl from "@onflow/fcl";

const Header = () => {
  const { user } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const buttonRef = useRef(null); // Reference to profile button

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <header className="bg-transparent text-white py-4 w-full flex items-center justify-between relative z-50">
      {/* Logo and Navigation Links */}
      <div className="flex items-center space-x-4 pl-4">
        <Link to="/" className="flex-shrink-0">
          <img
            src="https://storage.googleapis.com/momentswap/images/MomentSwapWhite.png"
            alt="MomentSwap Logo"
            className="max-h-8"
          />
        </Link>
        <div className="flex space-x-4">
          <NavLink to="/" isActive={location.pathname === "/"}>
            Swap
          </NavLink>

          <NavLink to="/vault" isActive={location.pathname === "/vault"}>
            Vault
          </NavLink>

          <NavLink to="/earn" isActive={location.pathname === "/earn"}>
            Overview
          </NavLink>
        </div>
      </div>

      {/* User Profile and Actions */}
      <div className="flex justify-end items-center w-full pr-2">
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
            className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Connect
          </button>
        )}
      </div>
    </header>
  );
};

const NavLink = ({ to, isActive, children }) => (
  <Link
    to={to}
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
