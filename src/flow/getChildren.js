export const getChildren = `

import HybridCustody from 0x294e44e1ec6993c6

access(all) fun main(parent: Address): [Address] {
    let acct = getAuthAccount<auth(Storage) &Account>(parent)
    let manager = acct.storage.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
        ?? panic("manager not found")
    return  manager.getChildAddresses()
}

`;
