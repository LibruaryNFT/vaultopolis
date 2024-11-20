import "HybridCustody"
import "NonFungibleToken"

access(all) fun main(parent: Address, child: Address): UInt64? {
    let parentAcct = getAuthAccount<auth(Storage) &Account>(parent)
    let manager = parentAcct.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
        ?? panic("Hybrid Custody Manager does not exist")

    let childAcct = manager.borrowAccount(addr: child)
        ?? panic("Child account not found")

    return childAcct.getControllerIDForType(
        type: Type<&{NonFungibleToken.Provider}>(),
        forPath: /storage/MomentCollection
    )
}
