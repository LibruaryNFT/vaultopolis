import "TopShot"
import "TopShotShardedCollectionV2"
import "NonFungibleToken"

// This transaction creates and stores an empty moment collection 
// that applies the CommonFandomFilter for TopShot moments.
// Moments are split into a number of buckets for efficiency.
//
// Parameter:
// numBuckets: The number of buckets to split Moments into

transaction(numBuckets: UInt64) {

    prepare(acct: auth(Storage, Capabilities) &Account) {

        if acct.storage.borrow<&TopShotShardedCollectionV2.ShardedCollection>(from: /storage/ShardedMomentCollection) == nil {

            // Explicitly use the CommonFandomFilter
            let filter: {TopShotShardedCollectionV2.MomentFilter}? = TopShotShardedCollectionV2.CommonFandomFilter()

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
