import "TopShotExchange"
import "FungibleToken"
import "NonFungibleToken"
import "TSHOTF"

transaction(tokenAmount: UFix64) {

    let address: Address

    prepare(signer: auth(Capabilities, Storage) &Account) {
        self.address = signer.address
        // borrow a reference to the signer's fungible token Vault
        let provider = signer.storage.borrow<auth(FungibleToken.Withdraw) &TSHOTF.Vault>(from: /storage/TSHOTFTokenVault)!
        
        // withdraw tokens from the signer's vault
        let tokens <- provider.withdraw(amount: tokenAmount) as! @TSHOTF.Vault

        // Call the `swapTSHOTForNFT` function from the TopShotExchange contract.
        TopShotExchange.swapTSHOTFForNFTs(address: self.address, tokenAmount: tokenAmount, tokenVault: <-tokens)

        // Log a success message if the transaction completes without issues.
        log("Successfully swapped TSHOT for TopShot NFTs")
    }

    execute {
        
    }
}
