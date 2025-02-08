import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      {/* 
        Use px-0 for mobile, sm:px-2 for small screens, and md:px-4 for medium and up.
        Adjust the values as needed.
      */}
      <main className="flex-1 px-0 sm:px-2 md:px-4">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
