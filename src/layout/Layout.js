// src/layout/Layout.jsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen relative bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary">
    <Header />

    <main className="flex-1">{children}</main>

    <Footer />
  </div>
);

export default Layout;
