export const exchangeTSHOTForNFT = `
  import TopShotExchange from 0x332ffc0ae9bba9c1
  import FungibleToken from 0x9a0766d93b6608b7
  import NonFungibleToken from 0x631e88ae7f1d7c20
  import TSHOT from 0x332ffc0ae9bba9c1

  transaction(tokenAmount: UFix64) {

    let address: Address

    prepare(signer: auth(Capabilities, Storage) &Account) {
      self.address = signer.address

      // Borrow a reference to the signer's TSHOT vault
      let provider = signer.storage.borrow<auth(FungibleToken.Withdraw) &TSHOT.Vault>(from: /storage/TSHOTTokenVault)
        ?? panic("Could not borrow a reference to the TSHOT vault.")

      // Withdraw the specified amount of TSHOT tokens
      let tokens <- provider.withdraw(amount: tokenAmount) as! @TSHOT.Vault

      // Call the swap function on TopShotExchange to exchange tokens for an NFT
      TopShotExchange.swapTSHOTForNFT(
        address: self.address,
        tokenAmount: tokenAmount,
        tokenVault: <-tokens
      )

      log("Successfully swapped TSHOT for TopShot NFTs")
    }

    execute {
      // This is where any post-transaction logic would go, if needed
    }
  }
`;
