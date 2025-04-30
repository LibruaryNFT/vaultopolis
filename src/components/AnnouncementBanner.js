// src/components/AnnouncementBanner.jsx
import React from "react";

function AnnouncementBanner() {
  return (
    <div className="bg-green-600 text-white text-center py-2">
      <p className="text-sm sm:text-base">
        <strong>Maintenance Notice:</strong>&nbsp; Vaultopolis will undergo
        performance upgrades&nbsp;
        <span className="whitespace-nowrap">May&nbsp;1, 10 – 11 AM EST</span>.
        &nbsp;Some features may be briefly unavailable.
      </p>
    </div>
  );
}

export default AnnouncementBanner;
