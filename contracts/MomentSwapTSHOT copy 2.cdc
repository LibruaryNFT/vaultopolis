import "FungibleToken"
import "NonFungibleToken"
import "TopShot"
import "TSHOT"
import "TopShotTiers"
import "TopShotShardedCollection"
import "RandomConsumer"

access(all) contract MomentSwapTSHOT {

    // Storage paths for the admin NFT vault and FT admin resources
    access(all) let nftCollectionPath: StoragePath
    access(all) let tshotAdminPath: StoragePath
    access(self) let consumer: @RandomConsumer.Consumer // RandomConsumer resource for commit-reveal

    // Function to check if an NFT belongs to the valid tier for a specific FT (TSHOT)
    access(all) fun validateNFT(nft: &TopShot.NFT, ftType: String): Bool {

        // Retrieve the tier of the given NFT using the TopShotTiers contract
        let nftTier = TopShotTiers.getTier(nft: nft)!
        let nftTierStr = TopShotTiers.tierToString(tier: nftTier)

        // Use if-else statements to define the valid tier for each FT type
        if ftType == "TSHOT" {
            return nftTierStr == "common"
        } else {
            panic("Invalid FT type provided.")
        }
    }

    // --- NFT to FT ---

    // Swap common NFTs for TSHOT tokens
    access(all) fun swapNFTsForTSHOT(nftIDs: [UInt64], address: Address) {
        let adminCollection = self.account
            .borrow<&TopShotShardedCollection.ShardedCollection>(from: self.nftCollectionPath)
            ?? panic("Could not borrow admin's TopShot Collection")

        let recipientAccount = getAccount(address)
        let receiverRef = recipientAccount
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/TSHOTTokenReceiver)
            .borrow()
            ?? panic("Could not borrow the user's TSHOT receiver capability")

        let adminRef = self.account
            .borrow<&TSHOT.Admin>(from: self.tshotAdminPath)
            ?? panic("Could not borrow the TSHOT Admin resource")

        var totalAmount: UFix64 = 0.0

        for id in nftIDs {
            // Withdraw the NFT from the user's collection
            let userCollection = getAccount(address)
                .capabilities
                .get<&{NonFungibleToken.Provider}>(/public/MomentCollection)
                .borrow()
                ?? panic("Could not borrow user's NFT collection")

            let nft <- userCollection.withdraw(withdrawID: id)

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
    }

    // --- Commit Phase ---

    // Receipt resource that holds the user's commitment to a swap
    access(all) resource Receipt: RandomConsumer.RequestWrapper {
        access(all) let commitBlock: UInt64
        access(all) let tokenAmount: UFix64
        access(all) let address: Address
        access(all) var request: @RandomConsumer.Request?

        init(commitBlock: UInt64, tokenAmount: UFix64, address: Address, request: @RandomConsumer.Request) {
            self.commitBlock = commitBlock
            self.tokenAmount = tokenAmount
            self.address = address
            self.request <- request
        }
    }

    // Users commit to swapping TSHOT tokens for NFTs
    access(all) fun commitTSHOTSwap(tokenAmount: UFix64, address: Address): @Receipt {
        // Request randomness from RandomConsumer
        let request <- self.consumer.requestRandomness()

        let commitBlock = getCurrentBlock().height

        let receipt <- create Receipt(
            commitBlock: commitBlock,
            tokenAmount: tokenAmount,
            address: address,
            request: <-request
        )

        return <-receipt
    }

    // --- FT to NFT (Reveal Phase) ---

    // Swap TSHOT tokens for random common NFTs
    access(all) fun swapTSHOTForNFTs(receipt: @Receipt, tokenVault: @TSHOT.Vault) {
        pre {
            receipt.request != nil:
                "Cannot reveal the swap! The provided receipt has already been revealed."
            receipt.getRequestBlock()! <= getCurrentBlock().height:
                "Cannot reveal the swap before the committed block has passed."
        }

        // Fulfill the random request and get a random number in range
        let randomNumber = self.consumer.fulfillRandomInRange(request: <-receipt.popRequest(), min: 0, max: UInt64.max)

        // Burn the TSHOT tokens using the contract's burnTokens function
        TSHOT.burnTokens(from: <-tokenVault)

        var counter = 0
        var exchangedNFTIDs: [UInt64] = []

        // Borrow the admin's TopShot Collection
        let adminCollection = self.account
            .borrow<&TopShotShardedCollection.ShardedCollection>(from: self.nftCollectionPath)
            ?? panic("Could not borrow admin's TopShot Collection")

        // Exchange each TSHOT token for a random TopShot NFT
        while counter < Int(receipt.tokenAmount) {
            let nftIDs: [UInt64] = adminCollection.getIDs()

            if nftIDs.length == 0 {
                panic("No NFTs available in the vault")
            }

            // Use the random number from RandomConsumer
            let randomIndex = UInt64(randomNumber % UInt64(nftIDs.length))
            let selectedNFTID = nftIDs[randomIndex]

            // Withdraw the selected NFT from the admin's storage
            let selectedNFT <- adminCollection.withdraw(withdrawID: selectedNFTID)

            // Get the recipient's account and borrow their TopShot Collection via capabilities
            let recipientAccount = getAccount(receipt.address)
            let receiverRef = recipientAccount
                .capabilities
                .get<&{NonFungibleToken.CollectionPublic}>(/public/MomentCollection)
                .borrow()
                ?? panic("Could not borrow the user's TopShot Collection via capability")

            // Deposit the TopShot NFT into the user's account
            receiverRef.deposit(token: <-selectedNFT)

            exchangedNFTIDs.append(selectedNFTID)
            counter = counter + 1
        }

        destroy receipt // Destroy the receipt after use
    }

    init() {
        // Set the storage paths for the admin NFT vault and FT admin resources
        self.nftCollectionPath = /storage/ShardedMomentCollection
        self.tshotAdminPath = /storage/TSHOTAdmin
        self.consumer <- RandomConsumer.createConsumer() // Create the RandomConsumer resource
    }
}