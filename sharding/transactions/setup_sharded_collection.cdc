import "TopShot"
import "TopShotShardedCollectionV2"
import "NonFungibleToken"

// This transaction creates and stores an empty moment collection 
// with an optional filter for common TopShot moments.
// Moments are split into a number of buckets
// to make storage more efficient and performant.

// Parameters:
//
// numBuckets: The number of buckets to split Moments into
// useCommonFilter: A Boolean to specify if a common-tier filter should be applied

transaction(numBuckets: UInt64, useCommonFilter: Bool) {

    prepare(acct: auth(Storage, Capabilities) &Account) {

        if acct.storage.borrow<&TopShotShardedCollectionV2.ShardedCollection>(from: /storage/ShardedMomentCollection) == nil {

            var filter: {TopShotShardedCollectionV2.MomentFilter}? = nil

            if useCommonFilter {
                filter = TopShotShardedCollectionV2.TSHOTCommonFilter()
            }

            let collection <- TopShotShardedCollectionV2.createEmptyCollection(
                numBuckets: numBuckets, 
                filter: filter
            )

            // Put a new Collection in storage
            acct.storage.save(<-collection, to: /storage/ShardedMomentCollection)

            // Update public capability
            acct.capabilities.unpublish(/public/MomentCollection)
            acct.capabilities.publish(
                acct.capabilities.storage.issue<&TopShotShardedCollectionV2.ShardedCollection>(/storage/ShardedMomentCollection),
                at: /public/MomentCollection
            )
        } else {

            panic("Sharded Collection already exists!")
        }
    }
}
