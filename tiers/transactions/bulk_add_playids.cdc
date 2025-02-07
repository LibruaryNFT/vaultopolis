import TopShotTiers from 0xb1788d64d512026d

transaction {
    let adminRef: &TopShotTiers.Admin

    prepare(signer: auth(Storage) &Account) {
        self.adminRef = signer.storage.borrow<&TopShotTiers.Admin>(from: /storage/TopShotTiersAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }

    execute {
        // Set 141 - Fandom tier
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5149, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5150, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5151, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5152, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5153, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5154, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5155, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5156, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5157, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5158, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5159, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5160, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5161, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5162, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5163, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5164, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5165, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5166, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5167, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5168, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5169, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5170, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5171, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5172, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5173, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5174, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5175, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5176, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5194, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5195, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5196, tier: TopShotTiers.Tier.fandom)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5197, tier: TopShotTiers.Tier.fandom)

        // Set 141 - Rare tier
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5177, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5178, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5179, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5180, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5181, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5182, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5183, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5184, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5185, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5186, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5187, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5188, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5189, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5190, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5192, tier: TopShotTiers.Tier.rare)
        self.adminRef.addOrUpdatePlayIDTier(setID: 141, playID: 5193, tier: TopShotTiers.Tier.rare)
    }
}