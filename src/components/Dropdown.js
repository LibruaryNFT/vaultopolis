// src/components/Dropdown.jsx
import React, { useState, useRef, useEffect } from "react";

/**
 * TSHOT label with bigger icon (w-9 h-9).
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
 * "TopShot Common / Fandom" with partial coloring:
 * - Common => text-gray-400
 * - Fandom => text-lime-400
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
          bg-brand-primary
          text-brand-text
          px-3
          py-2
          rounded-lg
          text-base
          w-60 sm:w-72
          h-14
          transition-colors
          hover:opacity-90
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
            d="M10 3a1 1 0 0 1 .707.293l6.364 6.364a1 1 0 1 1-1.414 1.414L10 5.414 4.343 11.07a1 1 0 1 1-1.414-1.414l6.364-6.364A1 1 0 0 1 10 3z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute
            z-50
            mt-1
            bg-brand-primary
            text-brand-text
            border
            border-brand-border
            rounded
            shadow-lg
            w-60 sm:w-72
          "
        >
          {filtered.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="
                px-4
                py-2
                cursor-pointer
                hover:bg-brand-secondary
                transition-colors
              "
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
