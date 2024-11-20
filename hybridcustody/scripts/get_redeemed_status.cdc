import "HybridCustody"

access(all) fun main(child: Address, parent: Address): Bool {
    let ownedAcct = getAccount(child)
        .capabilities
        .get<&{HybridCustody.OwnedAccountPublic}>(HybridCustody.OwnedAccountPublicPath)
        .borrow()
        ?? panic("OwnedAccount not found")

    return ownedAcct.getRedeemedStatus(addr: parent) == true
}
