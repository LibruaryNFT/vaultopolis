import "HybridCustody"

access(all) fun main(parent: Address): [Address] {
    let parentAcct = getAccount(parent)
    let manager = parentAcct.capabilities
        .get<&{HybridCustody.ManagerPublic}>(HybridCustody.ManagerPublicPath)
        .borrow()
        ?? panic("Hybrid Custody Manager does not exist")

    return manager.getChildAddresses()
}
