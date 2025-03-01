import TopShotTiers from 0xb1788d64d512026d

// Transaction for set 181, all entries are fandom (with Moment Counts above 0)
transaction {
    let adminRef: &TopShotTiers.Admin

    prepare(signer: auth(Storage) &Account) {
        self.adminRef = signer.storage
            .borrow<&TopShotTiers.Admin>(from: /storage/TopShotTiersAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }

    execute {
        // Fandom tier entries for set 181

        // Alperen Şengün – Play ID: 6354, Moment Count: 1216
        self.adminRef.addOrUpdatePlayIDTier(setID: 181, playID: 6354, tier: TopShotTiers.Tier.fandom)
        
        // Victor Wembanyama – Play ID: 6355, Moment Count: 1216
        self.adminRef.addOrUpdatePlayIDTier(setID: 181, playID: 6355, tier: TopShotTiers.Tier.fandom)
        
        // Kyrie Irving – Play ID: 6356, Moment Count: 1216
        self.adminRef.addOrUpdatePlayIDTier(setID: 181, playID: 6356, tier: TopShotTiers.Tier.fandom)
        
        // Cade Cunningham – Play ID: 6357, Moment Count: 1216
        self.adminRef.addOrUpdatePlayIDTier(setID: 181, playID: 6357, tier: TopShotTiers.Tier.fandom)
        
        // Evan Mobley – Play ID: 6358, Moment Count: 1216
        self.adminRef.addOrUpdatePlayIDTier(setID: 181, playID: 6358, tier: TopShotTiers.Tier.fandom)
        
        // Jalen Williams – Play ID: 6359, Moment Count: 1216
        self.adminRef.addOrUpdatePlayIDTier(setID: 181, playID: 6359, tier: TopShotTiers.Tier.fandom)
        
        // Tyler Herro – Play ID: 6360, Moment Count: 1216
        self.adminRef.addOrUpdatePlayIDTier(setID: 181, playID: 6360, tier: TopShotTiers.Tier.fandom)
        
        // Stephen Curry – Play ID: 6361, Moment Count: 75
        self.adminRef.addOrUpdatePlayIDTier(setID: 181, playID: 6361, tier: TopShotTiers.Tier.fandom)
        
        // Trae Young – Play ID: 6362, Moment Count: 1216
        self.adminRef.addOrUpdatePlayIDTier(setID: 181, playID: 6362, tier: TopShotTiers.Tier.fandom)
        
        // Jaylen Brown – Play ID: 6363, Moment Count: 1216
        self.adminRef.addOrUpdatePlayIDTier(setID: 181, playID: 6363, tier: TopShotTiers.Tier.fandom)
        
        // Damian Lillard – Play ID: 6364, Moment Count: 1216
        self.adminRef.addOrUpdatePlayIDTier(setID: 181, playID: 6364, tier: TopShotTiers.Tier.fandom)
    }
}
