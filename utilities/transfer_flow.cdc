import "FungibleToken"
import "FlowToken"

transaction(amount: UFix64, to: Address) {

    let sentVault: @FlowToken.Vault

    prepare(signer: auth(BorrowValue) &Account) {
        let vaultRef = signer
            .storage
            .borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
                from: /storage/flowTokenVault
            )
            ?? panic("Could not borrow FlowToken vault from /storage/flowTokenVault")

        // Downcast the interface resource to FlowToken.Vault
        self.sentVault <- vaultRef.withdraw(amount: amount) as! @FlowToken.Vault
    }

    execute {
        let recipient = getAccount(to)

        let receiverRef = recipient
            .capabilities
            .borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            ?? panic("Could not borrow reference to the recipient's FlowToken receiver.")

        receiverRef.deposit(from: <-self.sentVault)
    }
}
