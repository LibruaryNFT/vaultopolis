// src/components/AccountSelection.jsx
import React from "react";
import { Repeat } from "lucide-react";

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
        p-2 w-36 sm:w-48 rounded-lg border-2 transition-all flex-shrink-0
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

/* ───────── AccountSelection ───────── */
const AccountSelection = ({
  parentAccount,
  childrenAddresses = [],
  selectedAccount,
  onSelectAccount,
  isLoadingChildren,
  requireCollection = false,
  title = "Account Selection",
}) => {
  /* -------- helpers -------- */
  const normSel = selectedAccount?.toLowerCase?.();

  const renderParentBox = () => {
    if (!parentAccount?.addr) return null;

    const disabledBecauseNoCollection =
      requireCollection && !parentAccount.hasCollection;

    return (
      <AccountBox
        key={`parent-${parentAccount.addr}`}
        label="Parent Account"
        address={parentAccount.addr}
        isSelected={normSel === parentAccount.addr.toLowerCase()}
        onClick={onSelectAccount}
        isDisabled={disabledBecauseNoCollection}
      />
    );
  };

  const renderChildBoxes = () => {
    if (isLoadingChildren) {
      return (
        <div
          key="loading"
          className="
            bg-brand-secondary p-2 rounded flex flex-col
            items-center text-center w-full
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
            bg-brand-secondary p-2 rounded flex flex-col
            items-center text-center w-full
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
              bg-flow-dark hover:bg-flow-darkest text-xs text-white
              font-bold px-2 py-1 rounded
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
  const parentEl = renderParentBox(); // could be null
  const childElsRaw = renderChildBoxes(); // element | array | null
  const childEls = Array.isArray(childElsRaw)
    ? childElsRaw
    : childElsRaw != null
    ? [childElsRaw]
    : [];

  const allBoxes = [...(parentEl ? [parentEl] : []), ...childEls];

  /* -------- render -------- */
  return (
    <div className="text-center">
      <h3 className="text-brand-text text-sm font-bold mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-2">{allBoxes}</div>
    </div>
  );
};

export default AccountSelection;
