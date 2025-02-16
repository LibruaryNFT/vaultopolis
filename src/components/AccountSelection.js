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
            <span className={tierTextColors[tier.toLowerCase()]}>
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
  childrenAccounts = [],
  selectedAccount,
  onSelectAccount,
  onRefresh,
  isRefreshing,
  isLoadingChildren,
}) => {
  return (
    <div>
      <div className="flex flex-col space-y-1">
        <div className="flex items-center text-white">
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
            {isRefreshing ? "Refreshing..." : "Refresh Collection"}
          </button>
        </div>
        <p className="text-sm text-yellow-400">
          Note: FLOW will always be deposited to the parent account.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <AccountBox
          label="Parent Account"
          accountAddr={parentAccount.addr}
          data={parentAccount}
          isSelected={selectedAccount === parentAccount.addr}
          onSelect={onSelectAccount}
        />
        {isLoadingChildren ? (
          <div className="flex items-center justify-center p-4">
            <span className="animate-spin mr-2">⟳</span>
            Loading children...
          </div>
        ) : (
          childrenAccounts.map((child) => (
            <AccountBox
              key={child.addr}
              label="Child Account"
              accountAddr={child.addr}
              data={child}
              isSelected={selectedAccount === child.addr}
              onSelect={onSelectAccount}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AccountSelection;
