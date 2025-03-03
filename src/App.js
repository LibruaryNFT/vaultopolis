import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import TSHOT from "./components/TSHOT";
import Earn from "./components/Earn";
import TermsAndService from "./components/TermsAndPrivacy";
import Layout from "./components/Layout";
import ExchangePanel from "./components/ExchangePanel";
import Transfer from "./components/Transfer";

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
      element: <Navigate to="/exchange" replace />,
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
      path: "/exchange",
      element: (
        <Layout>
          <ExchangePanel />
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
