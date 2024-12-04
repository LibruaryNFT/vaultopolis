import "TopShotTiers"

transaction(setID: UInt32, playID: UInt32) {
    let adminRef: &TopShotTiers.Admin

    prepare(signer: auth(Storage) &Account) {
        self.adminRef = signer.storage.borrow<&TopShotTiers.Admin>(from: /storage/TopShotTiersAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }

    execute {
        self.adminRef.removePlayIDTier(setID: setID, playID: playID)
    }
}
