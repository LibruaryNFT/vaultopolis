# Scripts

flow scripts execute ./sharding/scripts/borrow_moment.cdc 0xf8d6e0586b0a20c7 54
flow scripts execute ./sharding/scripts/get_collection_by_shard.cdc 0xf8d6e0586b0a20c7 0
flow scripts execute ./sharding/scripts/get_collection_ids.cdc 0xf8d6e0586b0a20c7
flow scripts execute ./sharding/scripts/get_count_of_nfts_by_shard.cdc 0xf8d6e0586b0a20c7
flow scripts execute ./sharding/scripts/get_length.cdc 0xf8d6e0586b0a20c7
flow scripts execute ./sharding/scripts/get_nftids_by_shard.cdc 0xf8d6e0586b0a20c7 0
flow scripts execute ./sharding/scripts/get_shard_ids.cdc 0xf8d6e0586b0a20c7 0
flow scripts execute ./sharding/scripts/verify_collection_details.cdc 0xf8d6e0586b0a20c7

# Transactions

flow transactions send ./sharding/transactions/batch_from_sharded.cdc 0x179b6b1cb6755e31 [54,55,56]
flow transactions send ./topshot/transactions/mint_moments.cdc 2 32 300 0xf8d6e0586b0a20c7 --signer=dapper
flow transactions send ./sharding/transactions/publish_sharded_collection.cdc
flow transactions send ./sharding/transactions/setup_sharded_collection.cdc 2 true
flow transactions send ./sharding/transactions/transfer_from_sharded.cdc 0x179b6b1cb6755e31 [54,55,56]
flow transactions send ./sharding/transactions/transfer_to_sharded.cdc 0xf8d6e0586b0a20c7 [54,55,56] --signer=dapper
flow transactions send ./sharding/transactions/unpublish_sharded_collection.cdc
