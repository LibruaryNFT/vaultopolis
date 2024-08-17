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

## Features to Implement

### TopShotExchange Contract Features

1. **One-to-One Exchange:**
   - Users can exchange 1 NBA Top Shot Moment for 1 TSHOT token.
   - Users can exchange 1 TSHOT token for 1 NBA Top Shot Moment.

2. **User-Initiated Transactions:**
   - Exchanges should be initiated by the user through a single transaction.
   - The contract will leverage capabilities, particularly to allow the TopShotExchange vault to send a Top Shot Moment back to the user within a transaction initiated by the user.
   - The approach will take inspiration from existing marketplace contracts to ensure security and efficiency.

3. **Secure Transfer and Minting:**
   - The actual transfer of the Top Shot Moment NFT must be made to the Admin’s storage.
   - The Admin will be the sole entity capable of minting TSHOT tokens, preventing any unauthorized minting and securing the system against potential attacks.

### Additional Features and Concepts

- **On-Chain Randomness:**
   - Implement on-chain randomness for specific operations, using Flow's `revertibleRandom()` function.
   - Future iterations will include mechanisms to mitigate post-selection of results, ensuring fairness and unpredictability.

   Example usage:

```cadence
   access(all) fun main(): UInt64 {
       let rand: UInt64 = revertibleRandom()
       return rand
   }
```

## Sharded Collections

Depending on performance requirements, the collection of NFTs or fungible tokens may need to be sharded. This concept is under exploration to manage scalability as the project grows.

## Current Contract Operations

### Capabilities and Setup

#### Capabilities Overview

Capabilities in Flow allow secure access to resources stored in accounts, enabling fine-grained control over what can be done with those resources. In our contracts, capabilities will be utilized extensively to ensure that only authorized actions can be performed, particularly in the TopShotExchange contract where NFTs and tokens are swapped.

#### NFT Vault

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

## Development Notes

- This project is built using Cadence 1.0, which introduces new syntax and design patterns.
- The secure and trustless nature of the Flow blockchain is leveraged throughout the project to ensure safe exchanges between NFTs and tokens.
- Detailed attention is being paid to the implementation of secure minting and transfer processes, ensuring that users can confidently interact with the contracts.

To perform the exchange of 1 TSHOT token for a randomly selected TopShot NFT within a single transaction, while keeping everything within the same contract, here’s how you can conceptually design it:

Transaction Design Overview
Single Transaction Exchange:

The transaction will handle both the burning of 1 TSHOT token and the random selection and transfer of a TopShot NFT in one atomic operation.
Transaction Workflow:

Input: The user sends 1 TSHOT token to the contract.
Random Selection: The contract generates a random number to select an NFT from the vault.
NFT Transfer: The selected NFT is transferred from the vault to the user’s account.
TSHOT Token Handling: The TSHOT token sent by the user is either burned or handled according to the contract's design (e.g., sent to an admin account).
Ensuring Atomicity:

All or Nothing: The transaction must succeed as a whole or fail entirely, ensuring that no partial operations occur (e.g., TSHOT is burned, but the NFT is not transferred).
Key Steps in the Transaction
Receive TSHOT Token:

The user authorizes the contract to withdraw 1 TSHOT token from their vault.
Generate Random Index:

The contract generates a random number within the range of available NFTs in the vault.
Retrieve NFT:

Using the random number, the contract retrieves the corresponding NFT from the vault.
Transfer NFT to User:

The NFT is then transferred to the user’s account.
Burn TSHOT Token:

The TSHOT token is either burned or sent to an admin-controlled vault.
Example Transaction Flow
Here’s a step-by-step outline of how this could be structured:

User Sends TSHOT Token:

The transaction begins with the user providing 1 TSHOT token, which the contract withdraws from the user's vault.
Random Number Generation:

The contract generates a random number that corresponds to the index of an NFT in the vault.
NFT Selection and Transfer:

The NFT at the selected index is transferred from the contract’s vault to the user.
TSHOT Token Handling:

The contract burns the TSHOT token or deposits it into an admin-controlled vault.
Completion:

The transaction completes, and the user now has a randomly selected NFT in exchange for their TSHOT token.
Considerations
Randomness:

Ensure that the randomness used is secure and cannot be manipulated by users or external entities.
Error Handling:

Handle cases where the vault might be empty or the user’s balance is insufficient.
Transaction Size:

Keep the operations within the transaction small enough to avoid exceeding transaction limits on the blockchain.
Implementation Outline
Transaction Script:

The transaction script would be written to handle the exchange process as outlined above.
Contract Methods:

Ensure that the contract has the necessary methods to support random selection, withdrawal, and deposit operations.
Testing:

Simulate different scenarios to test the transaction thoroughly, especially the random selection mechanism.
Summary
By following this approach, you can enable users to exchange 1 TSHOT token for a randomly selected TopShot NFT within a single transaction, all while maintaining the process within a single contract. This provides a seamless, efficient, and engaging experience for users, leveraging the power of Cadence's atomic transactions.

## TopShot Emulator Setup
This guide will help you set up the TopShot emulator, allowing you to start minting moments quickly.

You can choose from three setup options, depending on your needs and the level of detail you require:

- Express Setup: A quick start with only 18 plays and 1 set. This setup takes just a minute to complete, providing the fastest way to get started with the TopShot emulator.
- Basic Setup: A more detailed setup with 5511 empty plays data and 160 sets data. This setup is a closer representation of the Mainnet TopShot contract and takes about 4 minutes to complete.
- Full Setup: The most comprehensive setup, including 5511 full plays data and 160 full sets data. This setup is the most accurate representation of the Mainnet TopShot contract and takes around 15 minutes to complete.

### [TopShot Emulator Commands Reference](./EMULATOR.md)

After completing your setup, refer to the **TopShot Emulator Commands Reference** for detailed instructions on how to mint moments, transfer them, and execute other commands using the emulator. This document will guide you through all the necessary commands to manage and interact with your TopShot moments effectively.

### Python Setup

If you are running the Basic or Full Setup, you will need a Python Virtual Environment

Create a python virtual environment
```bash
python -m venv venv
```

Activate the Virtual environment

```bash
.\venv\Scripts\activate
```

### Express Setup 

```bash

flow-c1 emulator start
./setup-flow.ps1
flow-c1 transactions send ./topshot/transactions/create_custom_plays.cdc
flow-c1 transactions send ./topshot/transactions/add_plays_to_sets.cdc 1 [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
flow-c1 transactions send ./topshot/transactions/mint_moments.cdc 1 1 5 0xf8d6e0586b0a20c7
flow-c1 transactions send .\topshot\transactions\transfer_moment.cdc 0x179b6b1cb6755e31 1
flow-c1 transactions send .\topshot\transactions\verify_entitlements.cdc 0x179b6b1cb6755e31
flow-c1 scripts execute .\topshot\scripts\verify_collection.cdc 0x179b6b1cb6755e31
```

### Basic Setup 

```bash
flow-c1 emulator start
./setup-flow.ps1
python ./topshot/tools/create_plays_minimal.py
python ./topshot/tools/add_plays_to_sets.py
```

### Full Setup 

```bash
flow-c1 emulator start
./setup-flow.ps1
python ./topshot/tools/create_plays.py
python ./topshot/tools/add_plays_to_sets.py

```

## TSHOT

```bash

flow-c1 transactions send ./tshot/transactions/setup_vault.cdc --signer=justin
flow-c1 scripts execute ./tshot/scripts/verify_vault.cdc 0x179b6b1cb6755e31
flow-c1 scripts execute ./tshot/scripts/verify_vault.cdc 0xf8d6e0586b0a20c7
flow-c1 transactions send ./tshot/transactions/mint_TSHOT.cdc 1 --signer=justin
flow-c1 scripts execute ./topshot/scripts/get_collection_ids.cdc 0xf8d6e0586b0a20c7
flow-c1 scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31
flow-c1 scripts execute ./tshot/scripts/verify_balance.cdc 0x179b6b1cb6755e31
flow-c1 scripts execute ./tshot/scripts/get_vault_nfts.cdc 0xf8d6e0586b0a20c7
flow-c1 scripts execute ./tshot/scripts/get_vault_metadata.cdc 1
flow-c1 transactions send ./tshot/transactions/exchange_TSHOT.cdc --signer=justin
flow-c1 scripts execute ./tshot/scripts/verify_balance.cdc 0x179b6b1cb6755e31
flow-c1 scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31
flow-c1 scripts execute ./tshot/scripts/verify_balance.cdc 0xf8d6e0586b0a20c7

```

### Scripts

verify_vault.cdc
address: Address

bool

```bash
flow-c1 scripts execute ./tshot/scripts/verify_vault.cdc 0xf8d6e0586b0a20c7
flow-c1 scripts execute ./tshot/scripts/verify_vault.cdc 0x179b6b1cb6755e31
```

### Transactions

```bash
flow-c1 transactions send ./tshot/transactions/setup_vault.cdc --signer=justin
```

```bash
flow-c1 transactions send ./tshot/transactions/mint_TSHOT.cdc 1 --signer=justin
```

## TopShot Tiers

### Status

Under review/testing. Will deploy to mainnet soon.

### [Tiers Commands Reference](./TIERS.md)





