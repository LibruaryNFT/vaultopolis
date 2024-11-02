import React, { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../contexts/UserContext";
import * as fcl from "@onflow/fcl";
import { FaSignOutAlt, FaClipboard, FaUserCircle } from "react-icons/fa";
import { setupTopShotCollection } from "../flow/setupTopShotCollection";
import { setupTSHOTVault } from "../flow/setupTSHOTVault";

const Header = () => {
  const {
    user,
    tshotBalance,
    network,
    tierCounts,
    hasCollection,
    hasVault,
    dispatch,
  } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const popoutRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen((prevIsMenuOpen) => !prevIsMenuOpen);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(user.addr);
  };

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

  const totalTopShotMoments = Object.values(tierCounts || {}).reduce(
    (sum, count) => sum + count,
    0
  );

  const setupCollection = async () => {
    try {
      const transactionId = await fcl.mutate({
        cadence: setupTopShotCollection,
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 100,
      });
      await fcl.tx(transactionId).onceSealed();
      // Update context state
      dispatch({ type: "SET_COLLECTION_STATUS", payload: true });
    } catch (error) {
      console.error("Error setting up collection:", error);
    }
  };

  const setupVault = async () => {
    try {
      const transactionId = await fcl.mutate({
        cadence: setupTSHOTVault,
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 100,
      });
      await fcl.tx(transactionId).onceSealed();
      // Update context state
      dispatch({ type: "SET_VAULT_STATUS", payload: true });
    } catch (error) {
      console.error("Error setting up vault:", error);
    }
  };

  return (
    <header className="bg-transparent text-white py-4 w-full flex justify-end items-center">
      <img
        src="https://storage.googleapis.com/momentswap/images/MomentSwapWhite.png"
        alt="MomentSwap Logo"
        className="h-8 ml-2"
      />
      <div className="flex justify-end items-center w-full pr-2">
        {user.loggedIn ? (
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={toggleMenu}
              className="flex items-center px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <FaUserCircle className="mr-2" size={20} />
              {user.addr}
            </button>

            {isMenuOpen && (
              <div
                ref={popoutRef}
                className="absolute top-12 right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10"
                style={{
                  backgroundColor: "#1b1b1b",
                  borderRadius: "12px",
                  padding: "8px",
                }}
              >
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

                  <button
                    onClick={() => fcl.unauthenticate()}
                    className="text-white hover:bg-red-600 p-2 rounded-full"
                    title="Disconnect"
                  >
                    <FaSignOutAlt size={20} />
                  </button>
                </div>

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
                {hasVault === false && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={setupVault}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Setup TSHOT Vault
                    </button>
                  </div>
                )}

                <div className="space-y-2 mt-4">
                  <div className="block p-2 hover:bg-gray-700 rounded-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-500 rounded-full"></div>
                        <div>
                          <p>
                            {parseFloat(tshotBalance || 0).toFixed(1)} $TSHOT
                          </p>
                          <p className="text-gray-400">
                            ${(parseFloat(tshotBalance || 0) * 0.2).toFixed(2)}{" "}
                            USD
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="block p-2 hover:bg-gray-700 rounded-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-500 rounded-full"></div>
                        <div>
                          <p>Total TopShot Moments</p>
                          <p>{totalTopShotMoments} Moments</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {["common", "rare", "fandom", "legendary", "ultimate"].map(
                    (tier) => (
                      <div
                        key={tier}
                        className="block p-2 hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-500 rounded-full"></div>
                            <div>
                              <p>{`TopShot ${
                                tier.charAt(0).toUpperCase() + tier.slice(1)
                              }s`}</p>
                              <p>{tierCounts?.[tier] || 0} Moments</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
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
