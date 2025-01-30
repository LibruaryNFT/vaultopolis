import "TopShotFloorsV2"
import "NonFungibleToken" 
import "TopShot"
import "NFTStorefrontV2"

transaction(nftIDs: [UInt64]) {
    let signerAddress: Address
    let nftProviderCap: Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>

    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.signerAddress = signer.address

        // Setup Storefront if needed
        if signer.storage.borrow<&NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath) == nil {
            signer.storage.save(<-NFTStorefrontV2.createStorefront(), to: NFTStorefrontV2.StorefrontStoragePath)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&NFTStorefrontV2.Storefront>(NFTStorefrontV2.StorefrontStoragePath),
                at: NFTStorefrontV2.StorefrontPublicPath
            )
        }

        // Verify NFTs exist
        let collection = signer.storage
            .borrow<&TopShot.Collection>(from: /storage/MomentCollection)
            ?? panic("Missing Collection")

        for nftID in nftIDs {
            assert(collection.borrowNFT(nftID) != nil, message: "NFT not found")
        }

        // Get NFT provider capability
        self.nftProviderCap = signer.capabilities.storage.issue<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
            /storage/MomentCollection
        )
    }

    execute {
        TopShotFloorsV2.exchangeNFTsForFlow(
            nftIDs: nftIDs,
            nftProviderCap: self.nftProviderCap,
            address: self.signerAddress
        )
    }
}