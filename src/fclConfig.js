// fclConfig.js (create this file)
import * as fcl from "@onflow/fcl";

fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org") // Flow Testnet
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn") // FCL wallet discovery
  .put("0xFlowToken", "0x7e60df042a9c0868")
  .put("discovery.walletConnect.projectId", "1c74f5c9166063f0f3d2eb0cc6b30265") // WalletConnect project ID
  .put("app.detail.title", "MomentSwap")
  .put(
    "app.detail.icon",
    "https://storage.googleapis.com/momentswap/images/MomentSwapWhite.png"
  )
  .put("app.detail.description", "MomentSwap - NFT and Token Swaps")
  .put("app.detail.url", "https://momentswap.xyz")
  .put("service.WalletConnect", {
    metadata: {
      name: "MomentSwap",
      description: "Swap NFTs and tokens with MomentSwap",
      url: "https://momentswap.xyz",
      icons: [
        "https://storage.googleapis.com/momentswap/images/MomentSwapWhite.png",
      ],
    },
  });
