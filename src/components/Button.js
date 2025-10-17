import React from "react";

/**
 * Standardized Button Component
 * Provides consistent styling across the application
 */
const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  disabled = false, 
  className = "", 
  onClick,
  type = "button",
  ...props 
}) => {
  // Base button classes
  const baseClasses = `
    font-semibold rounded-lg transition-all duration-200 select-none
    focus:outline-none focus:ring-2 focus:ring-brand-accent/50
    disabled:cursor-not-allowed
  `;

  // Size variants
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base", 
    lg: "px-6 py-4 text-lg"
  };

  // Color variants
  const variantClasses = {
    primary: `
      bg-brand-accent text-white hover:bg-brand-accent/90
      shadow-md hover:shadow-lg
    `,
    secondary: `
      bg-brand-secondary text-brand-text border border-brand-border
      hover:bg-brand-primary hover:border-brand-accent
      disabled:bg-brand-primary disabled:text-brand-text/80 disabled:border-brand-border/60
    `,
    outline: `
      bg-transparent text-brand-accent border-2 border-brand-accent
      hover:bg-brand-accent hover:text-white
    `,
    ghost: `
      bg-transparent text-brand-text hover:bg-brand-primary
    `,
    opolis: `
      bg-opolis text-white hover:bg-opolis-dark
      shadow-md hover:shadow-lg
    `
  };

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
