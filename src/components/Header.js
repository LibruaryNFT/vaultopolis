import React, { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../contexts/UserContext";
import * as fcl from "@onflow/fcl";
import { FaSignOutAlt, FaClipboard, FaUserCircle } from "react-icons/fa"; // Import icons
import { setupTopShotCollection } from "../flow/setupTopShotCollection";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";

const Header = () => {
  const { user, tshotBalance, network, momentDetails } =
    useContext(UserContext); // Assuming momentDetails provides the user's moments
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewType, setViewType] = useState("Tokens"); // Toggle between Tokens and Moments view
  const [hasCollection, setHasCollection] = useState(null); // Track collection status
  const popoutRef = useRef(null); // Ref for the popout element
  const buttonRef = useRef(null); // Ref for the profile button

  const toggleMenu = () => {
    setIsMenuOpen((prevIsMenuOpen) => !prevIsMenuOpen); // Toggle the popout state
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(user.addr); // Copy address silently
  };

  const checkCollection = async () => {
    try {
      const result = await fcl.query({
        cadence: verifyTopShotCollection,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });
      setHasCollection(result);
    } catch (error) {
      console.error("Error verifying collection:", error);
      setHasCollection(false);
    }
  };

  const setupCollection = async () => {
    try {
      const transactionId = await fcl.mutate({
        cadence: setupTopShotCollection,
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 100,
      });
      console.log("Transaction ID:", transactionId);
      await fcl.tx(transactionId).onceSealed();
      // Refresh collection status after successful setup
      checkCollection();
    } catch (error) {
      console.error("Error setting up collection:", error);
    }
  };

  // Check if the collection is set up when the component mounts
  useEffect(() => {
    if (user.addr) {
      checkCollection();
    }
  }, [user.addr]);

  // Close the popout when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoutRef.current &&
        !popoutRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatBalance = (balance) => {
    return typeof balance === "number" ? balance.toFixed(1) : "0.0";
  };

  const calculateValue = (balance, rate) => {
    return (balance * rate).toFixed(2);
  };

  // Calculate total value of tokens
  const totalValue = calculateValue(tshotBalance, 0.25);

  const tokenData = [
    { name: "TopShot Common", symbol: "TSHOT", balance: tshotBalance },
    { name: "TopShot Fandom", symbol: "TFANDOM", balance: 0 },
    { name: "TopShot Rare", symbol: "TRARE", balance: 0 },
    { name: "TopShot Legendary", symbol: "TLEGO", balance: 0 },
    { name: "All Day Common", symbol: "ADCOM", balance: 0 },
    { name: "All Day Uncommon", symbol: "ADUNCOM", balance: 0 },
    { name: "All Day Rare", symbol: "ADRARE", balance: 0 },
    { name: "All Day Legendary", symbol: "ADLEGO", balance: 0 },
  ];

  const momentData = [
    { name: "TopShot Common", owned: momentDetails?.common || 0 },
    { name: "TopShot Fandom", owned: 0 },
    { name: "TopShot Rare", owned: 0 },
    { name: "TopShot Legendary", owned: 0 },
    { name: "All Day Common", owned: 0 },
    { name: "All Day Uncommon", owned: 0 },
    { name: "All Day Rare", owned: 0 },
    { name: "All Day Legendary", owned: 0 },
  ];

  return (
    <header className="bg-transparent text-white py-4 w-full flex justify-end items-center">
      {/* MomentSwap Logo */}
      <img
        src="https://storage.googleapis.com/momentswap/images/MomentSwapWhite.png"
        alt="MomentSwap Logo"
        className="h-8 ml-2"
      />
      <div className="flex justify-end items-center w-full pr-2">
        {user.loggedIn ? (
          <div className="relative">
            {/* Profile icon and address */}
            <button
              ref={buttonRef}
              onClick={toggleMenu}
              className="flex items-center px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <FaUserCircle className="mr-2" size={20} /> {/* Profile icon */}
              {user.addr}
            </button>

            {isMenuOpen && (
              <div
                ref={popoutRef} // Ref for the popout to detect outside clicks
                className="absolute top-12 right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10"
                style={{
                  backgroundColor: "#1b1b1b",
                  borderRadius: "12px",
                  padding: "8px",
                }}
              >
                {/* User Address and Network at the top */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col text-left pl-2">
                    <span
                      className="cursor-pointer hover:underline flex items-center"
                      onClick={handleCopyAddress}
                    >
                      {user.addr} <FaClipboard className="ml-2" />
                    </span>
                    <span>{network}</span>
                  </div>

                  {/* Disconnect button */}
                  <button
                    onClick={() => fcl.unauthenticate()}
                    className="text-white hover:bg-red-600 p-2 rounded-full"
                    title="Disconnect"
                  >
                    <FaSignOutAlt size={20} />
                  </button>
                </div>

                {/* Show setup button if collection is not set up */}
                {hasCollection === false && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={setupCollection}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Setup Collection
                    </button>
                  </div>
                )}

                {/* Toggle between Tokens and Moments */}
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={() => setViewType("Tokens")}
                    className={`px-4 py-2 rounded-md ${
                      viewType === "Tokens"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    Tokens
                  </button>
                  <button
                    onClick={() => setViewType("Moments")}
                    className={`px-4 py-2 rounded-md ${
                      viewType === "Moments"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    Moments
                  </button>
                </div>

                {/* Tokens or Moments Section */}
                {viewType === "Tokens" ? (
                  <div className="space-y-2 mt-4">
                    <h3 className="text-4xl font-bold">${totalValue}</h3>
                    {tokenData.map((token, index) => (
                      <div
                        key={index}
                        className="block p-2 hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-500 rounded-full"></div>
                            <div>
                              <p>{token.name}</p>
                              <p>
                                {formatBalance(token.balance)} {token.symbol}
                              </p>
                            </div>
                          </div>
                          <p>${calculateValue(token.balance, 0.25)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 mt-4">
                    {momentData.map((moment, index) => (
                      <div
                        key={index}
                        className="block p-2 hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-500 rounded-full"></div>
                            <div>
                              <p>{moment.name}</p>
                              <p>{moment.owned} Moments</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

export default Header;
