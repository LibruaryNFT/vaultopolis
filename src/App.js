import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
// IMPORTANT: import the *default* provider from "./context/UserContext"
import UserContext from "./context/UserContext";

import TSHOT from "./pages/TSHOT";
import TermsAndPrivacy from "./pages/TermsAndPrivacy";
import Layout from "./layout/Layout";
import Swap from "./pages/Swap";
import Transfer from "./pages/Transfer";

function enforceHTTPS() {
  if (
    window.location.protocol !== "https:" &&
    window.location.hostname !== "localhost"
  ) {
    window.location.href = `https://${window.location.hostname}${window.location.pathname}${window.location.search}`;
  }
}

// Create the router
const router = createBrowserRouter([
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
]);

function App() {
  useEffect(() => {
    enforceHTTPS();
  }, []);

  return (
    // We wrap our entire app in <UserContext>
    // (the default export from "UserContext.js"),
    // which provides the context to all child routes/components.
    <UserContext>
      <div className="w-full min-h-screen bg-brand-secondary text-brand-text">
        <div className="relative min-h-screen">
          <RouterProvider router={router} />
        </div>
      </div>
    </UserContext>
  );
}

export default App;
