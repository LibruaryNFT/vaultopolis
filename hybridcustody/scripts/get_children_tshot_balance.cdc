import "TSHOT"
import "FungibleToken"
import "HybridCustody"

// This script retrieves the TSHOT balance for each child account.
access(all) fun main(parent: Address): {Address: UFix64} {
    // Borrow the HybridCustody Manager from the parent account
    let manager = getAuthAccount<auth(Storage) &Account>(parent)
        .storage
        .borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(
            from: HybridCustody.ManagerStoragePath
        ) ?? panic("Manager does not exist")

    var childBalances: {Address: UFix64} = {}

    // Iterate through all child accounts
    for childAddress in manager.getChildAddresses() {
        log("Inspecting child account: ".concat(childAddress.toString()))

        // Get the child account
        let childAccount = getAccount(childAddress)

        // Check if the child has a Balance capability for TSHOT
        let balanceCap = childAccount.capabilities.borrow<&{FungibleToken.Balance}>(TSHOT.tokenBalancePath)
        if balanceCap != nil {
            // Add the balance to the result map
            let balance = balanceCap?.balance ?? 0.0
            childBalances[childAddress] = balance
            log("Child account ".concat(childAddress.toString()).concat(" has a balance of ").concat(balance.toString()))
        } else {
            // No Vault set up, set balance to 0.0
            childBalances[childAddress] = 0.0
            log("Child account ".concat(childAddress.toString()).concat(" has no TSHOT balance."))
        }
    }

    return childBalances
}
