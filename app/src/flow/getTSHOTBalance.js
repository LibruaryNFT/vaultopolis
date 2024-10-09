export const getTSHOTBalance = `
  import TSHOT from 0x332ffc0ae9bba9c1
  import FungibleToken from 0x9a0766d93b6608b7

  access(all) fun main(address: Address): UFix64 {
    let account = getAccount(address)
    
    // Borrow a reference to the user's Vault balance using the public capability
    let balanceRef = account.capabilities.borrow<&{FungibleToken.Balance}>(/public/TSHOTTokenBalance)
        ?? panic("Could not borrow reference to the user's Vault balance")
    
    // Return the balance in the Vault
    return balanceRef.balance
  }
`;
