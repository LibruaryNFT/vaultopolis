export const getTSHOTBalance = `
  //import TSHOT from 0x332ffc0ae9bba9c1
  //import FungibleToken from 0x9a0766d93b6608b7

import TSHOT from 0x05b67ba314000b2d
import FungibleToken from 0xf233dcee88fe0abe

access(all) fun main(address: Address): UFix64 {
    let account = getAccount(address)

    // Check if the user has the Receiver capability
    let receiverCap = account.capabilities.borrow<&{FungibleToken.Receiver}>(TSHOT.tokenReceiverPath)
    if receiverCap == nil {
        return 0.0 // Vault not set up, return 0.0
    }

    // Check if the user has the Balance capability
    let balanceCap = account.capabilities.borrow<&{FungibleToken.Balance}>(TSHOT.tokenBalancePath)
    if balanceCap == nil {
        return 0.0 // Vault not set up, return 0.0
    }

    // Safely access the balance using optional chaining
    return balanceCap?.balance ?? 0.0
}

`;
