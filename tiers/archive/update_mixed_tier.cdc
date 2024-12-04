import TopShotTiers from 0xf8d6e0586b0a20c7

transaction(setID: UInt32, playID: UInt32, tierRawValue: UInt8) {
    let adminRef: &TopShotTiers.Admin

    prepare(signer: auth(Storage) &Account) {
        self.adminRef = signer.storage.borrow<&TopShotTiers.Admin>(from: /storage/TopShotTiersAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }

    execute {
        let tierEnum: TopShotTiers.Tier = TopShotTiers.Tier(rawValue: tierRawValue) ?? panic("Invalid tier value")
        
        self.adminRef.addOrUpdateMixedTierSet(setID: setID, playID: playID, tier: tierEnum)
    }
}
