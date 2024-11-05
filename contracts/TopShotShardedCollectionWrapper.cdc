import "TopShotShardedCollection"
import "NonFungibleToken"
import "TopShot"

access(all) contract TopShotShardedCollectionWrapper {

    // Wrapper resource that holds the capability of the sharded collection
    access(all) resource CollectionWrapper {
        // Capability to the sharded collection
        access(all) let collectionCap: Capability<&TopShotShardedCollection.ShardedCollection>

        // Initialize the wrapper with the sharded collection capability
        init(collectionCap: Capability<&TopShotShardedCollection.ShardedCollection>) {
            self.collectionCap = collectionCap
        }

        // Expose the getIDs function from the Sharded Collection
        access(all) fun getIDs(): [UInt64] {
            // Borrow the collection using the capability
            let collectionRef = self.collectionCap.borrow()
                ?? panic("Could not borrow the sharded collection reference")
            
            // Call and return getIDs
            return collectionRef.getIDs()
        }

        // Expose the getLength function from the Sharded Collection
        access(all) fun getLength(): Int {
            // Borrow the collection using the capability
            let collectionRef = self.collectionCap.borrow()
                ?? panic("Could not borrow the sharded collection reference")
            
            // Call and return getLength
            return collectionRef.getLength()
        }

        // Expose the borrowMoment function from the Sharded Collection
        access(all) fun borrowMoment(id: UInt64): &TopShot.NFT? {
            // Borrow the collection using the capability
            let collectionRef = self.collectionCap.borrow()
                ?? panic("Could not borrow the sharded collection reference")
            
            // Call and return borrowMoment
            return collectionRef.borrowMoment(id: id)
        }
    }

    // Function to create a new CollectionWrapper with the sharded collection capability
    access(all) fun createWrapper(collectionCap: Capability<&TopShotShardedCollection.ShardedCollection>): @CollectionWrapper {
        return <-create CollectionWrapper(collectionCap: collectionCap)
    }
}
