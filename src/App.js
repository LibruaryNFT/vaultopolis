import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserProvider } from "./components/UserContext";
import Header from "./components/Header";
import Home from "./components/Home";
import Vault from "./components/Vault";
import Earn from "./components/Earn";

function App() {
  return (
    <UserProvider>
      <Router>
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
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/vault" element={<Vault />} />
              <Route path="/earn" element={<Earn />} />
            </Routes>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
