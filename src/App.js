// App.js
import React from "react";
import { UserProvider } from "./components/UserContext";
import Header from "./components/Header";
import ExchangePanel from "./components/ExchangePanel";
import TransactionModal from "./components/TransactionModal";

function App() {
  return (
    <UserProvider>
      <div className="w-full min-h-screen relative overflow-hidden bg-black">
        {/* Background Video */}
        <video
          className="fixed top-0 left-0 w-full h-full object-cover"
          src="https://storage.googleapis.com/momentswap/images/BackgroundMomentSwap4.mp4"
          autoPlay
          muted
          playsInline
        />

        {/* Overlay for content readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center text-white">
          <Header />
          <div className="w-full flex flex-col items-center p-4 mt-32">
            <ExchangePanel />
            <TransactionModal />
          </div>
        </div>
      </div>
    </UserProvider>
  );
}

export default App;
