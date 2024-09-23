import "FungibleToken"
import "NonFungibleToken"
import "TopShot"
import "TSHOT"

access(all) contract TopShotExchange {

    // Storage path for the admin NFT vault
    access(all) let nftCollectionPath: StoragePath

    // Path to the admin resource in the TSHOT contract
    access(all) let tshotAdminPath: StoragePath

    // Event emitted when an NFT is deposited
    access(all) event NFTDeposited(id: UInt64, from: Address)

    // Event emitted when TSHOT tokens are minted
    access(all) event TSHOTMinted(amount: UFix64, to: Address)

    // Event emitted when an NFT is exchanged for TSHOT
    access(all) event NFTExchanged(ids: [UInt64], to: Address)

    access(all) resource interface PublicVault {
        access(all) view fun getVaultIDs(): [UInt64]
        access(all) view fun borrowNFT(id: UInt64): &TopShot.NFT?  // Read-only access to the NFT
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
        access(all) view fun getVaultIDs(): [UInt64] {
            return self.nfts.keys
        }

        // Function to borrow a read-only reference to an NFT by its ID
        access(all) view fun borrowNFT(id: UInt64): &TopShot.NFT? {
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
        nftIDs: @[TopShot.NFT],
        address: Address
    ) {

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
            adminCollection.deposit(token: <-nft)

            // Mint 1 TSHOT token for each NFT and deposit into the user's account
            let tshotVault <- adminRef.mintTokens(amount: 1.0)

            receiverRef.deposit(from: <-tshotVault)

            totalAmount = totalAmount + 1.0

        }

        // Destroy the empty resource array to prevent resource leakage
        destroy nftIDs


        // Emit a single event with the cumulative amount
        emit TSHOTMinted(amount: totalAmount, to: address)
      
    }

    init() {
        // Set the storage path for the admin NFT vault
        self.nftCollectionPath = /storage/MomentCollection
        self.tshotAdminPath = /storage/TSHOTAdmin

    }
}
