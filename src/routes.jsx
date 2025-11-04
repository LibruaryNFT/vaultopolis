/* src/routes.jsx
   --------------------------------------------------------------------
   Central route tree – pure data, NO browser APIs.
   -------------------------------------------------------------------- */
import React from "react";
import { Navigate } from "react-router-dom";
import Layout           from "./layout/Layout";
import Swap             from "./pages/Swap";
import TSHOT            from "./pages/TSHOT";
import Analytics        from "./pages/Stats";
import VaultContents    from "./pages/VaultContents";
import TSHOTVaultPage   from "./pages/vaults/TSHOTVault";
import TopShotGrailsVaultPage from "./pages/vaults/TopShotGrailsVault";
import AllDayGrailsVaultPage from "./pages/vaults/AllDayGrailsVault";
import Transfer         from "./pages/Transfer";
import Profile          from "./pages/Profile";
import MyCollection     from "./pages/MyCollection";
import BountiesTopShot from "./pages/BountiesTopShot";
import BountiesAllDay from "./pages/BountiesAllDay";
import Announcements from "./pages/Announcements";
import TermsAndPrivacy  from "./pages/TermsAndPrivacy";
import ComingSoon       from "./pages/ComingSoon";
import Guides           from "./pages/Guides";
import About            from "./pages/About";
import DapperWalletGuide  from "./pages/guides/DapperWalletGuide";
import FlowWalletGuide     from "./pages/guides/FlowWalletGuide";
import AccountLinkingGuide from "./pages/guides/AccountLinkingGuide";
import NFTToTSHOTGuide     from "./pages/guides/NFTToTSHOTGuide";
import TSHOTToNFTGuide     from "./pages/guides/TSHOTToNFTGuide";
import TSHOTBridgingGuide   from "./pages/guides/TSHOTBridgingGuide";
import QuickStartGuidePage from "./pages/guides/QuickStartGuidePage";
import WhatIsTSHOT from "./pages/guides/WhatIsTSHOT";
import TSHOTRewardsGuide from "./pages/guides/TSHOTRewardsGuide";
import HowToGetFLOW from "./pages/guides/HowToGetFLOW";
import TransferGuide from "./pages/guides/TransferGuide";
import BountiesGuide from "./pages/guides/BountiesGuide";
import DeFiBasicsGuide from "./pages/guides/DeFiBasicsGuide";
import FAQ from "./pages/guides/FAQ";


/** Export the route object array (React Router v6 friendly) */
const routes = [
  { path: "/",            element: <Layout><Swap /></Layout> },
  { path: "/swap",        element: <Layout><Swap /></Layout> },
  { path: "/tshot",       element: <Layout><TSHOT /></Layout> },
  { path: "/analytics",   element: <Layout><Analytics /></Layout> },
  { path: "/vault-contents", element: <Layout><VaultContents /></Layout> },
  { path: "/vaults/tshot", element: <Layout><TSHOTVaultPage /></Layout> },
  { path: "/vaults/topshotgrails", element: <Layout><TopShotGrailsVaultPage /></Layout> },
  { path: "/vaults/alldaygrails", element: <Layout><AllDayGrailsVaultPage /></Layout> },
  { path: "/vaults/treasury", element: <Navigate to="/vaults/topshotgrails" replace /> },
  { path: "/transfer",    element: <Layout><Transfer /></Layout> },
  { path: "/profile",     element: <Layout><Profile /></Layout> },
  { path: "/profile/:address?", element: <Layout><Profile /></Layout> },
  { path: "/my-collection", element: <Layout><MyCollection /></Layout> },
  { path: "/bounties",  element: <Navigate to="/bounties/topshot" replace /> },
  { path: "/bounties/topshot", element: <Layout><BountiesTopShot /></Layout> },
  { path: "/bounties/allday", element: <Layout><BountiesAllDay /></Layout> },
  { path: "/guides",      element: <Layout><Guides /></Layout> },
  { path: "/guides/faq",  element: <Layout><FAQ /></Layout> },
  { path: "/guides/quick-start", element: <Layout><QuickStartGuidePage /></Layout> },
  { path: "/guides/what-is-tshot", element: <Layout><WhatIsTSHOT /></Layout> },
  { path: "/guides/tshot-rewards", element: <Layout><TSHOTRewardsGuide /></Layout> },
  { path: "/guides/how-to-get-flow", element: <Layout><HowToGetFLOW /></Layout> },
  { path: "/guides/transfer", element: <Layout><TransferGuide /></Layout> },
  { path: "/guides/bounties", element: <Layout><BountiesGuide /></Layout> },
  { path: "/guides/defi-basics", element: <Layout><DeFiBasicsGuide /></Layout> },
  { path: "/news", element: <Layout><Announcements /></Layout> },

  { path: "/guides/dapper-wallet", element: <Layout><DapperWalletGuide /></Layout> },
  { path: "/guides/flow-wallet", element: <Layout><FlowWalletGuide /></Layout> },
  { path: "/guides/account-linking", element: <Layout><AccountLinkingGuide /></Layout> },
  { path: "/guides/buying-nfts", element: <Layout><DapperWalletGuide /></Layout> },
  { path: "/guides/nft-to-tshot", element: <Layout><NFTToTSHOTGuide /></Layout> },
  { path: "/guides/tshot-to-nft", element: <Layout><TSHOTToNFTGuide /></Layout> },
  { path: "/guides/tshot-bridging", element: <Layout><TSHOTBridgingGuide /></Layout> },
  { path: "/guides/earning-rewards", element: <Layout><DapperWalletGuide /></Layout> },
  { path: "/guides/bridging-to-fevm", element: <Layout><DapperWalletGuide /></Layout> },
  { path: "/guides/bridging-from-fevm", element: <Layout><DapperWalletGuide /></Layout> },
  { path: "/about",       element: <Layout><About /></Layout> },
  { path: "/terms",       element: <Layout><TermsAndPrivacy /></Layout> },
  { path: "/comingsoon",  element: <ComingSoon /> },
];

export default routes;
