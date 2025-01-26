import "TopShot"
import "FungibleToken"
import "NonFungibleToken"
import "NFTStorefrontV2"

transaction(saleItemID: UInt64, salePrice: UFix64) {
    let tokenReceiver: Capability<&{FungibleToken.Receiver}>
    let nftProvider: Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>
    let storefront: auth(NFTStorefrontV2.CreateListing) &NFTStorefrontV2.Storefront
    
    prepare(acct: auth(Storage, Capabilities) &Account) {
        // Get Flow Token receiver capability
        self.tokenReceiver = acct.capabilities
            .get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)

        // Get NFT provider capability
        self.nftProvider = acct.capabilities.storage.issue<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
            /storage/MomentCollection
        )

        // Get storefront reference
        self.storefront = acct.storage.borrow<auth(NFTStorefrontV2.CreateListing) &NFTStorefrontV2.Storefront>(
            from: NFTStorefrontV2.StorefrontStoragePath
        ) ?? panic("Missing Storefront")

        // Verify NFT exists in collection
        let collection = acct.storage.borrow<&TopShot.Collection>(
            from: /storage/MomentCollection
        ) ?? panic("Missing Collection")
        
        assert(collection.borrowNFT(saleItemID) != nil, message: "NFT not found")
    }

    execute {
        let saleCut = NFTStorefrontV2.SaleCut(
            receiver: self.tokenReceiver,
            amount: salePrice
        )

        let listingResourceID = self.storefront.createListing(
            nftProviderCapability: self.nftProvider,
            nftType: Type<@TopShot.NFT>(),
            nftID: saleItemID,
            salePaymentVaultType: Type<@{FungibleToken.Vault}>(),
            saleCuts: [saleCut],
            marketplacesCapability: nil,
            customID: nil,
            commissionAmount: 0.0,
            expiry: UInt64(getCurrentBlock().timestamp) + UInt64(86400)
        )
    }
}