// Home.js
import React from "react";
import SellPanel from "./SellPanel";
import TransactionModal from "./TransactionModal";
import TestingSetupPrompt from "./TestingSetupPrompt";
import FlowPriceDashboard from "./FlowPriceDashboard";
import FlowPriceChart from "./FlowPriceChart";

function Sell() {
  return (
    <div className="w-full flex flex-col items-center p-4 mt-2">
      <TestingSetupPrompt />
      <SellPanel />
      <TransactionModal />
    </div>
  );
}

export default Sell;
