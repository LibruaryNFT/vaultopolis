// src/components/Dropdown.js
import React, { useState, useRef, useEffect } from "react";

/**
 * Single-line TSHOT label with bigger icon (w-9 h-9).
 */
const tshotLabel = (
  <div className="flex items-center gap-2">
    <img
      src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
      alt="TSHOT"
      className="w-9 h-9"
    />
    <span>TSHOT</span>
  </div>
);

/**
 * Single-line "TopShot Common / Fandom"
 * partial-colored for "Common" / "Fandom".
 */
const topShotLabel = (
  <span>
    TopShot <span className="text-gray-400">Common</span> /{" "}
    <span className="text-lime-400">Fandom</span>
  </span>
);

export const FROM_OPTIONS = [
  { value: "TSHOT", label: tshotLabel },
  { value: "TopShot Common / Fandom", label: topShotLabel },
];

/**
 * A custom dropdown that:
 * - Excludes the current selection if 'excludeSelected' is true
 * - Has a fixed width (w-72) + fixed height (h-14)
 * - Larger TSHOT icon and arrow, no hover color changes
 * - Single-line text for TopShot
 */
export default function Dropdown({
  options,
  selectedValue,
  onChange,
  excludeSelected = false,
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

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleSelect = (value) => {
    onChange(value);
    setIsOpen(false);
  };

  const filtered = excludeSelected
    ? options.filter((opt) => opt.value !== selectedValue)
    : options;

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="
          flex items-center justify-between
          bg-gray-700 text-white
          px-3 py-2
          rounded-lg text-base
          w-72 h-14
        "
      >
        <div className="text-left">
          {selectedOption ? selectedOption.label : "Select..."}
        </div>
        <svg
          className={`
            ml-2 w-5 h-5
            ${isOpen ? "rotate-180" : ""}
            transition-transform duration-200
          `}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 0 1 .707.293l6.364 6.364a1 1 0 1 1-1.414 1.414L10 5.414 4.343 11.07a1 1 0 0 1-1.414-1.414l6.364-6.364A1 1 0 0 1 10 3z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-gray-800 rounded shadow-lg w-72">
          {filtered.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="px-4 py-2 text-white cursor-pointer"
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
