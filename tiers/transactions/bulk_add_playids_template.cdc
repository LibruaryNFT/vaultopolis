import TopShotTiers from 0xb1788d64d512026d

transaction {
    let adminRef: &TopShotTiers.Admin

    prepare(signer: auth(Storage) &Account) {
        self.adminRef = signer.storage
            .borrow<&TopShotTiers.Admin>(from: /storage/TopShotTiersAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }

    execute {
        // Set 100 - rare
        self.adminRef.addOrUpdatePlayIDTier(setID: 100, playID: 6366, tier: TopShotTiers.Tier.rare)

        // Set 166 - rare
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6307, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6308, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6310, tier: TopShotTiers.Tier.rare)

        // Set 167 - fandom
        self.adminRef.addOrUpdatePlayIDTier(setID: 167, playID: 6365, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 167, playID: 6430, tier: TopShotTiers.Tier.fandom)

        // Set 169 - legendary
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6326, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6328, tier: TopShotTiers.Tier.legendary)
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6329, tier: TopShotTiers.Tier.legendary)

        // Set 171 - common
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6415, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6416, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6417, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6418, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6419, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6420, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6421, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6422, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6423, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6424, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6425, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6426, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6427, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6428, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6429, tier: TopShotTiers.Tier.common)

        // Set 172 - rare
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6367, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6368, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6369, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6370, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6371, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6372, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6373, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6374, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6375, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6376, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6377, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6378, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6379, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6380, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6381, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6382, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6383, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6384, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6385, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6386, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6387, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6388, tier: TopShotTiers.Tier.rare)

        // Set 174 - rare
        self.adminRef.addOrUpdatePlayIDTier(setID: 174, playID: 6118, tier: TopShotTiers.Tier.rare)

        // Set 177 - common
        self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6402, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6403, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6404, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6405, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6406, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6407, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6408, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6409, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6410, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6411, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6412, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6413, tier: TopShotTiers.Tier.common)

        // Set 180 - rare
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6393, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6394, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6395, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6396, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6397, tier: TopShotTiers.Tier.rare)

        // Set 182 - common
        self.adminRef.addOrUpdatePlayIDTier(setID: 182, playID: 6399, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 182, playID: 6400, tier: TopShotTiers.Tier.common)
        self.adminRef.addOrUpdatePlayIDTier(setID: 182, playID: 6401, tier: TopShotTiers.Tier.common)
    }
}
