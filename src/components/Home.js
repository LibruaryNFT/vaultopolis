// Home.js
import React from "react";
import ExchangePanel from "./ExchangePanel";
import TransactionModal from "./TransactionModal";
import TestingSetupPrompt from "./TestingSetupPrompt";
import Child from "./Child";

function Home() {
  return (
    <div className="w-full flex flex-col items-center p-4 mt-2">
      <TestingSetupPrompt />
      <ExchangePanel />
      <TransactionModal />
    </div>
  );
}

export default Home;
