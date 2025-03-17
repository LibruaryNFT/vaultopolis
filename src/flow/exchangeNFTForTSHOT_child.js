export const exchangeNFTForTSHOT_child = `

import TSHOT from 0x05b67ba314000b2d
import TSHOTExchange from 0x05b67ba314000b2d
import NonFungibleToken from 0x1d7e57aa55817448
import TopShot from 0x0b2a3299cc857e29
import FungibleToken from 0xf233dcee88fe0abe
import HybridCustody from 0xd8a7e05a7ac670c0

transaction(childAddress: Address, nftIDs: [UInt64]) {

        // --------------------------------------------------
        // Enforce maximum of 200 NFTs
        // --------------------------------------------------
        pre {
            nftIDs.length <= 200: "Cannot swap more than 200 NFTs at once."
        }

    let nfts: @[TopShot.NFT]
    let signerAddress: Address
    let provider: auth(NonFungibleToken.Withdraw) & {NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}

    prepare(signer: auth(Storage, Capabilities) & Account) {
        // Store the signer's (parent's) address for use in the execute phase
        self.signerAddress = signer.address

        // --- Setup TSHOT Vault on the parent (signer) if not already set up ---
        let tokenVaultPath = /storage/TSHOTTokenVault
        let tokenReceiverPath = /public/TSHOTTokenReceiver
        let tokenBalancePath = /public/TSHOTTokenBalance

        if signer.storage.borrow<&TSHOT.Vault>(from: tokenVaultPath) == nil {
            // Create a new empty Vault for TSHOT
            let vault <- TSHOT.createEmptyVault(vaultType: Type<@TSHOT.Vault>())
            // Save the Vault in the parent's storage
            signer.storage.save(<-vault, to: tokenVaultPath)
            // Publish the public capability for the receiver
            let receiverCap = signer.capabilities.storage.issue<&{FungibleToken.Receiver}>(tokenVaultPath)
            signer.capabilities.publish(receiverCap, at: tokenReceiverPath)
            // Publish the public capability for the balance
            let balanceCap = signer.capabilities.storage.issue<&{FungibleToken.Balance}>(tokenVaultPath)
            signer.capabilities.publish(balanceCap, at: tokenBalancePath)
            log("Parent account vault setup complete.")
        } else {
            log("Parent account vault already exists.")
        }
        // ---------------------------------------------------------------------

        // Get a reference to the signer's HybridCustody.Manager from storage
        let managerRef = signer.storage.borrow<auth(HybridCustody.Manage) & HybridCustody.Manager>(
            from: HybridCustody.ManagerStoragePath
        ) ?? panic("Could not borrow reference to HybridCustody.Manager!")

        // Borrow a reference to the specified child account
        let childAccount = managerRef.borrowAccount(addr: childAddress)
            ?? panic("Signer does not have access to specified child account")

        let capType = Type<auth(NonFungibleToken.Withdraw) & {NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>()

        // Determine the controller ID for the TopShot collection capability in the child account
        let controllerID = childAccount.getControllerIDForType(
            type: capType,
            forPath: /storage/MomentCollection
        ) ?? panic("Controller ID for TopShot collection not found")

        // Get the Capability for the child's TopShot collection
        let cap = childAccount.getCapability(
            controllerID: controllerID,
            type: capType
        ) ?? panic("Could not get capability for the child's TopShot collection")

        let providerCap = cap as! Capability<auth(NonFungibleToken.Withdraw) & {NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>
        assert(providerCap.check(), message: "invalid provider capability")

        self.provider = providerCap.borrow()!

        // Initialize an empty array to store the NFTs
        self.nfts <- []

        // For each ID, withdraw the NFT and append it to the array
        for nftID in nftIDs {
            let nft <- self.provider.withdraw(withdrawID: nftID) as! @TopShot.NFT
            self.nfts.append(<-nft)
        }
    }

    execute {
        // Call the swapNFTsForTSHOT function in the TSHOTExchange contract,
        // passing the withdrawn NFTs and the parent's address.
        TSHOTExchange.swapNFTsForTSHOT(
            nftIDs: <-self.nfts,
            address: self.signerAddress
        )
    }
}
`;
