// src/components/MultiSelectDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaCheck } from "react-icons/fa";

/**
 * MultiSelectDropdown Component
 * A multi-select dropdown for filtering (e.g., Series filters)
 * 
 * @param {Array} options - Array of option values
 * @param {Array} selectedValues - Currently selected values
 * @param {Function} onChange - Callback when selection changes (receives new array)
 * @param {Function} labelFn - Optional function to format option labels (receives value, returns string/React node)
 * @param {Function} countFn - Optional function to get count for each option (receives value, returns number)
 * @param {string} placeholder - Placeholder text when no items selected
 * @param {string} width - Width class (default: "w-40")
 * @param {string} title - Title/tooltip text
 * @param {boolean} disabled - Whether dropdown is disabled
 */
export default function MultiSelectDropdown({
  options = [],
  selectedValues = [],
  onChange,
  labelFn = null,
  countFn = null,
  placeholder = "Select...",
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

  const handleSelect = (value) => {
    if (disabled) return;
    
    const isSelected = selectedValues.includes(value);
    let newSelection;
    
    if (isSelected) {
      // Deselect - but prevent deselecting all if this is the last one
      newSelection = selectedValues.filter((v) => v !== value);
      if (newSelection.length === 0) {
        // Can't deselect all - select all instead
        newSelection = [...options];
      }
    } else {
      // Select
      newSelection = [...selectedValues, value];
    }
    
    onChange(newSelection);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allSelected = selectedValues.length === options.length;
    onChange(allSelected ? [] : [...options]);
  };

  const getLabel = (value) => {
    if (labelFn) return labelFn(value);
    return String(value);
  };

  const getCount = (value) => {
    if (countFn) return countFn(value);
    return null;
  };

  const displayText = selectedValues.length === 0
    ? placeholder
    : selectedValues.length === options.length
    ? "All"
    : selectedValues.length === 1
    ? getLabel(selectedValues[0])
    : `${selectedValues.length} selected`;

  const allSelected = selectedValues.length === options.length && options.length > 0;

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
        <span className="truncate text-left flex-1 min-w-0">{displayText}</span>
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
          {/* Select All option */}
          <div
            onClick={handleSelectAll}
            className="
              px-3
              py-2
              cursor-pointer
              hover:bg-brand-secondary
              transition-colors
              select-none
              border-b border-brand-border
              font-semibold
            "
          >
            <div className="flex items-center gap-2">
              <div className={`
                w-4 h-4 flex items-center justify-center
                border border-brand-border rounded
                ${allSelected ? 'bg-brand-accent border-brand-accent' : 'bg-transparent'}
              `}>
                {allSelected && <FaCheck className="w-3 h-3 text-white" />}
              </div>
              <span>All</span>
            </div>
          </div>

          {/* Individual options */}
          {options.map((option) => {
            const isSelected = selectedValues.includes(option);
            const count = getCount(option);
            const label = getLabel(option);
            
            return (
              <div
                key={option}
                onClick={() => handleSelect(option)}
                className="
                  px-3
                  py-2
                  cursor-pointer
                  hover:bg-brand-secondary
                  transition-colors
                  select-none
                  flex items-center gap-2
                  min-w-0
                  w-full
                "
              >
                <div className={`
                  w-4 h-4 flex items-center justify-center
                  border border-brand-border rounded flex-shrink-0
                  ${isSelected ? 'bg-brand-accent border-brand-accent' : 'bg-transparent'}
                `}>
                  {isSelected && <FaCheck className="w-3 h-3 text-white" />}
                </div>
                <span className="flex-1 truncate min-w-0 text-left">{typeof label === 'string' ? label : String(label)}</span>
                {count !== null && (
                  <span className="text-xs text-brand-text/60 flex-shrink-0 whitespace-nowrap">({count})</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
