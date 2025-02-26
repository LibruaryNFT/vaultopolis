// flow/batchTransfer_child.js
export const batchTransfer_child = `

import NonFungibleToken from 0x1d7e57aa55817448
import TopShot from 0x0b2a3299cc857e29
import HybridCustody from 0xd8a7e05a7ac670c0

// Transfers multiple TopShot NFTs from a HybridCustody child account
// to a recipient's TopShot collection, using the same "Provider" approach
// from exchangeNFTForFLOW_child.
//
// childAddress: the child's address
// recipient: the Flow address receiving the NFTs
// momentIDs: array of NFT IDs to transfer
transaction(childAddress: Address, recipient: Address, momentIDs: [UInt64]) {

    // We store the withdrawn NFTs here
    let nfts: @[TopShot.NFT]
    let signerAddress: Address
    let provider: auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}

    prepare(signer: auth(Storage, Capabilities) &Account) {
        // 1) Store the signer's (parent) address for reference
        self.signerAddress = signer.address

        // 2) Borrow the parent's HybridCustody.Manager
        let managerRef = signer.storage
            .borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(
                from: HybridCustody.ManagerStoragePath
            )
            ?? panic("Could not borrow HybridCustody.Manager from parent storage")

        // 3) Borrow the child account from the manager
        let childAccount = managerRef.borrowAccount(addr: childAddress)
            ?? panic("Parent does not have access to specified child account")

        // 4) Define the capability type we need: a Provider for NonFungibleToken
        let capType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()

        // 5) Get the child's controller ID for the TopShot collection
        let controllerID = childAccount.getControllerIDForType(
            type: capType,
            forPath: /storage/MomentCollection
        ) ?? panic("Controller ID for child's TopShot collection not found")

        // 6) Get the child's capability
        let cap = childAccount.getCapability(
            controllerID: controllerID,
            type: capType
        ) ?? panic("Could not get capability for the child's TopShot collection")

        let providerCap = cap as! Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>
        assert(providerCap.check(), message: "Invalid child provider capability")

        // 7) Borrow the Provider reference
        self.provider = providerCap.borrow()!

        // 8) Withdraw each NFT by ID and store in an array
        self.nfts <- []
        for nftID in momentIDs {
            let nft <- self.provider.withdraw(withdrawID: nftID) as! @TopShot.NFT
            self.nfts.append(<-nft)
        }
    }

    execute {
        // 9) Get the recipient's public account
        let recipientAcct = getAccount(recipient)

        // 10) Borrow the recipient’s TopShot.Collection (Cadence 1.0 style)
        let receiverRef = recipientAcct.capabilities
            .borrow<&TopShot.Collection>(/public/MomentCollection)
            ?? panic("Cannot borrow the recipient's TopShot.Collection reference")

        // 11) Deposit each NFT individually
        while self.nfts.length > 0 {
            let nft <- self.nfts.removeFirst()
            receiverRef.deposit(token: <-nft)
        }

        // Destroy the (empty) array
        destroy self.nfts
    }
}


`;
