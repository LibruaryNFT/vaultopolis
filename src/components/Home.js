// Home.js
import React from "react";
import ExchangePanel from "./ExchangePanel";
import TransactionModal from "./TransactionModal";

function Home() {
  return (
    <div className="w-full flex flex-col items-center p-4 mt-32">
      <ExchangePanel />
      <TransactionModal />
    </div>
  );
}

export default Home;
