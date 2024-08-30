import "FungibleToken"
import "NonFungibleToken"
import "TopShot"

access(all) contract TopShotFloors {

    // Storage paths
    access(all) let flowVaultPath: StoragePath
    access(all) let nftCollectionPath: StoragePath

    // The amount of Flow tokens paid for a single TopShot moment
    access(account) var flowPerNFT: UFix64

    // Events
    access(all) event NFTsDeposited(ids: [UInt64], from: Address, totalAmount: UFix64)
    access(all) event FlowPerNFTUpdated(newAmount: UFix64)
    access(all) event ContractInitialized()

    // Function to deposit multiple NFTs in exchange for Flow tokens
    access(all) fun depositNFTsForFlow(
        ownerCollection: Capability<auth(NonFungibleToken.Withdraw) &TopShot.Collection>,
        nftIDs: [UInt64],
        receiverCap: Capability<&{FungibleToken.Receiver}>
    ) {
        let collectionRef = ownerCollection
            .borrow()
            ?? panic("Could not borrow reference to user's TopShot Collection")

        let adminCollection = self.account
            .storage
            .borrow<&{NonFungibleToken.Receiver}>(from: self.nftCollectionPath)
            ?? panic("Could not borrow admin's TopShot Collection")

        let totalFlowAmount = self.flowPerNFT * UFix64(nftIDs.length)

        let adminFlowVault = self.account
            .storage
            .borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(from: self.flowVaultPath)
            ?? panic("Could not borrow admin's Flow Vault")

        let flowTokens <- adminFlowVault.withdraw(amount: totalFlowAmount)

        for nftID in nftIDs {
            let nft <- collectionRef.withdraw(withdrawID: nftID) as! @TopShot.NFT
            adminCollection.deposit(token: <-nft)
        }

        let receiverRef = receiverCap.borrow()
            ?? panic("Could not borrow reference to user's Flow token receiver")
        receiverRef.deposit(from: <-flowTokens)

        emit NFTsDeposited(ids: nftIDs, from: self.account.address, totalAmount: totalFlowAmount)
    }

    // Contract-level function to update the Flow per NFT value (only callable by the Admin resource)
    access(contract) fun updateFlowPerNFT(newAmount: UFix64) {
        self.flowPerNFT = newAmount
        emit FlowPerNFTUpdated(newAmount: newAmount)
    }

    // Getter function for flowPerNFT
    access(all) fun getFlowPerNFT(): UFix64 {
        return self.flowPerNFT
    }

    // Admin resource definition
    access(all) resource Admin {

        // Function to update the Flow per NFT value
        access(all) fun updateFlowPerNFT(newValue: UFix64) {
            TopShotFloors.updateFlowPerNFT(newAmount: newValue)
        }
    }

    // Contract initializer
    init() {
        self.flowVaultPath = /storage/flowTokenVault
        self.nftCollectionPath = /storage/MomentCollection
        self.flowPerNFT = 0.5

        // Initialize and save the Admin resource in storage
        self.account.storage.save<@Admin>(<-create Admin(), to: /storage/TopShotFloorsAdmin)

        emit FlowPerNFTUpdated(newAmount: self.flowPerNFT)
        emit ContractInitialized()
    }
}
