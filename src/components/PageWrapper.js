import React from "react";

/**
 * Standardized Page Wrapper Component
 * Provides consistent spacing and layout across all pages
 */
const PageWrapper = ({ 
  children, 
  className = "", 
  maxWidth = "4xl",
  padding = "md"
}) => {
  // Max width variants
  const maxWidthClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl", 
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full"
  };

  // Padding variants - standardized spacing from header
  const paddingClasses = {
    none: "",
    sm: "pt-8 pb-8",
    md: "pt-12 pb-12", 
    lg: "pt-16 pb-16",
    xl: "pt-20 pb-20"
  };

  const classes = `
    ${paddingClasses[padding]}
    ${className}
  `.trim();

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto px-2 sm:px-4 ${classes}`}>
      {children}
    </div>
  );
};

export default PageWrapper;
