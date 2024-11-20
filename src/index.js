import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App";
import * as fcl from "@onflow/fcl";
import "./index.css";

// Configure FCL
fcl
  .config()
  .put("flow.network", "testnet")
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  .put(
    "discovery.authn.endpoint",
    "https://fcl-discovery.onflow.org/testnet/authn"
  )
  .put("discovery.authn.include", ["0x33f75ff0b830dcec", "0xc7efa8c33fceee03"])
  .put("walletconnect.projectId", "5eabb9960473de682c24253ffb57efa1")
  .put("app.detail.title", "MomentSwap")
  .put(
    "app.detail.icon",
    "https://storage.googleapis.com/momentswap/images/MomentSwapWhite.png"
  )
  .put("app.detail.description", "MomentSwap - NFT and Token Swaps")
  .put("app.detail.url", "https://momentswap.xyz")
  .put("0xFlowToken", "0x7e60df042a9c0868");

// Initialize QueryClient instance
const queryClient = new QueryClient();
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
