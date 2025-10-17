import React from "react";

/**
 * ContentPanel Component
 * Codifies the elegant TSHOT styling for informational content sections
 * Creates the base content style that serves as a canvas for interactive Card components
 */
const ContentPanel = ({ 
  children, 
  className = "", 
  padding = "md",
  title,
  subtitle
}) => {
  // Padding variants
  const paddingClasses = {
    none: "",
    sm: "p-4", 
    md: "p-6",
    lg: "p-8",
    xl: "p-10"
  };

  const classes = `
    bg-white/10 border border-white/20 rounded-lg
    ${paddingClasses[padding]}
    ${className}
  `.trim();

  return (
    <div className={classes}>
      {title && (
        <h2 className="text-white text-xl font-bold mb-4">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-white/80 text-sm mb-6">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
};

export default ContentPanel;
