export const destroyMoments = `

import TopShot from 0x332ffc0ae9bba9c1
import NonFungibleToken from 0x631e88ae7f1d7c20

transaction(momentIDs: [UInt64]) {

    let collectionRef: auth(NonFungibleToken.Update) &TopShot.Collection
    
    prepare(acct: auth(BorrowValue) &Account) {
        // delist any of the moments that are listed (this delists for both MarketV1 and Marketv3)

        self.collectionRef = acct.storage.borrow<auth(NonFungibleToken.Update) &TopShot.Collection>(from: /storage/MomentCollection)
            ?? panic("Could not borrow from MomentCollection in storage")
    }

    execute {
        self.collectionRef.destroyMoments(ids: momentIDs)
    }
}

`;
