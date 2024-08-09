//Arguments (2):
 //   - Argument 0: {"type":"Address","value":"0xe03daebed8ca0615"}
  //  - Argument 1: {"type":"UFix64","value":"100.0"}

import FlowToken from "FlowToken"
import FungibleToken from "FungibleToken"

transaction(address: Address, amount: UFix64) {
  let tokenAdmin: &FlowToken.Administrator
  let tokenReceiver: &{FungibleToken.Receiver}

  prepare(signer: AuthAccount) {
        self.tokenAdmin = signer
          .borrow<&FlowToken.Administrator>(from: /storage/flowTokenAdmin)
          ?? panic("Signer is not the token admin")

        self.tokenReceiver = getAccount(address)
          .getCapability(/public/flowTokenReceiver)!
          .borrow<&{FungibleToken.Receiver}>()
          ?? panic("Unable to borrow receiver reference")
    }

    execute {
        let minter <- self.tokenAdmin.createNewMinter(allowedAmount: amount)
        let mintedVault <- minter.mintTokens(amount: amount)

        self.tokenReceiver.deposit(from: <-mintedVault)

        destroy minter
    }
}