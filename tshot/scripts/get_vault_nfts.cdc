import "TopShotExchange"

access(all) fun main(): [UInt64] {
    let vaultOwner = getAccount(0xf8d6e0586b0a20c7)

    // Borrow a reference to the public interface of the NFTVault
    let vaultRef = vaultOwner.capabilities.borrow<&{TopShotExchange.PublicVault}>(/public/TopShotNFTVault)
        ?? panic("Could not borrow a reference to the NFTVault")

    // Retrieve the list of NFT IDs
    return vaultRef.getVaultIDs()
}
