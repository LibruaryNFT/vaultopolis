import "TSHOTR"
import "FungibleToken"

access(all) fun main(address: Address): UFix64 {
    let account = getAccount(address)
    
    // Borrow a reference to the user's Vault balance using the public capability
    let balanceRef = account.capabilities.borrow<&{FungibleToken.Balance}>(/public/TSHOTRTokenBalance)
        ?? panic("Could not borrow reference to the user's Vault balance")
    
    // Return the balance in the Vault
    return balanceRef.balance
}
