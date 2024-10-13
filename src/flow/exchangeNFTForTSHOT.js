export const exchangeNFTForTSHOT = `
  import TopShotExchange from 0x332ffc0ae9bba9c1
  import NonFungibleToken from 0x631e88ae7f1d7c20
  import TopShot from 0x332ffc0ae9bba9c1
  import FungibleToken from 0x9a0766d93b6608b7
  import TSHOT from 0x332ffc0ae9bba9c1

  transaction(nftIDs: [UInt64]) {

    let nfts: @[TopShot.NFT]
    let signerAddress: Address

    prepare(signer: auth(Capabilities, Storage) &Account) {
        self.signerAddress = signer.address

        let collectionRef = signer.storage
            .borrow<auth(NonFungibleToken.Withdraw) &TopShot.Collection>(from: /storage/MomentCollection)
            ?? panic("Could not borrow the user's TopShot collection")

        self.nfts <- []

        for nftID in nftIDs {
            let nft <- collectionRef.withdraw(withdrawID: nftID) as! @TopShot.NFT
            self.nfts.append(<-nft)
        }
    }

    execute {
      TopShotExchange.swapNFTForTSHOT(
        nftIDs: <-self.nfts,
        address: self.signerAddress
      )
    }
  }
`;
