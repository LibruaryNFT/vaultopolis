import React from "react";

/**
 * Standardized Card Component
 * Provides consistent card styling across the application
 */
const Card = ({ 
  children, 
  variant = "default", 
  padding = "md", 
  className = "", 
  hover = false,
  onClick,
  ...props 
}) => {
  // Base card classes
  const baseClasses = `
    rounded-lg border transition-all duration-300
    ${onClick ? 'cursor-pointer' : ''}
  `;

  // Padding variants
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4", 
    lg: "p-6",
    xl: "p-8"
  };

  // Card variants
  const variantClasses = {
    default: `
      bg-brand-primary border-brand-border
      ${hover ? 'hover:border-brand-accent hover:shadow-lg hover:shadow-brand-accent/20' : ''}
    `,
    secondary: `
      bg-brand-secondary border-brand-border
      ${hover ? 'hover:border-brand-accent hover:shadow-lg hover:shadow-brand-accent/20' : ''}
    `,
    elevated: `
      bg-brand-secondary border-brand-border shadow-md
      ${hover ? 'hover:border-brand-accent hover:shadow-xl hover:shadow-brand-accent/30 hover:-translate-y-1' : ''}
    `,
    gradient: `
      bg-gradient-to-br from-brand-secondary to-brand-primary border-brand-border
      ${hover ? 'hover:border-brand-accent hover:shadow-xl hover:shadow-brand-accent/30 hover:-translate-y-1' : ''}
    `,
    accent: `
      bg-gradient-to-br from-brand-accent to-brand-accent/80 border-brand-accent/30
      ${hover ? 'hover:border-brand-accent/50 hover:shadow-xl hover:shadow-brand-accent/30' : ''}
    `
  };

  const classes = `
    ${baseClasses}
    ${paddingClasses[padding]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  const Component = onClick ? 'div' : 'div';

  return (
    <Component
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
