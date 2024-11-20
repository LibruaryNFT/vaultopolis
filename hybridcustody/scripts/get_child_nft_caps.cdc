import "HybridCustody"
import "NonFungibleToken"

// This script iterates through a parent's child accounts,
// identifies private paths with an accessible NonFungibleToken.Provider, and returns the corresponding typeIds
access(all) fun main(addr: Address): {Address: [String]} {
    let account = getAuthAccount<auth(Storage) &Account>(addr)
    let manager = account.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(
        from: HybridCustody.ManagerStoragePath
    ) ?? panic("Hybrid Custody Manager does not exist")

    var typeIdsWithProvider: {Address: [String]} = {}
    let providerType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()

    // Iterate through child accounts
    for address in manager.getChildAddresses() {
        log("Checking child account: ".concat(address.toString()))

        let childAcct = manager.borrowAccount(addr: address) 
            ?? panic("Child account not found")
        
        let foundTypes: [String] = []
        let childAccount = getAuthAccount<auth(Storage, Capabilities) &Account>(address)

        // Get all private storage paths
        for path in childAccount.storage.storagePaths {
            log("Checking path: ".concat(path.toString()))

            let controllers = childAccount.capabilities.storage.getControllers(forPath: path)
            for controller in controllers {
                log("Found controller for path: ".concat(path.toString()))

                // Check if the controller type matches the expected provider type
                if !controller.borrowType.isSubtype(of: providerType) {
                    log("Controller type does not match provider type")
                    continue
                }

                // Attempt to get the capability from the child account
                if let cap = childAcct.getCapability(controllerID: controller.capabilityID, type: providerType) {
                    let providerCap = cap as! Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>
                    
                    if !providerCap.check() {
                        log("Capability is invalid or inaccessible")
                        continue
                    }

                    // Append the capability's type identifier
                    let resourceType = cap.borrow<&AnyResource>()?.getType()?.identifier ?? "Unknown"
                    foundTypes.append(resourceType)
                    log("Capability found and added: ".concat(resourceType))
                }
            }
        }

        if foundTypes.length > 0 {
            typeIdsWithProvider[address] = foundTypes
        }
    }

    return typeIdsWithProvider
}
