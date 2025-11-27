import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { BookOpen, Wallet } from "lucide-react";
import PageWrapper from "../../components/PageWrapper";
import ContentPanel from "../../components/ContentPanel";
import Card from "../../components/Card";

function TSHOTBridgingGuide() {
  return (
    <>
      <Helmet>
        <title>Bridge TSHOT from Cadence to EVM - Complete Guide | Vaultopolis</title>
        <meta name="description" content="Learn how to bridge TSHOT tokens from Cadence (Flow) to EVM networks. Step-by-step guide for transferring TSHOT between blockchains." />
        <meta name="keywords" content="tshot bridge, cadence to evm, flow to evm, tshot transfer, cross-chain bridge, tshot guide" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Bridge TSHOT from Cadence to EVM - Complete Guide" />
        <meta property="og:description" content="Learn how to bridge TSHOT tokens from Cadence (Flow) to EVM networks." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://vaultopolis.com/guides/tshot-bridging" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Bridge TSHOT from Cadence to EVM - Complete Guide" />
        <meta name="twitter:description" content="Learn how to bridge TSHOT tokens from Cadence (Flow) to EVM networks." />
      </Helmet>

      <div className="w-full">
        {/* Breadcrumb Navigation */}
        <PageWrapper padding="sm">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-white/70">
              <li>
                <Link to="/guides" className="hover:text-opolis transition-colors flex items-center">
                  <BookOpen className="mr-1" size={14} />
                  Guides
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-white">TSHOT Bridging</span>
              </li>
            </ol>
          </nav>
        </PageWrapper>

        {/* Main Content */}
        <PageWrapper padding="md">
          <ContentPanel 
            title="Bridge TSHOT from Cadence to EVM" 
            subtitle="Learn how to transfer your TSHOT tokens from the Flow blockchain (Cadence) to EVM-compatible networks."
          >
            <div className="space-y-6">
              {/* Prerequisites */}
              <Card variant="secondary" padding="md">
                <h3 className="text-lg font-semibold text-brand-text mb-4">Prerequisites</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Wallet className="text-brand-accent" size={20} />
                    <span className="text-brand-text/80">Flow wallet with TSHOT tokens</span>
                  </div>
                </div>
              </Card>

              {/* Step Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card variant="elevated" padding="md" className="text-center">
                  <div className="bg-opolis text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-brand-text mb-3">Login to Flow Wallet</h3>
                  <p className="text-brand-text/80 text-sm">Access your Flow wallet where your TSHOT tokens are held.</p>
                </Card>

                <Card variant="elevated" padding="md" className="text-center">
                  <div className="bg-opolis text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-brand-text mb-3">Click Send/Transfer</h3>
                  <p className="text-brand-text/80 text-sm">Locate and click the Send or Transfer option in your wallet.</p>
                </Card>

                <Card variant="elevated" padding="md" className="text-center">
                  <div className="bg-opolis text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-brand-text mb-3">Choose TSHOT Token</h3>
                  <p className="text-brand-text/80 text-sm">Select TSHOT from the list of available tokens.</p>
                </Card>

                <Card variant="elevated" padding="md" className="text-center">
                  <div className="bg-opolis text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    4
                  </div>
                  <h3 className="text-lg font-semibold text-brand-text mb-3">Select EVM Wallet</h3>
                  <p className="text-brand-text/80 text-sm">Enter your EVM wallet address (e.g., MetaMask).</p>
                </Card>

                <Card variant="elevated" padding="md" className="text-center">
                  <div className="bg-opolis text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    5
                  </div>
                  <h3 className="text-lg font-semibold text-brand-text mb-3">Enter Amount</h3>
                  <p className="text-brand-text/80 text-sm">Specify the TSHOT amount and click Next.</p>
                </Card>

                <Card variant="elevated" padding="md" className="text-center">
                  <div className="bg-opolis text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    6
                  </div>
                  <h3 className="text-lg font-semibold text-brand-text mb-3">Confirm Send</h3>
                  <p className="text-brand-text/80 text-sm">Review and confirm the transaction in your wallet.</p>
                </Card>
              </div>
            </div>
          </ContentPanel>
        </PageWrapper>
      </div>
    </>
  );
}

export default TSHOTBridgingGuide;
