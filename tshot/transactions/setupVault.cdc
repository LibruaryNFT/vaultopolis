import "TSHOT"

transaction {

    prepare(signer: AuthAccount) {
        // Check if the user already has a TSHOT Vault set up
        if signer.borrow<&TSHOT.Vault>(from: /storage/tshotVault) == nil {
            // Create a new Vault
            let vault <- TSHOT.createVault(initialBalance: 0.0)
            // Save the new Vault to the user's account storage
            signer.save(<-vault, to: /storage/tshotVault)

            // Create a storage capability
            let cap = signer.capabilities.storage.issue<&TSHOT.Vault>(/storage/tshotVault)

            // Publish the storage capability to a public path
            signer.capabilities.publish(cap, at: /public/tshotReceiver)
        }
    }
}
