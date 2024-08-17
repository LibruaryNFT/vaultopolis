import "TopShotExchange"
import "FungibleToken"
import "NonFungibleToken"
import "TSHOT"

transaction {

    prepare(signer: auth(Capabilities, Storage) &Account) {
        // Retrieve the capability to the user's TSHOT Vault
        let userTSHOTVault = signer.capabilities
            .storage
            .issue<auth(FungibleToken.Withdraw) &TSHOT.Vault>(TSHOT.tokenVaultPath)

        // Retrieve the capability for the user's NFT Receiver using the hardcoded path
        let userNFTReceiver = signer
            .capabilities
            .get<&{NonFungibleToken.Receiver}>(/public/MomentCollection)!

        // Now call the exchange function with the user's capabilities
        TopShotExchange.exchangeTSHOTForRandomNFT(
            userTSHOTVault: userTSHOTVault,
            userNFTReceiver: userNFTReceiver,
            userAddress: signer.address
        )
    }

    execute {
        log("Exchange completed successfully.")
    }
}
