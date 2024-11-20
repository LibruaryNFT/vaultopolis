import "MomentSwapTSHOT"
import "NonFungibleToken"
import "TopShot"
import "FungibleToken"
import "TSHOT"
import "HybridCustody"

transaction(childAddress: Address, nftIDs: [UInt64]) {

    let nfts: @[TopShot.NFT]
    let signerAddress: Address
    let nftProvider: Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>

    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Store the signer's address for use in the execute phase
        self.signerAddress = signer.address

        // Get a reference to the signer's HybridCustody.Manager from storage with Storage authorization
        let managerRef = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(
            from: HybridCustody.ManagerStoragePath
        ) ?? panic("Could not borrow reference to HybridCustody.Manager!")

        // Borrow a reference to the specified child account
        let childAccount = managerRef.borrowAccount(addr: childAddress)
            ?? panic("Signer does not have access to specified child account")

        // Determine the controller ID for the TopShot collection capability
        let controllerID = childAccount.getControllerIDForType(
            type: Type<&{NonFungibleToken.Provider}>(),
            forPath: /storage/MomentCollection
        ) ?? panic("Controller ID for TopShot collection not found")

        // Get the Capability for the child's TopShot collection
        let providerCap = childAccount.getCapability(
            controllerID: controllerID,
            type: Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()
        ) ?? panic("Could not get capability for the child's TopShot collection")

        self.nftProvider = providerCap as! Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>

        assert(self.nftProvider.check(), message: "invalid provider capability")

        assert(self.nftProvider.borrow() != nil, message: "Missing or mis-typed NFT provider")

        let collection = self.nftProvider.borrow()
        ?? panic("Could not borrow NFT provider capability")

        // Initialize an empty array to store the NFTs
        self.nfts <- []

        // For each ID, withdraw the NFT and append it to the array
        for nftID in nftIDs {
            let nft <- collection.withdraw(withdrawID: nftID) as! @TopShot.NFT
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