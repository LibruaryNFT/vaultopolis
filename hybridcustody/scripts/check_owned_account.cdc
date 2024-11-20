import "HybridCustody"

access(all) fun main(child: Address): Bool {
    let ownedAcct = getAccount(child)
        .capabilities
        .get<&{HybridCustody.OwnedAccountPublic}>(HybridCustody.OwnedAccountPublicPath)
        .borrow()

    return ownedAcct != nil
}
