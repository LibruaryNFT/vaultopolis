// src/components/AccountSelection.jsx

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
      className={`
        p-2 w-36 sm:w-48 rounded-lg border-2 transition-all flex-shrink-0
        ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}

        /* Border color: opolis if selected, brand-border if not */
        ${isSelected ? "border-opolis" : "border-brand-border"}

        /*
          Updated brand color classes:
          - If disabled => bg-brand-blue
          - If enabled => bg-brand-secondary (hover => bg-brand-blue)
        */
        ${isDisabled ? "bg-brand-blue" : "bg-brand-primary hover:bg-brand-blue"}
      `}
    >
      <h4
        className={`
          text-sm font-semibold
          ${isSelected ? "text-opolis" : "text-brand-text"}
        `}
      >
        {label}
      </h4>
      <p className="text-[11px] leading-snug text-brand-text/70 break-all">
        {address}
      </p>
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
  // You can pass this in if you only want to enforce a collection check for certain steps
  requireCollection = false,
  title = "Account Selection",
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
          className="
            bg-brand-secondary
            p-2
            rounded
            flex
            flex-col
            items-center
            text-center
            w-full
          "
        >
          <p className="text-sm text-brand-text">Loading child data...</p>
        </div>
      );
    }

    // If there are zero children, show a Dapper wallet info card or fallback
    if (childrenAddresses.length === 0) {
      return (
        <div
          key="dapper-card"
          className="
            bg-brand-secondary
            p-2
            rounded
            flex
            flex-col
            items-center
            text-center
            w-full
          "
        >
          <div className="flex items-center justify-center text-base font-bold text-brand-text mb-1">
            <Repeat className="w-5 h-5 text-flow-light mr-1" />
            Use Your Dapper Wallet Moments
          </div>
          <p className="text-xs text-brand-text/70 mb-2">
            Seamlessly leverage Dapper Wallet assets on TSHOT—no need to move
            them elsewhere.
          </p>
          <a
            href="https://support.meetdapper.com/hc/en-us/articles/20744347884819-Account-Linking-and-FAQ"
            target="_blank"
            rel="noreferrer"
            className="
              bg-flow-dark
              hover:bg-flow-darkest
              text-xs
              text-white
              font-bold
              px-2
              py-1
              rounded
            "
          >
            Learn More
          </a>
        </div>
      );
    }

    // Otherwise, build an array of child boxes
    return childrenAddresses.map((childAddr) => {
      // For step 2, we don't need to check collection status
      const disabledBecauseNoCollection = false;

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
  const childBoxEls = renderChildBoxes();
  const allBoxes = parentBoxEl
    ? [parentBoxEl, ...[childBoxEls].flat()]
    : [childBoxEls].flat();

  return (
    <div className="text-center">
      <h3 className="text-brand-text text-sm font-bold mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-2">{allBoxes}</div>
    </div>
  );
};

export default AccountSelection;
