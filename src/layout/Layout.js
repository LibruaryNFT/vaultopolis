// src/layout/Layout.jsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen relative">
    <Header />

    <main className="flex-1 px-0 sm:px-2 md:px-4">{children}</main>

    <Footer />
  </div>
);

export default Layout;
