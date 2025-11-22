// src/components/FilterDropdown.jsx
import React, { useState, useRef, useEffect } from "react";

/**
 * FilterDropdown Component
 * A single-select dropdown for filters (League, Set, Team, Player, Parallel, etc.)
 * Standardized styling consistent with the design system
 * 
 * @param {Array} options - Array of option values (strings)
 * @param {string} value - Currently selected value
 * @param {Function} onChange - Callback when selection changes (receives new value via e.target.value)
 * @param {Function} labelFn - Optional function to format option labels (receives value, returns string)
 * @param {Function} countFn - Optional function to get count for each option (receives value, returns number)
 * @param {string} width - Width class (default: "w-40")
 * @param {string} title - Title/tooltip text
 * @param {boolean} disabled - Whether dropdown is disabled
 */
export default function FilterDropdown({
  options = [],
  value = "All",
  onChange,
  labelFn = null,
  countFn = null,
  width = "w-40",
  title = "",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleSelect = (optionValue) => {
    if (disabled) return;
    // Create a synthetic event for compatibility with existing onChange handlers
    const syntheticEvent = {
      target: { value: optionValue },
    };
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  const getLabel = (optionValue) => {
    if (labelFn) return labelFn(optionValue);
    return String(optionValue);
  };

  const getCount = (optionValue) => {
    if (countFn) return countFn(optionValue);
    return null;
  };

  const selectedOption = value || "All";
  const displayText = selectedOption === "All" 
    ? "All" 
    : getLabel(selectedOption);
  const selectedCount = selectedOption !== "All" ? getCount(selectedOption) : null;

  return (
    <div className={`relative ${width} min-w-0`} ref={dropdownRef} title={title}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex items-center justify-between
          bg-brand-primary
          text-brand-text
          px-3
          py-1.5
          rounded
          text-xs
          w-full
          min-w-0
          transition-colors
          hover:opacity-90
          select-none
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
      >
        <span className="truncate text-left flex-1 min-w-0">
          {displayText}
          {selectedCount !== null && (
            <span className="text-brand-text/60 ml-1">({selectedCount})</span>
          )}
        </span>
        <svg
          className={`
            ml-2 w-4 h-4 flex-shrink-0
            ${isOpen ? "rotate-180" : ""}
            transition-transform duration-200
          `}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 0 1 .707.293l6.364 6.364a1 1 0 1 1-1.414 1.414L10 5.414 4.343 11.07a1 1 0 1 1-1.414-1.414l6.364-6.364A1 1 0 0 1 10 3z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          className="
            absolute
            left-0
            right-0
            z-50
            mt-1
            bg-brand-primary
            text-brand-text
            border
            border-brand-border
            rounded
            shadow-lg
            max-h-60
            overflow-y-auto
            overflow-x-hidden
            min-w-0
          "
        >
          {options.map((option) => {
            const isSelected = option === selectedOption;
            const count = getCount(option);
            const label = getLabel(option);
            
            return (
              <div
                key={option}
                onClick={() => handleSelect(option)}
                className={`
                  px-3
                  py-2
                  cursor-pointer
                  hover:bg-brand-secondary
                  transition-colors
                  select-none
                  min-w-0
                  ${isSelected ? 'bg-brand-secondary/50' : ''}
                `}
              >
                <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                  <span className="truncate flex-1 min-w-0">{label}</span>
                  {count !== null && (
                    <span className="text-xs text-brand-text/60 flex-shrink-0 whitespace-nowrap">({count})</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

