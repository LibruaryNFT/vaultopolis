import TopShotTiers from 0xf8d6e0586b0a20c7

transaction(setID: UInt32, playID: UInt32) {
    let adminRef: &TopShotTiers.Admin

    prepare(signer: auth(Storage) &Account) {
        self.adminRef = signer.storage.borrow<&TopShotTiers.Admin>(from: /storage/TopShotTiersAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }

    execute {
        self.adminRef.removePlayIDFromMixedTierSet(setID: setID, playID: playID)
        log("Removed play ID from mixed tier set successfully")
    }
}
