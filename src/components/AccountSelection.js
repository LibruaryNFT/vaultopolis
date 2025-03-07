// src/components/AccountSelection.js
import React from "react";
import { Repeat } from "lucide-react";

/**
 * Minimal display for an account box:
 * - Shows label (Parent/Child)
 * - Shows address
 * - Highlights if selected
 * - Narrower (w-48) so multiple accounts fit side by side more easily.
 */
const AccountBox = ({ label, address, isSelected, onClick }) => {
  return (
    <div
      onClick={() => onClick(address)}
      className={`p-2 w-48 rounded-lg border-2 transition-all cursor-pointer
        ${isSelected ? "border-opolis" : "border-gray-500"}
        hover:bg-gray-800 bg-gray-700
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
}) => {
  /**
   * Render the parent account box if available
   * Add a unique "key" prop to avoid the React warning
   */
  const renderParentBox = () => {
    if (!parentAccount || !parentAccount.addr) return null;

    return (
      <AccountBox
        key={`parent-${parentAccount.addr}`} // Add a unique key for the parent box
        label="Parent Account"
        address={parentAccount.addr}
        isSelected={selectedAccount === parentAccount.addr}
        onClick={onSelectAccount}
      />
    );
  };

  /**
   * Render child account boxes, but only if `hasCollection === true`.
   * Returns an array of React elements (or one fallback card).
   */
  const renderChildBoxes = () => {
    // If still loading child data
    if (isLoadingChildren) {
      return [
        <div
          key="loading"
          className="bg-gray-600 p-2 rounded flex flex-col items-center text-center w-48"
        >
          <p className="text-sm text-gray-100">Loading child data...</p>
        </div>,
      ];
    }

    // If there are zero children, show the Dapper Wallet info card
    if (childrenAddresses.length === 0) {
      return [
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
        </div>,
      ];
    }

    // Otherwise, build an array of child boxes that have a TS collection
    return childrenAddresses
      .map((childAddr) => {
        const childData = childrenAccounts.find((c) => c.addr === childAddr);
        if (!childData?.hasCollection) return null;

        return (
          <AccountBox
            key={childAddr}
            label="Child Account"
            address={childAddr}
            isSelected={selectedAccount === childAddr}
            onClick={onSelectAccount}
          />
        );
      })
      .filter(Boolean); // remove any nulls
  };

  // We'll combine the parent box + child boxes into a single array for our grid
  const parentBoxEl = renderParentBox();
  const childBoxEls = renderChildBoxes(); // array of React elements
  const allBoxes = parentBoxEl ? [parentBoxEl, ...childBoxEls] : childBoxEls;

  return (
    <div className="text-center">
      {/* Centered Title */}
      <h3 className="text-white text-sm font-bold mb-2">Account Selection</h3>

      {/* 
        - Two columns: if there's a 3rd item, it wraps to the next row.
        - Each item is centered horizontally (justify-items-center). 
      */}
      <div className="grid grid-cols-2 gap-3 justify-items-center">
        {allBoxes}
      </div>
    </div>
  );
};

export default AccountSelection;
