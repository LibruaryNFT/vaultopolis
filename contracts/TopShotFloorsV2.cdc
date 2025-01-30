// Contract
import "FungibleToken"
import "NonFungibleToken"
import "TopShot"
import "TopShotTiers"
import "TopShotShardedCollectionV2"
import "NFTStorefrontV2"

access(all) contract TopShotFloorsV2 {
   access(all) let flowVaultPath: StoragePath
   access(all) let nftCollectionPath: StoragePath
   access(all) let storefrontPath: StoragePath
   
   access(contract) var flowPerNFT: UFix64
   access(contract) var commissionPercent: UFix64
   access(contract) var commissionReceiver: Address

   access(all) event ContractInitialized()
   access(all) event NFTsExchanged(address: Address, numberOfNFTs: Int, totalFlowAmount: UFix64)
   access(all) event FlowPerNFTUpdated(newAmount: UFix64)
   access(all) event CommissionConfigUpdated(commissionPercent: UFix64, commissionReceiver: Address)

   access(all) entitlement AdminEntitlement

   access(all) fun getFlowPerNFT(): UFix64 {
       return self.flowPerNFT
   }

   access(all) fun getCommissionConfig(): {String: AnyStruct} {
       return {
           "commissionPercent": self.commissionPercent,
           "commissionReceiver": self.commissionReceiver
       }
   }

   access(all) fun validateNFT(nft: &TopShot.NFT, ftType: String): Bool {
       let nftTier = TopShotTiers.getTier(nft: nft)
       let nftTierStr = TopShotTiers.tierToString(tier: nftTier!)
       return ftType == "TSHOT" && nftTierStr == "common"
   }

   access(all) resource Admin {
       access(AdminEntitlement) fun updateFlowPerNFT(newAmount: UFix64) {
           TopShotFloorsV2.flowPerNFT = newAmount
           emit TopShotFloorsV2.FlowPerNFTUpdated(newAmount: newAmount)
       }

       access(AdminEntitlement) fun updateCommissionConfig(commissionPercent: UFix64, commissionReceiver: Address) {
           TopShotFloorsV2.commissionPercent = commissionPercent
           TopShotFloorsV2.commissionReceiver = commissionReceiver
           emit TopShotFloorsV2.CommissionConfigUpdated(
               commissionPercent: commissionPercent,
               commissionReceiver: commissionReceiver
           )
       }
   }

  access(all) fun exchangeNFTsForFlow(
    nftIDs: [UInt64],
    nftProviderCap: Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>,
    acct: auth(Storage, Capabilities) &Account
) {
    pre {
        nftIDs.length > 0: "Cannot swap! No NFTs provided."
    }

    let storefront = acct.storage.borrow<auth(NFTStorefrontV2.CreateListing) &NFTStorefrontV2.Storefront>(
            from: NFTStorefrontV2.StorefrontStoragePath
        ) ?? panic("Missing Storefront")

    for nftID in nftIDs {
        let listingResourceID = storefront.createListing(
            nftProviderCapability: nftProviderCap,
            nftType: Type<@TopShot.NFT>(),
            nftID: nftID,
            salePaymentVaultType: Type<@{FungibleToken.Vault}>(),
            saleCuts: [
                NFTStorefrontV2.SaleCut(
                    receiver: acct.capabilities
                        .get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)!,
                    amount: self.flowPerNFT
                )
            ],
            marketplacesCapability: nil,
            customID: nil,
            commissionAmount: 0.0,
            expiry: UInt64(getCurrentBlock().timestamp) + UInt64(86400)
        )
    }

    emit NFTsExchanged(
        address: acct.address,
        numberOfNFTs: nftIDs.length,
        totalFlowAmount: self.flowPerNFT * UFix64(nftIDs.length) 
    )
}

   init() {
       self.flowVaultPath = /storage/flowTokenVault
       self.nftCollectionPath = /storage/ShardedMomentCollection
       self.storefrontPath = NFTStorefrontV2.StorefrontStoragePath
       self.flowPerNFT = 0.5
       self.commissionPercent = 0.0
       self.commissionReceiver = 0x68b53c4a123f2baf

       self.account.storage.save(<-create Admin(), to: /storage/TopShotFloorsV2Admin)

       if self.account.storage.borrow<&NFTStorefrontV2.Storefront>(from: self.storefrontPath) == nil {
           self.account.storage.save(<-NFTStorefrontV2.createStorefront(), to: self.storefrontPath)
       }

       emit FlowPerNFTUpdated(newAmount: self.flowPerNFT)
       emit ContractInitialized()
   }
}

