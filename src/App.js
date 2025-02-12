import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserProvider } from "./components/UserContext";
import Header from "./components/Header";
import Home from "./components/Home";
import Vault from "./components/Vault";
import Earn from "./components/Earn";
import Admin from "./components/Admin";
import TermsAndService from "./components/TermsAndPrivacy";
import Footer from "./components/Footer";
import Layout from "./components/Layout";
import Sell from "./components/Sell";
import Swap from "./components/Swap";

// Enforce HTTPS only in production
function enforceHTTPS() {
  if (
    window.location.protocol !== "https:" &&
    window.location.hostname !== "localhost"
  ) {
    window.location.href = `https://${window.location.hostname}${window.location.pathname}${window.location.search}`;
  }
}

// Create the router
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <Layout>
          <Home />
        </Layout>
      ),
    },
    {
      path: "/sell",
      element: (
        <Layout>
          <Sell />
        </Layout>
      ),
    },
    {
      path: "/swap",
      element: (
        <Layout>
          <Swap />
        </Layout>
      ),
    },
    {
      path: "/vault",
      element: (
        <Layout>
          <Vault />
        </Layout>
      ),
    },
    {
      path: "/earn",
      element: (
        <Layout>
          <Earn />
        </Layout>
      ),
    },
    {
      path: "/terms",
      element: (
        <Layout>
          <TermsAndService />
        </Layout>
      ),
    },
    {
      path: "/admin",
      element: <Admin />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

function App() {
  useEffect(() => {
    enforceHTTPS();
  }, []);

  return (
    <UserProvider>
      <div className="w-full min-h-screen bg-gray-600">
        {/* Main Content */}
        <div className="relative min-h-screen">
          <RouterProvider router={router} />
        </div>
      </div>
    </UserProvider>
  );
}

export default App;
