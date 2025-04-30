// src/layout/Layout.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AnnouncementBanner from "../components/AnnouncementBanner";

const Layout = ({ children }) => {
  const { pathname } = useLocation();

  // Show the banner only on "/" and "/swap"
  const showBanner = pathname === "/" || pathname === "/swap";

  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />

      {showBanner && <AnnouncementBanner />}

      <main className="flex-1 px-0 sm:px-2 md:px-4">{children}</main>

      <Footer />
    </div>
  );
};

export default Layout;
