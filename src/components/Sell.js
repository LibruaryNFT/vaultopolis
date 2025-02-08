// Home.js
import React from "react";
import SellPanel from "./SellPanel";
import TransactionModal from "./TransactionModal";
import SellDashboard from "./SellDashboard";

function Sell() {
  return (
    <div className="w-full flex flex-col items-center py-4 px-2 mt-1">
      <SellDashboard />
      <SellPanel />
      <TransactionModal />
    </div>
  );
}

export default Sell;
