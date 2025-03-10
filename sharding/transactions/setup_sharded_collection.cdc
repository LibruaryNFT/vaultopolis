import "TopShot"
import "TopShotShardedCollectionV2"
import "NonFungibleToken"

// This transaction creates and stores an empty moment collection 
// with an optional filter for common OR fandom TopShot moments.
// Moments are split into a number of buckets for efficiency.
//
// Parameters:
//
// numBuckets: The number of buckets to split Moments into
// useCommonFilter: If true, a CommonFandomFilter is applied; otherwise, no filter is applied.
transaction(numBuckets: UInt64, useCommonFilter: Bool) {

    prepare(acct: auth(Storage, Capabilities) &Account) {

        if acct.storage.borrow<&TopShotShardedCollectionV2.ShardedCollection>(from: /storage/ShardedMomentCollection) == nil {

            var filter: {TopShotShardedCollectionV2.MomentFilter}? = nil

            if useCommonFilter {
                filter = TopShotShardedCollectionV2.CommonFandomFilter()
            }

            let collection <- TopShotShardedCollectionV2.createEmptyCollection(
                numBuckets: numBuckets, 
                filter: filter
            )

            // Save the new collection in storage
            acct.storage.save(<-collection, to: /storage/ShardedMomentCollection)

            // Update the public capability
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
