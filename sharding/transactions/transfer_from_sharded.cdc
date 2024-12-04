import "NonFungibleToken"
import "TopShot"
import "TopShotShardedCollectionV2"

// This transaction deposits an NFT to a recipient
//https://github.com/dapperlabs/nba-smart-contracts/blob/master/transactions/shardedCollection/transfer_from_sharded.cdc
// Parameters
//
// recipient: the Flow address who will receive the NFT
// momentID: moment ID of NFT that recipient will receive

transaction(recipient: Address, momentID: UInt64) {

    let transferToken: @{NonFungibleToken.NFT}
    
    prepare(acct: auth(BorrowValue) &Account) {

        self.transferToken <- acct.storage.borrow<auth(NonFungibleToken.Withdraw) &TopShotShardedCollectionV2.ShardedCollection>(from: /storage/ShardedMomentCollection)!.withdraw(withdrawID: momentID)
    }

    execute {
        
        // get the recipient's public account object
        let recipient = getAccount(recipient)

        // get the Collection reference for the receiver
        let receiverRef = recipient.capabilities.borrow<&TopShot.Collection>(/public/MomentCollection)!

        // deposit the NFT in the receivers collection
        receiverRef.deposit(token: <-self.transferToken)
    }
}