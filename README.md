# Fungify

## TopShot Tiers

### Status

Under review/testing. Will deploy to mainnet soon.

### Commands

get_tier (account, momentID)

- flow-c1 scripts execute ./tiers/scripts/get_tier.cdc 0xf8d6e0586b0a20c7 1

(Admin) update_default_tier (setID: UInt32, tierRawValue: UInt8)

- flow-c1 transactions send ./tiers/transactions/update_default_tier.cdc 1 2

(Admin) update_mixed_tier (setID: UInt32, playID: UInt32, tierRawValue: UInt8)

- flow-c1 transactions send ./tiers/transactions/update_mixed_tier.cdc

(Admin) remove_playid.cdc (setID: UInt32, playID: UInt32)

- flow-c1 transactions send ./tiers/transactions/remove_playid.cdc 1 245

  ### [Tiers Reference](./TIERS.md)

## TopShot Emulator

1. Deploy TopShotLocking, TopShot, TopShotTiers

JSON looks like this:

"emulator-account": [
"TopShotLocking",
"TopShot",
"TopShotTiers"
]

- flow-c1 project deploy

2. (Optional) Setup second emulator user

- flow-c1 keys generate
- flow-c1 accounts create --key <public key>
- flow-c1  transactions send .\topshot\transactions\setup_collection.cdc --signer=justin
- flow-c1  transactions send .\topshot\transactions\verify_collection.cdc --signer=justin
- flow-c1 scripts execute .\topshot\scripts\verify_collection.cdc 0x179b6b1cb6755e31

3. create_set (string)
  - flow-c1 transactions send ./topshot/transactions/create_set.cdc "First Set!"

4. create_plays (metadata found inside transaction)
  - flow-c1 transactions send ./topshot/transactions/create_plays.cdc

5. add_play_to_set (setID: UInt32, playID: UInt32)
- flow-c1 transactions send ./topshot/transactions/add_play_to_set.cdc 1 1
- flow-c1 scripts execute .\topshot\scripts\get_plays_in_set.cdc 1

5. mint_moment(setID: UInt32, playID: UInt32, recipientAddr: Address)

-flow-c1 transactions send ./topshot/transactions/mint_moment.cdc 1 1 0xf8d6e0586b0a20c7

or mint_moments(setID: UInt32, playID: UInt32, recipientAddr: Address)

- flow-c1 transactions send ./topshot/transactions/mint_moments.cdc 1 1 5 0xf8d6e0586b0a20c7

5. transfer_moment (recipientAddr: Address, momentID: UInt32)
 - flow-c1 transactions send .\topshot\transactions\transfer_moment.cdc 0x179b6b1cb6755e31 1

 6. get_collection_ids (account: Address)
 flow-c1 scripts execute .\topshot\scripts\get_collection_ids.cdc 0x179b6b1cb6755e31 
