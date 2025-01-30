export const getTier = `

import TopShotTiers from 0xb1788d64d512026d
import TopShot from 0x0b2a3299cc857e29

access(all) fun main(account: Address, momentID: UInt64): String {
    // Borrow a reference to the user's TopShot Collection
    let collectionRef = getAccount(account)
        .capabilities.get<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection)
        .borrow()
        ?? panic("Could not borrow capability from public collection")

    // Borrow the NFT from the collection using the momentID
    let momentRef = collectionRef.borrowMoment(id: momentID)
        ?? panic("Could not borrow the TopShot NFT")

    // Get the tier of the NFT
    let tier = TopShotTiers.getTier(nft: momentRef)

    // Return the tier of the NFT as a string or an empty string if not found
    return tier != nil ? TopShotTiers.tierToString(tier: tier!) : ""
}

`;
