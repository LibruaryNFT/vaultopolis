import "TopShotExchange"
import "NonFungibleToken"
import "TopShot"
import "FungibleToken"
import "TSHOT"

transaction(nftIDs: [UInt64]) {

    prepare(signer: auth(Capabilities, Storage) &Account) {
        // Retrieve the capability to the user's TopShot Collection
        let ownerCollection = signer.capabilities
            .storage
            .issue<auth(NonFungibleToken.Withdraw) &TopShot.Collection>(/storage/MomentCollection)

        // Retrieve the capability for the user's TSHOT Receiver using the hardcoded path
        let receiverCap = signer
            .capabilities
            .get<&{FungibleToken.Receiver}>(TSHOT.tokenReceiverPath)

        // Now call the swap function with the user's capabilities
        TopShotExchange.swapNFTForTSHOT(
            ownerCollection: ownerCollection, 
            nftIDs: nftIDs, 
            receiverCap: receiverCap, 
            userAddress: signer.address
        )
    }

    execute {
        log("Swap completed successfully.")
    }
}