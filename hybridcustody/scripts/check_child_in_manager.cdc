import "HybridCustody"

access(all) fun main(parent: Address, child: Address): Bool {
    let parentAcct = getAuthAccount<auth(Storage) &Account>(parent)
    let manager = parentAcct.storage.borrow<&{HybridCustody.ManagerPublic}>(from: HybridCustody.ManagerStoragePath)
        ?? panic("Manager not found")

    let childAddresses = manager.getChildAddresses()
    return childAddresses.contains(child)
}
