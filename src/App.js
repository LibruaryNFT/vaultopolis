import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UserContext from "./context/UserContext";

import TSHOT from "./pages/TSHOT";
import TermsAndPrivacy from "./pages/TermsAndPrivacy";
import Layout from "./layout/Layout";
import Swap from "./pages/Swap";
import Transfer from "./pages/Transfer";
import Profile from "./pages/Profile";

// Special pages
import ComingSoon from "./pages/ComingSoon";
import MaintenancePage from "./pages/Maintenance";

function enforceHTTPS() {
  if (
    window.location.protocol !== "https:" &&
    window.location.hostname !== "localhost"
  ) {
    window.location.href = `https://${window.location.hostname}${window.location.pathname}${window.location.search}`;
  }
}

// Create the router for normal operation
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Swap />
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
    path: "/transfer",
    element: (
      <Layout>
        <Transfer />
      </Layout>
    ),
  },
  {
    path: "/profile",
    element: (
      <Layout>
        <Profile />
      </Layout>
    ),
  },
  {
    path: "/profile/:address?",
    element: (
      <Layout>
        <Profile />
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
  // NEW: ComingSoon route
  {
    path: "/comingsoon",
    element: <ComingSoon />,
  },
]);

function App() {
  useEffect(() => {
    enforceHTTPS();
  }, []);

  // Read the environment variables
  const maintenanceMode = process.env.REACT_APP_MAINTENANCE_MODE === "true";
  const comingSoonMode = process.env.REACT_APP_COMING_SOON_MODE === "true";

  // Priority: Maintenance Mode first, then Coming Soon Mode
  if (maintenanceMode) {
    return <MaintenancePage />;
  } else if (comingSoonMode) {
    return <ComingSoon />;
  }

  return (
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
