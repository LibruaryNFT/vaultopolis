# Vaultopolis Frontend

This repository contains the React frontend application for Vaultopolis.

**This project is proudly built on the Flow Blockchain.** It provides the user interface for interacting with the Vaultopolis smart contracts to swap NBA Top Shot Moments and TSHOT tokens.

---

## Project Ecosystem & Contracts

### Related Repositories

* **Vaultopolis (Main):** [https://github.com/LibruaryNFT/vaultopolis](https://github.com/LibruaryNFT/vaultopolis)
* **Pinnacle Pin Bot:** [https://github.com/LibruaryNFT/pinnacle-pin-bot](https://github.com/LibruaryNFT/pinnacle-pin-bot)

### Deployed Mainnet Contracts

The following smart contracts are deployed on Flow Mainnet and power the Vaultopolis protocol.

| Contract Name                  | Address                                        | Flowscan Link                                                                                         |
| ------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **TSHOTExchange** | `A.05b67ba314000b2d.TSHOTExchange`             | [View on Flowscan](https://www.flowscan.io/contract/A.05b67ba314000b2d.TSHOTExchange)                   |
| **TSHOT** | `A.05b67ba314000b2d.TSHOT`                     | [View on Flowscan](https://www.flowscan.io/contract/A.05b67ba314000b2d.TSHOT)                           |
| **TopShotTiers** | `A.b1788d64d512026d.TopShotTiers`              | [View on Flowscan](https://www.flowscan.io/contract/A.b1788d64d512026d.TopShotTiers)                  |
| **TopShotShardedCollectionV2** | `A.b1788d64d512026d.TopShotShardedCollectionV2` | [View on Flowscan](https://www.flowscan.io/contract/A.b1788d64d512026d.TopShotShardedCollectionV2) |
| **TopShotFloors** | `A.b1788d64d512026d.TopShotFloors`             | [View on Flowscan](https://www.flowscan.io/contract/A.b1788d64d512026d.TopShotFloors)                  |

---

## Features

-   **Connect Wallet:** Connects to various Flow wallets (Dapper, Blocto, Flow Core, etc.).
-   **Swap Interface:** Allows users to initiate swaps between NBA Top Shot Moments and TSHOT tokens.
-   **Moment Selection:** Browse and select eligible Top Shot moments from the user's collection.
-   **TSHOT Balance:** View user's TSHOT token balance.
-   **Transaction Tracking:** Provides feedback on pending and completed transactions.
-   **Hybrid Custody Interaction:** (If applicable via UI) Interface for managing child accounts or related features.
-   **Stats/Info Pages:** Displays relevant protocol information or user stats.

---

## Tech Stack

-   React
-   Tailwind CSS
-   Flow Client Library (FCL JS)
-   Additional Javascript libraries (as defined in `package.json`)

---

## UI Styling Spec

**This app is dark-theme only. Do not introduce light mode styling or theme toggles.**

### Buttons

Always use `src/components/Button.js` for buttons. Avoid ad-hoc Tailwind styling for button-like elements.

**Variants**
- **`primary` (default):** Primary CTA — pill shape + outline style  
  - Visual: `rounded-full`, `bg-opolis/20`, `border-2 border-opolis/40`, `shadow-md hover:shadow-lg`, `font-bold`
- **`solid`:** Rare max-emphasis CTA (escape hatch for special cases)  
  - Visual: `bg-opolis`, `shadow-md hover:shadow-lg`, `font-bold`
- **`secondary`**, **`ghost`**, **`outline`:** Use sparingly per existing component definitions

**Rules**
- Reserve `font-bold` for `primary` / `solid` CTAs.
- Standard UI controls (pagination, utility controls) use `font-semibold` (not `font-bold`) to avoid competing with CTAs.
- All buttons must include proper disabled states:  
  `disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none`

### Border Radius

- **Primary CTAs:** `rounded-full` (pill shape) — intentional hierarchy
- **Standard controls:** `rounded-lg` (pagination, inputs, utility controls, secondary actions)

### Pagination

Pagination must have clear state indicators:

- **Default:** `bg-brand-primary`, `border border-brand-border`
- **Hover:** `hover:bg-brand-primary/80 hover:border-opolis/60`
- **Active/Current:** include `aria-current="page"` and style with `text-opolis font-semibold`
- **Disabled:** `disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none`

**Requirements**
- Active page indicator must include `aria-current="page"`.
- All pagination controls must include keyboard focus styles:  
  `focus-visible:ring-2 focus-visible:ring-opolis/50`
- Use `font-semibold` (not `font-bold`) to maintain hierarchy.

### Colors & Tokens

Always use design tokens—never hardcoded Tailwind colors.

- ✅ Use: `border-opolis`, `bg-opolis/20`, `text-opolis`
- ❌ Avoid: `border-green-500`, `bg-gray-500`, `text-green-400`

**Token notes**
- `opolis` is the primary brand color (e.g., `#50c878`).
- `brand-*` tokens map to CSS variables (e.g., `--brand-primary-bg`, `--brand-text`, `--brand-border`).

If you need a new color, add it as a token (Tailwind config/CSS vars); do not inline a Tailwind palette color in components.

### Accessibility

- **Icon-only buttons:** must include an `aria-label`.
- **Touch targets:** interactive elements should meet minimum **44×44px** where applicable.
- **Focus states:** all interactive elements must have visible focus indicators:  
  `focus-visible:ring-2 focus-visible:ring-opolis/50`
- **Contrast (dark theme):** verify text/background combinations meet **WCAG AA (4.5:1)**.  
  Note: translucent backgrounds and muted text can still fail contrast in dark UI.

### Shadows

- **Primary buttons:** `shadow-md hover:shadow-lg` (standardized scale)
- **Pagination:** shadows optional; clear state indicators are more important

---

## Getting Started

### Prerequisites

-   Node.js (LTS version recommended)
-   npm or yarn

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
    * Create a `.env` file in the root directory by copying `.env.example` (if one exists) or creating it manually.
    * Populate it with the necessary environment variables for the frontend. These typically start with `REACT_APP_` and might include:
        * `REACT_APP_FLOW_ACCESS_NODE`: URL for the Flow Access Node (e.g., Emulator: `http://127.0.0.1:8888`, Testnet: `https://rest-testnet.onflow.org`)
        * `REACT_APP_WALLET_DISCOVERY`: URL for FCL Wallet Discovery (e.g., Emulator: `http://localhost:8701/fcl/authn`, Testnet: `https://fcl-discovery.onflow.org/testnet/authn`)
        * `REACT_APP_CONTRACT_ADDRESS_...`: Addresses of the _deployed_ Vaultopolis contracts (TSHOT, TSHOTExchange, etc.) on the target network. **Get these after deploying from the `vaultopolis-contracts` repo.**
        * `REACT_APP_MAINTENANCE_MODE`: Set to `true` or `false` (requires rebuild/deploy on Heroku, see `App.js`).
        * `REACT_APP_COMING_SOON_MODE`: Set to `true` or `false` (requires rebuild/deploy on Heroku, see `App.js`).
    * **Never commit sensitive keys to `.env` or the repository.**

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