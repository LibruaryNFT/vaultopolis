// src/components/SingleSelectDropdown.jsx
import React, { useState, useRef, useEffect } from "react";

/**
 * SingleSelectDropdown Component
 * A single-select dropdown compatible with native select usage
 * 
 * @param {Array} options - Array of option values (strings or numbers)
 * @param {string|number} value - Currently selected value
 * @param {Function} onChange - Callback when selection changes: (e) => void (e.target.value)
 * @param {string} label - Label text to show before the dropdown (e.g., "League:")
 * @param {Function} getLabel - Function to get display label for each value: (value) => string (optional, defaults to String(value))
 * @param {boolean} disabled - Whether the dropdown is disabled
 * @param {string} width - Tailwind width class (default: "w-40")
 * @param {string} title - Title/tooltip text
 */
export default function SingleSelectDropdown({
  options = [],
  value,
  onChange,
  label = "",
  getLabel = (val) => String(val),
  disabled = false,
  width = "w-40",
  title = "",
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

  const handleSelect = (selectedValue) => {
    // Create a synthetic event to match native select onChange behavior
    const syntheticEvent = {
      target: { value: selectedValue },
    };
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  const selectedLabel = value === "All" || !value ? "All" : getLabel(value);
  const displayOptions = ["All", ...options];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {label && (
        <span className="font-semibold text-xs mr-2">{label}</span>
      )}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        title={title}
        className={`
          ${width}
          flex items-center justify-between
          bg-brand-primary
          text-brand-text
          px-3
          py-1.5
          rounded-lg
          text-sm
          border border-brand-border
          transition-colors
          hover:opacity-90
          disabled:opacity-40 disabled:cursor-not-allowed
          select-none
        `}
      >
        <span className="text-left truncate">{selectedLabel}</span>
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
            z-50
            mt-1
            bg-brand-primary
            text-brand-text
            border
            border-brand-border
            rounded-lg
            shadow-lg
            w-full
            max-h-60
            overflow-y-auto
          "
        >
          {displayOptions.map((option) => {
            const optionValue = option === "All" ? "All" : option;
            const isSelected = value === optionValue;
            return (
              <div
                key={optionValue}
                onClick={() => handleSelect(optionValue)}
                className={`
                  px-4
                  py-2
                  cursor-pointer
                  hover:bg-brand-secondary
                  transition-colors
                  select-none
                  ${isSelected ? "bg-brand-secondary/50" : ""}
                `}
              >
                {option === "All" ? "All" : getLabel(option)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

