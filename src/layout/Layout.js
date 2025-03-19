// src/layout/Layout.jsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";
import AnnouncementBanner from "../components/AnnouncementBanner";

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />

      {/* 
        Conditionally render the banner ONLY on /swap route.
        The banner is outside the main container, so it can go full width.
      */}
      {location.pathname === "/swap" && <AnnouncementBanner />}

      <main className="flex-1 px-0 sm:px-2 md:px-4">{children}</main>

      <Footer />
    </div>
  );
};

export default Layout;
