export const setupTopShotCollection = `

  import TopShot from 0x0b2a3299cc857e29

  transaction {
      prepare(acct: auth(Storage, Capabilities) &Account) {
          // First, check if a moment collection already exists
          if acct.storage.borrow<&TopShot.Collection>(from: /storage/MomentCollection) == nil {
              // Create a new TopShot Collection
              let collection <- TopShot.createEmptyCollection(nftType: Type<@TopShot.NFT>()) as! @TopShot.Collection
              // Store the new Collection in storage
              acct.storage.save(<-collection, to: /storage/MomentCollection)
          }

          acct.capabilities.unpublish(/public/MomentCollection)
          acct.capabilities.publish(
              acct.capabilities.storage.issue<&TopShot.Collection>(/storage/MomentCollection),
              at: /public/MomentCollection
          )
      }
  }
`;
