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
  matchCount,
  role, // "PARENT" | "CHILD"
  displayName,
}) => {
  const handleClick = () => {
    if (!isDisabled) onClick(address);
  };

  const primaryText = role === "PARENT" ? null : (displayName || label);
  const hasPrimary = !!primaryText;

  return (
    <div
      onClick={handleClick}
      title={isDisabled ? "This account has no TopShot collection." : ""}
      className={`
        p-2 w-36 sm:w-48 rounded-lg border-2 transition-all flex-shrink-0 select-none relative
        ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${isSelected ? "border-opolis" : "border-brand-border"}
        ${
          isDisabled
            ? "bg-brand-blue"
            : "bg-brand-secondary hover:bg-brand-blue"
        }
        ${!hasPrimary && role ? "pt-5" : ""}
      `}
    >
      {/* Top row: primary name on left, role badge on right */}
      <div className="flex items-start justify-between">
        {primaryText && (
          <h4
            className={`
              text-sm font-semibold select-none text-left truncate pr-2
              ${isSelected ? "text-opolis" : "text-brand-text"}
            `}
            title={primaryText}
          >
            {primaryText}
          </h4>
        )}
        {role && (
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-brand-primary/60 text-brand-text font-semibold whitespace-nowrap border border-brand-border/50 absolute right-1 top-1">
            {role}
          </span>
        )}
      </div>

      {/* Second line: wallet type icon (Flow for parent, Dapper for child with username) + address */}
      <p className={`text-[11px] leading-snug text-brand-text/80 font-mono break-all select-none text-left ${hasPrimary ? "mt-0.5" : "mt-2"} flex items-center`}>
        {role === "PARENT" ? (
          <img
            src="https://cdn.prod.website-files.com/68d31a12d30c3ba3a0928e1d/68d31a12d30c3ba3a092902a_Group%2047467.png"
            alt="Flow Wallet"
            className="w-3 h-3 mr-1 shrink-0"
          />
        ) : (displayName ? (
          <svg fill="none" viewBox="0 0 53 54" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1 shrink-0" aria-label="Dapper Wallet">
            <g fill="none" fillRule="evenodd" transform="translate(.197 .704)">
              <path fill="#F5E3F7" d="M52.803 26.982C52.803 12.412 40.983.6 26.4.6 11.82.6 0 12.41 0 26.982v13.789c0 6.462 5.291 11.75 11.758 11.75h29.287c6.466 0 11.758-5.288 11.758-11.75V26.982z"></path>
              <g>
                <path fill="#FF5A9D" d="M45.92 22.847c0-4.049-1.191-19.768-16.434-22.15-13.545-2.116-24.77 2.144-27.628 15.72-2.859 13.576-.239 26.199 9.765 27.39 10.004 1.19 12.861.714 23.341.238 10.48-.477 10.956-17.149 10.956-21.198" transform="translate(3.2 5.333)"></path>
                <path fill="#FFF" d="M32.763 11.307c-4.457 0-8.255 2.82-9.709 6.772-1.453-3.953-5.252-6.772-9.709-6.772-5.712 0-10.342 4.63-10.342 10.342 0 5.712 4.63 10.342 10.342 10.342 4.457 0 8.256-2.82 9.71-6.772 1.453 3.952 5.251 6.772 9.708 6.772 5.712 0 10.342-4.63 10.342-10.342 0-5.712-4.63-10.342-10.342-10.342" transform="translate(3.2 5.333)"></path>
                <path fill="#7320D3" d="M13.556 14.364c-3.73 0-6.753 3.023-6.753 6.754 0 3.73 3.023 6.753 6.753 6.753s6.754-3.023 6.754-6.753-3.023-6.754-6.754-6.754M32.552 14.364c-3.73 0-6.754 3.023-6.754 6.754 0 3.73 3.024 6.753 6.754 6.753 3.73 0 6.754-3.023 6.754-6.753s-3.024-6.754-6.754-6.754" transform="translate(3.2 5.333)"></path>
                <path fill="#FFF" d="M19.427 16.27c0 1.64-1.33 2.968-2.969 2.968-1.639 0-2.968-1.329-2.968-2.968s1.33-2.968 2.968-2.968c1.64 0 2.969 1.33 2.969 2.968M39.214 16.27c0 1.64-1.33 2.968-2.968 2.968-1.64 0-2.968-1.329-2.968-2.968s1.328-2.968 2.968-2.968c1.638 0 2.968 1.33 2.968 2.968" transform="translate(3.2 5.333)"></path>
              </g>
            </g>
          </svg>
        ) : null)}
        <span className="truncate">{address}</span>
      </p>
    </div>
  );
};

/* ───────── AccountSelection ───────── */
const AccountSelection = ({
  parentAccount,
  childrenAddresses = [],
  childrenAccounts = [],
  matchCounts = {},
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

      const parentLabel = parentAccount.addr;
      const parentBox = (
      <AccountBox
        key={`parent-${parentAccount.addr}`}
          label={parentLabel}
        address={parentAccount.addr}
        isSelected={normSel === parentAccount.addr.toLowerCase()}
        onClick={onSelectAccount}
        isDisabled={requireCollection && !parentAccount.hasCollection}
          matchCount={matchCounts[parentAccount.addr?.toLowerCase?.()]}
          role="PARENT"
          displayName={null}
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

    return childrenAddresses.map((childAddr) => {
      const lower = childAddr?.toLowerCase?.();
      const childObj = (childrenAccounts || []).find((c) => c?.addr?.toLowerCase?.() === lower);
      const name = childObj?.displayName;
      const labelText = "Child Account";
      return (
        <AccountBox
          key={childAddr}
          label={labelText}
          address={childAddr}
          isSelected={normSel === childAddr.toLowerCase()}
          onClick={onSelectAccount}
          isDisabled={requireCollection && !childObj?.hasCollection}
          matchCount={matchCounts[childAddr?.toLowerCase?.()]}
          role="CHILD"
          displayName={name || null}
        />
      );
    });
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
      <div className="flex flex-wrap justify-start gap-2">{allBoxes}</div>
    </div>
  );
};

export default AccountSelection;
