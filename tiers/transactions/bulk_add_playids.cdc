import TopShotTiers from 0xb1788d64d512026d

transaction {
    let adminRef: &TopShotTiers.Admin

    prepare(signer: auth(Storage) &Account) {
        self.adminRef = signer.storage.borrow<&TopShotTiers.Admin>(from: /storage/TopShotTiersAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }

    execute {
        // Set 175 (rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6282, tier: TopShotTiers.Tier.rare)
    }
}
