import "FungibleToken"
import "NonFungibleToken"
import "TopShot"
import "TSHOT"

access(all) contract TopShotExchange {

    // Storage path for the admin NFT vault
    access(all) let nftVaultPath: StoragePath

    // Event emitted when an NFT is deposited
    access(all) event NFTDeposited(id: UInt64, from: Address)

    // Event emitted when TSHOT tokens are minted
    access(all) event TSHOTMinted(amount: UFix64, to: Address)

    // Event emitted when an NFT is exchanged for TSHOT
    access(all) event NFTExchanged(id: UInt64, to: Address)

    access(all) resource interface PublicVault {
        access(all) fun getVaultIDs(): [UInt64]
        access(all) fun borrowNFT(id: UInt64): &TopShot.NFT?  // Read-only access to the NFT
        access(all) fun withdrawNFT(id: UInt64): @TopShot.NFT  // Withdraw an NFT by ID
    }

    // Resource to hold the TopShot NFTs that users deposit
    access(all) resource NFTVault: PublicVault {
        access(all) var nfts: @{UInt64: TopShot.NFT}

        init() {
            self.nfts <- {}
        }

        access(NonFungibleToken.Withdraw) fun deposit(nft: @TopShot.NFT) {
            let nftID = nft.id
            self.nfts[nftID] <-! nft
            emit NFTDeposited(id: nftID, from: self.owner!.address)
        }

        // Function to get the IDs of all NFTs in the vault
        access(all) fun getVaultIDs(): [UInt64] {
            return self.nfts.keys
        }

        // Function to borrow a read-only reference to an NFT by its ID
        access(all) fun borrowNFT(id: UInt64): &TopShot.NFT? {
            return &self.nfts[id] as &TopShot.NFT?
        }

        // Function to withdraw an NFT by its ID
        access(all) fun withdrawNFT(id: UInt64): @TopShot.NFT {
            let nft <- self.nfts.remove(key: id) 
                ?? panic("No NFT found with the given ID")
            return <-nft
        }
    }

    // Function to swap an NBA Top Shot Moment for TSHOT tokens
    access(all) fun swapNFTForTSHOT(
        ownerCollection: Capability<auth(NonFungibleToken.Withdraw) &TopShot.Collection>,
        nftID: UInt64,
        receiverCap: Capability<&{FungibleToken.Receiver}>,
        userAddress: Address
    ) {
        // Borrow the owner's TopShot Collection reference using the provided capability
        let collectionRef = ownerCollection
            .borrow()
            ?? panic("Could not borrow reference to user's TopShot Collection")

        // Withdraw the NFT from the user's collection
        let nft <- collectionRef.withdraw(withdrawID: nftID) as! @TopShot.NFT

        // Deposit the NFT into the exchange's NFT vault
        let adminVault = self.account
            .storage
            .borrow<auth(NonFungibleToken.Withdraw) &NFTVault>(from: self.nftVaultPath)
            ?? panic("Could not borrow NFTVault")

        adminVault.deposit(nft: <-nft)

        // Mint 1 TSHOT token for the user
        let tshotVault <- TSHOT.mintTokens(amount: 1.0)

        // Borrow a reference to the user's receiver
        let receiverRef = receiverCap.borrow()
            ?? panic("Could not borrow reference to user's TSHOT Receiver")

        // Deposit the TSHOT token into the user's account
        receiverRef.deposit(from: <-tshotVault)
        emit TSHOTMinted(amount: 1.0, to: userAddress)
    }

// Function to exchange 1 TSHOT token for a random TopShot NFT
access(all) fun exchangeTSHOTForRandomNFT(
    userTSHOTVault: Capability<auth(FungibleToken.Withdraw) &TSHOT.Vault>,
    userNFTReceiver: Capability<&{NonFungibleToken.Receiver}>,
    userAddress: Address
) {
    // Borrow the user's TSHOT Vault reference
    let tshotVaultRef = userTSHOTVault
        .borrow()
        ?? panic("Could not borrow the user's TSHOT Vault")

    // Withdraw 1 TSHOT token from the user's vault
    let payment <- tshotVaultRef.withdraw(amount: 1.0) as! @TSHOT.Vault

    // Burn the TSHOT token using the contract's burnTokens function
    TSHOT.burnTokens(from: <-payment)

    // Get all NFT IDs from the vault
    let vaultRef = self.account.storage
        .borrow<&NFTVault>(from: self.nftVaultPath)
        ?? panic("Could not borrow the NFTVault")

    let nftIDs = vaultRef.getVaultIDs()

    // Ensure there are NFTs available
    if nftIDs.length == 0 {
        panic("No NFTs available in the vault")
    }

    // Generate a random number using revertibleRandom
let randNumber: UInt64 = revertibleRandom<UInt64>()

// Calculate the random index by taking the modulus with the length of the NFT IDs list
let nftCount: UInt64 = UInt64(nftIDs.length)
let randomIndex: UInt64 = randNumber % nftCount

// Select the NFT ID using the calculated random index
let selectedNFTID = nftIDs[randomIndex]

    // Withdraw the selected NFT from the vault
    let selectedNFT <- vaultRef.withdrawNFT(id: selectedNFTID)

    // Borrow the user's NFT receiver
    let receiverRef = userNFTReceiver.borrow()
        ?? panic("Could not borrow the user's NFT Receiver")

    // Deposit the NFT into the user's account
    receiverRef.deposit(token: <-selectedNFT)

    // Emit event for NFT exchange
    emit NFTExchanged(id: selectedNFTID, to: userAddress)
}



    init() {
        // Set the storage path for the admin NFT vault
        self.nftVaultPath = /storage/TopShotNFTVault

        // Store the NFT Vault in the contract's storage
        self.account.storage.save(<-create NFTVault(), to: self.nftVaultPath)

        // Issue the capability to the NFT vault and publish it to a public path
        let cap = self.account.capabilities.storage.issue<&NFTVault>(self.nftVaultPath)
        self.account.capabilities.publish(cap, at: /public/TopShotNFTVault)

        // Update the TopShotExchange address in TSHOT contract
        TSHOT.updateTopShotExchangeAddress(newAddress: self.account.address)
    }
}
