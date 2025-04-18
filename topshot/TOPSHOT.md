flow scripts execute ./topshot/scripts/get_all_play_metadata.cdc 1 1 --network=testnet

flow scripts execute ./topshot/scripts/get_all_plays_in_set.cdc --network=testnet

flow scripts execute ./topshot/scripts/get_all_set_names.cdc --network=testnet

flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0xa1d297b2610cba6a --network=testnet

flow scripts execute ./topshot/scripts/get_collection_length.cdc 0xa1d297b2610cba6a --network=testnet

flow scripts execute ./topshot/scripts/get_collection_parent.cdc 0xa1d297b2610cba6a --network=testnet

flow scripts execute ./topshot/scripts/get_metadata.cdc 0xa1d297b2610cba6a 10314 --network=testnet

flow scripts execute ./topshot/scripts/get_moment_isLocked.cdc 0xa1d297b2610cba6a 10314 --network=testnet

flow scripts execute ./topshot/scripts/get_collection_minimal.cdc 0xa1d297b2610cba6a --network=testnet

Broken
?? panic("No subedition admin resource in storage")
flow scripts execute ./topshot/scripts/get_collection_all.cdc 0xa1d297b2610cba6a 1 --network=testnet

memory issues i think
Command Error: client: rpc error: code = DeadlineExceeded desc = failed to execute script on execution nodes: 3 errors occurred:
flow scripts execute ./topshot/scripts/get_collection_new.cdc 0xa1d297b2610cba6a --network=testnet

same
flow scripts execute ./topshot/scripts/get_collection.cdc 0xa1d297b2610cba6a --network=testnet

flow scripts execute ./topshot/scripts/get_collection_with_tiers.cdc 0xa1d297b2610cba6a --network=testnet

# TopShot Emulator Commands

## Scripts

### verify_collection (with signer)

- **Description**: Verifies that a specified account has a valid TopShot collection by executing a transaction signed by a specific account.
- **Input Parameters**:
  - `--signer`: The account used to sign the transaction (e.g., `justin`).
- **Example Usage**:

```bash
  flow transactions send .\topshot\transactions\verify_collection.cdc --signer=justin
```

### verify_collection

- **Description**: Verifies that a specified account has a valid TopShot collection.
- **Input Parameters**:
  - `account: Address` - The Flow account address to verify.
- **Example Usage**:

```bash
  flow scripts execute .\topshot\scripts\verify_collection.cdc 0x179b6b1cb6755e31
```

### get_collection_length

flow scripts execute .\topshot\scripts\get_collection_length.cdc 0xa1d297b2610cba6a --network=testnet

### get_plays_in_set

- **Description**: Retrieves all play IDs within a specific set.
- **Input Parameters**:
  - `setID: UInt32` - The ID of the set from which to retrieve play IDs.
- **Example Usage**:

  ```bash
  flow scripts execute .\topshot\scripts\get_plays_in_set.cdc 1
  ```

### get_collection_ids

- **Description**: Retrieves the IDs of all moments in a specified account's collection.
- **Input Parameters**:
  - `account: Address` - The Flow account address to query.
- **Example Usage**:

```bash
  flow scripts execute .\topshot\scripts\get_collection_ids.cdc 0x179b6b1cb6755e31
  flow scripts execute .\topshot\scripts\get_collection_ids.cdc 0xf8d6e0586b0a20c7
flow scripts execute .\topshot\scripts\get_collection_ids.cdc 0xa1d297b2610cba6a --network=testnet
  0xa1d297b2610cba6a
```

## Transactions

### keys generate

- **Description**: Generates a new key pair (public and private keys) for use with Flow accounts.
- **Example Usage**:

  ```bash
  flow keys generate
  ```

### accounts create

- **Description**: Creates a new Flow account using the provided public key.
- **Input Parameters**:
  - `--key <public key>` - The public key to associate with the new account.
- **Example Usage**:

  ```bash
  flow accounts create --key <public key>
  ```

### setup_collection

- **Description**: Sets up a TopShot collection for a specified account by executing a transaction signed by that account.
- **Input Parameters**:
  - `--signer`: The account used to sign the transaction (e.g., `justin`).
- **Example Usage**:

```bash
  flow transactions send .\topshot\transactions\setup_collection.cdc --signer=justin
```

### create_set

- **Description**: Creates a new set in the TopShot contract.
- **Input Parameters**:
  - `setName: String` - The name of the set to be created (e.g., "Genesis Set").
- **Example Usage**:

```bash
  flow transactions send ./topshot/transactions/create_set.cdc "Genesis Set"
```

### create_custom_plays

- **Description**: Creates custom plays with metadata included in the transaction, resulting in unique play IDs.
- **Notes**: This will create 18 unique play IDs starting at 1.
- **Example Usage**:

```bash
  flow transactions send ./topshot/transactions/create_custom_plays.cdc
```

### add_play_to_set

- **Description**: Adds a play to a specific set in the TopShot contract.
- **Input Parameters**:
  - `setID: UInt32` - The ID of the set to which the play will be added.
  - `playID: UInt32` - The ID of the play to be added to the set.
- **Example Usage**:

  ```bash
  flow transactions send ./topshot/transactions/add_play_to_set.cdc 1 1
  ```

### mint_moment

- **Description**: Mints a single moment for a specified set and play, sending it to the recipient's address.
- **Input Parameters**:
  - `setID: UInt32` - The ID of the set from which to mint the moment.
  - `playID: UInt32` - The ID of the play to be minted.
  - `recipientAddr: Address` - The Flow address of the recipient.
- **Example Usage**:

```bash
  flow transactions send ./topshot/transactions/mint_moment.cdc 1 1 0xf8d6e0586b0a20c7
```

### mint_moments

- **Description**: Mints multiple moments for a specified set and play, sending them to the recipient's address.
- **Input Parameters**:
  - `setID: UInt32` - The ID of the set from which to mint the moments.
  - `playID: UInt32` - The ID of the play to be minted.
  - `quantity: UInt64` - The number of moments to mint.
  - `recipientAddr: Address` - The Flow address of the recipient.
- **Example Usage**:

```bash
  flow transactions send ./topshot/transactions/mint_moments.cdc 1 1 5 0xf8d6e0586b0a20c7
```

### transfer_moment

- **Description**: Transfers a moment from one account to another.
- **Input Parameters**:
  - `recipientAddr: Address` - The Flow address of the recipient.
  - `momentID: UInt32` - The ID of the moment to transfer.
- **Example Usage**:

```bash
  flow transactions send .\topshot\transactions\transfer_moment.cdc 0x179b6b1cb6755e31 1
```

### verify_entitlements

- **Description**: Verifies that a specified account has the NonFungible.Withdraw entitlement.
- **Input Parameters**:
  - `account: Address` - The Flow account address to verify.
- **Example Usage**:

```bash
  flow transactions send .\topshot\transactions\verify_entitlements.cdc 0x179b6b1cb6755e31
```
