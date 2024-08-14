import "TSHOT"

pub fun main(address: Address): UFix64 {
    let account = getAccount(address)
    
    // Borrow a reference to the user's Vault using the public capability
    let vaultRef = account.capabilities.borrow<&TSHOT.Vault>(/public/tshotReceiver)
        ?? panic("Could not borrow reference to the user's Vault")
    
    // Return the balance in the Vault
    return vaultRef.getBalance()
}
