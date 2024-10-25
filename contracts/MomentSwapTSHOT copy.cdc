import "FungibleToken"
import "NonFungibleToken"
import "TopShot"
import "TSHOT"
import "TopShotTiers"
import "TopShotShardedCollection"

access(all) contract MomentSwapTSHOT {

    // Storage paths for the admin NFT vault and FT admin resources
    access(all) let nftCollectionPath: StoragePath
    access(all) let tshotAdminPath: StoragePath

// Function to check if an NFT belongs to the valid tier for a specific FT (TSHOT, TSHOTF, TSHOTR, TSHOTL)
access(all) fun validateNFT(nft: &TopShot.NFT, ftType: String): Bool {

    // Retrieve the tier of the given NFT using the TopShotTiers contract
    let nftTier = TopShotTiers.getTier(nft: nft)
    let nftTierStr = TopShotTiers.tierToString(tier: nftTier!)

    // Initialize the expectedTier with an empty string
    var expectedTier: String = ""

    // Use if-else statements to define the valid tier for each FT type
    if ftType == "TSHOT" {
        expectedTier = "common"
    } else {
        panic("Invalid FT type provided.")
    }

    // Check if the NFT's tier matches the expected tier for the FT type
    return nftTierStr == expectedTier
}

    // --- NFT to FT ---

    // Swap common NFTs for TSHOT tokens
    access(all) fun swapNFTsForTSHOT(nftIDs: @[TopShot.NFT], address: Address) {
        let adminCollection = self.account
            .storage
            .borrow<&TopShotShardedCollection.ShardedCollection>(from: self.nftCollectionPath)
            ?? panic("Could not borrow admin's TopShot Collection")

        let recipientAccount = getAccount(address)
        let receiverRef = recipientAccount
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/TSHOTTokenReceiver)
            .borrow()
            ?? panic("Could not borrow the user's TSHOT receiver capability")

        let adminRef = self.account
            .storage
            .borrow<auth(TSHOT.AdminEntitlement) &TSHOT.Admin>(from: self.tshotAdminPath)
            ?? panic("Could not borrow the TSHOT Admin resource")

        var totalAmount: UFix64 = 0.0

        while nftIDs.length > 0 {
            let nft <- nftIDs.removeFirst()

            // Validate the NFT tier for TSHOT (which requires common-tier moments)
            if !self.validateNFT(nft: &nft as &TopShot.NFT, ftType: "TSHOT") {
            panic("NFT tier is not valid for TSHOT. Only common-tier moments are allowed.")
            }

            adminCollection.deposit(token: <-nft)

            // Mint TSHOT tokens for each NFT deposited
            let tshotVault <- adminRef.mintTokens(amount: 1.0)
            receiverRef.deposit(from: <-tshotVault)
            totalAmount = totalAmount + 1.0
        }

        destroy nftIDs
    }

    // --- FT to NFT ---

    // Swap TSHOT tokens for random common NFTs
    access(all) fun swapTSHOTForNFTs(address: Address, tokenAmount: UFix64, tokenVault: @TSHOT.Vault) {

        // Withdraw the specified amount of TSHOT tokens
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
            .borrow<auth(NonFungibleToken.Withdraw) &TopShotShardedCollection.ShardedCollection>(from: self.nftCollectionPath)
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
        // Set the storage paths for the admin NFT vault and FT admin resources
        self.nftCollectionPath = /storage/ShardedMomentCollection
        self.tshotAdminPath = /storage/TSHOTAdmin
    }
}
