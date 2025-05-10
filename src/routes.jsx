/* src/routes.jsx
   --------------------------------------------------------------------
   Central route tree – pure data, NO browser APIs.
   -------------------------------------------------------------------- */
import React from "react";
import Layout           from "./layout/Layout";
import Swap             from "./pages/Swap";
import TSHOT            from "./pages/TSHOT";
import Transfer         from "./pages/Transfer";
import Profile          from "./pages/Profile";
import TermsAndPrivacy  from "./pages/TermsAndPrivacy";
import ComingSoon       from "./pages/ComingSoon";

/** Export the route object array (React Router v6 friendly) */
const routes = [
  { path: "/",            element: <Layout><Swap /></Layout> },
  { path: "/swap",        element: <Layout><Swap /></Layout> },
  { path: "/tshot",       element: <Layout><TSHOT /></Layout> },
  { path: "/transfer",    element: <Layout><Transfer /></Layout> },
  { path: "/profile",     element: <Layout><Profile /></Layout> },
  { path: "/profile/:address?", element: <Layout><Profile /></Layout> },
  { path: "/terms",       element: <Layout><TermsAndPrivacy /></Layout> },
  { path: "/comingsoon",  element: <ComingSoon /> },
];

export default routes;
