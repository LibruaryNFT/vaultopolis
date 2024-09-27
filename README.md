# Fungify

**Fungify** is an innovative project that allows users to swap their NBA Top Shot moments for a fungible token called **TSHOT** on the Flow Blockchain. This project leverages the unique capabilities of the Flow blockchain to facilitate secure and trustless exchanges between non-fungible tokens (NFTs) and fungible tokens.

We are developing this project using Cadence 1.0, which is part of the Crescendo update. Cadence 1.0 introduces several changes in syntax, design, and other areas, which we are incorporating into our contracts.

## Contracts Overview

The Fungify project involves three primary smart contracts:

### 1. **TopShot**

- This contract represents the NBA Top Shot collection where users store their NBA Top Shot moments as NFTs. The contract handles the creation, management, and transfer of these NFTs. It also includes metadata management and capabilities for secure interactions.

### 2. **TSHOT**

- This contract manages the TSHOT fungible token. Users will store their TSHOT tokens in this contract. The contract follows the Fungible Token standard on Flow and includes functionality for minting, transferring, and burning TSHOT tokens.

### 3. **TopShotExchange**

- This is the core contract that facilitates the exchange between Top Shot moments and TSHOT tokens. Users can swap their Top Shot moments for TSHOT tokens and vice versa. The contract ensures that all exchanges are secure and trustless, leveraging Flow’s capability system.

### 4. **TopShotFloors**

- This allows users to submit TopShot moments in exchange for Flow tokens.

### 5. **Liquidity Pool Contracts**

## Features

### TopShotExchange Contract Features

1. **One-to-One Exchange:**

There is currently no limits set in place(ie 5 for 5), however they will be added.

- Users can exchange 1 NBA Top Shot Moment for 1 TSHOT token.
- Users can exchange 1 TSHOT token for 1 NBA Top Shot Moment.

2. **User-Initiated Transactions:**

   - Exchanges should be initiated by the user through a single transaction.
   - The contract will leverage capabilities, particularly to allow the TopShotExchange vault to send a Top Shot Moment back to the user within a transaction initiated by the user.
   - The approach will take inspiration from existing marketplace contracts to ensure security and efficiency.

3. **Secure Transfer and Minting:**

   - The actual transfer of the Top Shot Moment NFT must be made to the Admin’s storage.
   - The Admin will be the sole entity capable of minting TSHOT tokens, preventing any unauthorized minting and securing the system against potential attacks.

4. **On-Chain Randomness**

- Implement on-chain randomness for specific operations, using Flow's `revertibleRandom()` function.
- Future iterations will include mechanisms to mitigate post-selection of results, ensuring fairness and unpredictability.

Example usage:

```cadence
   access(all) fun main(): UInt64 {
       let rand: UInt64 = revertibleRandom()
       return rand
   }
```

5. **NFT Vault**

The **NFTVault** resource within the TopShot contract is a secure storage for NFTs. It can:

- Store multiple NFTs.
- Provide a list of all stored NFT IDs.
- Allow controlled withdrawal and deposit of NFTs.
- Return metadata associated with each NFT for users to view.

The **NFTVault** cannot:

- Mint new NFTs (this is reserved for the Admin).
- Directly swap NFTs with tokens; this requires interaction with the TopShotExchange contract.

## Important Contracts and References

- **Core Contracts:** FastBreakV1, PackNFT, ResolverSubedition, TopShot, TopShotLocking  
  [View Contracts](https://contractbrowser.com/account/0x0b2a3299cc857e29/contracts)

- **Marketplace Contracts:** TopShotMarketV2, TopShotMarketV3  
  [View Marketplace Contracts](https://contractbrowser.com/account/0xc1e4f4f4c4257510/contracts)

- **Sharded Collection Reference:**  
  [TopShot Sharded Collection Contract](https://github.com/dapperlabs/nba-smart-contracts/blob/judez/NBA-2865-upgrade-flow-sdk/contracts/TopShotShardedCollection.cdc)

### [TopShot Commands](./TOPSHOT.md)

After completing your setup, refer to the **TopShot Commands** for detailed instructions on how to mint moments, transfer them, and execute other commands using the emulator. This document will guide you through all the necessary commands to manage and interact with your TopShot moments effectively.

## TSHOT Setup

```bash
flow emulator start
./deployment/scripts/setup-flow.ps1
./deployment/scripts/setup-tshot.ps1
```

### [TopShotExchange Commands][./EXCHANGE.md]

## TopShot Tiers

### Status

Under review/testing. Will deploy to mainnet soon.

### [Tiers Commands Reference](./TIERS.md)

# Notes

## Computational Limits

Current limits seem to be that we can swap 95 moments at a time and also swap 95 TSHOT for NFTs at a time.

## Questions

What limit should there be for swapping? There are gas and computational limits.
How efficient is the swapping functionality for gas?
Depending on performance requirements, the collection of NFTs or fungible tokens may need to be sharded. This concept is under exploration to manage scalability as the project grows.

Does that allow for exchanging tshot for any other tokens somehow?

It adopts the factory pattern that each unique trading pair is deployed using the SwapPair template file, with a factory contract storing all deployed pairs.

## TopShot Badges

### Status

The following are implemented:

- Rookie Mint
- Rookie of the Year
- MVP Year
- Rookie Year
- Championship Year

The following are in-progress:

- Rookie Premiere
- Top Shot Debut
- Challenge Reward
- Crafting Challenge Reward
- Leaderboard Reward

### Commands

#### get_all_badges

- **Description**: Retrieves all badges associated with a specified account.
- **Input Parameters**:
  - `account: Address` - The Flow account address to query (e.g., `0xf8d6e0586b0a20c7`).
- **Example Usage**:

```bash
  flow scripts execute ./badges/scripts/get_all_badges.cdc 0xf8d6e0586b0a20c7
```

SwapFactory
https://www.flowdiver.io/account/0xb063c16cac85dbd1
Pair creation and data container of all uni-v2 style (volatile) swap pair addresses

Summary of Key Contracts for Creating and Managing Your Liquidity Pool

1. SwapFactory Contract
   Purpose:
   The SwapFactory contract is used to create new liquidity pools (pairs) between two tokens.

Steps to Use:

Create the Liquidity Pool:
Call the createPair function on the SwapFactory contract.
Specify the vaults for $TSHOT and $stFlow.
This function will deploy a new SwapPair contract specific to the $TSHOT/$stFlow pair. 2. SwapPair Contract
Purpose:
The SwapPair contract manages the specific liquidity pool for your token pair. It handles adding/removing liquidity and processing swaps.

Steps to Use:

Add Initial Liquidity:
Once the pair is created, interact with the SwapPair contract.
Use the addLiquidity function to deposit your initial $2,500 worth of $TSHOT and $stFlow tokens into the pool.
Manage the Pool:
You can use the removeLiquidity function to withdraw liquidity.
The swap function allows tokens to be exchanged between $TSHOT and $stFlow within the pool.
How It Works:
Creation: SwapFactory creates a SwapPair contract for your chosen tokens.
Management: SwapPair handles the day-to-day operations of the liquidity pool, including liquidity management and swaps.
Note: You don’t need to interact with SwapRouter or SwapConfig directly; they are used internally to support advanced swap functionalities.

Increment.FI only allows for basic swap functionality, so you will primarily interact with the SwapPair contract to manage your liquidity pool.

Notes

// TopShotFloors

// Borrow Admin's TopShot Collection

let adminCollection = self.account
.storage
.borrow<&TopShot.Collection>(from: self.nftCollectionPath)
?? panic("Could not borrow admin's TopShot Collection")

// Borrow the admin's Flow Vault to withdraw tokens

let adminFlowVault = self.account
.storage
.borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(from: self.flowVaultPath)
?? panic("Could not borrow admin's Flow Vault")

// Get the recipient's account and borrow their Flow token receiver

let recipientAccount = getAccount(address)
let receiver = recipientAccount
.capabilities
.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
.borrow()
?? panic("Could not borrow the user's Flow token receiver capability")

// SwapNFTForTSHOT

// Get the recipient's account and borrow their TSHOT token receiver

let recipientAccount = getAccount(address)
let receiverRef = recipientAccount
.capabilities
.get<&{FungibleToken.Receiver}>(/public/TSHOTTokenReceiver)
.borrow()
?? panic("Could not borrow the user's TSHOT receiver capability")

// Borrow the TSHOT Admin resource

let adminRef = self.account
.storage
.borrow<auth(TSHOT.AdminEntitlement) &TSHOT.Admin>(from: self.tshotAdminPath)
?? panic("Could not borrow the TSHOT Admin resource")
