// index.js
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { UserProvider } from "./contexts/UserContext";
import * as fcl from "@onflow/fcl";
import "./index.css";

// Configure FCL
fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org") // Flow Testnet
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn") // Wallet for Testnet
  .put("0xFlowToken", "0x7e60df042a9c0868"); // Flow Token address

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <UserProvider>
    <App />
  </UserProvider>
);
