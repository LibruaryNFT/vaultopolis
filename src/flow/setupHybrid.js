export const setupHybrid = `

  import TopShot from 0x332ffc0ae9bba9c1
import NonFungibleToken from 0x631e88ae7f1d7c20

transaction {

    prepare(acct: auth(Storage, Capabilities) &Account) {
        // Check if the collection exists, create if it doesn't
        if acct.storage.borrow<&TopShot.Collection>(from: /storage/MomentCollection) == nil {
            let collection <- TopShot.createEmptyCollection(nftType: Type<@TopShot.NFT>()) as! @TopShot.Collection
            acct.storage.save(<-collection, to: /storage/MomentCollection)
        }

        // Unpublish any existing public capability
        acct.capabilities.unpublish(/public/MomentCollection)

        // Publish a capability with the expected type
        acct.capabilities.publish(
            acct.capabilities.storage.issue<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(/storage/MomentCollection),
            at: /public/MomentCollection
        )
    }
}

`;
