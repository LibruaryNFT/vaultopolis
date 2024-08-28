import "FungibleToken"
import "NonFungibleToken"
import "TopShot"

access(all) contract TopShotFloors {

    // Storage path for the admin's Flow token vault
    access(all) let flowVaultPath: StoragePath

    // Storage path for the admin's TopShot NFT collection
    access(all) let nftCollectionPath: StoragePath

    // The amount of Flow tokens paid for a single TopShot moment
    access(account) var flowPerNFT: UFix64

    // Event emitted when NFTs are deposited
    access(all) event NFTsDeposited(ids: [UInt64], from: Address, totalAmount: UFix64)

    // Event emitted when the Flow per NFT price is updated
    access(all) event FlowPerNFTUpdated(newAmount: UFix64)

    // Function to deposit multiple NFTs in exchange for Flow tokens
    access(all) fun depositNFTsForFlow(
        ownerCollection: Capability<auth(NonFungibleToken.Withdraw) &TopShot.Collection>,
        nftIDs: [UInt64],
        receiverCap: Capability<&{FungibleToken.Receiver}>
    ) {
        // Borrow the user's TopShot Collection reference using the provided capability
        let collectionRef = ownerCollection
            .borrow()
            ?? panic("Could not borrow reference to user's TopShot Collection")

        // Borrow the admin's TopShot Collection
        let adminCollection = self.account
            .storage
            .borrow<&{NonFungibleToken.Receiver}>(from: self.nftCollectionPath)
            ?? panic("Could not borrow admin's TopShot Collection")

        // Calculate the total amount of Flow tokens to be sent
        let totalFlowAmount = self.flowPerNFT * UFix64(nftIDs.length)

        // Borrow the admin's Flow Vault
        let adminFlowVault = self.account
            .storage
            .borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(from: self.flowVaultPath)
            ?? panic("Could not borrow admin's Flow Vault")

        // Withdraw the Flow tokens from the admin's vault
        let flowTokens <- adminFlowVault.withdraw(amount: totalFlowAmount)

        // Deposit each NFT into the admin's collection
        for nftID in nftIDs {
            let nft <- collectionRef.withdraw(withdrawID: nftID) as! @TopShot.NFT
            adminCollection.deposit(token: <-nft)
        }

        // Deposit Flow tokens into the user's account
        let receiverRef = receiverCap.borrow()
            ?? panic("Could not borrow reference to user's Flow token receiver")
        receiverRef.deposit(from: <-flowTokens)

        // Emit event for NFT deposit
        emit NFTsDeposited(ids: nftIDs, from: self.account.address, totalAmount: totalFlowAmount)
    }

    // Function to update the amount of Flow tokens paid per NFT
    access(contract) fun updateFlowPerNFT(newAmount: UFix64) {
        self.flowPerNFT = newAmount
        emit FlowPerNFTUpdated(newAmount: newAmount)
    }

    init() {
        // Set the storage path for the admin's Flow token vault
        self.flowVaultPath = /storage/flowTokenVault

        // Set the storage path for the admin's TopShot NFT collection
        self.nftCollectionPath = /storage/MomentCollection

        // Initialize the Flow per NFT amount
        self.flowPerNFT = 0.5

        emit FlowPerNFTUpdated(newAmount: self.flowPerNFT)
    }
}
