// src/components/AccountSelection.jsx
import React, { useState } from "react";
import { Repeat, Package } from "lucide-react";

/* ───────── AccountBox ───────── */
const AccountBox = ({
  label,
  address,
  isSelected,
  onClick,
  isDisabled = false,
}) => {
  const handleClick = () => {
    if (!isDisabled) onClick(address);
  };

  return (
    <div
      onClick={handleClick}
      title={isDisabled ? "This account has no TopShot collection." : ""}
      className={`
        p-2 w-36 sm:w-48 rounded-lg border-2 transition-all flex-shrink-0 select-none
        ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${isSelected ? "border-opolis" : "border-brand-border"}
        ${
          isDisabled
            ? "bg-brand-blue"
            : "bg-brand-secondary hover:bg-brand-blue"
        }
      `}
    >
      <h4
        className={`
          text-sm font-semibold select-none text-center
          ${isSelected ? "text-opolis" : "text-brand-text"}
        `}
      >
        {label}
      </h4>
      <p className="text-[11px] leading-snug text-brand-text/70 break-all select-none text-center">
        {address}
      </p>
    </div>
  );
};

/* ───────── AccountSelection ───────── */
const AccountSelection = ({
  parentAccount,
  childrenAddresses = [],
  selectedAccount,
  onSelectAccount,
  isLoadingChildren,
  requireCollection = false,
  title = "Account Selection",
  onSetupTopShotCollection,
  onRefreshParentAccount,
}) => {
  const [isSettingUpCollection, setIsSettingUpCollection] = useState(false);
  const [setupError, setSetupError] = useState(null);

  /* -------- helpers -------- */
  const normSel = selectedAccount?.toLowerCase?.();

  const handleSetupCollection = async () => {
    if (!onSetupTopShotCollection || !parentAccount?.addr) return;

    setIsSettingUpCollection(true);
    setSetupError(null);

    try {
      await onSetupTopShotCollection(parentAccount.addr);
      if (onRefreshParentAccount) {
        await onRefreshParentAccount();
      }
    } catch (error) {
      console.error("Failed to setup TopShot collection:", error);
      setSetupError("Failed to setup collection. Please try again.");
    } finally {
      setIsSettingUpCollection(false);
    }
  };

  const renderParentBox = () => {
    if (!parentAccount?.addr) return null;

    const parentBox = (
      <AccountBox
        key={`parent-${parentAccount.addr}`}
        label="Parent Account"
        address={parentAccount.addr}
        isSelected={normSel === parentAccount.addr.toLowerCase()}
        onClick={onSelectAccount}
        isDisabled={requireCollection && !parentAccount.hasCollection}
      />
    );

    // Only show setup box if we require collection and parent doesn't have one
    if (requireCollection && !parentAccount.hasCollection) {
      const setupBox = (
        <div
          key="setup-collection"
          className="
            p-2 w-36 sm:w-48 rounded-lg border-2 border-brand-border
            bg-brand-secondary flex flex-col items-center text-center
            flex-shrink-0 select-none
          "
        >
          <div className="flex items-center justify-center text-sm font-semibold text-brand-text mb-1">
            <Package className="w-4 h-4 text-flow-light mr-1" />
            Setup Collection
          </div>
          <p className="text-[11px] leading-snug text-brand-text/70 mb-2">
            Your parent account needs a TopShot collection to proceed.
          </p>
          {setupError && (
            <p className="text-[11px] text-red-500 mb-1">{setupError}</p>
          )}
          <button
            onClick={handleSetupCollection}
            disabled={isSettingUpCollection}
            className={`
              bg-opolis hover:bg-opolis-dark text-[11px] text-white
              font-bold px-2 py-0.5 rounded
              ${isSettingUpCollection ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {isSettingUpCollection ? "Setting up..." : "Setup Collection"}
          </button>
        </div>
      );

      return [parentBox, setupBox];
    }

    return parentBox;
  };

  const renderChildBoxes = () => {
    if (isLoadingChildren) {
      return (
        <div
          key="loading"
          className="
            p-2 w-36 sm:w-48 rounded-lg border-2 border-brand-border
            bg-brand-secondary flex flex-col items-center text-center
            flex-shrink-0 select-none
          "
        >
          <p className="text-sm text-brand-text">Loading child data...</p>
        </div>
      );
    }

    if (childrenAddresses.length === 0) {
      return (
        <div
          key="dapper-card"
          className="
            p-2 w-36 sm:w-48 rounded-lg border-2 border-brand-border
            bg-brand-secondary flex flex-col items-center text-center
            flex-shrink-0 select-none
          "
        >
          <div className="flex items-center justify-center text-sm font-semibold text-brand-text mb-1">
            <Repeat className="w-4 h-4 text-flow-light mr-1" />
            Dapper Wallet
          </div>
          <p className="text-[11px] leading-snug text-brand-text/70 mb-2">
            Use your Dapper Wallet Moments on TSHOT
          </p>
          <a
            href="https://support.meetdapper.com/hc/en-us/articles/20744347884819-Account-Linking-and-FAQ"
            target="_blank"
            rel="noreferrer"
            className="
              bg-flow-dark hover:bg-flow-darkest text-[11px] text-white
              font-bold px-2 py-0.5 rounded
            "
          >
            Learn More
          </a>
        </div>
      );
    }

    return childrenAddresses.map((childAddr) => (
      <AccountBox
        key={childAddr}
        label="Child Account"
        address={childAddr}
        isSelected={normSel === childAddr.toLowerCase()}
        onClick={onSelectAccount}
        isDisabled={false}
      />
    ));
  };

  /* -------- assemble list safely -------- */
  const parentEl = renderParentBox();
  const childElsRaw = renderChildBoxes(); // element | array | null
  const childEls = Array.isArray(childElsRaw)
    ? childElsRaw
    : childElsRaw != null
    ? [childElsRaw]
    : [];

  // Handle parentEl being an array (when showing both parent box and setup box)
  const allBoxes = [
    ...(Array.isArray(parentEl) ? parentEl : parentEl ? [parentEl] : []),
    ...childEls,
  ];

  /* -------- render -------- */
  return (
    <div className="bg-brand-primary text-brand-text p-1 rounded w-full">
      <h4 className="text-brand-text text-sm mb-2">Select Account:</h4>
      <div className="flex flex-wrap justify-center gap-2">{allBoxes}</div>
    </div>
  );
};

export default AccountSelection;
