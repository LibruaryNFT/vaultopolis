import React, { useContext, useEffect, useRef } from "react";
import { UserContext } from "./UserContext";
import * as fcl from "@onflow/fcl";
import { FaSignOutAlt, FaClipboard, FaWallet, FaCube } from "react-icons/fa";

const DropdownMenu = ({ closeMenu, buttonRef }) => {
  const { user, accountData, dispatch } = useContext(UserContext);
  // Destructure properties updated from context
  const { parentAddress, flowBalance, nftDetails, childrenData } = accountData;
  const popoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoutRef.current &&
        !popoutRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };
    // Delay the event listener so that click on the button doesn't immediately trigger close
    setTimeout(
      () => document.addEventListener("mousedown", handleClickOutside),
      0
    );
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeMenu, buttonRef]);

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    closeMenu();
  };

  const handleLogout = () => {
    fcl.unauthenticate();
    dispatch({ type: "RESET_STATE" });
    closeMenu();
  };

  // Calculate total NFTs by counting the items in nftDetails array
  const calculateTotalNFTs = (nfts) => (nfts ? nfts.length : 0);

  // Summation for all accounts: parent + children
  const calculateAllAccountTotals = () => {
    // 1) Total Flow: add parent's flowBalance plus all children's flowBalance
    const totalFlow =
      parseFloat(flowBalance || 0) +
      childrenData.reduce(
        (sum, child) => sum + parseFloat(child.flowBalance || 0),
        0
      );

    // 2) Total NFTs: parent's nft count plus all children's nft count
    const totalNFTs =
      calculateTotalNFTs(nftDetails) +
      childrenData.reduce(
        (sum, child) => sum + calculateTotalNFTs(child.nftDetails),
        0
      );

    return { totalFlow, totalNFTs };
  };

  const { totalFlow, totalNFTs } = calculateAllAccountTotals();

  // Build a unified array of accounts for display
  const allAccounts = [
    {
      label: "Parent Account",
      address: parentAddress,
      flowBalance,
      nftCount: calculateTotalNFTs(nftDetails),
    },
    ...childrenData.map((child, index) => ({
      label: `Child Account ${index + 1}`,
      address: child.addr,
      flowBalance: child.flowBalance,
      nftCount: calculateTotalNFTs(child.nftDetails),
    })),
  ];

  return (
    <div
      ref={popoutRef}
      className="absolute top-12 right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700"
    >
      {/* Header Section */}
      <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center">
              <FaWallet className="text-white text-lg" />
            </div>
            <div className="flex flex-col">
              <button
                onClick={() => handleCopyAddress(user.addr)}
                className="text-sm text-gray-300 hover:text-white flex items-center group"
              >
                <span className="truncate max-w-[180px]">{user.addr}</span>
                <FaClipboard className="ml-2 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Disconnect"
          >
            <FaSignOutAlt size={18} />
          </button>
        </div>
      </div>

      {/* Portfolio Summary Section */}
      <div className="px-6 py-5">
        <div className="flex items-center space-x-3 mb-3">
          <FaCube className="text-blue-400 text-lg" />
          <h4 className="text-lg font-medium text-white">Portfolio Summary</h4>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          {/* Summary Stats */}
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Flow</p>
                <p className="text-xl font-bold text-white">
                  {parseFloat(totalFlow || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Total NFTs</p>
                <p className="text-xl font-bold text-white">{totalNFTs}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Accounts */}
      <div className="px-6 pb-6">
        <div className="space-y-4">
          {allAccounts.map((account) => (
            <div
              key={account.address}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <h5 className="text-sm font-medium text-white">
                  {account.label}
                </h5>
                <button
                  onClick={() => handleCopyAddress(account.address)}
                  className="text-xs text-gray-400 hover:text-white flex items-center"
                >
                  <span className="truncate max-w-[140px]">
                    {account.address}
                  </span>
                  <FaClipboard className="ml-2" />
                </button>
              </div>
              {/* Account Stats */}
              <div className="bg-gray-800 p-4 rounded-lg mb-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Flow Balance</p>
                    <p className="text-sm font-semibold text-white">
                      {parseFloat(account.flowBalance || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">NFT Count</p>
                    <p className="text-sm font-semibold text-white">
                      {account.nftCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DropdownMenu;
