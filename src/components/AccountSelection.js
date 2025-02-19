// src/components/AccountSelection.js

import React from "react";

const tierTextColors = {
  common: "text-gray-400",
  rare: "text-blue-500",
  fandom: "text-lime-400",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

const AccountBox = ({ label, accountAddr, data, isSelected, onSelect }) => {
  if (!data) {
    // If we don't have a valid data object, skip rendering.
    return null;
  }

  const { flowBalance = 0, tshotBalance = 0, nftDetails = [] } = data;
  const tierCounts = nftDetails.reduce((acc, nft) => {
    const tier = nft.tier ? nft.tier.toLowerCase() : "unknown";
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      onClick={() => onSelect(accountAddr)}
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer
        ${
          isSelected
            ? "border-opolis bg-gray-700"
            : "border-gray-500 bg-gray-700"
        }
        hover:bg-gray-800
      `}
    >
      <div className="mb-2">
        <h4
          className={`text-sm font-semibold ${
            isSelected ? "text-green-400" : "text-white"
          }`}
        >
          {label}
        </h4>
        <p className="text-xs text-gray-400 truncate">{accountAddr}</p>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-300">
          <span className="font-bold text-white">
            {parseFloat(flowBalance).toFixed(2)}
          </span>{" "}
          $FLOW
        </p>
        <p className="text-sm text-gray-300">
          <span className="font-bold text-white">
            {parseFloat(tshotBalance).toFixed(2)}
          </span>{" "}
          $TSHOT
        </p>
        {Object.entries(tierCounts).map(([tier, count]) => (
          <p key={tier} className="text-sm">
            <span className="font-bold text-white">{count}</span>{" "}
            <span className={tierTextColors[tier] || ""}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </span>{" "}
            <span className="text-gray-400">
              {count === 1 ? "Moment" : "Moments"}
            </span>
          </p>
        ))}
        {(!nftDetails || nftDetails.length === 0) && (
          <p className="text-xs text-red-500 mt-1">(No TopShot Collection)</p>
        )}
      </div>
    </div>
  );
};

const AccountSelection = ({
  parentAccount, // Can be null or an object
  childrenAddresses = [], // Array of child addresses
  childrenAccounts = [], // Array of child data
  selectedAccount,
  onSelectAccount,
  onRefresh,
  isRefreshing,
  isLoadingChildren,
}) => {
  return (
    <div className="space-y-4">
      {/* Optional refresh button, if you like */}
      {onRefresh && (
        <div className="flex items-center justify-between">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${
              isRefreshing
                ? "bg-opolis cursor-not-allowed"
                : "bg-opolis hover:bg-opolis-dark"
            }`}
          >
            <span className={isRefreshing ? "animate-spin" : ""}>⟳</span>
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </button>
          {isLoadingChildren && (
            <div className="text-sm text-yellow-300 flex items-center gap-1">
              <span className="animate-spin">⟳</span> Fetching child data...
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* If parentAccount is not null, render it */}
        {parentAccount && parentAccount.addr && (
          <AccountBox
            label="Parent Account"
            accountAddr={parentAccount.addr}
            data={parentAccount}
            isSelected={selectedAccount === parentAccount.addr}
            onSelect={onSelectAccount}
          />
        )}

        {/* Child accounts */}
        {childrenAddresses.length === 0 ? (
          <div className="p-4 rounded-lg border-2 border-gray-500 bg-gray-700">
            <h4 className="text-sm font-semibold text-white mb-1">Children</h4>
            <p className="text-xs text-gray-400">
              {isLoadingChildren ? "Checking for children..." : "No children."}
            </p>
          </div>
        ) : (
          childrenAddresses.map((childAddr) => {
            const childData = childrenAccounts.find(
              (c) => c.addr === childAddr
            );
            return (
              <AccountBox
                key={childAddr}
                label="Child Account"
                accountAddr={childAddr}
                data={childData}
                isSelected={selectedAccount === childAddr}
                onSelect={onSelectAccount}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default AccountSelection;
