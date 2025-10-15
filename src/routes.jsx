/* src/routes.jsx
   --------------------------------------------------------------------
   Central route tree – pure data, NO browser APIs.
   -------------------------------------------------------------------- */
import React from "react";
import Layout           from "./layout/Layout";
import Swap             from "./pages/Swap";
import TSHOT            from "./pages/TSHOT";
import Analytics        from "./pages/Stats";
import VaultContents    from "./pages/VaultContents";
import Transfer         from "./pages/Transfer";
import Profile          from "./pages/Profile";
import TreasuryBids     from "./pages/TreasuryBids";
import TermsAndPrivacy  from "./pages/TermsAndPrivacy";
import ComingSoon       from "./pages/ComingSoon";
import Guides           from "./pages/Guides";
import About            from "./pages/About";
import DapperWalletGuide  from "./pages/guides/DapperWalletGuide";
import FlowWalletGuide     from "./pages/guides/FlowWalletGuide";
import AccountLinkingGuide from "./pages/guides/AccountLinkingGuide";
import NFTToTSHOTGuide     from "./pages/guides/NFTToTSHOTGuide";
import TSHOTToNFTGuide     from "./pages/guides/TSHOTToNFTGuide";
import QuickStartGuidePage from "./pages/guides/QuickStartGuidePage";
import FAQ from "./pages/guides/FAQ";


/** Export the route object array (React Router v6 friendly) */
const routes = [
  { path: "/",            element: <Layout><Swap /></Layout> },
  { path: "/swap",        element: <Layout><Swap /></Layout> },
  { path: "/tshot",       element: <Layout><TSHOT /></Layout> },
  { path: "/analytics",   element: <Layout><Analytics /></Layout> },
  { path: "/vault-contents", element: <Layout><VaultContents /></Layout> },
  { path: "/transfer",    element: <Layout><Transfer /></Layout> },
  { path: "/profile",     element: <Layout><Profile /></Layout> },
  { path: "/profile/:address?", element: <Layout><Profile /></Layout> },
  { path: "/offers",         element: <Layout><TreasuryBids /></Layout> },
  { path: "/treasury-bids",  element: <Layout><TreasuryBids /></Layout> },
  { path: "/guides",      element: <Layout><Guides /></Layout> },
  { path: "/guides/faq",  element: <Layout><FAQ /></Layout> },
  { path: "/guides/quick-start", element: <Layout><QuickStartGuidePage /></Layout> },

  { path: "/guides/dapper-wallet", element: <Layout><DapperWalletGuide /></Layout> },
  { path: "/guides/flow-wallet", element: <Layout><FlowWalletGuide /></Layout> },
  { path: "/guides/account-linking", element: <Layout><AccountLinkingGuide /></Layout> },
  { path: "/guides/buying-nfts", element: <Layout><DapperWalletGuide /></Layout> },
  { path: "/guides/nft-to-tshot", element: <Layout><NFTToTSHOTGuide /></Layout> },
  { path: "/guides/tshot-to-nft", element: <Layout><TSHOTToNFTGuide /></Layout> },
  { path: "/guides/earning-rewards", element: <Layout><DapperWalletGuide /></Layout> },
  { path: "/guides/bridging-to-fevm", element: <Layout><DapperWalletGuide /></Layout> },
  { path: "/guides/bridging-from-fevm", element: <Layout><DapperWalletGuide /></Layout> },
  { path: "/about",       element: <Layout><About /></Layout> },
  { path: "/terms",       element: <Layout><TermsAndPrivacy /></Layout> },
  { path: "/comingsoon",  element: <ComingSoon /> },
];

export default routes;
