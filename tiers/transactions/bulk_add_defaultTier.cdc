import TopShotTiers from 0xb1788d64d512026d

transaction {
    let adminRef: &TopShotTiers.Admin

    prepare(signer: auth(Storage) &Account) {
        self.adminRef = signer.storage.borrow<&TopShotTiers.Admin>(from: /storage/TopShotTiersAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }

    execute {
        self.adminRef.addOrUpdateDefaultTier(setID: 1, tier: TopShotTiers.Tier.ultimate)
        self.adminRef.addOrUpdateDefaultTier(setID: 2, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 3, tier: TopShotTiers.Tier.ultimate)
        self.adminRef.addOrUpdateDefaultTier(setID: 4, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 5, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 6, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 7, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 8, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 9, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 10, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 11, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 12, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 13, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 14, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 15, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 16, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 17, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 18, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 19, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 20, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 21, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 22, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 23, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 24, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 25, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 26, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 27, tier: TopShotTiers.Tier.ultimate)
        self.adminRef.addOrUpdateDefaultTier(setID: 28, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 29, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 30, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 31, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 32, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 33, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 34, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 35, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 36, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 37, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 38, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 39, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 40, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 41, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 42, tier: TopShotTiers.Tier.ultimate)
        self.adminRef.addOrUpdateDefaultTier(setID: 43, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 44, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 45, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 46, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 47, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 48, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 49, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 50, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 51, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 52, tier: TopShotTiers.Tier.ultimate)
        self.adminRef.addOrUpdateDefaultTier(setID: 53, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 54, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 55, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 56, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 57, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 58, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 59, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 60, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 61, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 62, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 63, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 64, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 65, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 66, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 67, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 68, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 69, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 70, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 71, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 72, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 73, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 75, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 76, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 77, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 78, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 79, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 80, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 81, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 82, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 83, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 84, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 85, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 86, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 87, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 88, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 89, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 90, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 91, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 92, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 93, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 94, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 95, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 96, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 97, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 98, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 99, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 101, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 102, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 103, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 104, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 105, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 106, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 107, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 108, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 110, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 111, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 112, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 113, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 115, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 116, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 118, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 120, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 121, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 122, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 123, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 124, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 125, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 126, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 127, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 128, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 129, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 130, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 131, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 132, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 133, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 134, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 135, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 136, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 137, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 138, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 139, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 140, tier: TopShotTiers.Tier.ultimate)
        self.adminRef.addOrUpdateDefaultTier(setID: 142, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 143, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdateDefaultTier(setID: 144, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 145, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdateDefaultTier(setID: 146, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 147, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 148, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 149, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 150, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 151, tier: TopShotTiers.Tier.ultimate)
        self.adminRef.addOrUpdateDefaultTier(setID: 152, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 153, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 154, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 157, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 159, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdateDefaultTier(setID: 160, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 161, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdateDefaultTier(setID: 162, tier: TopShotTiers.Tier.legendary)
    }
}