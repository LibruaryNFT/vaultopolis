import "FungibleToken"
import "NonFungibleToken"
import "TopShot"
import "TSHOT"
import "TopShotTiers"
import "TopShotShardedCollection"
import "RandomConsumer"
import "Burner"

access(all) contract MomentSwapTSHOT {

    // Storage paths for the admin NFT vault and FT admin resources
    access(all) let nftCollectionPath: StoragePath
    access(all) let tshotAdminPath: StoragePath

    /// The Vault used by the contract to store funds.
    access(self) let reserve: @TSHOT.Vault

    /// The canonical path for common Receipt storage
    access(all) let ReceiptStoragePath: StoragePath

    /// The RandomConsumer.Consumer resource used to request & fulfill randomness
    access(self) let consumer: @RandomConsumer.Consumer

    // Function to check if an NFT belongs to the valid tier for a specific FT (TSHOT, TSHOTF, TSHOTR, TSHOTL)
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

            // Validate the NFT tier for TSHOT (common-tier moments)
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

    /// The Receipt resource is used to store the bet amount and the associated randomness request.
    access(all) resource Receipt : RandomConsumer.RequestWrapper {
        /// The amount bet by the user
        access(all) let betAmount: UFix64
        /// The associated randomness request which contains the block height at which the request was made
        /// and whether the request has been fulfilled.
        access(all) var request: @RandomConsumer.Request?

        init(betAmount: UFix64, request: @RandomConsumer.Request) {
            self.betAmount = betAmount
            self.request <- request
        }
    }

    /* --- Commit --- */
    //
    /// In this method, the caller commits tokens. The contract takes note of the block height and bet amount,
    /// returning a Receipt resource which is used by the user to reveal the swap result.
    access(all) fun commitSwap(bet: @{FungibleToken.Vault}): @Receipt {
        pre {
            bet.balance > 0.0:
            "Cannot commit to the swap! The provided vault's balance is 0.0."
            bet.getType() == Type<@TSHOT.Vault>():
            "Cannot commit to swap! The type of the provided vault <".concat(bet.getType().identifier).concat("> is invalid. The vault must be a TSHOTToken Vault.")
        }
        let request <- self.consumer.requestRandomness()
        let receipt <- create Receipt(
            betAmount: bet.balance,
            request: <-request
        )
        self.reserve.deposit(from: <-bet)

        return <-receipt
    }

    // --- Reveal --- //

   access(all) fun swapTSHOTForNFTs(address: Address, receipt: @Receipt) {

    pre {
        receipt.request != nil: 
        "Cannot swap! The provided receipt has already been swapped."
        receipt.getRequestBlock()! <= getCurrentBlock().height:
        "Cannot swap! The provided receipt was committed for block height ".concat(receipt.getRequestBlock()!.toString())
        .concat(" which is greater than the current block height of ")
        .concat(getCurrentBlock().height.toString())
        .concat(". The swap can only happen after the committed block has passed.")
    }

    let tokenAmount = receipt.betAmount
    let commitBlock = receipt.getRequestBlock()!
    let receiptID = receipt.uuid

    // Withdraw the specified amount of TSHOT tokens from the reserve
    let payment <- self.reserve.withdraw(amount: tokenAmount) as! @TSHOT.Vault

    // Burn the TSHOT tokens using the contract's burnTokens function
    TSHOT.burnTokens(from: <-payment)

    // Pop the randomness request once and assign the random value to a variable
    let randomSeed <- receipt.popRequest()
    let baseRandomValue = randomSeed.uuid

    // Now that the receipt has been fully used, we burn it
    Burner.burn(<-receipt)

    var counter = 0

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

        // Combine revertibleRandom with baseRandomValue to derive a new random index in each iteration
        let derivedRandomValue = (baseRandomValue + UInt64(revertibleRandom<UInt64>())) % UInt64(nftIDs.length)

        let randomIndex = UInt64(derivedRandomValue)

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

        counter = counter + 1
    }

    // Now that we've processed all the tokens and burned the receipt, no further action is needed
}




    init() {
        // Set the storage paths for the admin NFT vault and FT admin resources
        self.nftCollectionPath = /storage/ShardedMomentCollection
        self.tshotAdminPath = /storage/TSHOTAdmin

        self.reserve <- TSHOT.createEmptyVault(vaultType: Type<@TSHOT.Vault>())

        // Create a RandomConsumer.Consumer resource
        self.consumer <- RandomConsumer.createConsumer()

        // Set the ReceiptStoragePath to a unique path for this contract - appending the address to the identifier
        self.ReceiptStoragePath = StoragePath(identifier: "MomentSwapReceipt_".concat(self.account.address.toString()))!
    }
}
