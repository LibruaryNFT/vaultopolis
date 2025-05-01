export const exchangeNFTForTSHOT = `

import TSHOT from 0x05b67ba314000b2d
import TSHOTExchange from 0x05b67ba314000b2d
import NonFungibleToken from 0x1d7e57aa55817448
import TopShot from 0x0b2a3299cc857e29
import FungibleToken from 0xf233dcee88fe0abe

transaction(nftIDs: [UInt64]) {

    // resource array that will hold the withdrawn Moments
    let nfts: @[TopShot.NFT]
    let signerAddress: Address

    prepare(signer: auth(Storage, Capabilities) &Account) {
        pre {
            nftIDs.length > 0      : "No NFT IDs supplied."
            nftIDs.length <= 200   : "Cannot swap more than 200 NFTs at once."
        }

        self.signerAddress = signer.address
        self.nfts <- [] as @[TopShot.NFT]

        /* ── Ensure the signer has a TSHOT vault set up ── */
        let vaultPath      = /storage/TSHOTTokenVault
        let receiverPub    = /public/TSHOTTokenReceiver
        let balancePub     = /public/TSHOTTokenBalance

        if signer.storage.borrow<&TSHOT.Vault>(from: vaultPath) == nil {
            let empty <- TSHOT.createEmptyVault(vaultType: Type<@TSHOT.Vault>())
            signer.storage.save(<-empty, to: vaultPath)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&{FungibleToken.Receiver}>(vaultPath),
                at: receiverPub
            )
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&{FungibleToken.Balance}>(vaultPath),
                at: balancePub
            )
        }

        /* ── Withdraw the requested NFTs ── */
        let collection = signer.storage
            .borrow<auth(NonFungibleToken.Withdraw) &TopShot.Collection>(
                from: /storage/MomentCollection
            ) ?? panic("Signer has no MomentCollection")

        for id in nftIDs {
            let nft <- collection.withdraw(withdrawID: id) as! @TopShot.NFT
            self.nfts.append(<-nft)
        }
    }

    execute {
        TSHOTExchange.swapNFTsForTSHOT(
            payer:     self.signerAddress,
            nftIDs:    <- self.nfts,
            recipient: self.signerAddress
        )
    }
}

`;
