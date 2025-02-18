// AccountSelection.js

import React from "react";

const tierTextColors = {
  common: "text-gray-400",
  rare: "text-blue-500",
  fandom: "text-lime-400",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};

const AccountBox = ({ label, accountAddr, data, isSelected, onSelect }) => {
  const { flowBalance = 0, tshotBalance = 0, nftDetails = [] } = data || {};
  const hasCollection = nftDetails && nftDetails.length > 0;

  const tierCounts = nftDetails.reduce((acc, nft) => {
    const tier = nft.tier ? nft.tier.toLowerCase() : "unknown";
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      onClick={() => onSelect(accountAddr)}
      className={`p-4 w-full sm:w-60 flex-shrink-0 text-left rounded-lg border-2 ${
        isSelected ? "border-opolis bg-gray-700" : "border-gray-500 bg-gray-700"
      } cursor-pointer hover:bg-gray-800 transition-all`}
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
        {!hasCollection && (
          <p className="text-xs text-red-500 mt-1">(No TopShot Collection)</p>
        )}
      </div>
    </div>
  );
};

const AccountSelection = ({
  parentAccount,
  childrenAccounts = [], // array of full data objects
  childrenAddresses = [], // array of addresses
  selectedAccount,
  onSelectAccount,
  onRefresh,
  isRefreshing,
  isLoadingChildren,
}) => {
  return (
    <div className="relative">
      {/* PARENT ACCOUNT BOX */}
      <div className="mb-4">
        <AccountBox
          label="Parent Account"
          accountAddr={parentAccount.addr}
          data={parentAccount}
          isSelected={selectedAccount === parentAccount.addr}
          onSelect={onSelectAccount}
        />
      </div>

      {/* CHILD ADDRESSES */}
      <div className="flex flex-wrap gap-2 mb-4">
        {childrenAddresses.length === 0 ? (
          <p className="text-xs text-gray-300">
            {isLoadingChildren ? "Checking for children..." : "No children."}
          </p>
        ) : (
          childrenAddresses.map((childAddr) => {
            // find the full data object for this child, if it's loaded
            const childData = childrenAccounts.find(
              (child) => child.addr === childAddr
            );

            if (!childData) {
              // We know the address but haven't loaded the data yet
              return (
                <div
                  key={childAddr}
                  className="p-4 w-full sm:w-60 flex-shrink-0 text-left rounded-lg border-2 border-gray-500 bg-gray-700"
                >
                  <h4 className="text-sm font-semibold text-white mb-1">
                    Child Account
                  </h4>
                  <p className="text-xs text-gray-400 truncate">{childAddr}</p>
                  <p className="text-xs text-gray-300 mt-2">
                    Loading child data...
                  </p>
                </div>
              );
            }

            // Otherwise we have the data => normal AccountBox
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

      {/* LOADING CHILDREN SPINNER (optional) */}
      {isLoadingChildren && (
        <div className="text-sm text-yellow-300 flex items-center gap-1 mb-4">
          <span className="animate-spin">⟳</span> Fetching child data...
        </div>
      )}

      {/* REFRESH BUTTON */}
      <div className="mt-2">
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
      </div>
    </div>
  );
};

export default AccountSelection;
