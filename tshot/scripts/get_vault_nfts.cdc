
import "TopShotExchange"

access(all) fun main(): [UInt64] {
    let admin = getAccount(0xf8d6e0586b0a20c7)

    // Borrow a reference to the NFTVault in the admin's storage
    let nftVaultRef = admin.storage.borrow<&TopShotExchange.NFTVault>(from: TopShotExchange.nftVaultPath)
        ?? panic("Could not borrow reference to NFTVault")

    // Return the list of IDs in the vault
    return nftVaultRef.nfts.keys
}
