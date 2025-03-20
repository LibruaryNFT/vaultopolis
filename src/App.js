// src/App.jsx

import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import TSHOT from "./pages/TSHOT";
import TermsAndPrivacy from "./pages/TermsAndPrivacy";
import Layout from "./layout/Layout";
import Swap from "./pages/Swap";
import Transfer from "./pages/Transfer";

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
      element: <Navigate to="/swap" replace />,
    },
    {
      path: "/transfer",
      element: (
        <Layout>
          <Transfer />
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
      path: "/tshot",
      element: (
        <Layout>
          <TSHOT />
        </Layout>
      ),
    },
    {
      path: "/terms",
      element: (
        <Layout>
          <TermsAndPrivacy />
        </Layout>
      ),
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
      <div className="w-full min-h-screen bg-brand-secondary text-brand-text">
        {/* Main Content */}
        <div className="relative min-h-screen">
          <RouterProvider router={router} />
        </div>
      </div>
    </UserProvider>
  );
}

export default App;
