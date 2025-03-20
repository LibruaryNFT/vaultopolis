import React from "react";
import TSHOTInfo from "../components/TSHOTInfo";
import TSHOTVault from "../components/TSHOTVault";

function TSHOT() {
  return (
    <div className="w-full text-white space-y-4 mb-2">
      {/* TSHOTInfo: now purely a marketing/info component */}
      <TSHOTInfo />
      {/* TSHOTVault: vault filters & display */}
      <TSHOTVault />
    </div>
  );
}

export default TSHOT;
