import "TopShot"
import "TopShotShardedCollectionV2"
import "NonFungibleToken"

transaction {

    prepare(acct: auth(Storage, Capabilities) &Account) {

        // Load the sharded collection from storage
        let shardedCollection <- acct.storage.load<@TopShotShardedCollectionV2.ShardedCollection>(from: /storage/ShardedMomentCollection)
            ?? panic("Could not load sharded collection from storage")

        // Ensure the collection is empty
        let totalNFTs = shardedCollection.getLength()
        if totalNFTs != 0 {
            panic("Cannot destroy sharded collection: it contains NFTs.")
        }

        // Destroy the sharded collection
        destroy shardedCollection

        // Unpublish the public capability
        acct.capabilities.unpublish(/public/MomentCollection)
    }
}

