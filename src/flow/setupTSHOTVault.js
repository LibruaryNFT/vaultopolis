export const setupTSHOTVault = `
  import TSHOT from 0x332ffc0ae9bba9c1
  import FungibleToken from 0x9a0766d93b6608b7

  transaction {

    prepare(signer: auth(Storage, Capabilities) &Account) {
        let tokenVaultPath = /storage/TSHOTTokenVault
        let tokenReceiverPath = /public/TSHOTTokenReceiver
        let tokenBalancePath = /public/TSHOTTokenBalance

        // Check if a vault already exists
        if signer.storage.borrow<&TSHOT.Vault>(from: tokenVaultPath) != nil {
            panic("Vault already exists for this account.")
        }

        // Create a new empty Vault
        let vault <- TSHOT.createEmptyVault(vaultType: Type<@TSHOT.Vault>())
        signer.storage.save(<-vault, to: tokenVaultPath)

        // Create a public capability for the stored Vault that exposes the Receiver interface
        let receiverCap = signer.capabilities.storage.issue<&{FungibleToken.Receiver}>(tokenVaultPath)
        signer.capabilities.publish(receiverCap, at: tokenReceiverPath)

        // Create a public capability for the stored Vault that exposes the Balance interface
        let balanceCap = signer.capabilities.storage.issue<&{FungibleToken.Balance}>(tokenVaultPath)
        signer.capabilities.publish(balanceCap, at: tokenBalancePath)

        log("Vault setup complete for the user.")
    }

    execute {
        log("Transaction executed successfully.")
    }
  }
`;
