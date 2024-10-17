import "TSHOTF"
import "FungibleToken"

transaction {

    prepare(signer: auth(Storage, Capabilities) &Account) {

        // Define the storage and public paths
        let tokenVaultPath = /storage/TSHOTFTokenVault
        let tokenReceiverPath = /public/TSHOTFTokenReceiver
        let tokenBalancePath = /public/TSHOTFTokenBalance
        
        // Check if the account already has a Vault set up by borrowing a reference
        if signer.storage.borrow<&TSHOTF.Vault>(from: tokenVaultPath) != nil {
            panic("Vault already exists for this account.")
        }

        // Create a new empty Vault
        let vault <- TSHOTF.createEmptyVault(vaultType: Type<@TSHOTF.Vault>())

        // Save the Vault in the user's storage
        signer.storage.save(<-vault, to: tokenVaultPath)

        // Create a public capability for the stored Vault that only exposes
        // the `deposit` method through the `Receiver` interface
        let receiverCap = signer.capabilities.storage.issue<&{FungibleToken.Receiver}>(tokenVaultPath)
        signer.capabilities.publish(receiverCap, at: tokenReceiverPath)

        // Create a public capability for the stored Vault that only exposes
        // the `balance` field through the `Balance` interface
        let balanceCap = signer.capabilities.storage.issue<&{FungibleToken.Balance}>(tokenVaultPath)
        signer.capabilities.publish(balanceCap, at: tokenBalancePath)

        log("Vault setup complete for the user.")
    }

    execute {
        log("Transaction executed successfully.")
    }
}