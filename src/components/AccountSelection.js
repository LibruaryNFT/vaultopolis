// src/components/AccountSelection.js

import React from "react";
import { Repeat } from "lucide-react";

/**
 * Minimal display for an account box:
 * - `isDisabled` used to decide if clickable or not
 * - If `isDisabled` is true, we show a disabled style + block clicks.
 */
const AccountBox = ({
  label,
  address,
  isSelected,
  onClick,
  isDisabled = false,
}) => {
  const handleClick = () => {
    if (!isDisabled) {
      onClick(address);
    }
  };

  return (
    <div
      onClick={handleClick}
      title={isDisabled ? "This account has no TopShot collection." : ""}
      className={`p-2 w-48 rounded-lg border-2 transition-all ${
        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }
      ${isSelected ? "border-opolis" : "border-gray-500"}
      ${isDisabled ? "bg-gray-800" : "bg-gray-700 hover:bg-gray-800"}
    `}
    >
      <h4
        className={`text-sm font-semibold ${
          isSelected ? "text-green-400" : "text-white"
        }`}
      >
        {label}
      </h4>
      <p className="text-xs text-gray-400 truncate">{address}</p>
    </div>
  );
};

const AccountSelection = ({
  parentAccount,
  childrenAddresses = [],
  childrenAccounts = [],
  selectedAccount,
  onSelectAccount,
  isLoadingChildren,
  // You can pass this in if you only want to enforce it for Step 2
  requireCollection = false,
}) => {
  // Render the parent account box if available
  const renderParentBox = () => {
    if (!parentAccount || !parentAccount.addr) return null;

    const disabledBecauseNoCollection =
      requireCollection && !parentAccount.hasCollection;

    return (
      <AccountBox
        key={`parent-${parentAccount.addr}`}
        label="Parent Account"
        address={parentAccount.addr}
        isSelected={selectedAccount === parentAccount.addr}
        onClick={onSelectAccount}
        isDisabled={disabledBecauseNoCollection}
      />
    );
  };

  // Render child account boxes (only if they exist)
  const renderChildBoxes = () => {
    if (isLoadingChildren) {
      return (
        <div
          key="loading"
          className="bg-gray-600 p-2 rounded flex flex-col items-center text-center w-48"
        >
          <p className="text-sm text-gray-100">Loading child data...</p>
        </div>
      );
    }

    // If there are zero children, show a Dapper wallet info card or fallback
    if (childrenAddresses.length === 0) {
      return (
        <div
          key="dapper-card"
          className="bg-gray-600 p-2 rounded flex flex-col items-center text-center w-48"
        >
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
      );
    }

    // Otherwise, build an array of child boxes
    return childrenAddresses.map((childAddr) => {
      const childData = childrenAccounts.find((c) => c.addr === childAddr);

      // If we require a TS collection, disable those that lack it
      const disabledBecauseNoCollection =
        requireCollection && !childData?.hasCollection;

      return (
        <AccountBox
          key={childAddr}
          label="Child Account"
          address={childAddr}
          isSelected={selectedAccount === childAddr}
          onClick={onSelectAccount}
          isDisabled={disabledBecauseNoCollection}
        />
      );
    });
  };

  const parentBoxEl = renderParentBox();
  const childBoxEls = renderChildBoxes(); // can be an array or single element
  const allBoxes = parentBoxEl
    ? [parentBoxEl, ...[childBoxEls].flat()]
    : [childBoxEls].flat();

  return (
    <div className="text-center">
      <h3 className="text-white text-sm font-bold mb-2">Account Selection</h3>
      <div className="grid grid-cols-2 gap-3 justify-items-center">
        {allBoxes}
      </div>
    </div>
  );
};

export default AccountSelection;
