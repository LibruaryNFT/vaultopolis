import TopShotTiers from 0x0b2a3299cc857e29

transaction(setID: UInt32, playIDs: [UInt32], tierRawValue: UInt8) {
    let adminRef: &TopShotTiers.Admin

    prepare(signer: auth(Storage) &Account) {
        self.adminRef = signer.storage.borrow<&TopShotTiers.Admin>(from: /storage/TopShotTiersAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }

    execute {
        let tierEnum: TopShotTiers.Tier = TopShotTiers.Tier(rawValue: tierRawValue) 
            ?? panic("Invalid tier value")

        for playID in playIDs {
            self.adminRef.addOrUpdatePlayIDTier(setID: setID, playID: playID, tier: tierEnum)
        }
    }
}
