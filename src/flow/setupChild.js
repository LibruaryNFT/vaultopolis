export const setupChild = `

import MetadataViews from 0x631e88ae7f1d7c20
import TopShot from 0x332ffc0ae9bba9c1
import NonFungibleToken from 0x631e88ae7f1d7c20
import TSHOT from 0x332ffc0ae9bba9c1

transaction {
    prepare(acct: auth(BorrowValue, SaveValue, StorageCapabilities, PublishCapability, UnpublishCapability) &Account) {
        let d = TopShot.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>())! as! MetadataViews.NFTCollectionData

        if acct.storage.borrow<&TopShot.Collection>(from: d.storagePath) == nil {
            acct.storage.save(<- TopShot.createEmptyCollection(nftType: Type<@TopShot.NFT>()), to: d.storagePath)
        }

        acct.capabilities.unpublish(d.publicPath)
        let cap = acct.capabilities.storage.issue<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Collection}>(d.storagePath)
        acct.capabilities.publish(cap, at: d.publicPath)

        // Issuing authorized Provider Capability so parent account can access the Collection via HybridCustody link
        acct.capabilities.storage.issue<auth(NonFungibleToken.Withdraw) &{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Provider}>(d.storagePath)
    }
}
           
    `;
