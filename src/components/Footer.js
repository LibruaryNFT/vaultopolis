import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white w-full z-40 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Logo Section */}
          <div>
            <div className="mb-4">
              <img
                src="https://storage.googleapis.com/momentswap/images/MomentSwapWhite.png"
                alt="MomentSwap Logo"
                className="max-h-8"
              />
            </div>
            <p className="text-sm text-gray-400">
              Decentralized NFT swapping platform
            </p>
          </div>

          {/* Disclaimer Section */}
          <div>
            <p className="text-sm text-gray-400">
              MomentSwap is not affiliated with NBA Top Shot or Dapper Labs. All
              operations are executed through decentralized smart contracts.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} MomentSwap
          </div>
          <div>
            <button
              onClick={() => navigate("/terms")}
              className="text-gray-400 hover:text-white transition-colors"
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
