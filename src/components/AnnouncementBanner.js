// src/components/AnnouncementBanner.jsx
import React from "react";
import { Link } from "react-router-dom";

function AnnouncementBanner() {
  return (
    <div className="bg-indigo-800 text-white text-center py-2">
      <p className="text-sm sm:text-base">
        <strong>Introducing TSHOT:</strong> a new token minted 1:1 from Top Shot
        Common/Fandom Moments.{" "}
        <Link
          to="/tshot"
          className="font-bold underline hover:text-gray-100 transition-colors"
        >
          Learn more
        </Link>
      </p>
    </div>
  );
}

export default AnnouncementBanner;
