import "TopShot"
import "TopShotShardedCollection"
import "NonFungibleToken"

// This transaction creates and stores an empty moment collection 
// and creates a public capability for it.
// Moments are split into a number of buckets
// This makes storage more efficient and performant

// Parameters
//
// numBuckets: The number of buckets to split Moments into

transaction(numBuckets: UInt64) {

    prepare(acct: auth(Storage, Capabilities) &Account) {

        if acct.storage.borrow<&TopShotShardedCollection.ShardedCollection>(from: /storage/ShardedMomentCollectionLegendary) == nil {

            let collection <- TopShotShardedCollection.createEmptyCollection(numBuckets: numBuckets)
            // Put a new Collection in storage
            acct.storage.save(<-collection, to: /storage/ShardedMomentCollectionLegendary)
           
        } else {

            panic("Sharded Collection already exists!")
        }
    }
}