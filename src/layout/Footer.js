// src/components/Footer.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full z-40 bg-brand-primary text-brand-text">
      {/* Horizontal line at the top */}
      <hr className="border-brand-border" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Logo Section */}
          <div className="space-y-3">
            <div>
              <img
                src="https://storage.googleapis.com/vaultopolis/Vaultopolis.png"
                alt="Vaultopolis Logo"
                className="max-h-8"
              />
            </div>
            <p className="text-sm text-brand-text/80 max-w-md leading-relaxed">
              Vaultopolis is a decentralized platform that tokenizes Top Shot
              Moments into TSHOT, enabling instant bulk trading, yield
              opportunities, and seamless liquidity management.
            </p>
          </div>

          {/* Disclaimer Section */}
          <div className="flex items-center">
            <p className="text-sm text-brand-text/80 leading-relaxed">
              Vaultopolis is not affiliated with Top Shot or Dapper Labs. All
              operations are executed through decentralized smart contracts.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-brand-text/70">
            © {new Date().getFullYear()} Vaultopolis
          </div>

          <div className="flex items-center gap-8">
            {/* Terms of Service Button */}
            <button
              onClick={() => navigate("/terms")}
              className="text-sm text-brand-text/70 hover:text-brand-text transition-colors"
            >
              Terms of Service
            </button>

            {/* Link to X Account */}
            <a
              href="https://x.com/vaultopolis"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-brand-text/70 hover:text-brand-text transition-colors"
            >
              <span className="mr-1">Follow on</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 300 300.251"
                fill="white"
                className="h-5 w-5"
              >
                <path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
