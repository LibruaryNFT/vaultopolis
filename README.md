# Fungify

We are making the ability to swap an NBA Top Shot moment for a fungible token called TSHOT. This is on the Flow Blockchain.

We will have the TSHOT fungible token contract and a contract called TopShotExchange which will allow users to swap their Top Shot moments for TSHOT tokens.

We want users to also be able to swap their TSHOT tokens back for Top Shot moments.

THe Flow blockchain has capabilities that should allow us to make this exchange in both ways trustless and secure.

This is build using cadence, we are making it with a brand new version of cadence that is called cadence 1.0 as part of the crescendo update. There are many changes and syntax, design changes etc.


## Features To Implement

three contracts
1. TopShot
  - This is the NBA Top Shot contract that users store their NFTs in.
2. TSHOT
  - This is the fungible token contract that users store their TSHOT tokens in.
3. TopShotExchange
  - This is the contract that allows users to swap their Top Shot moments for TSHOT tokens and vice versa.

In the TopShot Exchange contract we want to implement the following features:

1. We want users to be able to exchange 1 NBA Top Shot Moment for 1 $TSHOT token.
2. We want users to be able to excahnge 1 $TSHOT token for 1 NBA Top Shot Moment.
3. We want the exchanges to be able to triggered by a user through a single transaction. In order to do this, we may need to leverage capabilities , especially for somehow having the TopShotExchange vault send a TopShot Moment back to the user from a transaction made by a user. We may need to learn from the way the marketplace contracts work.
4. We need the actual transfer of the NFT to be done to the Admin storage. We also prefer the Admin be the only one to actually mint the TSHOT tokens. This is to prevent any kind of attack where a user could mint TSHOT tokens for themselves.

- onchain random and then the next iteration that mitigates post-selection of results
https://developers.flow.com/build/advanced-concepts/randomness
Example:
// Language reference:
// https://cadence-lang.org/docs/language/built-in-functions#revertiblerandom
// Run the snippet here: https://academy.ecdao.org/en/snippets/cadence-random
access(all) fun main(): UInt64 {
	// Simple assignment using revertibleRandom - keep reading docs for safe usage!	
	let rand: UInt64 = revertibleRandom()
	return rand
}




Important Contracts

FastBreakV1, PackNFT, ResolverSubedition, TopShot, TopShotLocking
https://contractbrowser.com/account/0x0b2a3299cc857e29/contracts

Market
TopShotMarketV2
TopShotMarketV3
https://contractbrowser.com/account/0xc1e4f4f4c4257510/contracts

May need to shard collection of vault
https://github.com/dapperlabs/nba-smart-contracts/blob/judez/NBA-2865-upgrade-flow-sdk/contracts/TopShotShardedCollection.cdc

## TopShot Emulator Setup
This setup will get you started with the TopShot emulator and ready to mint moments.
### [TopShot Emulator Commands Reference](./EMULATOR.md)


Express Setup 

./setup-flow.ps1
flow-c1 transactions send ./topshot/transactions/create_custom_plays.cdc
flow-c1 transactions send ./topshot/transactions/add_plays_to_sets.cdc 1 [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
flow-c1 transactions send ./topshot/transactions/mint_moments.cdc 1 1 5 0xf8d6e0586b0a20c7
flow-c1 transactions send .\topshot\transactions\transfer_moment.cdc 0x179b6b1cb6755e31 1
flow-c1 transactions send .\topshot\transactions\verify_entitlements.cdc 0x179b6b1cb6755e31
flow-c1 scripts execute .\topshot\scripts\verify_collection.cdc 0x179b6b1cb6755e31

flow-c1 transactions send ./tshot/transactions/mint_TSHOT.cdc 1 --signer=justin
flow-c1 transactions send ./tshot/transactions/setup_vault.cdc --signer=justin
flow-c1 scripts execute ./tshot/scripts/verify_vault.cdc 0x179b6b1cb6755e31
flow-c1 scripts execute .\topshot\scripts\get_collection_ids.cdc 0xf8d6e0586b0a20c7
flow-c1 scripts execute .\topshot\scripts\get_collection_ids.cdc 0x179b6b1cb6755e31
flow-c1 scripts execute ./tshot/scripts/verify_balance.cdc 0x179b6b1cb6755e31


1. Start the emulator
```bash
flow-c1 emulator start
```

2. Run the setup-flow.ps1 script. This will deploy contracts, setup a second emulator account(0x179b6b1cb6755e31) with a TopShot collection and create the sets.
```bash
./setup-flow.ps1
```

3. Create the plays. There are two modes, you can either create plays that do not have metadata or create plays with the exact metadata from Top Shot. Depends on your use case and creating all the metadata takes about 20 minutes compared to 4 minutes for the minimal metadata.

Create a python virtual environment
```bash
python -m venv venv
```

Activate the Virtual environment

```bash
.\venv\Scripts\activate
```

Verbose Mode: Same Play Metadata as TopShot 

```bash
python ./topshot/tools/create_plays.py
```

Empty Play Metadata

Minimal Mode: Minimal Play Metadata

```bash
python ./topshot/tools/create_plays_minimal.py
```

or

```bash
flow-c1 transactions send ./topshot/transactions/create_custom_plays.cdc
```

Add plays to sets. This is the exact mapping found on TopShot. Takes about 5 minutes. The script to generate the json that is used(play_metadata.json) is found in /topshot/tools/fetch_plays.py.
  
```bash
python ./topshot/tools/add_plays_to_sets.py
```

or 

```bash
flow-c1 transactions send ./topshot/transactions/add_plays_to_sets.cdc 1 [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
```

## TSHOT

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





