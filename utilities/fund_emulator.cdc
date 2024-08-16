import FlowToken from "FlowToken"
import FungibleToken from "FungibleToken"

transaction(address: Address, amount: UFix64) {
    // Declare references to the FlowToken Administrator and the FungibleToken Receiver
    let tokenAdmin: &FlowToken.Administrator
    let tokenReceiver: &{FungibleToken.Receiver}

    prepare(acct: auth(BorrowValue) &Account) {
        // Borrow the FlowToken Administrator capability from the signer's storage
        self.tokenAdmin = acct
            .storage
            .borrow<&FlowToken.Administrator>(from: /storage/flowTokenAdmin)
            ?? panic("Signer is not the token admin")

        // Access the recipient's account and borrow the capability for the FungibleToken Receiver
        let account = getAccount(address)

        // Check if the capability exists
        let receiverCap = account
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            .check()

        if !receiverCap {
            panic("The specified address does not have a FlowToken receiver capability.")
        }

        // Borrow the capability as a reference
        self.tokenReceiver = account
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            .borrow()
            ?? panic("Cannot borrow a reference to the recipient's flow token receiver")
    }

    execute {
        // Create a new minter with the specified allowed amount
        let minter <- self.tokenAdmin.createNewMinter(allowedAmount: amount)
        
        // Mint the specified amount of Flow tokens
        let mintedVault <- minter.mintTokens(amount: amount)

        // Deposit the minted tokens into the receiver's vault
        self.tokenReceiver.deposit(from: <-mintedVault)

        // Destroy the minter after it has been used
        destroy minter
    }
}