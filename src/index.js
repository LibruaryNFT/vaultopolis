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
  .put("discovery.authn.endpoint", "https://fcl-discovery.onflow.org/api/authn")
  .put("walletconnect.projectId", "9bdcbff82af5b742cb5141150e061beb")
  .put("app.detail.title", "Vaultopolis")
  .put(
    "app.detail.icon",
    "https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png"
  )
  .put("app.detail.description", "Vaultopolis")
  .put("app.detail.url", "https://vaultopolis.com")
  .put("0xFlowToken", "0x1654653399040a61")
  .put("discovery.authn.exclude", [
    "0x95b85a9ef4daabb1", // Nufi
    "0xf086a545ce3c552d", // Blocto
    "0x55ad22f01ef568a1", // Blocto2
  ]);

// Initialize QueryClient instance
const queryClient = new QueryClient();
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
