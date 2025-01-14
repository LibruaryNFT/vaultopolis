import "FungibleToken"
import "NonFungibleToken"
import "TopShot"
import "TopShotTiers"
import "TopShotShardedCollectionV2"

access(all) contract TopShotFloors {

    // Storage paths
    access(all) let flowVaultPath: StoragePath
    access(all) let nftCollectionPath: StoragePath

    // The amount of Flow tokens paid for a single TopShot moment
    access(contract) var flowPerNFT: UFix64

    // Define Admin Entitlement
    access(all) entitlement AdminEntitlement

    // Events
    access(all) event ContractInitialized()
    access(all) event NFTsExchanged(address: Address, numberOfNFTs: Int, totalFlowAmount: UFix64)
    access(all) event FlowPerNFTUpdated(newAmount: UFix64)

    // Getter function for flowPerNFT
    access(all) fun getFlowPerNFT(): UFix64 {
        return self.flowPerNFT
    }

     // Function to check if an NFT is a common tier moment
    access(all) fun validateNFT(nft: &TopShot.NFT, ftType: String): Bool {
        // Retrieve the tier of the given NFT using the TopShotTiers contract
        let nftTier = TopShotTiers.getTier(nft: nft)
        let nftTierStr = TopShotTiers.tierToString(tier: nftTier!)

        // Define the valid tier for each FT type
        if ftType == "TSHOT" {
            return nftTierStr == "common"
        } else {
            panic("Invalid FT type provided.")
        }
    }

    // Admin resource definition with entitlement applied to the function
    access(all) resource Admin {

        // Function to update the Flow per NFT value with entitlement
        access(AdminEntitlement) fun updateFlowPerNFT(newAmount: UFix64) {
            // Update the contract's `flowPerNFT` variable directly
            TopShotFloors.flowPerNFT = newAmount
            emit TopShotFloors.FlowPerNFTUpdated(newAmount: newAmount)
        }
    }

    // Function to deposit multiple NFTs in exchange for Flow tokens
    access(all) fun exchangeNFTsForFlow(
        nfts: @[TopShot.NFT],
        address: Address
    ) {

        pre {
    nfts.length > 0: "Cannot swap! No NFTs provided."
        }

        // Borrow the admin's TopShot Collection
        //let adminCollection = self.account
         //   .storage
         //   .borrow<&TopShot.Collection>(from: self.nftCollectionPath)
          //  ?? panic("Could not borrow admin's TopShot Collection")

         // Borrow the admin's TopShot Collection
        let adminCollection = self.account
                .storage
                .borrow<&TopShotShardedCollectionV2.ShardedCollection>(from: self.nftCollectionPath)
                ?? panic("Could not borrow admin's TopShot Collection")

        // Store the number of NFTs before they are moved
        let numberOfNFTs = nfts.length

        // Deposit all NFTs into the admin's collection
        while nfts.length > 0 {
            let nft <- nfts.removeFirst()

             // Validate the NFT tier for TSHOT (common-tier moments)
            if !self.validateNFT(nft: &nft as &TopShot.NFT, ftType: "TSHOT") {
                panic("NFT tier is not valid for TSHOT. Only common-tier moments are allowed.")
            }

            adminCollection.deposit(token: <-nft)
        }

        // Destroy the empty resource array to prevent resource leakage
        destroy nfts

        // Borrow the admin's Flow Vault to withdraw tokens
        let adminFlowVault = self.account
            .storage
            .borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(from: self.flowVaultPath)
            ?? panic("Could not borrow admin's Flow Vault")

        // Calculate the total amount of Flow tokens to transfer
        let totalFlowAmount = self.flowPerNFT * UFix64(numberOfNFTs)

        // Withdraw the Flow tokens from the admin's vault
        let flowTokens <- adminFlowVault.withdraw(amount: totalFlowAmount)

        // Get the recipient's account and borrow their Flow token receiver
        let recipientAccount = getAccount(address)
        let receiver = recipientAccount
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            .borrow()
            ?? panic("Could not borrow the user's Flow token receiver capability")

        // Deposit the Flow tokens into the recipient's account
        receiver.deposit(from: <-flowTokens)

        // Emit an event for logging purposes
        emit NFTsExchanged(address: address, numberOfNFTs: numberOfNFTs, totalFlowAmount: totalFlowAmount)
    }

    // Contract initializer
    init() {
        self.flowVaultPath = /storage/flowTokenVault
        self.nftCollectionPath = /storage/ShardedMomentCollection
        self.flowPerNFT = 0.5

         // Initialize and save the Admin resource in storage
        self.account.storage.save<@Admin>(<-create Admin(), to: /storage/TopShotFloorsAdmin)

        emit FlowPerNFTUpdated(newAmount: self.flowPerNFT)
        emit ContractInitialized()
    }
}
