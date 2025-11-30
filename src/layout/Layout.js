// src/layout/Layout.jsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen relative bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary overflow-x-hidden">
    {/* Skip Navigation Link - Hidden by default, appears on focus */}
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-opolis focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-opolis focus:ring-offset-2"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
    
    <Header />

    <main id="main-content" className="flex-1" tabIndex={-1}>
      {children}
    </main>

    <Footer />
  </div>
);

export default Layout;
