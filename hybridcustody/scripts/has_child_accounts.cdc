import "HybridCustody"

access(all) fun main(parent: Address): Bool {
    let acct = getAuthAccount<auth(BorrowValue) &Account>(parent)
    if let manager = acct.storage.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath) {
        return manager.getChildAddresses().length > 0
    }
    return false
}