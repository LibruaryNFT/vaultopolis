import React from "react";
import { UserProvider } from "./contexts/UserContext";
import Header from "./components/Header"; // Import the Header component
import ExchangePanel from "./components/ExchangePanel";
import TransactionModal from "./components/TransactionModal";

function App() {
  return (
    <UserProvider>
      <div
        className="w-full min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://storage.googleapis.com/momentswap/images/BackgroundMomentSwap.jpg')",
        }}
      >
        <Header />
        {/* Add margin-top (mt-16) to move it down */}
        <div className="p-4 mt-32">
          <ExchangePanel />
          <TransactionModal />
        </div>
      </div>
    </UserProvider>
  );
}

export default App;
