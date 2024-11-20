import "HybridCustody"
import "NonFungibleToken"

// Verify capabilities for a specific child account
access(all) fun main(parent: Address, child: Address): Bool {
    // Get the parent account's manager
    let parentAcct = getAuthAccount<auth(Storage) &Account>(parent)
    let manager = parentAcct.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
        ?? panic("Hybrid Custody Manager does not exist")

    // Borrow the child account
    let childAcct = manager.borrowAccount(addr: child)
        ?? panic("Child account not found")

    let type = Type<&{NonFungibleToken.CollectionPublic}>()
    let controllerId = childAcct.getControllerIDForType(type: type, forPath: /storage/MomentCollection)
        ?? panic("no controller ID found for desired type")

    let nakedCap = childAcct.getCapability(controllerID: controllerId, type: type)
        ?? panic("capability not found")

    let cap = nakedCap as! Capability<&{NonFungibleToken.CollectionPublic}>
    cap.borrow() ?? panic("unable to borrow nft provider collection")

    return true
}
