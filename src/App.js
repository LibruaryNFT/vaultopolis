import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserProvider } from "./components/UserContext";
import Header from "./components/Header";
import Home from "./components/Home";
import Vault from "./components/Vault";
import Earn from "./components/Earn";
import Admin from "./components/Admin";

// Create the router
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <>
          <Header />
          <Home />
        </>
      ),
    },
    {
      path: "/vault",
      element: (
        <>
          <Header />
          <Vault />
        </>
      ),
    },
    {
      path: "/earn",
      element: (
        <>
          <Header />
          <Earn />
        </>
      ),
    },
    {
      path: "/admin",
      element: (
        <>
          <Admin />
        </>
      ),
    },
  ],
  {
    future: {
      v7_startTransition: true, // Opt-in to React Router v7 behavior
    },
  }
);

function App() {
  return (
    <UserProvider>
      <div className="w-full min-h-screen relative overflow-hidden bg-black">
        {/* Background Video */}
        <video
          className="fixed top-0 left-0 w-full h-full object-cover z-0"
          src="https://storage.googleapis.com/momentswap/images/BackgroundMomentSwap4.mp4"
          autoPlay
          muted
          playsInline
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
        {/* Main Content */}
        <div className="relative z-20 min-h-screen flex flex-col items-center text-white">
          {/* Provide the router to your app */}
          <RouterProvider router={router} />
        </div>
      </div>
    </UserProvider>
  );
}

export default App;
