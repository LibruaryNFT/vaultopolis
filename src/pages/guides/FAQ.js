import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

function FAQ() {
  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions - TSHOT & Vaultopolis | NBA Top Shot Tokenization</title>
        <meta name="description" content="Find quick answers to common questions about TSHOT, Vaultopolis, and NBA Top Shot tokenization. Comprehensive FAQ covering wallet setup, trading, and vault operations." />
        <meta name="keywords" content="TSHOT FAQ, Vaultopolis questions, NBA Top Shot help, Flow wallet setup, Dapper integration, TSHOT trading, vault operations" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Frequently Asked Questions - TSHOT & Vaultopolis" />
        <meta property="og:description" content="Find quick answers to common questions about TSHOT, Vaultopolis, and NBA Top Shot tokenization." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/guides/faq" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Frequently Asked Questions - TSHOT & Vaultopolis" />
        <meta name="twitter:description" content="Find quick answers to common questions about TSHOT, Vaultopolis, and NBA Top Shot tokenization." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is TSHOT?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "TSHOT is a liquid token that represents your NBA Top Shot Moments. It allows you to trade, stake, and use your Moments in DeFi without selling them, unlocking new utility and liquidity."
                }
              },
              {
                "@type": "Question",
                "name": "What can I do with TSHOT tokens?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Trade TSHOT on DEXs like Increment.fi and PunchSwap, provide liquidity for yield farming, use in wagering contests on aiSports, or burn them to receive random Moments from the vault."
                }
              },
              {
                "@type": "Question",
                "name": "Is TSHOT audited and secure?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! TSHOT is built on the Flow blockchain with smart contracts that are audited and verifiable. The protocol uses secure vault mechanics and VRF technology for fair Moment selection."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary">
        {/* Hero Section */}
        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-brand-text mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-brand-text/80 max-w-3xl mx-auto leading-relaxed">
              Find quick answers to common questions about TSHOT, Vaultopolis, and NBA Top Shot tokenization.
            </p>
            <div className="mt-8">
              <Link 
                to="/guides" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-white font-semibold rounded-lg hover:bg-brand-accent/90 transition-colors"
              >
                ← Back to All Guides
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="max-w-5xl mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-10">
              {/* Getting Started */}
              <div className="bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 rounded-2xl p-8 border border-brand-border/50">
                <h3 className="text-2xl font-bold text-brand-text mb-6 flex items-center gap-3">
                  <span className="text-3xl">🚀</span>
                  Getting Started
                </h3>
                <div className="space-y-4">
                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      What is TSHOT?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        TSHOT is a liquid token that represents your NBA Top Shot Moments. It allows you to trade, stake, and use your Moments in DeFi without selling them, unlocking new utility and liquidity.
                      </p>
                    </div>
                  </details>

                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      What can I do with TSHOT tokens?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        Trade TSHOT on DEXs like Increment.fi and PunchSwap, provide liquidity for yield farming, use in wagering contests on aiSports, or burn them to receive random Moments from the vault.
                      </p>
                    </div>
                  </details>

                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      Is TSHOT audited and secure?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        Yes! TSHOT is built on the Flow blockchain with smart contracts that are audited and verifiable. The protocol uses secure vault mechanics and VRF technology for fair Moment selection.
                      </p>
                    </div>
                  </details>

                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      How do I get started with TSHOT?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        Getting started is easy! You need a Flow wallet (required) and optionally a Dapper account for your Top Shot Moments. Check out our <Link to="/guides/quick-start" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Quick Start Guide</Link> for complete step-by-step instructions.
                      </p>
                    </div>
                  </details>
                </div>
              </div>

              {/* Wallet Setup */}
              <div className="bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 rounded-2xl p-8 border border-brand-border/50">
                <h3 className="text-2xl font-bold text-brand-text mb-6 flex items-center gap-3">
                  <span className="text-3xl">🔗</span>
                  Wallet Setup
                </h3>
                <div className="space-y-4">
                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      What wallets do I need?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        You need a Flow wallet for all transactions. Optionally, you can link your Dapper account to access your existing Top Shot Moments. See our <Link to="/guides/flow-wallet" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Flow Wallet Guide</Link> and <Link to="/guides/dapper-wallet" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Dapper Wallet Guide</Link> for setup instructions.
                      </p>
                    </div>
                  </details>

                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      How do I create a Flow wallet?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        Download the Flow wallet app from wallet.flow.com, create a new account, choose a username, and securely store your 12-word recovery phrase. Our <Link to="/guides/flow-wallet" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Flow Wallet Guide</Link> has detailed instructions with screenshots.
                      </p>
                    </div>
                  </details>

                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      Is the Flow wallet secure?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        Yes! The Flow wallet is self-custodial, meaning you control your private keys. Always store your recovery phrase securely offline and never share it with anyone. The wallet supports biometric authentication and is designed with security in mind.
                      </p>
                    </div>
                  </details>

                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      How do I create a Top Shot account?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        Visit nbatopshot.com, click Login, then Sign Up. You can use Google/Apple ID or create a new account. You'll automatically get a Dapper wallet. See our <Link to="/guides/dapper-wallet" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Dapper Wallet Guide</Link> for complete setup.
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-10">
              {/* Account Integration */}
              <div className="bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 rounded-2xl p-8 border border-brand-border/50">
                <h3 className="text-2xl font-bold text-brand-text mb-6 flex items-center gap-3">
                  <span className="text-3xl">🔐</span>
                  Account Integration
                </h3>
                <div className="space-y-4">
                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      How do I link my Dapper and Flow wallets?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        Sign into your Dapper account, go to Account Linking, select Flow Wallet, and choose which collections to link. Our <Link to="/guides/account-linking" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Account Linking Guide</Link> has step-by-step instructions with screenshots.
                      </p>
                    </div>
                  </details>

                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      Is account linking safe?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        Yes! Account linking creates a secure connection between your wallets without transferring ownership of your Moments. You maintain full control over your assets at all times.
                      </p>
                    </div>
                  </details>

                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      What are the requirements for Top Shot?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        You must be at least 18 years old, a resident in a participating country/state, and limited to 1 account per collector. Check the official Top Shot website for current location requirements.
                      </p>
                    </div>
                  </details>
                </div>
              </div>

              {/* Trading & Swaps */}
              <div className="bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 rounded-2xl p-8 border border-brand-border/50">
                <h3 className="text-2xl font-bold text-brand-text mb-6 flex items-center gap-3">
                  <span className="text-3xl">🔄</span>
                  Trading & Swaps
                </h3>
                <div className="space-y-4">
                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      How do I swap my Moments for TSHOT?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        Connect your Flow wallet, link your Dapper account, select the Moments you want to deposit, and confirm the swap. You'll receive TSHOT tokens instantly. See our <Link to="/guides/quick-start" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Quick Start Guide</Link> for complete instructions.
                      </p>
                    </div>
                  </details>

                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      What types of Moments can I deposit?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        Currently, we only accept Common and Fandom NBA Top Shot Moments. Higher tier Moments (Rare, Legendary, etc.) are not supported at this time. We also exclude serials under 4000 by default for additional safety.
                      </p>
                    </div>
                  </details>

                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      Is the swap instant?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        Yes! The swap from Moments to TSHOT is instant. You deposit your Moment and immediately receive TSHOT tokens that you can trade, stake, or use in DeFi applications.
                      </p>
                    </div>
                  </details>
                </div>
              </div>

              {/* Redemption & Vault */}
              <div className="bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 rounded-2xl p-8 border border-brand-border/50">
                <h3 className="text-2xl font-bold text-brand-text mb-6 flex items-center gap-3">
                  <span className="text-3xl">🎁</span>
                  Redemption & Vault
                </h3>
                <div className="space-y-4">
                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      How do I get Moments back from TSHOT?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        Burn your TSHOT tokens to receive random Common or Fandom Moments from the vault. This is a two-step process: first burn TSHOT, then receive random Moments. See our <Link to="/guides/tshot-to-nft" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">TSHOT to NFT Guide</Link> for details.
                      </p>
                    </div>
                  </details>

                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      What Moments will I receive when burning TSHOT?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        You'll receive random Common or Fandom NBA Top Shot Moments from the vault. The selection is fair and tamper-proof using Flow's Verifiable Random Function (VRF) technology.
                      </p>
                    </div>
                  </details>

                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      Can I get my original Moment back?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        While it's technically possible to get your original Moment back, it's very unlikely since you'll receive random Moments from the vault. Each redemption is a surprise!
                      </p>
                    </div>
                  </details>

                  <details className="group bg-brand-primary/10 rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all duration-200">
                    <summary className="cursor-pointer text-brand-text font-semibold hover:text-brand-accent transition-colors flex items-center justify-between p-5">
                      What happens if the vault runs out of Moments?
                      <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform duration-200 text-brand-accent" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-brand-text/80 leading-relaxed">
                        The vault is designed to maintain balance. Users can always deposit new Moments to mint TSHOT, ensuring there are always Moments available for redemption. The system is self-sustaining.
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-brand-accent/10 to-brand-accent/5 rounded-2xl p-8 border border-brand-accent/20">
              <h3 className="text-2xl font-bold text-brand-text mb-4">
                Still need help?
              </h3>
              <p className="text-brand-text/80 mb-6 max-w-2xl mx-auto">
                Can't find the answer you're looking for? Check out our comprehensive guides or reach out to our community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/guides" 
                  className="px-6 py-3 bg-brand-accent text-white font-semibold rounded-lg hover:bg-brand-accent/90 transition-colors"
                >
                  Browse All Guides
                </Link>
                <Link 
                  to="/guides/quick-start" 
                  className="px-6 py-3 bg-brand-primary text-brand-text font-semibold rounded-lg border border-brand-border hover:bg-brand-primary/80 transition-colors"
                >
                  Quick Start Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FAQ; 