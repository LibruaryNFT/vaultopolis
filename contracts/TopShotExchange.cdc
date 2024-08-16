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

    // Resource to hold the TopShot NFTs that users deposit
    access(all) resource NFTVault {
        access(all) var nfts: @{UInt64: TopShot.NFT}

        init() {
            self.nfts <- {}
        }

        access(NonFungibleToken.Withdraw) fun deposit(nft: @TopShot.NFT) {
            let nftID = nft.id
            self.nfts[nftID] <-! nft
            emit NFTDeposited(id: nftID, from: self.owner!.address)
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

    init() {
        // Set the storage path for the admin NFT vault
        self.nftVaultPath = /storage/TopShotNFTVault

        // Store the NFT Vault in the contract's storage
        self.account.storage.save(<-create NFTVault(), to: self.nftVaultPath)

        // Update the TopShotExchange address in TSHOT contract
        TSHOT.updateTopShotExchangeAddress(newAddress: self.account.address)
    }
}
