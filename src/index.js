import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import * as fcl from "@onflow/fcl";
import "./index.css";

/* ──────────────────────────────────────────── */
/* 1)  Dark-mode shim – unchanged              */
/* ──────────────────────────────────────────── */
(function applyThemeImmediately() {
  let storedMode = localStorage.getItem("themeMode");
  if (!storedMode) {
    storedMode = "dark";
    localStorage.setItem("themeMode", "dark");
  }
  if (storedMode === "system") {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } else {
    document.documentElement.classList.toggle("dark", storedMode === "dark");
  }
})();

/* ──────────────────────────────────────────── */
/*  NEW: one-time cleanup of legacy 400 KB key */
/* ──────────────────────────────────────────── */
try {
  localStorage.removeItem("topshotMetadata");
} catch {
  /* ignore */
}

/* ──────────────────────────────────────────── */
/* 2)  Flow SDK config – unchanged             */
/* ──────────────────────────────────────────── */
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

/* ──────────────────────────────────────────── */
/* 3)  React root                              */
/* ──────────────────────────────────────────── */
const queryClient = new QueryClient();
const root = createRoot(document.getElementById("root"));

root.render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </HelmetProvider>
);
