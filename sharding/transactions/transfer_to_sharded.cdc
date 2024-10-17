import "TopShot"
import "NonFungibleToken"
import "TopShotShardedCollection"

// Transaction to send an NFT to a recipient's sharded collection

transaction(recipient: Address, withdrawID: UInt64) {

    let transferToken: @{NonFungibleToken.NFT}
    
    prepare(acct: auth(BorrowValue) &Account) {
        // Borrow a reference to the sender's sharded collection
        let collectionRef = acct.storage.borrow<auth(NonFungibleToken.Withdraw) &TopShotShardedCollection.ShardedCollection>(from: /storage/ShardedMomentCollection)
            ?? panic("Could not borrow reference to the stored Sharded Moment collection")
        
        // Withdraw the NFT from the sharded collection
        self.transferToken <- collectionRef.withdraw(withdrawID: withdrawID)
    }

    execute {
        // Get the recipient's public account object
        let recipient = getAccount(recipient)

        // Get the recipient's collection reference from their public capability
        let receiverRef = recipient.capabilities.borrow<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection)
            ?? panic("Could not borrow the recipient's Moment Collection reference")

        // Deposit the NFT into the recipient's sharded collection
        receiverRef.deposit(token: <-self.transferToken)
    }
}
