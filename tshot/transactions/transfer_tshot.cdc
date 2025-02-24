import "FungibleToken"
import "FungibleTokenMetadataViews"
import "TSHOT"

transaction(amount: UFix64, to: Address) {

    /// FTVaultData metadata view for the TSHOT token
    let vaultData: FungibleTokenMetadataViews.FTVaultData

    // The Vault resource that holds the tokens being sent
    let sentVault: @{FungibleToken.Vault}

    prepare(signer: auth(BorrowValue) &Account) {
        // Fetch TSHOT's FTVaultData Metadata View
        self.vaultData = TSHOT.resolveContractView(
            resourceType: nil, 
            viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
        ) as! FungibleTokenMetadataViews.FTVaultData? 
            ?? panic("Could not resolve FTVaultData from TSHOT contract")

        // Borrow an authorized reference to the signer's TSHOT vault
        let vaultRef = signer
            .storage
            .borrow<auth(FungibleToken.Withdraw) &TSHOT.Vault>(
                from: self.vaultData.storagePath
            )
            ?? panic(
                "The signer does not store a TSHOT.Vault at the path "
                .concat(self.vaultData.storagePath.toString())
                .concat(". Make sure they've initialized their vault first!")
            )

        // Withdraw the specified amount from the signer's vault
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        // Get the account object for the recipient
        let recipient = getAccount(to)

        // Borrow the recipient’s public TSHOT receiver reference
        let receiverRef = recipient.capabilities
            .borrow<&{FungibleToken.Receiver}>(self.vaultData.receiverPath)
            ?? panic(
                "Could not borrow a TSHOT Receiver reference at path "
                .concat(self.vaultData.receiverPath.toString())
                .concat(" for account ")
                .concat(to.toString())
                .concat(". Make sure the recipient has set up a public TSHOT receiver.")
            )

        // Deposit the withdrawn tokens into the recipient’s vault
        receiverRef.deposit(from: <- self.sentVault)
    }
}
