# 🏆 PL_Genesis Hackathon Submission 🏆

* **Project:** Vaultopolis (Existing Code Track)
* **Challenges Entered:**
    * `Flow: ⚡️ Most Killer App Potential`
    * `Wildcard: ⚡️ Wildcard: Decentralized Economies, Governance & Science`

### New Feature Built During Hackathon: Analytics Pipeline & Dashboard

To provide critical insights for our users and community, we built a comprehensive, end-to-end analytics pipeline during the hackathon. This serves as our project's changelog for the event.

**1. Backend Data Pipeline:** We developed a new backend service that runs a scheduled data aggregation job. This job processes over 1.3 million raw on-chain events from the Flow blockchain using a multi-stage MongoDB aggregation pipeline. It efficiently calculates key daily statistics (total deposits, withdrawals, unique wallets) and saves them to a new, optimized collection.

**2. Frontend Analytics Dashboard:** This new backend and its `/tshot-stats` endpoint power a brand new, feature-rich **TSHOT Analytics dashboard** built in React. The dashboard visualizes both lifetime protocol metrics (from our existing `/wallet-leaderboard` endpoint) and daily activity trends (from the new endpoint), featuring KPI tiles, Top 10 leaderboards, and multiple charts to give a complete picture of our protocol's health and user engagement.

This new feature transforms raw, high-volume blockchain data into actionable insights, significantly enhancing the value we provide to our community and demonstrating a scalable approach to on-chain analytics.

---

# Vaultopolis Frontend

This repository contains the React frontend application for Vaultopolis, a decentralized protocol on the Flow Blockchain for swapping NBA Top Shot Moments and TSHOT tokens.

This application provides the user interface for interacting with the Vaultopolis smart contracts.

---

## Features

- **Connect Wallet:** Connects to various Flow wallets (Dapper, Blocto, Flow Core, etc.).
- **Swap Interface:** Allows users to initiate swaps between NBA Top Shot Moments and TSHOT tokens.
- **Moment Selection:** Browse and select eligible Top Shot moments from the user's collection.
- **TSHOT Balance:** View user's TSHOT token balance.
- **Transaction Tracking:** Provides feedback on pending and completed transactions.
- **Hybrid Custody Interaction:** (If applicable via UI) Interface for managing child accounts or related features.
- **Stats/Info Pages:** Displays relevant protocol information or user stats.

---

## Tech Stack

- React
- Tailwind CSS
- Flow Client Library (FCL JS)
- Additional Javascript libraries (as defined in `package.json`)

---

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd vaultopolis-web
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Environment Variables:**
    - Create a `.env` file in the root directory by copying `.env.example` (if one exists) or creating it manually.
    - Populate it with the necessary environment variables for the frontend. These typically start with `REACT_APP_` and might include:
      - `REACT_APP_FLOW_ACCESS_NODE`: URL for the Flow Access Node (e.g., Emulator: `http://127.0.0.1:8888`, Testnet: `https://rest-testnet.onflow.org`)
      - `REACT_APP_WALLET_DISCOVERY`: URL for FCL Wallet Discovery (e.g., Emulator: `http://localhost:8701/fcl/authn`, Testnet: `https://fcl-discovery.onflow.org/testnet/authn`)
      - `REACT_APP_CONTRACT_ADDRESS_...`: Addresses of the _deployed_ Vaultopolis contracts (TSHOT, TSHOTExchange, etc.) on the target network. **Get these after deploying from the `vaultopolis-contracts` repo.**
      - `REACT_APP_MAINTENANCE_MODE`: Set to `true` or `false` (requires rebuild/deploy on Heroku, see `App.js`).
      - `REACT_APP_COMING_SOON_MODE`: Set to `true` or `false` (requires rebuild/deploy on Heroku, see `App.js`).
    - **Never commit sensitive keys to `.env` or the repository.**

### Running Locally

1.  **Start the development server:**
    ```bash
    npm start
    # or
    yarn start
    ```
2.  Open your browser to `http://localhost:3000` (or the port specified).
3.  Ensure your `.env` file points to the desired Flow network (Emulator, Testnet) where the corresponding Vaultopolis contracts are deployed. Make sure the Flow Emulator is running if targeting it.

---

## Building for Production

```bash
npm run build
# or
yarn build