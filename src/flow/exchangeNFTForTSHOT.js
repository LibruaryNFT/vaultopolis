export const exchangeNFTForTSHOT = `

import TSHOT from 0x05b67ba314000b2d
import TSHOTExchange from 0x05b67ba314000b2d
import NonFungibleToken from 0x1d7e57aa55817448
import TopShot from 0x0b2a3299cc857e29
import FungibleToken from 0xf233dcee88fe0abe

transaction(nftIDs: [UInt64]) {

        // --------------------------------------------------
        // Enforce maximum of 200 NFTs
        // --------------------------------------------------
        pre {
            nftIDs.length <= 200: "Cannot swap more than 200 NFTs at once."
        }

    let nfts: @[TopShot.NFT]
    let signerAddress: Address

    prepare(signer: auth(Capabilities, Storage) &Account) {
        // Store the signer's address for use in the execute phase
        self.signerAddress = signer.address

        // Check if the user already has a TSHOT Vault set up in their storage
        let tokenVaultPath = /storage/TSHOTTokenVault
        let tokenReceiverPath = /public/TSHOTTokenReceiver
        let tokenBalancePath = /public/TSHOTTokenBalance

        if signer.storage.borrow<&TSHOT.Vault>(from: tokenVaultPath) == nil {
            // If the Vault does not exist, create a new Vault and set up the public capabilities
            let vault <- TSHOT.createEmptyVault(vaultType: Type<@TSHOT.Vault>())

            // Save the Vault in the user's storage
            signer.storage.save(<-vault, to: tokenVaultPath)

            // Create a public capability for the stored Vault exposing the deposit method
            let receiverCap = signer.capabilities.storage.issue<&{FungibleToken.Receiver}>(tokenVaultPath)
            signer.capabilities.publish(receiverCap, at: tokenReceiverPath)

            // Create a public capability for the stored Vault exposing the balance field
            let balanceCap = signer.capabilities.storage.issue<&{FungibleToken.Balance}>(tokenVaultPath)
            signer.capabilities.publish(balanceCap, at: tokenBalancePath)

            log("Vault setup complete for the user.")
        } else {
            log("Vault already exists for the user.")
        }

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
        // Call the swapNFTsForTSHOT function in the MomentSwap contract
        TSHOTExchange.swapNFTsForTSHOT(
            nftIDs: <-self.nfts,
            address: self.signerAddress
        )
    }

}

`;
