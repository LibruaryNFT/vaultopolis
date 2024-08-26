### Scripts

```bash
flow-c1 scripts execute ./tshot/scripts/verify_vault.cdc 0xf8d6e0586b0a20c7
flow-c1 scripts execute ./tshot/scripts/verify_vault.cdc 0x179b6b1cb6755e31
```

```bash
flow-c1 scripts execute ./tshot/scripts/verify_vault.cdc 0x179b6b1cb6755e31
flow-c1 scripts execute ./tshot/scripts/verify_vault.cdc 0xf8d6e0586b0a20c7
```

```bash
flow-c1 scripts execute ./tshot/scripts/get_vault_nfts.cdc 0xf8d6e0586b0a20c7
```

```bash
flow-c1 scripts execute ./tshot/scripts/get_vault_metadata.cdc 1
```

```bash
flow-c1 scripts execute ./tshot/scripts/verify_balance.cdc 0x179b6b1cb6755e31
```

```bash
flow-c1 scripts execute ./tshot/scripts/verify_balance.cdc 0xf8d6e0586b0a20c7
```

### Transactions

```bash
flow-c1 transactions send ./tshot/transactions/setup_vault.cdc --signer=justin
```

```bash
flow-c1 transactions send ./tshot/transactions/mint_TSHOT.cdc [12,3,4,5] --signer=justin
```

```bash
flow-c1 transactions send ./tshot/transactions/exchange_TSHOT.cdc 1.0 --signer=justin
```
