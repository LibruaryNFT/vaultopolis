export const verifyTSHOTVault = `
  //import TSHOT from 0x332ffc0ae9bba9c1
  //import FungibleToken from 0x9a0766d93b6608b7

import TSHOT from 0x05b67ba314000b2d
import FungibleToken from 0xf233dcee88fe0abe

  access(all) fun main(userAddress: Address): Bool {
    let userAccount = getAccount(userAddress)

    // Check if the user has the Receiver capability
    let receiverCap = userAccount
        .capabilities
        .borrow<&{FungibleToken.Receiver}>(/public/TSHOTTokenReceiver)
    
    // Check if the user has the Balance capability
    let balanceCap = userAccount
        .capabilities
        .borrow<&{FungibleToken.Balance}>(/public/TSHOTTokenBalance)

    // Return true if both capabilities exist, otherwise false
    return receiverCap != nil && balanceCap != nil
  }
`;
