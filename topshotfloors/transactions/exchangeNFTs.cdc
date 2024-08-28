import "TopShotFloors"
import "NonFungibleToken"
import "TopShot"
import "FungibleToken"

transaction(nftIDs: [UInt64]) {

    prepare(signer: auth(Capabilities, Storage) &Account) {
        // Retrieve the capability to the user's TopShot Collection
        let ownerCollection = signer.capabilities
            .storage
            .issue<auth(NonFungibleToken.Withdraw) &TopShot.Collection>(/storage/MomentCollection)

        // Retrieve the capability for the user's Flow token receiver using the hardcoded path
        let receiverCap = signer
            .capabilities
            .get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)

        // Call the depositNFTsForFlow function in the TopShotFloors contract
        TopShotFloors.depositNFTsForFlow(
            ownerCollection: ownerCollection,
            nftIDs: nftIDs,
            receiverCap: receiverCap
        )
    }

    execute {
        log("NFTs exchanged for Flow tokens successfully.")
    }
}