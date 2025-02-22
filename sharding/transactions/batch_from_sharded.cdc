import "NonFungibleToken"
import "TopShot"
import "TopShotShardedCollectionV2"

// This transaction deposits a number of NFTs to a recipient

// Parameters
//
// recipient: the Flow address who will receive the NFTs
// momentIDs: an array of moment IDs of NFTs that recipient will receive

transaction(recipient: Address, momentIDs: [UInt64]) {

    let transferTokens: @{NonFungibleToken.Collection}
    
    prepare(acct: auth(BorrowValue) &Account) {
        
        self.transferTokens <- acct.storage.borrow<auth(NonFungibleToken.Withdraw) &TopShotShardedCollectionV2.ShardedCollection>(from: /storage/ShardedMomentCollection)!.batchWithdraw(ids: momentIDs)
    }

    execute {

        // get the recipient's public account object
        let recipient = getAccount(recipient)

        // get the Collection reference for the receiver
        let receiverRef = recipient.capabilities.borrow<&TopShot.Collection>(/public/MomentCollection)!

        // deposit the NFT in the receivers collection
        receiverRef.batchDeposit(tokens: <-self.transferTokens)
    }
}