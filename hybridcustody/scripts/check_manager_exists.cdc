import "HybridCustody"

access(all) fun main(parent: Address): Bool {
    let parentAcct = getAuthAccount<auth(Storage) &Account>(parent)
    let manager = parentAcct.storage.borrow<&{HybridCustody.ManagerPublic}>(from: HybridCustody.ManagerStoragePath)
    return manager != nil
}
