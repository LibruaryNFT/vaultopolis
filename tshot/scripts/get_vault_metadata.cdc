import "TopShot"
import "TopShotExchange"

// This script gets the metadata associated with a moment
// in the TopShotExchange vault by looking up its playID
// and then searching for that play's metadata in the TopShot contract

// Parameters:
//
// id: The unique ID for the moment whose data needs to be read

// Returns: {String: String} 
// A dictionary of all the play metadata associated
// with the specified moment

access(all) fun main(id: UInt64): {String: String} {

    // Get the account that owns the vault
    let vaultOwner = getAccount(0xf8d6e0586b0a20c7)

    // Borrow a reference to the public interface of the NFTVault
    let vaultRef = vaultOwner.capabilities.borrow<&{TopShotExchange.PublicVault}>(/public/TopShotNFTVault)
        ?? panic("Could not borrow a reference to the NFTVault")

    // Borrow a reference to the specified moment using the borrowNFT method
    let token = vaultRef.borrowNFT(id: id)
        ?? panic("Could not borrow a reference to the specified moment in the vault")

    // Get the moment's metadata to access its play and set IDs
    let data = token.data

    // Use the moment's play ID 
    // to get all the metadata associated with that play
    let metadata = TopShot.getPlayMetaData(playID: data.playID) ?? panic("Play doesn't exist")

    log(metadata)

    return metadata
}
