// fclConfig.js (create this file)
import * as fcl from "@onflow/fcl";

fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org") // Flow Testnet
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn") // FCL wallet discovery
  .put("0xFlowToken", "0x7e60df042a9c0868");
