import TSHOT from "TSHOT"

access(all) fun main(address: Address): Bool {
    let account = getAccount(address)
    
    // Check if the Vault is linked to /public/tshotReceiver
    let vaultPublicRef = account.capabilities.borrow<&TSHOT.Vault>(/public/tshotReceiver)
                              ?? panic("Could not borrow reference to the Vault")

    return vaultPublicRef != nil
}
