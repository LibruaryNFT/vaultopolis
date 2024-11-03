// App.js
import React from "react";
import { UserProvider } from "./components/UserContext";
import Header from "./components/Header";
import ExchangePanel from "./components/ExchangePanel";
import TransactionModal from "./components/TransactionModal";
import SwapInfo from "./components/SwapInfo";
import Admin from "./components/Admin";

function App() {
  return (
    <UserProvider>
      <div
        className="w-full min-h-screen bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            "url('https://storage.googleapis.com/momentswap/images/BackgroundMomentSwap.jpg')",
          objectPosition: "center",
        }}
      >
        {/* Optional overlay for better readability on mobile */}
        <div className="bg-black bg-opacity-50 min-h-screen">
          <Header />
          <div className="p-4 mt-32">
            <SwapInfo />
            <ExchangePanel />
            <TransactionModal />
          </div>
        </div>
      </div>
    </UserProvider>
  );
}

export default App;
