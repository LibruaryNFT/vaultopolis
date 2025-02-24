export const getFLOWBalance = `

import FungibleToken from 0xf233dcee88fe0abe
import FlowToken from 0x1654653399040a61

access(all) fun main(address: Address): UFix64 {

    let vaultRef = getAccount(address)
        .capabilities
        .get<&FlowToken.Vault>(/public/flowTokenBalance)
        .borrow()
        ?? panic("Could not borrow reference to the vault balance")

    return vaultRef.balance
}

`;
