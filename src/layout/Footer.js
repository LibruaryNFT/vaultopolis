// src/components/Footer.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer
      className="
        w-full
        z-40

        /* Use brand-secondary for the footer background, brand-text for text */
        bg-brand-primary
        text-brand-text
      "
    >
      {/* Full-width horizontal line at the very top (border-brand-border) */}
      <hr className="border-brand-border" />

      {/* Centered footer content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Logo Section */}
          <div>
            <div className="mb-4">
              <img
                src="https://storage.googleapis.com/vaultopolis/Vaultopolis.png"
                alt="Vaultopolis Logo"
                className="max-h-8"
              />
            </div>
            <p
              className="
                text-sm
                /* Slightly subdued text for disclaimers or tagline if you like */
                text-brand-text/80
              "
            >
              Ownership Evolved, Possibilities Unlocked
            </p>
          </div>

          {/* Disclaimer Section */}
          <div>
            <p className="text-sm text-brand-text/80">
              Vaultopolis is not affiliated with NBA Top Shot or Dapper Labs.
              All operations are executed through decentralized smart contracts.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="
            border-t
            border-brand-border
            pt-8
            flex flex-col md:flex-row
            justify-between
            items-center
          "
        >
          <div className="text-sm text-brand-text/70 mb-4 md:mb-0">
            © {new Date().getFullYear()} Vaultopolis
          </div>
          <div>
            <button
              onClick={() => navigate("/terms")}
              className="
                text-brand-text/70
                hover:text-brand-text
                transition-colors
              "
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
