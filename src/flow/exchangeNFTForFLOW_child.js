export const exchangeNFTForFLOW_child = `

import TopShotFloors from 0x68b53c4a123f2baf
import NonFungibleToken from 0x631e88ae7f1d7c20
import TopShot from 0x332ffc0ae9bba9c1
import FungibleToken from 0x9a0766d93b6608b7
import HybridCustody from 0x294e44e1ec6993c6

transaction(childAddress: Address, nftIDs: [UInt64]) {

    // This will hold the NFTs we withdraw from the child's collection
    let nfts: @[TopShot.NFT]

    // We'll store the parent (signer) address for use in execute
    let signerAddress: Address

    // This is a reference to the child's NFT provider capability
    let provider: auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}

    prepare(signer: auth(Account)) {
        // Store the signer's (parent's) address
        self.signerAddress = signer.address

        // Borrow a reference to the signer's HybridCustody.Manager from storage
        let managerRef = signer
            .borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("Could not borrow reference to HybridCustody.Manager from parent account!")

        // Borrow the specified child account using HybridCustody
        let childAccount = managerRef.borrowAccount(addr: childAddress)
            ?? panic("Signer does not have access to specified child account.")

        // We'll look up the child's TopShot collection capability.
        // Adjust the Type and StoragePath if your child uses a different path.
        let capType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()

        let controllerID = childAccount.getControllerIDForType(
            type: capType,
            forPath: /storage/MomentCollection
        ) ?? panic("Controller ID for the child's TopShot collection not found.")

        let cap = childAccount.getCapability(
            controllerID: controllerID,
            type: capType
        ) ?? panic("Could not get capability for the child's TopShot collection.")

        let providerCap = cap as! Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>
        assert(providerCap.check(), message: "Invalid provider capability for the child's TopShot collection.")

        // Borrow the actual provider from the capability
        self.provider = providerCap.borrow()
            ?? panic("Failed to borrow the child's NFT provider reference.")

        // Prepare an empty array for the NFTs we withdraw
        self.nfts <- []

        // Withdraw each specified NFT from the child's collection
        for nftID in nftIDs {
            let nft <- self.provider.withdraw(withdrawID: nftID) as! @TopShot.NFT
            self.nfts.append(<-nft)
        }
    }

    execute {
        // Call the contract function to exchange these NFTs for FLOW
        // Make sure your 'exchangeNFTsForFlow' function is correctly implemented 
        // in TopShotFloors
        TopShotFloors.exchangeNFTsForFlow(
            nfts: <-self.nfts, 
            address: self.signerAddress
        )
    }
}

`;
