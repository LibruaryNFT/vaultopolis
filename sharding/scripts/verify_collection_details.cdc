import "TopShotShardedCollectionV2"

access(all) fun main(account: Address): {String: AnyStruct} {
    let account = getAccount(account)

    // Attempt to borrow the ShardedCollection from storage
    let shardedCollectionRef = account
        .capabilities
        .get<&TopShotShardedCollectionV2.ShardedCollection>(/public/MomentCollection)
        .borrow()
        ?? panic("Sharded Collection not found in the account's public capabilities")

    // Get the number of shards (buckets)
    let numBuckets = shardedCollectionRef.getNumBuckets()

    // Check for filter and determine its type
    var filterInfo: String = "No filter applied"
    if let filter = shardedCollectionRef.filter {
        // Check for common-tier filter specifically
        if filter.getType() == Type<TopShotShardedCollectionV2.TSHOTCommonFilter>() {
            filterInfo = "A filter is applied: Common Moments Only"
        } else {
            filterInfo = "A filter is applied, but type is unknown"
        }
    }

    // Fetch IDs from each shard using a while loop
    var bucketIDs: {UInt64: [UInt64]} = {}
    var i: UInt64 = 0
    while i < numBuckets {
        bucketIDs[i] = shardedCollectionRef.getShardIDs(shardIndex: i)
        i = i + 1
    }

    return {
        "numBuckets": numBuckets,
        "filterInfo": filterInfo,
        "bucketIDs": bucketIDs
    }
}
