# Vaultopolis

**Vaultopolis** is a decentralized protocol on the Flow Blockchain that enables users to seamlessly swap NBA Top Shot Moments for the fungible token **TSHOT**, and vice versa. Built on Cadence 1.0 (Crescendo update), it leverages on-chain randomness and sharded storage to ensure trustless, efficient, and secure swaps.

---

## Features

### Core Features

- **One-to-One Swaps**  
  Exchange Top Shot Moments for TSHOT tokens, or TSHOT tokens for Top Shot Moments, with a 1:1 conversion ratio.

- **Batch Swaps**  
  Swap multiple moments for tokens, or tokens for moments, in a single transaction.

- **On-Chain Randomness**  
  Randomly select moments from a secure NFT vault, ensuring fairness in token-to-moment swaps.

- **Sharded NFT Storage**  
  Efficient management of large collections of Top Shot Moments through sharded storage.

---

## Contracts Overview

Vaultopolis is powered by the following core contracts:

1. **TSHOTExchange**  
   Facilitates the trustless exchange of Top Shot Moments for TSHOT tokens, supporting both single and batch swaps.

2. **TSHOT**  
   Implements the TSHOT fungible token, adhering to Flow's Fungible Token standards. Supports minting, transferring, and burning.

3. **TopShotTiers**  
   Classifies Top Shot Moments into tiers (e.g., common, rare, legendary) for swap validation.

4. **TopShotShardedCollectionV2**  
   Provides efficient storage and retrieval of large collections of NFTs using a sharded structure.

---

## Commands

Refer to the following sections for detailed commands and their usage:

- [Exchange Commands](./SWAP.md)  
  Commands related to swapping moments and tokens.

- [Sharding Commands](./SHARDING.md)  
  Commands for interacting with the sharded collection.

- [Tiers Commands](./TIERS.md)  
  Commands for managing and querying NFT tiers.

- [Utilities Commands](./UTILITIES.md)  
  Helper functions for vaults, randomness, and other protocol interactions.

- [Liquidity Pool Commands](./LIQUIDITY.md)  
  Managing liquidity for TSHOT trading.

- [Deployment Commands](./DEPLOYMENT.md)  
  Instructions for deploying the contracts.

---

## Core Contracts

The following contracts power the MomentSwap ecosystem:

1. **TSHOTExchange**  
   [View Full Contract](./contracts/TSHOTExchange.cdc)

2. **TSHOT**  
   [View Full Contract](./contracts/TSHOT.cdc)

3. **TopShotTiers**  
   [View Full Contract](./contracts/TopShotTiers.cdc)

4. **TopShotShardedCollectionV2**  
   [View Full Contract](./contracts/TopShotShardedCollectionV2.cdc)

For more details on Flow's NFT and token standards, visit the [Flow Documentation](https://developers.flow.com/).

---

## References

- **TopShot Contracts**:  
  [FastBreakV1, PackNFT, and more](https://contractbrowser.com/account/0x0b2a3299cc857e29/contracts)

- **Marketplace Contracts**:  
  [TopShotMarketV2, TopShotMarketV3](https://contractbrowser.com/account/0xc1e4f4f4c4257510/contracts)

---

## License

This project is licensed under the [MIT License](./LICENSE).

Testnet Addresses
https://testnet.flowscan.io/account/0x332ffc0ae9bba9c1

## Flow Connect Endpoints

https://flowconnectbackend-864654c6a577.herokuapp.com/topshot-sets
https://flowconnectbackend-864654c6a577.herokuapp.com/topshot-sets?setID=56
https://flowconnectbackend-864654c6a577.herokuapp.com/topshot-editions
https://flowconnectbackend-864654c6a577.herokuapp.com/topshot-editions?setID=1&playID=1
https://flowconnectbackend-864654c6a577.herokuapp.com/topshot-plays
https://flowconnectbackend-864654c6a577.herokuapp.com/topshot-plays?playID=2
https://flowconnectbackend-864654c6a577.herokuapp.com/topshot-tiers
https://flowconnectbackend-864654c6a577.herokuapp.com/topshot-tiers?setID=2&playID=95
