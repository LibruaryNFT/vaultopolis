import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"

access(all) fun main(address: Address): UFix64 {

    let vaultRef = getAccount(address)
        .capabilities
        .get<&FlowToken.Vault>(/public/flowTokenBalance)
        .borrow()
        ?? panic("Could not borrow reference to the vault balance")

    return vaultRef.balance
}