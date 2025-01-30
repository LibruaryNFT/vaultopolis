import TopShotTiers from 0xb1788d64d512026d

transaction {
    let adminRef: &TopShotTiers.Admin

    prepare(signer: auth(Storage) &Account) {
        self.adminRef = signer.storage.borrow<&TopShotTiers.Admin>(from: /storage/TopShotTiersAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }

    execute {
// Set 175 (all rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6192, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6191, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6190, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6189, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6188, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6187, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6186, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6185, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6184, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6183, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6182, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6181, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6180, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6179, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6178, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6099, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6098, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6097, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6096, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6095, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6094, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6093, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6092, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6091, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6090, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6089, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6088, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6087, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6086, tier: TopShotTiers.Tier.rare)
self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6085, tier: TopShotTiers.Tier.rare)

// Set 176 (all ultimate)
self.adminRef.addOrUpdatePlayIDTier(setID: 176, playID: 6158, tier: TopShotTiers.Tier.ultimate)
self.adminRef.addOrUpdatePlayIDTier(setID: 176, playID: 6157, tier: TopShotTiers.Tier.ultimate)
self.adminRef.addOrUpdatePlayIDTier(setID: 176, playID: 6156, tier: TopShotTiers.Tier.ultimate)
self.adminRef.addOrUpdatePlayIDTier(setID: 176, playID: 6155, tier: TopShotTiers.Tier.ultimate)
self.adminRef.addOrUpdatePlayIDTier(setID: 176, playID: 6154, tier: TopShotTiers.Tier.ultimate)
self.adminRef.addOrUpdatePlayIDTier(setID: 176, playID: 6153, tier: TopShotTiers.Tier.ultimate)
self.adminRef.addOrUpdatePlayIDTier(setID: 176, playID: 6152, tier: TopShotTiers.Tier.ultimate)
self.adminRef.addOrUpdatePlayIDTier(setID: 176, playID: 6151, tier: TopShotTiers.Tier.ultimate)

// Set 177 (all common)
self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6203, tier: TopShotTiers.Tier.common)
self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6170, tier: TopShotTiers.Tier.common)
self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6169, tier: TopShotTiers.Tier.common)
self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6168, tier: TopShotTiers.Tier.common)
self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6167, tier: TopShotTiers.Tier.common)
self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6166, tier: TopShotTiers.Tier.common)
self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6165, tier: TopShotTiers.Tier.common)
self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6164, tier: TopShotTiers.Tier.common)
self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6163, tier: TopShotTiers.Tier.common)
self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6162, tier: TopShotTiers.Tier.common)
self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6161, tier: TopShotTiers.Tier.common)
self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6160, tier: TopShotTiers.Tier.common)
self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6159, tier: TopShotTiers.Tier.common)

    }
}