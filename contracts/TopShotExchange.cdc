import "FungibleToken"
import "NonFungibleToken"
import "TopShot"
import "TSHOT"
import "TopShotTiers"

access(all) contract TopShotExchange {

    // Storage path for the admin NFT vault
    access(all) let nftCollectionPath: StoragePath

    // Path to the admin resource in the TSHOT contract
    access(all) let tshotAdminPath: StoragePath

    // Function to check if an NFT belongs to one of the valid tiers
    access(all) fun criteriaChecklist(nft: &TopShot.NFT): Bool {
    
        // Define a list of valid tiers (only valid tiers are listed)
        let validTiers: [String] = [
            "common",
            "fandom",
            "rare",
            "legendary"
        ]

        // Retrieve the tier of the given NFT using the TopShotTiers contract
        let nftTier = TopShotTiers.getTier(nft: nft)
        
        // Convert the tier to a string for easier comparison
        let nftTierStr = TopShotTiers.tierToString(tier: nftTier!)

        // Check if the tier is in the list of valid tiers
        return validTiers.contains(nftTierStr)
    }  

    // Function to swap an NBA Top Shot Moment for TSHOT tokens
    access(all) fun swapNFTForTSHOT(nftIDs: @[TopShot.NFT], address: Address) {

        // Borrow the admin's TopShot Collection
        let adminCollection = self.account
            .storage
            .borrow<&TopShot.Collection>(from: self.nftCollectionPath)
            ?? panic("Could not borrow admin's TopShot Collection")

        // Get the recipient's account and borrow their TSHOT token receiver
        let recipientAccount = getAccount(address)
        let receiverRef = recipientAccount
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/TSHOTTokenReceiver)
            .borrow()
            ?? panic("Could not borrow the user's TSHOT receiver capability")

        // Initialize the cumulative amount
        var totalAmount: UFix64 = 0.0

        // Store the number of NFTs before they are moved
        let numberOfNFTs = nftIDs.length

        let adminRef = self.account
            .storage
            .borrow<auth(TSHOT.AdminEntitlement) &TSHOT.Admin>(from: self.tshotAdminPath)
            ?? panic("Could not borrow the TSHOT Admin resource")

        // Deposit all NFTs into the admin's collection
        while nftIDs.length > 0 {
            let nft <- nftIDs.removeFirst()

            // Borrow a reference to the NFT for tier validation
            let nftRef = &nft as &TopShot.NFT

            // Validate the NFT tier
            if !self.criteriaChecklist(nft: nftRef) {
                panic("NFT tier is not valid.")
            }

            adminCollection.deposit(token: <-nft)

            // Mint 1 TSHOT token for each NFT and deposit into the user's account
            let tshotVault <- adminRef.mintTokens(amount: 1.0)

            receiverRef.deposit(from: <-tshotVault)

            totalAmount = totalAmount + 1.0

        }

        // Destroy the empty resource array to prevent resource leakage
        destroy nftIDs
      
    }

   access(all) fun swapTSHOTForNFT(address: Address, tokenAmount: UFix64, tokenVault: @TSHOT.Vault) {

        // Withdraw the specified amount of TSHOT tokens from the user's vault
        let payment <- tokenVault.withdraw(amount: tokenAmount) as! @TSHOT.Vault

        // Burn the TSHOT tokens using the contract's burnTokens function
        TSHOT.burnTokens(from: <-payment)

        // Get the recipient's account and borrow their TSHOT token receiver
        let recipientAccount = getAccount(address)
        let receiverRef = recipientAccount
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/TSHOTTokenReceiver)
            .borrow()
            ?? panic("Could not borrow the user's TSHOT receiver capability")

        receiverRef.deposit(from: <-tokenVault)

        var counter = 0
        var exchangedNFTIDs: [UInt64] = []

        // Borrow the admin's TopShot Collection
        let adminCollection = self.account
            .storage
            .borrow<auth(NonFungibleToken.Withdraw) &TopShot.Collection>(from: self.nftCollectionPath)
            ?? panic("Could not borrow admin's TopShot Collection")

        // Exchange each TSHOT token for a random TopShot NFT
        while counter < Int(tokenAmount) {
            let nftIDs: [UInt64] = adminCollection.getIDs()

            if nftIDs.length == 0 {
                panic("No NFTs available in the vault")
            }

            // Generate a random index
            let randomIndex = UInt64(revertibleRandom<UInt64>() % UInt64(nftIDs.length))
            let selectedNFTID = nftIDs[randomIndex]

            // Withdraw the selected NFT from the admin's storage
            let selectedNFT <- adminCollection.withdraw(withdrawID: selectedNFTID)

            // Get the recipient's account and borrow their TopShot Collection via capabilities
            let receiverRef = getAccount(address)
                .capabilities
                .get<&TopShot.Collection>(/public/MomentCollection)
                .borrow()
                ?? panic("Could not borrow the user's TopShot Collection via capability")

            // Deposit the TopShot NFT into the user's account
            receiverRef.deposit(token: <-selectedNFT)

            exchangedNFTIDs.append(selectedNFTID)
            counter = counter + 1
        }

    }

    init() {
        // Set the storage path for the admin NFT vault
        self.nftCollectionPath = /storage/MomentCollection
        self.tshotAdminPath = /storage/TSHOTAdmin

    }
}
