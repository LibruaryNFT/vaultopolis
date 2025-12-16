import React, { useState } from "react";

/**
 * Shared PageInput component for pagination
 * Allows users to jump to a specific page number
 */
const PageInput = ({ maxPages, currentPage, onPageChange, disabled }) => {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleSubmit = () => {
    const newPage = parseInt(inputValue, 10);
    if (
      newPage &&
      newPage >= 1 &&
      newPage <= maxPages &&
      newPage !== currentPage
    ) {
      onPageChange(newPage);
    }
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Page #"
          className="w-16 px-2 py-1 rounded-lg bg-brand-primary text-brand-text/80 text-sm border border-brand-border focus:outline-none focus:ring-2 focus:ring-opolis/50"
          disabled={disabled}
        />
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled}
        className="px-3 py-1 rounded-lg bg-brand-primary text-brand-text/80 border border-brand-border hover:bg-brand-primary/80 hover:border-opolis/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-opolis/50 focus-visible:outline-none"
      >
        Go
      </button>
    </div>
  );
};

export default PageInput;

