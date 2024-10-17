import "FungibleToken"
import "NonFungibleToken"
import "TopShot"
import "TSHOT"
import "TSHOTF"
import "TSHOTR"
import "TSHOTL"
import "TopShotTiers"

access(all) contract TopShotExchange {

    // Storage paths for the admin NFT vault and FT admin resources
    access(all) let nftCollectionPath: StoragePath
    access(all) let tshotAdminPath: StoragePath
    access(all) let tshotfAdminPath: StoragePath
    access(all) let tshotrAdminPath: StoragePath
    access(all) let tshotlAdminPath: StoragePath

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
    } else if ftType == "TSHOTF" {
        expectedTier = "fandom"
    } else if ftType == "TSHOTR" {
        expectedTier = "rare"
    } else if ftType == "TSHOTL" {
        expectedTier = "legendary"
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
            .borrow<&TopShot.Collection>(from: self.nftCollectionPath)
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

    // Swap rare NFTs for TSHOTR tokens
    access(all) fun swapNFTsForTSHOTR(nftIDs: @[TopShot.NFT], address: Address) {
        let adminCollection = self.account
            .storage
            .borrow<&TopShot.Collection>(from: self.nftCollectionPath)
            ?? panic("Could not borrow admin's TopShot Collection")

        let recipientAccount = getAccount(address)
        let receiverRef = recipientAccount
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/TSHOTRTokenReceiver)
            .borrow()
            ?? panic("Could not borrow the user's TSHOTR receiver capability")

        let adminRef = self.account
            .storage
            .borrow<auth(TSHOTR.AdminEntitlement) &TSHOTR.Admin>(from: self.tshotrAdminPath)
            ?? panic("Could not borrow the TSHOTR Admin resource")

        var totalAmount: UFix64 = 0.0

        while nftIDs.length > 0 {
            let nft <- nftIDs.removeFirst()

             // Validate the NFT tier for TSHOT (which requires common-tier moments)
            if !self.validateNFT(nft: &nft as &TopShot.NFT, ftType: "TSHOTR") {
            panic("NFT tier is not valid for TSHOT. Only rare-tier moments are allowed.")
            }

            adminCollection.deposit(token: <-nft)

            // Mint TSHOTR tokens for each NFT deposited
            let tshotrVault <- adminRef.mintTokens(amount: 1.0)
            receiverRef.deposit(from: <-tshotrVault)
            totalAmount = totalAmount + 1.0
        }

        destroy nftIDs
    }

    // Swap fandom NFTs for TSHOTF tokens
    access(all) fun swapNFTsForTSHOTF(nftIDs: @[TopShot.NFT], address: Address) {
        let adminCollection = self.account
            .storage
            .borrow<&TopShot.Collection>(from: self.nftCollectionPath)
            ?? panic("Could not borrow admin's TopShot Collection")

        let recipientAccount = getAccount(address)
        let receiverRef = recipientAccount
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/TSHOTFTokenReceiver)
            .borrow()
            ?? panic("Could not borrow the user's TSHOTF receiver capability")

        let adminRef = self.account
            .storage
            .borrow<auth(TSHOTF.AdminEntitlement) &TSHOTF.Admin>(from: self.tshotfAdminPath)
            ?? panic("Could not borrow the TSHOTF Admin resource")

        var totalAmount: UFix64 = 0.0

        while nftIDs.length > 0 {
            let nft <- nftIDs.removeFirst()

             // Validate the NFT tier for TSHOT (which requires common-tier moments)
            if !self.validateNFT(nft: &nft as &TopShot.NFT, ftType: "TSHOTF") {
            panic("NFT tier is not valid for TSHOT. Only fandom-tier moments are allowed.")
            }

            adminCollection.deposit(token: <-nft)

            // Mint TSHOTF tokens for each NFT deposited
            let tshotfVault <- adminRef.mintTokens(amount: 1.0)
            receiverRef.deposit(from: <-tshotfVault)
            totalAmount = totalAmount + 1.0
        }

        destroy nftIDs
    }

    // Swap legendary NFTs for TSHOTL tokens
    access(all) fun swapNFTsForTSHOTL(nftIDs: @[TopShot.NFT], address: Address) {
        let adminCollection = self.account
            .storage
            .borrow<&TopShot.Collection>(from: self.nftCollectionPath)
            ?? panic("Could not borrow admin's TopShot Collection")

        let recipientAccount = getAccount(address)
        let receiverRef = recipientAccount
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/TSHOTLTokenReceiver)
            .borrow()
            ?? panic("Could not borrow the user's TSHOTL receiver capability")

        let adminRef = self.account
            .storage
            .borrow<auth(TSHOTL.AdminEntitlement) &TSHOTL.Admin>(from: self.tshotlAdminPath)
            ?? panic("Could not borrow the TSHOTL Admin resource")

        var totalAmount: UFix64 = 0.0

        while nftIDs.length > 0 {
            let nft <- nftIDs.removeFirst()

             // Validate the NFT tier for TSHOT (which requires common-tier moments)
            if !self.validateNFT(nft: &nft as &TopShot.NFT, ftType: "TSHOTL") {
            panic("NFT tier is not valid for TSHOT. Only legendary-tier moments are allowed.")
            }

            adminCollection.deposit(token: <-nft)

            // Mint TSHOTL tokens for each NFT deposited
            let tshotlVault <- adminRef.mintTokens(amount: 1.0)
            receiverRef.deposit(from: <-tshotlVault)
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

    // Swap TSHOTR tokens for random rare NFTs
    access(all) fun swapTSHOTRForNFTs(address: Address, tokenAmount: UFix64, tokenVault: @TSHOTR.Vault) {

        let payment <- tokenVault.withdraw(amount: tokenAmount) as! @TSHOTR.Vault
        TSHOTR.burnTokens(from: <-payment)

        let recipientAccount = getAccount(address)
        let receiverRef = recipientAccount
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/TSHOTRTokenReceiver)
            .borrow()
            ?? panic("Could not borrow the user's TSHOTR receiver capability")

        receiverRef.deposit(from: <-tokenVault)

        var counter = 0
        var exchangedNFTIDs: [UInt64] = []

        let adminCollection = self.account
            .storage
            .borrow<auth(NonFungibleToken.Withdraw) &TopShot.Collection>(from: self.nftCollectionPath)
            ?? panic("Could not borrow admin's TopShot Collection")

        while counter < Int(tokenAmount) {
            let nftIDs: [UInt64] = adminCollection.getIDs()

            if nftIDs.length == 0 {
                panic("No NFTs available in the vault")
            }

            let randomIndex = UInt64(revertibleRandom<UInt64>() % UInt64(nftIDs.length))
            let selectedNFTID = nftIDs[randomIndex]
            let selectedNFT <- adminCollection.withdraw(withdrawID: selectedNFTID)

            let receiverRef = getAccount(address)
                .capabilities
                .get<&TopShot.Collection>(/public/MomentCollection)
                .borrow()
                ?? panic("Could not borrow the user's TopShot Collection via capability")

            receiverRef.deposit(token: <-selectedNFT)
            exchangedNFTIDs.append(selectedNFTID)
            counter = counter + 1
        }
    }

    // Swap TSHOTF tokens for random fandom NFTs
    access(all) fun swapTSHOTFForNFTs(address: Address, tokenAmount: UFix64, tokenVault: @TSHOTF.Vault) {

        let payment <- tokenVault.withdraw(amount: tokenAmount) as! @TSHOTF.Vault
        TSHOTF.burnTokens(from: <-payment)

        let recipientAccount = getAccount(address)
        let receiverRef = recipientAccount
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/TSHOTFTokenReceiver)
            .borrow()
            ?? panic("Could not borrow the user's TSHOTF receiver capability")

        receiverRef.deposit(from: <-tokenVault)

        var counter = 0
        var exchangedNFTIDs: [UInt64] = []

        let adminCollection = self.account
            .storage
            .borrow<auth(NonFungibleToken.Withdraw) &TopShot.Collection>(from: self.nftCollectionPath)
            ?? panic("Could not borrow admin's TopShot Collection")

        while counter < Int(tokenAmount) {
            let nftIDs: [UInt64] = adminCollection.getIDs()

            if nftIDs.length == 0 {
                panic("No NFTs available in the vault")
            }

            let randomIndex = UInt64(revertibleRandom<UInt64>() % UInt64(nftIDs.length))
            let selectedNFTID = nftIDs[randomIndex]
            let selectedNFT <- adminCollection.withdraw(withdrawID: selectedNFTID)

            let receiverRef = getAccount(address)
                .capabilities
                .get<&TopShot.Collection>(/public/MomentCollection)
                .borrow()
                ?? panic("Could not borrow the user's TopShot Collection via capability")

            receiverRef.deposit(token: <-selectedNFT)
            exchangedNFTIDs.append(selectedNFTID)
            counter = counter + 1
        }
    }

    // Swap TSHOTL tokens for random legendary NFTs
    access(all) fun swapTSHOTLForNFTs(address: Address, tokenAmount: UFix64, tokenVault: @TSHOTL.Vault) {

        let payment <- tokenVault.withdraw(amount: tokenAmount) as! @TSHOTL.Vault
        TSHOTL.burnTokens(from: <-payment)

        let recipientAccount = getAccount(address)
        let receiverRef = recipientAccount
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/TSHOTLTokenReceiver)
            .borrow()
            ?? panic("Could not borrow the user's TSHOTL receiver capability")

        receiverRef.deposit(from: <-tokenVault)

        var counter = 0
        var exchangedNFTIDs: [UInt64] = []

        let adminCollection = self.account
            .storage
            .borrow<auth(NonFungibleToken.Withdraw) &TopShot.Collection>(from: self.nftCollectionPath)
            ?? panic("Could not borrow admin's TopShot Collection")

        while counter < Int(tokenAmount) {
            let nftIDs: [UInt64] = adminCollection.getIDs()

            if nftIDs.length == 0 {
                panic("No NFTs available in the vault")
            }

            let randomIndex = UInt64(revertibleRandom<UInt64>() % UInt64(nftIDs.length))
            let selectedNFTID = nftIDs[randomIndex]
            let selectedNFT <- adminCollection.withdraw(withdrawID: selectedNFTID)

            let receiverRef = getAccount(address)
                .capabilities
                .get<&TopShot.Collection>(/public/MomentCollection)
                .borrow()
                ?? panic("Could not borrow the user's TopShot Collection via capability")

            receiverRef.deposit(token: <-selectedNFT)
            exchangedNFTIDs.append(selectedNFTID)
            counter = counter + 1
        }
    }

    init() {
        // Set the storage paths for the admin NFT vault and FT admin resources
        self.nftCollectionPath = /storage/MomentCollection
        self.tshotAdminPath = /storage/TSHOTAdmin
        self.tshotfAdminPath = /storage/TSHOTFAdmin
        self.tshotrAdminPath = /storage/TSHOTRAdmin
        self.tshotlAdminPath = /storage/TSHOTLAdmin
    }
}
