import "HybridCustody"

access(all) fun main(child: Address): Bool {
    let childAccount = getAccount(child)
    return childAccount
        .storage
        .borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath) != nil
}
