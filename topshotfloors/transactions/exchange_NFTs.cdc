import "TopShotFloors"
import "NonFungibleToken"
import "TopShot"

transaction(nftIDs: [UInt64]) {

    let nfts: @[TopShot.NFT]
    let signerAddress: Address

    prepare(signer: auth(Capabilities, Storage) &Account) {
        // Store the signer's address for use in execute phase
        self.signerAddress = signer.address

        // Borrow the user's TopShot collection from their storage
        let collectionRef = signer.storage
            .borrow<auth(NonFungibleToken.Withdraw) &TopShot.Collection>(from: /storage/MomentCollection)
            ?? panic("Could not borrow the user's TopShot collection")

        // Initialize an empty array to store the NFTs
        self.nfts <- []

        // For each ID, withdraw the NFT and append it to the array
        for nftID in nftIDs {
            let nft <- collectionRef.withdraw(withdrawID: nftID) as! @TopShot.NFT
            self.nfts.append(<-nft)
        }
    }

    execute {
        // Call the contract function to exchange the NFTs for Flow tokens
        TopShotFloors.exchangeNFTsForFlow(nfts: <-self.nfts, address: self.signerAddress)
    }
}
