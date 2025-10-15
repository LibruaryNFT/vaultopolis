import React from "react";

// Simple reusable panel with consistent header/body spacing
// Props: title (string), actions (node, optional), className (optional), dense (bool)
const UIPanel = ({ title, actions, children, className = "", dense = false }) => {
  return (
    <div className={`rounded-lg shadow border border-brand-primary mb-6 ${className}`}>
      <div className={`bg-brand-secondary ${dense ? "px-3 py-1.5" : "px-3 py-2"} rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold m-0 text-brand-text">{title}</h3>
          {actions ? <div className="flex items-center space-x-2">{actions}</div> : null}
        </div>
      </div>
      <div className={`bg-brand-primary ${dense ? "p-3" : "p-4"} rounded-b-lg`}>
        {children}
      </div>
    </div>
  );
};

export default UIPanel;


