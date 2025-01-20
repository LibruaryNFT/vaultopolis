export const getFLOWBalance = `

import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

access(all) fun main(address: Address): UFix64 {

    let vaultRef = getAccount(address)
        .capabilities
        .get<&FlowToken.Vault>(/public/flowTokenBalance)
        .borrow()
        ?? panic("Could not borrow reference to the vault balance")

    return vaultRef.balance
}

`;
