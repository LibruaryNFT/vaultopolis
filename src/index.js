// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App";
import * as fcl from "@onflow/fcl";
import "./index.css";

// 1) Immediately set .dark if needed, to avoid flicker
(function applyThemeImmediately() {
  let storedMode = localStorage.getItem("themeMode");
  // default to "dark" if no preference
  if (!storedMode) {
    storedMode = "dark";
    localStorage.setItem("themeMode", "dark");
  }

  if (storedMode === "system") {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (systemPrefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } else if (storedMode === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    // "light"
    document.documentElement.classList.remove("dark");
  }
})();

// 2) Flow config (unchanged from your snippet)
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
    "0x95b85a9ef4daabb1",
    "0xf086a545ce3c552d",
    "0x55ad22f01ef568a1",
  ]);

// 3) Create React root
const queryClient = new QueryClient();
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
