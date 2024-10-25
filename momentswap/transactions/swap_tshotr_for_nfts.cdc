import "TopShotExchange"
import "FungibleToken"
import "NonFungibleToken"
import "TSHOTR"

transaction(tokenAmount: UFix64) {

    let address: Address

    prepare(signer: auth(Capabilities, Storage) &Account) {
        self.address = signer.address
        // borrow a reference to the signer's fungible token Vault
        let provider = signer.storage.borrow<auth(FungibleToken.Withdraw) &TSHOTR.Vault>(from: /storage/TSHOTRTokenVault)!
        
        // withdraw tokens from the signer's vault
        let tokens <- provider.withdraw(amount: tokenAmount) as! @TSHOTR.Vault

        // Call the `swapTSHOTForNFT` function from the TopShotExchange contract.
        TopShotExchange.swapTSHOTRForNFTs(address: self.address, tokenAmount: tokenAmount, tokenVault: <-tokens)

        // Log a success message if the transaction completes without issues.
        log("Successfully swapped TSHOTR for TopShot NFTs")
    }

    execute {
        
    }
}
