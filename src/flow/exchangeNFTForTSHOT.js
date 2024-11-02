export const exchangeNFTForTSHOT = `
  import MomentSwapTSHOT from 0x332ffc0ae9bba9c1
  import NonFungibleToken from 0x631e88ae7f1d7c20
  import TopShot from 0x332ffc0ae9bba9c1
  import FungibleToken from 0x9a0766d93b6608b7
  import TSHOT from 0x332ffc0ae9bba9c1

 transaction(nftIDs: [UInt64]) {

    let nfts: @[TopShot.NFT]
    let signerAddress: Address

    prepare(signer: auth(Capabilities, Storage) &Account) {
        // Store the signer's address for use in the execute phase
        self.signerAddress = signer.address

        // Borrow the user's TopShot collection from their storage using the new Cadence 1.0 syntax
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
        // Call the swapNFTForTSHOT function in the MomentSwap contract
        MomentSwapTSHOT.swapNFTsForTSHOT(
            nftIDs: <-self.nfts,
            address: self.signerAddress
        )
    }

}
`;
