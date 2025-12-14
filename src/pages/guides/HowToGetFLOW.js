import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import PageWrapper from "../../components/PageWrapper";
import ContentPanel from "../../components/ContentPanel";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  ExternalLink,
  AlertCircle,
} from "lucide-react";

function HowToGetFLOW() {
  return (
    <>
      <Helmet>
        <title>Vaultopolis - How to Get $FLOW: Your Gas for Transactions</title>
        <meta name="description" content="Learn how to get $FLOW token for transaction fees on Flow blockchain. Buy FLOW directly in wallets or on exchanges to pay for swaps and rewards." />
        <meta name="keywords" content="get FLOW, buy FLOW, Flow token, gas fees, transaction fees, Flow wallet, how to buy FLOW" />
        
        {/* Open Graph */}
        <meta property="og:title" content="How to Get $FLOW - Your Gas for Transactions | Vaultopolis" />
        <meta property="og:description" content="Learn how to get $FLOW token for transaction fees on Flow blockchain. Buy FLOW directly in wallets or on exchanges." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://vaultopolis.com/guides/how-to-get-flow" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="How to Get $FLOW - Your Gas for Transactions | Vaultopolis" />
        <meta name="twitter:description" content="Learn how to get $FLOW token for transaction fees on Flow blockchain." />
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
                <span className="text-white">How to Get $FLOW</span>
              </li>
            </ol>
          </nav>
        </PageWrapper>

        {/* Main Content */}
        <PageWrapper padding="md">
          <ContentPanel 
            title="How to Get $FLOW (Your 'Gas' for Transactions)" 
          >
            <div className="space-y-6">
              {/* When You Need $FLOW on Vaultopolis */}
              <Card variant="elevated" padding="md" className="bg-opolis/10 border-opolis/30">
                <h3 className="font-semibold text-brand-text mb-3 text-lg">
                  When You Need $FLOW on Vaultopolis
                  <span className="text-xs bg-brand-primary/50 text-brand-text/70 px-2 py-1 rounded-full ml-2">
                    Optional
                  </span>
                </h3>
                <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                  <strong>Currently, Flow Wallet is temporarily covering most transaction fees on Vaultopolis.</strong> However, you may still need $FLOW in your wallet for:
                </p>
                <ul className="text-sm text-brand-text/80 mb-3 space-y-2 list-disc list-inside ml-2">
                  <li><strong>Transaction fees:</strong> In the future, you may need to pay transaction fees yourself when using other wallets or if the sponsorship ends. Every action on Vaultopolis (like swapping NFTs for TSHOT, accepting bounties, or claiming rewards) requires a small transaction fee paid in $FLOW.</li>
                  <li><strong>Storage:</strong> Your Flow wallet needs $FLOW to store your NFTs and data. The more you store, the more $FLOW you need to keep in your wallet as a reserve.</li>
                </ul>
                <div className="text-sm text-brand-text/80 space-y-2 mt-3 p-3 bg-brand-primary/30 rounded border border-brand-border">
                  <p className="font-semibold mb-2">Important Details:</p>
                  <ul className="space-y-1 ml-2">
                    <li>• <strong>Minimum account balance:</strong> Every Flow account must maintain at least 0.001 FLOW. This is automatically provided when you create your account and cannot be withdrawn.</li>
                    <li>• <strong>Storage capacity:</strong> Your wallet's storage capacity is tied to your FLOW balance. Currently, 1 FLOW provides storage for about 100 MB of data.</li>
                    <li>• <strong>Efficiency:</strong> Flow is very efficient—a small amount of $FLOW goes a long way for transaction fees!</li>
                  </ul>
                </div>
              </Card>

              {/* How to Get $FLOW */}
              <Card variant="elevated" padding="md">
                <h3 className="font-semibold text-brand-text mb-3 text-lg">
                  How to Get $FLOW
                </h3>
                <p className="text-sm text-brand-text/80 mb-4 leading-relaxed">
                  There are several ways to get $FLOW into your wallet:
                </p>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-brand-text mb-2">Buy with Credit Card via Wallet</h4>
                    <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                      Some wallets let you buy crypto directly with a credit card, debit card, bank transfer, or even Apple Pay using services like MoonPay or Ramp. Geographical restrictions may apply.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://www.moonpay.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        MoonPay <ExternalLink size={14} />
                      </a>
                      <a href="https://wallet.flow.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Flow Wallet <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-text mb-2">Get $FLOW via Wallets</h4>
                    <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                      Some wallets let you buy crypto with a debit/credit card, bank transfer or even Apple Pay. Geographical restrictions apply.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://walletconnect.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        WalletConnect <ExternalLink size={14} />
                      </a>
                      <a href="https://nu.fi/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        NuFi <ExternalLink size={14} />
                      </a>
                      <a href="https://rabby.io/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Rabby <ExternalLink size={14} />
                      </a>
                      <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        MetaMask <ExternalLink size={14} />
                      </a>
                      <a href="https://www.ledger.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Ledger <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-text mb-2">Buy on a Decentralized Exchange (DEX)</h4>
                    <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                      When you purchase FLOW through a decentralized exchange, you can buy directly from your peers without giving control of your funds to a centralized company.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://www.trado.one/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Trado.one <ExternalLink size={14} />
                      </a>
                      <a href="https://kittypunch.io/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Kittypunch <ExternalLink size={14} />
                      </a>
                      <a href="https://app.increment.fi/swap?in=A.1654653399040a61.FlowToken&out=" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Increment.fi <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-text mb-2">Buy on a Centralized Exchange</h4>
                    <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                      You can buy $FLOW on a major centralized exchange using traditional payment methods. The exchange retains custody over your FLOW until you transfer it to your personal Flow Wallet address.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://www.binance.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Binance <ExternalLink size={14} />
                      </a>
                      <a href="https://www.bybit.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Bybit <ExternalLink size={14} />
                      </a>
                      <a href="https://www.coinbase.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Coinbase <ExternalLink size={14} />
                      </a>
                      <a href="https://upbit.com/home" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Upbit <ExternalLink size={14} />
                      </a>
                      <a href="https://www.okx.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        OKX <ExternalLink size={14} />
                      </a>
                      <a href="https://www.bitget.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Bitget <ExternalLink size={14} />
                      </a>
                      <a href="https://www.mexc.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        MEXC <ExternalLink size={14} />
                      </a>
                      <a href="https://www.gate.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Gate.io <ExternalLink size={14} />
                      </a>
                      <a href="https://www.htx.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        HTX <ExternalLink size={14} />
                      </a>
                      <a href="https://www.kucoin.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        KuCoin <ExternalLink size={14} />
                      </a>
                      <a href="https://crypto.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Crypto.com <ExternalLink size={14} />
                      </a>
                      <a href="https://bingx.com/en" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        BingX <ExternalLink size={14} />
                      </a>
                      <a href="https://www.kraken.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Kraken <ExternalLink size={14} />
                      </a>
                      <a href="https://www.bitmart.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        BitMart <ExternalLink size={14} />
                      </a>
                      <a href="https://www.lbank.com/fa" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        LBank <ExternalLink size={14} />
                      </a>
                      <a href="https://www.bithumb.com/react/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Bithumb <ExternalLink size={14} />
                      </a>
                      <a href="https://www.tokocrypto.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Tokocrypto <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-text mb-2">Bridge Crypto to Flow</h4>
                    <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                      If you already have crypto on another blockchain (like Ethereum, BSC, etc.), you can use bridges to transfer funds to Flow EVM.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://stargate.finance/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Stargate <ExternalLink size={14} />
                      </a>
                      <a href="https://debridge.finance/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        DeBridge <ExternalLink size={14} />
                      </a>
                      <a href="https://bridge.flow.com/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Bridge.Flow.com <ExternalLink size={14} />
                      </a>
                      <a href="https://celer.network/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Celer <ExternalLink size={14} />
                      </a>
                      <a href="https://www.axelar.network/" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis-dark text-sm font-medium inline-flex items-center gap-1">
                        Axelar <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Official Guide Link */}
              <Card variant="elevated" padding="md" className="bg-opolis/10 border-opolis/30">
                <h3 className="font-semibold text-brand-text mb-3 text-lg">
                  The Safest, Most Up-to-Date List
                </h3>
                <p className="text-sm text-brand-text/80 mb-4 leading-relaxed">
                  Exchanges and services change constantly. Instead of maintaining a list ourselves, we link directly to the official guide from the Flow team. This is the most secure and up-to-date resource.
                </p>
                <a 
                  href="https://flow.com/use-flow/flow-token#get-flow" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="primary" size="md" className="inline-flex items-center gap-2">
                    Official Guide: Where to buy $FLOW
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </Card>

              {/* Important Note */}
              <Card variant="elevated" padding="md" className="border-yellow-500/30 bg-yellow-500/10">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-brand-text mb-2">
                      IMPORTANT: After you buy $FLOW on an exchange, you must "Withdraw" it to your new Flow Wallet address to be able to use it on Vaultopolis.
                    </h4>
                    <p className="text-sm text-brand-text/80 leading-relaxed">
                      When you buy FLOW on an exchange, it stays in your exchange account. You need to withdraw it to your personal Flow Wallet address to use it for transactions on Vaultopolis.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Related Guides */}
              <div className="pt-4 border-t border-brand-border">
                <h3 className="font-semibold text-brand-text mb-3">
                  Related Guides
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Link to="/guides/flow-wallet">
                    <Button variant="secondary" size="md">
                      Make a Flow Wallet
                    </Button>
                  </Link>
                  <Link to="/guides/quick-start">
                    <Button variant="secondary" size="md">
                      Quick Start Guide
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </ContentPanel>
        </PageWrapper>
      </div>
    </>
  );
}

export default HowToGetFLOW;

