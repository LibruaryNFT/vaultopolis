// src/components/AccountSelection.js

import React from "react";
// For the "Use Your Dapper Wallet Moments" icon, let's import one from lucide or similar
// (like Repeat, from your TSHOT code snippet)
import { Repeat } from "lucide-react";

const tierTextColors = {
  common: "text-gray-400",
  rare: "text-blue-500",
  fandom: "text-lime-400",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

/**
 * Renders an individual account box (Parent or Child).
 */
const AccountBox = ({ label, accountAddr, data, isSelected, onSelect }) => {
  if (!data) return null;

  const {
    flowBalance = 0,
    tshotBalance = 0,
    nftDetails = [],
    hasCollection,
  } = data;

  // Count how many NFTs in each tier
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

      {/* Balances */}
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

        {/* 1) If user does NOT have a TopShot Collection */}
        {!hasCollection && (
          <p className="text-xs text-red-500 mt-2">
            (No TopShot Collection found)
          </p>
        )}

        {/* 2) If user HAS a collection but zero NFTs */}
        {hasCollection && nftDetails.length === 0 && (
          <p className="text-sm text-gray-300 mt-2">0 TopShot Moments</p>
        )}

        {/* 3) If we do have NFTs, show tier breakdown */}
        {hasCollection &&
          nftDetails.length > 0 &&
          Object.entries(tierCounts).map(([tier, count]) => (
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
      </div>
    </div>
  );
};

const AccountSelection = ({
  parentAccount,
  childrenAddresses = [],
  childrenAccounts = [],
  selectedAccount,
  onSelectAccount,
  onRefresh,
  isRefreshing,
  isLoadingChildren,
}) => {
  return (
    <div className="space-y-4">
      {/* Optional Refresh Section */}
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
        {/* Parent Account */}
        {parentAccount && parentAccount.addr && (
          <AccountBox
            label="Parent Account"
            accountAddr={parentAccount.addr}
            data={parentAccount}
            isSelected={selectedAccount === parentAccount.addr}
            onSelect={onSelectAccount}
          />
        )}

        {/* Child Accounts */}
        {childrenAddresses.length === 0 ? (
          /** Instead of "No children," we display a "Dapper Wallet" info card. */
          <div className="bg-gray-600 p-3 rounded flex flex-col items-center text-center col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-center text-base font-bold text-white mb-1">
              <Repeat className="w-5 h-5 text-blue-400 mr-1" />
              Use Your Dapper Wallet Moments
            </div>
            <p className="text-xs text-gray-100 mb-2">
              Seamlessly leverage Dapper Wallet assets on TSHOT—no need to move
              them elsewhere.
            </p>
            <a
              href="https://support.meetdapper.com/hc/en-us/articles/20744347884819-Account-Linking-and-FAQ"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-xs text-white font-bold px-2 py-1 rounded"
            >
              Learn More
            </a>
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
