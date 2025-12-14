// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full z-40 bg-brand-primary text-brand-text">
      {/* Horizontal line at the top */}
      <hr className="border-brand-border" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-3">
        {/* Logo and Disclaimer Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-3 pb-3 border-b border-brand-border text-center md:text-left">
          <img
            src="https://storage.googleapis.com/vaultopolis/Vaultopolis.png"
            alt="Vaultopolis Logo"
            className="max-h-8 mx-auto md:mx-0"
          />
          <p className="text-xs text-brand-text/80 max-w-2xl mx-auto md:mx-0 leading-snug">
            Vaultopolis is an independent third-party protocol and is not affiliated with Dapper Labs, NBA Top Shot, or NFL All Day. All interactions occur through non-custodial Flow smart contracts.
          </p>
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-0 mb-3 text-center sm:text-left">
          {/* PRODUCT */}
          <div className="w-full">
            <h3 className="text-xs tracking-[0.15em] font-semibold text-brand-text/80 mb-1">
              PRODUCT
            </h3>
            <ul className="space-y-1">
              <li>
                <Link to="/swap" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  Swap
                </Link>
              </li>
              <li>
                <Link to="/vaults/tshot" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  Vaults
                </Link>
              </li>
              <li>
                <Link to="/bounties/topshot" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  Grail Bounties
                </Link>
              </li>
              <li>
                <Link to="/transfer" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  Bulk Transfer
                </Link>
              </li>
            </ul>
          </div>

          {/* TOOLS */}
          <div className="w-full">
            <h3 className="text-xs tracking-[0.15em] font-semibold text-brand-text/80 mb-1">
              TOOLS
            </h3>
            <ul className="space-y-1">
              <li>
                <Link to="/profile" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/profile?tab=collection" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  My Collection
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* LEARN */}
          <div className="w-full mt-4 sm:mt-0 sm:pl-6">
            <h3 className="text-xs tracking-[0.15em] font-semibold text-brand-text/80 mb-1">
              LEARN
            </h3>
            <ul className="space-y-1">
              <li>
                <Link to="/tshot" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  TSHOT
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link to="/guides/faq" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div className="w-full">
            <h3 className="text-xs tracking-[0.15em] font-semibold text-brand-text/80 mb-1">
              COMPANY
            </h3>
            <ul className="space-y-1">
              <li>
                <Link to="/about" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/terms-of-use" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/rewards/tshot" className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors">
                  Rewards Disclosure
                </Link>
              </li>
              <li>
                <a
                  href="https://x.com/vaultopolis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-brand-text/70 hover:text-brand-text transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Icons and Copyright */}
        <div className="border-t border-brand-border pt-2.5 flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-3">
            {/* Link to X Account */}
            <a
              href="https://x.com/vaultopolis"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-brand-text/70 hover:text-brand-text transition-colors"
              aria-label="Follow us on X"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 300 300.251"
                fill="white"
                className="h-4 w-4"
              >
                <path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66" />
              </svg>
            </a>

            {/* Link to Discord Server */}
            <a
              href="https://discord.gg/nJdwqYfenh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-brand-text/70 hover:text-brand-text transition-colors"
              aria-label="Join us on Discord"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="h-4 w-4"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
          </div>

          <div className="text-xs text-brand-text/70">
            © {new Date().getFullYear()} Vaultopolis
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
