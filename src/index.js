import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App";
import * as fcl from "@onflow/fcl";
import "./index.css";

fcl
  .config()
  .put("flow.network", "mainnet")
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/authn")
  .put("discovery.authn.endpoint", "https://fcl-discovery.onflow.org/authn")
  .put("discovery.authn.include", [
    "0xead892083b3e2c6c", // Dapper Wallet
    "0xe5cd26afebe62781", // Blocto
  ])
  .put("walletconnect.projectId", "9bdcbff82af5b742cb5141150e061beb")
  .put("app.detail.title", "Vaultopolis")
  .put(
    "app.detail.icon",
    "https://storage.googleapis.com/momentswap/images/Vaultopolis.png"
  )
  .put("app.detail.description", "Vaultopolis")
  .put("app.detail.url", "https://vaultopolis.com")
  // Mainnet contract addresses
  .put("0xFlowToken", "0x1654653399040a61");

// Initialize QueryClient instance
const queryClient = new QueryClient();
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
