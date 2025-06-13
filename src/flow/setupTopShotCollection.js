export const setupTopShotCollection = `

// Flow Wallet - mainnet Script enableNFTStorage - v2.68
// iOS-2.4.8-120

import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448
import TopShot from 0x0b2a3299cc857e29

transaction {
    prepare(signer: auth(Capabilities, SaveValue) &Account) {
        if signer.capabilities.borrow<&TopShot.Collection>(/public/MomentCollection) == nil {
            let collection <- TopShot.createEmptyCollection(nftType: Type<@TopShot.NFT>())
            signer.storage.save(<-collection, to: /storage/MomentCollection)
        }
        
        if (signer.capabilities.borrow<&TopShot.Collection>(/public/MomentCollection) == nil) {
            signer.capabilities.unpublish(/public/MomentCollection)
            let cap = signer.capabilities.storage.issue<&TopShot.Collection>(/storage/MomentCollection)
            
            signer.capabilities.publish(cap, at: /public/MomentCollection)
        }
    }
}
`;
