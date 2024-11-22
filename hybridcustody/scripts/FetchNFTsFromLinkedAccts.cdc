// breaks for big collections

import "HybridCustody"
import "NonFungibleToken"
import "MetadataViews"

// This script iterates through a parent's child accounts,
// identifies private paths with an accessible NonFungibleToken.Provider, and returns the corresponding typeIds

access(all) fun main(addr: Address): AnyStruct {
  let manager = getAuthAccount<auth(Storage) &Account>(addr).storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
    ?? panic ("manager does not exist")

  var typeIdsWithProvider: {Address: [String]} = {}
  var nftViews: {Address: {UInt64: MetadataViews.Display}} = {}

  let providerType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()
  let collectionType: Type = Type<@{NonFungibleToken.CollectionPublic}>()

  for address in manager.getChildAddresses() {
    let acct = getAuthAccount<auth(Storage, Capabilities) &Account>(address)
    let foundTypes: [String] = []
    let views: {UInt64: MetadataViews.Display} = {}
    let childAcct = manager.borrowAccount(addr: address) ?? panic("child account not found")

    // Iterate through storage paths to find NFTs that are controlled by the parent account
    // To just find NFTs, check if thing stored is nft collection and borrow it as NFT collection and get IDs
    for s in acct.storage.storagePaths {
      // Iterate through capabilities
      for c in acct.capabilities.storage.getControllers(forPath: s) {
        if !c.borrowType.isSubtype(of: providerType){
          // If this doen't have providerType, it's not an NFT collection
          continue
        }

        // We're dealing with a Collection but we need to check if accessible from the parent account
        if let cap: Capability = childAcct.getCapability(controllerID: c.capabilityID, type: providerType) { // Part 1
          let providerCap = cap as! Capability<&{NonFungibleToken.Provider}>

          if !providerCap.check(){
            // If I don't have access to control the account, skip it.
            // Disable this check to do something else.
            // 
            continue
          }

          foundTypes.append(cap.borrow<&AnyResource>()!.getType().identifier)
          typeIdsWithProvider[address] = foundTypes
          // Don't need to keep looking at capabilities, we can control NFT from parent account
          break
        }
      }
    }

    // Iterate storage, check if typeIdsWithProvider contains the typeId, if so, add to views
    acct.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {

      if typeIdsWithProvider[address] == nil {
        return true
      }
      
      for key in typeIdsWithProvider.keys {
        for idx, value in typeIdsWithProvider[key]! {
          let value = typeIdsWithProvider[key]!

          if value[idx] != type.identifier {
              continue
          } else {
            if type.isInstance(collectionType) {
              continue
            }
            if let collection = acct.storage.borrow<&{NonFungibleToken.CollectionPublic}>(from: path) {
              // Iterate over IDs & resolve the Display view
              for id in collection.getIDs() {
                let nft = collection.borrowNFT(id)!
                if let display = nft.resolveView(Type<MetadataViews.Display>())! as? MetadataViews.Display {
                  views.insert(key: id, display)
                }
              }
            }
            continue
          }
        }
      }
      return true
    })
    nftViews[address] = views
  }
  return nftViews
}
