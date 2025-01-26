// Transaction
import "TopShotFloorsV2"
import "NonFungibleToken" 
import "TopShot"
import "NFTStorefrontV2"

transaction(nftIDs: [UInt64]) {
   let nfts: @[TopShot.NFT]
   let signerAddress: Address
   let nftProviderCap: Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>

   prepare(signer: auth(Storage, Capabilities) &Account) {
       self.signerAddress = signer.address

       // Get provider capability
       self.nftProviderCap = signer.capabilities.storage.issue<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
           /storage/MomentCollection
       )

       // Verify NFTs exist
       let collection = signer.storage
           .borrow<&TopShot.Collection>(from: /storage/MomentCollection)
           ?? panic("Could not borrow collection")

       for nftID in nftIDs {
           let nft = collection.borrowNFT(nftID) 
               ?? panic("NFT not found in collection: ".concat(nftID.toString()))
       }

       // Prepare NFTs array
       self.nfts <- []
       let collectionRef = signer.storage
           .borrow<auth(NonFungibleToken.Withdraw) &TopShot.Collection>(from: /storage/MomentCollection)
           ?? panic("Could not borrow collection")

       for nftID in nftIDs {
           let nft <- collectionRef.withdraw(withdrawID: nftID) as! @TopShot.NFT
           self.nfts.append(<-nft)
       }
   }

   execute {
       TopShotFloorsV2.exchangeNFTsForFlow(
           nfts: <-self.nfts,
           nftProviderCap: self.nftProviderCap,
           address: self.signerAddress
       )
   }
}