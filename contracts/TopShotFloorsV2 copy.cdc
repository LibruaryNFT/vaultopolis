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
       nfts: @[TopShot.NFT],
       nftProviderCap: Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>,
       address: Address
   ) {
       pre {
           nfts.length > 0: "Cannot swap! No NFTs provided."
       }

       let adminCollection = self.account
           .storage
           .borrow<&TopShotShardedCollectionV2.ShardedCollection>(from: self.nftCollectionPath)
           ?? panic("Could not borrow admin's TopShot Collection")

       let storefront = self.account
           .storage
           .borrow<auth(NFTStorefrontV2.CreateListing) &NFTStorefrontV2.Storefront>(from: self.storefrontPath)
           ?? panic("Could not borrow admin's NFTStorefront")

       let numberOfNFTs = nfts.length
       let totalFlowAmount = self.flowPerNFT * UFix64(numberOfNFTs)

       while nfts.length > 0 {
           let nft <- nfts.removeFirst()
           
           if !self.validateNFT(nft: &nft as &TopShot.NFT, ftType: "TSHOT") {
               panic("NFT tier is not valid for TSHOT")
           }

           let receiverCap = self.account.capabilities
               .get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)

           let marketplaceCap = getAccount(self.commissionReceiver)
               .capabilities
               .get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)

           let commissionAmount = self.flowPerNFT * (self.commissionPercent / 100.0)

           // Create listing before handling the NFT
           let listingResourceID = storefront.createListing(
               nftProviderCapability: nftProviderCap,
               nftType: Type<@TopShot.NFT>(),
               nftID: nft.id,
               salePaymentVaultType: Type<@{FungibleToken.Vault}>(),
               saleCuts: [
                   NFTStorefrontV2.SaleCut(
                       receiver: receiverCap!,
                       amount: self.flowPerNFT
                   )
               ],
               marketplacesCapability: [marketplaceCap!],
               customID: nil,
               commissionAmount: commissionAmount,
               expiry: UInt64(getCurrentBlock().timestamp) + UInt64(86400)
           )

           // Then handle the payment and purchase
           let paymentVault <- self.account
               .storage
               .borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(from: self.flowVaultPath)!
               .withdraw(amount: self.flowPerNFT)

           let purchasedNFT <- storefront
               .borrowListing(listingResourceID: listingResourceID)!
               .purchase(
                   payment: <-paymentVault,
                   commissionRecipient: marketplaceCap
               )

           adminCollection.deposit(token: <-nft)
           destroy purchasedNFT
       }

       destroy nfts

       let adminFlowVault = self.account
           .storage
           .borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(from: self.flowVaultPath)
           ?? panic("Could not borrow admin's Flow Vault")

       let flowTokens <- adminFlowVault.withdraw(amount: totalFlowAmount)

       let receiver = getAccount(address)
           .capabilities
           .borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
           ?? panic("Could not borrow Flow token receiver")

       receiver.deposit(from: <-flowTokens)

       emit NFTsExchanged(
           address: address,
           numberOfNFTs: numberOfNFTs,
           totalFlowAmount: totalFlowAmount
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

