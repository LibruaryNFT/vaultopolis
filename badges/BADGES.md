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
