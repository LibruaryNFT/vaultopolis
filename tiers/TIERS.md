# TopShot Tiers Commands Reference

## Process for Updating Tiers Onchain

## Tiers Contract Commands

### get_tier

- **Description**: Retrieves the tier of a specific moment.
- **Notes**: Make sure the momentID exists in the specified account to avoid errors.
- **Input Parameters**:
  - `account: Address` - The Flow account address (e.g., 0xf8d6e0586b0a20c7).
  - `momentID: UInt32` - The ID of the moment you want to query.
- **Example Usage**:

```bash
flow scripts execute ./tiers/scripts/get_tier.cdc 0xf8d6e0586b0a20c7 1
flow scripts execute ./tiers/scripts/get_tier.cdc 0x179b6b1cb6755e31 1
```

### update_default_tier

- **Description**: Updates the default tier for a specific set.
- **Notes**: This command requires admin privileges to execute.
- **Input Parameters**:
  - `setID: UInt32` - The ID of the set you want to update.
  - `tierRawValue: UInt8` - The new tier value to set (e.g., 0 common, 1 fandom, 2 rare, 3 legendary, 4 ultimate).
- **Example Usage**:

  ```bash
  flow transactions send ./tiers/transactions/update_default_tier.cdc 1 2
  ```

### update_mixed_tier

- **Description**: Updates the tier for a specific play within a set.
- **Notes**: Ensure both the `setID` and `playID` exist and are correct before running this command.
- **Input Parameters**:
  - `setID: UInt32` - The ID of the set containing the play.
  - `playID: UInt32` - The ID of the play you want to update.
  - `tierRawValue: UInt8` - The new tier value to assign to the play.
- **Example Usage**:

  ```bash
  flow transactions send ./tiers/transactions/update_mixed_tier.cdc 1 245 3
  ```

### remove_playid

- **Description**: Removes a play from a specific set.
- **Notes**: This command permanently removes the association between the play and the set.
- **Input Parameters**:
  - `setID: UInt32` - The ID of the set you want to modify.
  - `playID: UInt32` - The ID of the play to remove from the set.
- **Example Usage**:

  ```bash
  flow transactions send ./tiers/transactions/remove_playid.cdc 1 245
  ```
