import "TopShot"
import "TopShotShardedCollection"
import "NonFungibleToken"

// Transaction to mint moments and deposit them into the recipient's sharded collection

transaction(setID: UInt32, playID: UInt32, quantity: UInt64, recipientAddr: Address) {

    let adminRef: &TopShot.Admin
    let mintedCollection: @{NonFungibleToken.Collection}

    prepare(acct: auth(BorrowValue) &Account) {
        // Borrow the admin resource to mint moments
        self.adminRef = acct.storage.borrow<&TopShot.Admin>(from: /storage/TopShotAdmin)
            ?? panic("Could not borrow a reference to the TopShot Admin")

        // Borrow the set reference
        let setRef = self.adminRef.borrowSet(setID: setID)

        // Mint the moments
        self.mintedCollection <- setRef.batchMintMoment(playID: playID, quantity: quantity)
    }

    execute {
        // Access the recipient's account
        let recipient = getAccount(recipientAddr)

        // Borrow the recipient's sharded collection from their storage directly
        let receiverRef = recipient.storage.borrow<auth(NonFungibleToken.Withdraw) &TopShotShardedCollection.ShardedCollection>(from: /storage/ShardedMomentCollection)
            ?? panic("Could not borrow recipient's Sharded Moment collection from storage")

        // Deposit the minted moments into the recipient's sharded collection
        receiverRef.batchDeposit(tokens: <-self.mintedCollection)

        log("Successfully deposited moments to recipient's sharded collection")
    }
}
