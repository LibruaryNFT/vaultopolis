export const exchangeNFTForTSHOT_child = `
import MomentSwapTSHOT from 0x332ffc0ae9bba9c1
import NonFungibleToken from 0x631e88ae7f1d7c20
import TopShot from 0x332ffc0ae9bba9c1
import FungibleToken from 0x9a0766d93b6608b7
import TSHOT from 0x332ffc0ae9bba9c1
import HybridCustody from 0x294e44e1ec6993c6

transaction(childAddress: Address, nftIDs: [UInt64]) {

    let nfts: @[TopShot.NFT]
    let signerAddress: Address
    let provider: auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}

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

        let capType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>()

        // Determine the controller ID for the TopShot collection capability
        let controllerID = childAccount.getControllerIDForType(
            type: capType,
            forPath: /storage/MomentCollection
        ) ?? panic("Controller ID for TopShot collection not found")

        // Get the Capability for the child's TopShot collection
        let cap = childAccount.getCapability(
            controllerID: controllerID,
            type: capType
        ) ?? panic("Could not get capability for the child's TopShot collection")

        let providerCap = cap as! Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>

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
        // Call the swapNFTForTSHOT function in the MomentSwap contract
        MomentSwapTSHOT.swapNFTsForTSHOT(
            nftIDs: <-self.nfts,
            address: self.signerAddress
        )
    }
}

`;
