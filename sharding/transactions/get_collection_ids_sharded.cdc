import "TopShotShardedCollection"
import "NonFungibleToken"

// Transaction to get the IDs of all moments in a sharded collection

transaction {

    // Declare a variable to store moment IDs
    var momentIDs: [UInt64]

    prepare(acct: auth(BorrowValue) &Account) {

        // Initialize the variable
        self.momentIDs = []

        // Borrow a reference to the sharded collection from storage with withdraw capability
        let collectionRef = acct
            .storage
            .borrow<auth(NonFungibleToken.Withdraw) &TopShotShardedCollection.ShardedCollection>(from: /storage/ShardedMomentCollection)
            ?? panic("Could not borrow reference to the stored Sharded Moment collection")

        // Retrieve the moment IDs from the sharded collection
        self.momentIDs = collectionRef.getIDs()
    }

    execute {
        // Log the entire array of moment IDs
        log(self.momentIDs)
        log("Moment ID retrieval completed.")
    }
}
