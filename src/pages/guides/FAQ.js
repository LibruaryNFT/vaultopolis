import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/Button';
import PageWrapper from '../../components/PageWrapper';
import ContentPanel from '../../components/ContentPanel';

function FAQ() {
  return (
    <>
      <Helmet>
        <title>Vaultopolis - Frequently Asked Questions: TSHOT & NBA Top Shot Tokenization</title>
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
                "name": "Is TSHOT secure?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! TSHOT is built on the Flow blockchain with secure vault mechanics. The protocol uses VRF technology for provably fair randomness, guarantees 1:1 collateralization, and executes all swaps on-chain."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="w-full">
        {/* FAQ Categories */}
        <PageWrapper maxWidth="xl" padding="md">
          <ContentPanel title="Frequently Asked Questions" subtitle="Find quick answers to common questions about TSHOT, Vaultopolis, and NBA Top Shot tokenization.">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Getting Started */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Getting Started
              </h3>
              <div className="space-y-3">
                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    What is TSHOT?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      TSHOT is a liquid token that represents your NBA Top Shot Moments. It allows you to trade, stake, and use your Moments in DeFi without selling them, unlocking new utility and liquidity.
                    </p>
                  </div>
                </details>

                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    What can I do with TSHOT tokens?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      Trade TSHOT on DEXs like Increment.fi and PunchSwap, provide liquidity for yield farming, use in wagering contests on aiSports, or burn them to receive random Moments from the vault.
                    </p>
                  </div>
                </details>

                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    Is TSHOT secure?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      Yes! TSHOT is built on the Flow blockchain with secure vault mechanics. The protocol uses VRF technology for provably fair randomness, guarantees 1:1 collateralization, and executes all swaps on-chain.
                    </p>
                  </div>
                </details>

                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    How do I get started with TSHOT?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      Getting started is easy! You need a Flow wallet (required) and optionally a Dapper account for your Top Shot Moments. Check out our <Link to="/guides/quick-start" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Quick Start Guide</Link> for complete step-by-step instructions.
                    </p>
                  </div>
                </details>
              </div>
            </div>

            {/* Wallet Setup */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                Wallet Setup
              </h3>
              <div className="space-y-3">
                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    What wallets do I need?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      You need a Flow wallet for all transactions. Optionally, you can link your Dapper account to access your existing Top Shot Moments. See our <Link to="/guides/flow-wallet" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Flow Wallet Guide</Link> and <Link to="/guides/dapper-wallet" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Dapper Wallet Guide</Link> for setup instructions.
                    </p>
                  </div>
                </details>

                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    How do I create a Flow wallet?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      Download the Flow wallet app from wallet.flow.com, create a new account, choose a username, and securely store your 12-word recovery phrase. Our <Link to="/guides/flow-wallet" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Flow Wallet Guide</Link> has detailed instructions with screenshots.
                    </p>
                  </div>
                </details>

                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    Is the Flow wallet secure?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      Yes! The Flow wallet is self-custodial, meaning you control your private keys. Always store your recovery phrase securely offline and never share it with anyone. The wallet supports biometric authentication and is designed with security in mind.
                    </p>
                  </div>
                </details>

                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    How do I create a Top Shot account?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      Visit nbatopshot.com, click Login, then Sign Up. You can use Google/Apple ID or create a new account. You'll automatically get a Dapper wallet. See our <Link to="/guides/dapper-wallet" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Dapper Wallet Guide</Link> for complete setup.
                    </p>
                  </div>
                </details>
              </div>
            </div>

            {/* Account Integration */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🔐</span>
                Account Integration
              </h3>
              <div className="space-y-3">
                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    How do I link my Dapper and Flow wallets?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      Sign into your Dapper account, go to Account Linking, select Flow Wallet, and choose which collections to link. Our <Link to="/guides/account-linking" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Account Linking Guide</Link> has step-by-step instructions with screenshots.
                    </p>
                  </div>
                </details>

                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    Is account linking safe?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      Yes! Account linking creates a secure connection between your wallets without transferring ownership of your Moments. You maintain full control over your assets at all times.
                    </p>
                  </div>
                </details>

                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    What are the requirements for Top Shot?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      You must be at least 18 years old, a resident in a participating country/state, and limited to 1 account per collector. Check the official Top Shot website for current location requirements.
                    </p>
                  </div>
                </details>
              </div>
            </div>

            {/* Trading & Swaps */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🔄</span>
                Trading & Swaps
              </h3>
              <div className="space-y-3">
                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    How do I swap my Moments for TSHOT?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      Connect your Flow wallet, link your Dapper account, select the Moments you want to deposit, and confirm the swap. You'll receive TSHOT tokens instantly. See our <Link to="/guides/quick-start" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">Quick Start Guide</Link> for complete instructions.
                    </p>
                  </div>
                </details>

                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    What types of Moments can I deposit?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      Currently, we only accept Common and Fandom NBA Top Shot Moments. Higher tier Moments (Rare, Legendary, etc.) are not supported at this time. We also exclude serials under 4000 by default for additional safety.
                    </p>
                  </div>
                </details>

                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    Is the swap instant?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      Yes! The swap from Moments to TSHOT is instant. You deposit your Moment and immediately receive TSHOT tokens that you can trade, stake, or use in DeFi applications.
                    </p>
                  </div>
                </details>
              </div>
            </div>

            {/* Redemption & Vault */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                Redemption & Vault
              </h3>
              <div className="space-y-3">
                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    How do I get Moments back from TSHOT?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      Burn your TSHOT tokens to receive random Common or Fandom Moments from the vault. This is a two-step process: first burn TSHOT, then receive random Moments. See our <Link to="/guides/tshot-to-nft" className="text-brand-accent hover:text-brand-accent/80 underline font-medium">TSHOT to NFT Guide</Link> for details.
                    </p>
                  </div>
                </details>

                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    What Moments will I receive when burning TSHOT?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      You'll receive random Common or Fandom NBA Top Shot Moments from the vault. The selection is fair and tamper-proof using Flow's Verifiable Random Function (VRF) technology.
                    </p>
                  </div>
                </details>

                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    Can I get my original Moment back?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      While it's technically possible to get your original Moment back, it's very unlikely since you'll receive random Moments from the vault. Each redemption is a surprise!
                    </p>
                  </div>
                </details>

                <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                    What happens if the vault runs out of Moments?
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform duration-200 text-opolis" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-white/80 leading-relaxed text-sm">
                      The vault is designed to maintain balance. Users can always deposit new Moments to mint TSHOT, ensuring there are always Moments available for redemption. The system is self-sustaining.
                    </p>
                  </div>
                </details>
              </div>
            </div>
            </div>
          </ContentPanel>
        </PageWrapper>

        {/* Bottom CTA */}
        <PageWrapper padding="md">
          <ContentPanel>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-3">
                Still need help?
              </h3>
              <p className="text-white/80 mb-4 max-w-2xl mx-auto text-sm">
                Can't find the answer you're looking for? Check out our comprehensive guides or reach out to our community.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="primary"
                  size="md"
                  onClick={() => window.location.href = '/guides'}
                >
                  Browse All Guides
                </Button>
                <Button 
                  variant="secondary"
                  size="md"
                  onClick={() => window.location.href = '/guides/quick-start'}
                >
                  Quick Start Guide
                </Button>
              </div>
            </div>
          </ContentPanel>
        </PageWrapper>
      </div>
    </>
  );
}

export default FAQ; 