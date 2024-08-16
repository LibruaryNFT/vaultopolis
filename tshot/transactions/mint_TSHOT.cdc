import "TopShotExchange"
import "NonFungibleToken"
import "TopShot"
import "TSHOT"
import "FungibleToken"

transaction(nftID: UInt64) {

    // The address of the user performing the swap
    let userAddress: Address

    prepare(signer: auth(Capabilities, Storage) &Account) {
        self.userAddress = signer.address

        // Get the user's TopShot Collection capability with the correct entitlement
        let userCollectionCap = signer
            .capabilities
            .get<auth(NonFungibleToken.Withdraw) &TopShot.Collection>(/public/MomentCollection)

        // Borrow the reference to the user's collection
        let userCollection = userCollectionCap.borrow()
            ?? panic("Could not borrow reference to user's TopShot Collection")

        // Withdraw the NFT from the user's collection
        let nft <- userCollection.withdraw(withdrawID: nftID) as! @TopShot.NFT

        // Borrow the NFT vault from TopShotExchange's storage path
        let adminVault = signer.storage
            .borrow<auth(NonFungibleToken.Withdraw) &TopShotExchange.NFTVault>(
                from: TopShotExchange.nftVaultPath
            ) 
            ?? panic("Could not borrow NFTVault from TopShotExchange")

        // Deposit the NFT into the exchange's NFT vault
        adminVault.deposit(nft: <-nft)

        // Mint 1 TSHOT token for the user
        let tshotVault <- TSHOT.mintTokens(amount: 1.0)

        // Get the user's TSHOT Receiver capability
        let receiverCap = signer.capabilities
            .get<&{FungibleToken.Receiver}>(/public/tshotReceiver)

        // Borrow a reference to the user's receiver
        let receiver = receiverCap.borrow()
            ?? panic("Could not borrow reference to user's TSHOT Receiver")

        // Deposit the TSHOT token into the user's account
        receiver.deposit(from: <-tshotVault)
    }

    execute {
        log("Swap completed successfully.")
    }
}