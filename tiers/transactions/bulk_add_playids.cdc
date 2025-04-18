import TopShotTiers from 0xb1788d64d512026d

transaction {
    let adminRef: &TopShotTiers.Admin

    prepare(signer: auth(Storage) &Account) {
        self.adminRef = signer.storage
            .borrow<&TopShotTiers.Admin>(from: /storage/TopShotTiersAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }

    execute {
        // --------------------------------------
        // Set 164 - "Rookie Debut"
        // --------------------------------------
        // PlayerName: Damion Baugh, setName: Rookie Debut, momentCount: 4000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 164, playID: 6540, tier: TopShotTiers.Tier.common)

        // PlayerName: Bobi Klintman, setName: Rookie Debut, momentCount: 4000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 164, playID: 6541, tier: TopShotTiers.Tier.common)

        // PlayerName: Drew Timme, setName: Rookie Debut, momentCount: 4000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 164, playID: 6621, tier: TopShotTiers.Tier.common)

        // PlayerName: Keion Brooks Jr., setName: Rookie Debut, momentCount: 4000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 164, playID: 6622, tier: TopShotTiers.Tier.common)

        // PlayerName: Alex Reese, setName: Rookie Debut, momentCount: 4000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 164, playID: 6623, tier: TopShotTiers.Tier.common)

        // --------------------------------------
        // Set 165 - "Supernova"
        // --------------------------------------
        // PlayerName: Russell Westbrook, setName: Supernova, momentCount: 10, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare, ultimate]
        self.adminRef.addOrUpdatePlayIDTier(setID: 165, playID: 6562, tier: TopShotTiers.Tier.ultimate)

        // PlayerName: Kevin Durant, setName: Supernova, momentCount: 10, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare, ultimate]
        self.adminRef.addOrUpdatePlayIDTier(setID: 165, playID: 6563, tier: TopShotTiers.Tier.ultimate)

        // --------------------------------------
        // Set 166 - "Metallic Gold LE"
        // --------------------------------------
        // PlayerName: Jaylen Brown, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6595, tier: TopShotTiers.Tier.rare)

        // PlayerName: Mark Williams, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6596, tier: TopShotTiers.Tier.rare)

        // PlayerName: Russell Westbrook, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6597, tier: TopShotTiers.Tier.rare)

        // PlayerName: Cade Cunningham, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6598, tier: TopShotTiers.Tier.rare)

        // PlayerName: Damian Lillard, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6599, tier: TopShotTiers.Tier.rare)

        // PlayerName: Anthony Edwards, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6600, tier: TopShotTiers.Tier.rare)

        // PlayerName: Julius Randle, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6601, tier: TopShotTiers.Tier.rare)

        // PlayerName: CJ McCollum, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6602, tier: TopShotTiers.Tier.rare)

        // PlayerName: Karl-Anthony Towns, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6603, tier: TopShotTiers.Tier.rare)

        // PlayerName: Shai Gilgeous-Alexander, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6604, tier: TopShotTiers.Tier.rare)

        // PlayerName: Franz Wagner, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6605, tier: TopShotTiers.Tier.rare)

        // PlayerName: Paolo Banchero, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6606, tier: TopShotTiers.Tier.rare)

        // PlayerName: Paul George, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6607, tier: TopShotTiers.Tier.rare)

        // PlayerName: Deni Avdija, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6608, tier: TopShotTiers.Tier.rare)

        // PlayerName: Toumani Camara, setName: Metallic Gold LE, momentCount: 299, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 166, playID: 6609, tier: TopShotTiers.Tier.rare)

        // --------------------------------------
        // Set 167 - "Metallic Silver"
        // --------------------------------------
        // PlayerName: Evan Mobley, setName: Metallic Silver, momentCount: 200, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 167, playID: 6456, tier: TopShotTiers.Tier.fandom)

        // PlayerName: Shaedon Sharpe, setName: Metallic Silver, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 167, playID: 6508, tier: TopShotTiers.Tier.fandom)

        // PlayerName: James Harden, setName: Metallic Silver, momentCount: 261, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 167, playID: 6560, tier: TopShotTiers.Tier.fandom)

        // PlayerName: Jalen Green, setName: Metallic Silver, momentCount: 194, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 167, playID: 6561, tier: TopShotTiers.Tier.fandom)

        // PlayerName: Jalen Duren, setName: Metallic Silver, momentCount: 86, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 167, playID: 6640, tier: TopShotTiers.Tier.fandom)

        // --------------------------------------
        // Set 169 - "Holo Icon"
        // --------------------------------------
        // PlayerName: Dyson Daniels, setName: Holo Icon, momentCount: 50, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6564, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Anthony Davis, setName: Holo Icon, momentCount: 50, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6565, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Jamal Murray, setName: Holo Icon, momentCount: 50, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6566, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Jalen Green, setName: Holo Icon, momentCount: 50, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6567, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Ivica Zubac, setName: Holo Icon, momentCount: 50, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6568, tier: TopShotTiers.Tier.legendary)

        // PlayerName: James Harden, setName: Holo Icon, momentCount: 50, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6569, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Tyler Herro, setName: Holo Icon, momentCount: 50, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6570, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Devin Booker, setName: Holo Icon, momentCount: 50, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6571, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Kevin Durant, setName: Holo Icon, momentCount: 50, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6572, tier: TopShotTiers.Tier.legendary)

        // PlayerName: DeMar DeRozan, setName: Holo Icon, momentCount: 50, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6573, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Domantas Sabonis, setName: Holo Icon, momentCount: 50, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6574, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Zach LaVine, setName: Holo Icon, momentCount: 50, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 169, playID: 6575, tier: TopShotTiers.Tier.legendary)

        // --------------------------------------
        // Set 170 - "For The Win"
        // --------------------------------------
        // PlayerName: Tyrese Haliburton, setName: For The Win, momentCount: 399, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6431, tier: TopShotTiers.Tier.rare)

        // PlayerName: Kawhi Leonard, setName: For The Win, momentCount: 399, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6432, tier: TopShotTiers.Tier.rare)

        // PlayerName: Austin Reaves, setName: For The Win, momentCount: 399, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6433, tier: TopShotTiers.Tier.rare)

        // PlayerName: Tyler Herro, setName: For The Win, momentCount: 399, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6434, tier: TopShotTiers.Tier.rare)

        // PlayerName: OG Anunoby, setName: For The Win, momentCount: 399, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6435, tier: TopShotTiers.Tier.rare)

        // PlayerName: Cole Anthony, setName: For The Win, momentCount: 399, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6436, tier: TopShotTiers.Tier.rare)

        // PlayerName: Anfernee Simons, setName: For The Win, momentCount: 399, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6437, tier: TopShotTiers.Tier.rare)

        // PlayerName: Scoot Henderson, setName: For The Win, momentCount: 399, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6438, tier: TopShotTiers.Tier.rare)

        // PlayerName: DeMar DeRozan, setName: For The Win, momentCount: 399, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6439, tier: TopShotTiers.Tier.rare)

        // PlayerName: De'Aaron Fox, setName: For The Win, momentCount: 399, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6440, tier: TopShotTiers.Tier.rare)

        // PlayerName: Jayson Tatum, setName: For The Win, momentCount: 206, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6441, tier: TopShotTiers.Tier.rare)

        // PlayerName: Anthony Edwards, setName: For The Win, momentCount: 219, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6442, tier: TopShotTiers.Tier.rare)

        // PlayerName: Caris LeVert, setName: For The Win, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6585, tier: TopShotTiers.Tier.rare)

        // PlayerName: Miles Bridges, setName: For The Win, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6586, tier: TopShotTiers.Tier.rare)

        // PlayerName: LeBron James, setName: For The Win, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6587, tier: TopShotTiers.Tier.rare)

        // PlayerName: Ja Morant, setName: For The Win, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6588, tier: TopShotTiers.Tier.rare)

        // PlayerName: Mikal Bridges, setName: For The Win, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 170, playID: 6589, tier: TopShotTiers.Tier.rare)

        // --------------------------------------
        // Set 171 - "Base Set"
        // --------------------------------------
        // PlayerName: Jalen Johnson, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6492, tier: TopShotTiers.Tier.common)

        // PlayerName: Derrick White, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6493, tier: TopShotTiers.Tier.common)

        // PlayerName: Tosan Evbuomwan, setName: Base Set, momentCount: 4000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6494, tier: TopShotTiers.Tier.common)

        // PlayerName: Ayo Dosunmu, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6495, tier: TopShotTiers.Tier.common)

        // PlayerName: Brandon Williams, setName: Base Set, momentCount: 4000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6496, tier: TopShotTiers.Tier.common)

        // PlayerName: Dante Exum, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6497, tier: TopShotTiers.Tier.common)

        // PlayerName: Jamal Murray, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6498, tier: TopShotTiers.Tier.common)

        // PlayerName: Peyton Watson, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6499, tier: TopShotTiers.Tier.common)

        // PlayerName: Malik Beasley, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6500, tier: TopShotTiers.Tier.common)

        // PlayerName: Quenton Jackson, setName: Base Set, momentCount: 4000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6501, tier: TopShotTiers.Tier.common)

        // PlayerName: A.J. Lawson, setName: Base Set, momentCount: 4000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6502, tier: TopShotTiers.Tier.common)

        // PlayerName: Oscar Tshiebwe, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6503, tier: TopShotTiers.Tier.common)

        // PlayerName: Oscar Tshiebwe, setName: Base Set, momentCount: 4000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6504, tier: TopShotTiers.Tier.common)

        // PlayerName: Josh Giddey, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6542, tier: TopShotTiers.Tier.common)

        // PlayerName: Donovan Mitchell, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6543, tier: TopShotTiers.Tier.common)

        // PlayerName: Julian Strawther, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6544, tier: TopShotTiers.Tier.common)

        // PlayerName: Derrick Jones Jr., setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6545, tier: TopShotTiers.Tier.common)

        // PlayerName: Ja Morant, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6546, tier: TopShotTiers.Tier.common)

        // PlayerName: Tyler Herro, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6547, tier: TopShotTiers.Tier.common)

        // PlayerName: Mike Conley, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6548, tier: TopShotTiers.Tier.common)

        // PlayerName: Dejounte Murray, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6549, tier: TopShotTiers.Tier.common)

        // PlayerName: Karl-Anthony Towns, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6550, tier: TopShotTiers.Tier.common)

        // PlayerName: Precious Achiuwa, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6551, tier: TopShotTiers.Tier.common)

        // PlayerName: Isaiah Hartenstein, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6552, tier: TopShotTiers.Tier.common)

        // PlayerName: Kentavious Caldwell-Pope, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6553, tier: TopShotTiers.Tier.common)

        // PlayerName: Wendell Carter Jr., setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6554, tier: TopShotTiers.Tier.common)

        // PlayerName: Kelly Oubre Jr., setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6624, tier: TopShotTiers.Tier.common)

        // PlayerName: Paul George, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6625, tier: TopShotTiers.Tier.common)

        // PlayerName: Tyrese Maxey, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6626, tier: TopShotTiers.Tier.common)

        // PlayerName: Devin Booker, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6627, tier: TopShotTiers.Tier.common)

        // PlayerName: Kevin Durant, setName: Base Set, momentCount: 8000, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 171, playID: 6628, tier: TopShotTiers.Tier.common)

        // --------------------------------------
        // Set 172 - "Throwdowns"
        // --------------------------------------
        // PlayerName: Stephen Curry, setName: Throwdowns, momentCount: 192, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6389, tier: TopShotTiers.Tier.rare)

        // PlayerName: Jaylen Wells, setName: Throwdowns, momentCount: 205, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6390, tier: TopShotTiers.Tier.rare)

        // PlayerName: Terrence Shannon Jr., setName: Throwdowns, momentCount: 187, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6391, tier: TopShotTiers.Tier.rare)

        // PlayerName: Shaedon Sharpe, setName: Throwdowns, momentCount: 184, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 172, playID: 6392, tier: TopShotTiers.Tier.rare)

        // --------------------------------------
        // Set 173 - "Denied!"
        // --------------------------------------
        // PlayerName: Lonzo Ball, setName: Denied!, momentCount: 599, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 173, playID: 6443, tier: TopShotTiers.Tier.rare)

        // PlayerName: Jalen Duren, setName: Denied!, momentCount: 599, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 173, playID: 6444, tier: TopShotTiers.Tier.rare)

        // PlayerName: GG Jackson II, setName: Denied!, momentCount: 599, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 173, playID: 6445, tier: TopShotTiers.Tier.rare)

        // PlayerName: Jaren Jackson Jr., setName: Denied!, momentCount: 599, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 173, playID: 6446, tier: TopShotTiers.Tier.rare)

        // PlayerName: Jaden McDaniels, setName: Denied!, momentCount: 599, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 173, playID: 6447, tier: TopShotTiers.Tier.rare)

        // PlayerName: Goga Bitadze, setName: Denied!, momentCount: 599, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 173, playID: 6448, tier: TopShotTiers.Tier.rare)

        // PlayerName: Kevin Durant, setName: Denied!, momentCount: 599, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 173, playID: 6449, tier: TopShotTiers.Tier.rare)

        // PlayerName: Toumani Camara, setName: Denied!, momentCount: 599, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 173, playID: 6450, tier: TopShotTiers.Tier.rare)

        // PlayerName: Scottie Barnes, setName: Denied!, momentCount: 599, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 173, playID: 6451, tier: TopShotTiers.Tier.rare)

        // PlayerName: Svi Mykhailiuk, setName: Denied!, momentCount: 599, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 173, playID: 6452, tier: TopShotTiers.Tier.rare)

        // PlayerName: Walker Kessler, setName: Denied!, momentCount: 599, subeditionIDs: [0], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 173, playID: 6453, tier: TopShotTiers.Tier.rare)

        // PlayerName: Zach Edey, setName: Denied!, momentCount: 367, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 173, playID: 6454, tier: TopShotTiers.Tier.rare)

        // PlayerName: Donovan Clingan, setName: Denied!, momentCount: 365, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 173, playID: 6455, tier: TopShotTiers.Tier.rare)

        // --------------------------------------
        // Set 175 - "Freshman Gems"
        // --------------------------------------
        // PlayerName: Quinten Post, setName: Freshman Gems, momentCount: 199, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6555, tier: TopShotTiers.Tier.rare)

        // PlayerName: Bronny James, setName: Freshman Gems, momentCount: 199, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6556, tier: TopShotTiers.Tier.rare)

        // PlayerName: Karlo Matkovic, setName: Freshman Gems, momentCount: 199, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6557, tier: TopShotTiers.Tier.rare)

        // PlayerName: Adem Bona, setName: Freshman Gems, momentCount: 199, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6558, tier: TopShotTiers.Tier.rare)

        // PlayerName: Justin Edwards, setName: Freshman Gems, momentCount: 199, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 175, playID: 6559, tier: TopShotTiers.Tier.rare)

        // --------------------------------------
        // Set 177 - "Hustle and Show"
        // --------------------------------------
        // PlayerName: Dyson Daniels, setName: Hustle and Show, momentCount: 607, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 177, playID: 6414, tier: TopShotTiers.Tier.common)

        // --------------------------------------
        // Set 178 - "Video Game Numbers"
        // --------------------------------------
        // PlayerName: Stephen Curry, setName: Video Game Numbers, momentCount: 499, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 178, playID: 6590, tier: TopShotTiers.Tier.rare)

        // PlayerName: Obi Toppin, setName: Video Game Numbers, momentCount: 499, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 178, playID: 6591, tier: TopShotTiers.Tier.rare)

        // PlayerName: Zion Williamson, setName: Video Game Numbers, momentCount: 499, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 178, playID: 6592, tier: TopShotTiers.Tier.rare)

        // PlayerName: Devin Vassell, setName: Video Game Numbers, momentCount: 499, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 178, playID: 6593, tier: TopShotTiers.Tier.rare)

        // PlayerName: Sandro Mamukelashvili, setName: Video Game Numbers, momentCount: 499, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 178, playID: 6594, tier: TopShotTiers.Tier.rare)

        // --------------------------------------
        // Set 179 - "Crunch Time"
        // --------------------------------------
        // PlayerName: Coby White, setName: Crunch Time, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6475, tier: TopShotTiers.Tier.common)

        // PlayerName: De'Andre Hunter, setName: Crunch Time, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6476, tier: TopShotTiers.Tier.common)

        // PlayerName: Kyrie Irving, setName: Crunch Time, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6477, tier: TopShotTiers.Tier.common)

        // PlayerName: James Harden, setName: Crunch Time, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6478, tier: TopShotTiers.Tier.common)

        // PlayerName: Ja Morant, setName: Crunch Time, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6479, tier: TopShotTiers.Tier.common)

        // PlayerName: Anthony Edwards, setName: Crunch Time, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6480, tier: TopShotTiers.Tier.common)

        // PlayerName: Jalen Brunson, setName: Crunch Time, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6481, tier: TopShotTiers.Tier.common)

        // PlayerName: Paolo Banchero, setName: Crunch Time, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6482, tier: TopShotTiers.Tier.common)

        // PlayerName: Collin Gillespie, setName: Crunch Time, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6483, tier: TopShotTiers.Tier.common)

        // PlayerName: Grayson Allen, setName: Crunch Time, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6484, tier: TopShotTiers.Tier.common)

        // PlayerName: Devin Vassell, setName: Crunch Time, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6485, tier: TopShotTiers.Tier.common)

        // PlayerName: Walker Kessler, setName: Crunch Time, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6486, tier: TopShotTiers.Tier.common)

        // PlayerName: Jordan Poole, setName: Crunch Time, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6487, tier: TopShotTiers.Tier.common)

        // PlayerName: Collin Gillespie, setName: Crunch Time, momentCount: 444, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 179, playID: 6509, tier: TopShotTiers.Tier.common)

        // --------------------------------------
        // Set 180 - "Breakout"
        // --------------------------------------
        // PlayerName: Quentin Grimes, setName: Breakout, momentCount: 158, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6398, tier: TopShotTiers.Tier.rare)

        // PlayerName: Keon Johnson, setName: Breakout, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6457, tier: TopShotTiers.Tier.rare)

        // PlayerName: Moses Moody, setName: Breakout, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6458, tier: TopShotTiers.Tier.rare)

        // PlayerName: Isaiah Joe, setName: Breakout, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6459, tier: TopShotTiers.Tier.rare)

        // PlayerName: Grayson Allen, setName: Breakout, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6460, tier: TopShotTiers.Tier.rare)

        // PlayerName: Nick Richards, setName: Breakout, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6461, tier: TopShotTiers.Tier.rare)

        // PlayerName: Naji Marshall, setName: Breakout, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6580, tier: TopShotTiers.Tier.rare)

        // PlayerName: Brandon Boston Jr., setName: Breakout, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6581, tier: TopShotTiers.Tier.rare)

        // PlayerName: Jaylin Williams, setName: Breakout, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6582, tier: TopShotTiers.Tier.rare)

        // PlayerName: Julian Champagnie, setName: Breakout, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6583, tier: TopShotTiers.Tier.rare)

        // PlayerName: Brice Sensabaugh, setName: Breakout, momentCount: 399, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 180, playID: 6584, tier: TopShotTiers.Tier.rare)

        // --------------------------------------
        // Set 182 - "Vintage Vibes: The Truth"
        // --------------------------------------
        // PlayerName: Paul Pierce, setName: Vintage Vibes: The Truth, momentCount: 500, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 182, playID: 6507, tier: TopShotTiers.Tier.rare)

        // --------------------------------------
        // Set 183 - "Ascension"
        // --------------------------------------
        // PlayerName: Payton Pritchard, setName: Ascension, momentCount: 99, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 183, playID: 6488, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Nic Claxton, setName: Ascension, momentCount: 99, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 183, playID: 6489, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Trey Murphy III, setName: Ascension, momentCount: 99, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 183, playID: 6490, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Austin Reaves, setName: Ascension, momentCount: 70, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 183, playID: 6491, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Malik Monk, setName: Ascension, momentCount: 99, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 183, playID: 6505, tier: TopShotTiers.Tier.legendary)

        // PlayerName: De'Andre Hunter, setName: Ascension, momentCount: 99, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 183, playID: 6576, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Norman Powell, setName: Ascension, momentCount: 99, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 183, playID: 6577, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Isaiah Hartenstein, setName: Ascension, momentCount: 99, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 183, playID: 6578, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Deni Avdija, setName: Ascension, momentCount: 99, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 183, playID: 6579, tier: TopShotTiers.Tier.legendary)

        // --------------------------------------
        // Set 184 - "Hoop Vision"
        // --------------------------------------
        // PlayerName: Trae Young, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6462, tier: TopShotTiers.Tier.common)

        // PlayerName: LaMelo Ball, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6463, tier: TopShotTiers.Tier.common)

        // PlayerName: Nick Smith Jr., setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6464, tier: TopShotTiers.Tier.common)

        // PlayerName: Nikola Jokić, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6465, tier: TopShotTiers.Tier.common)

        // PlayerName: Alperen Şengün, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6466, tier: TopShotTiers.Tier.common)

        // PlayerName: Alperen Şengün, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6467, tier: TopShotTiers.Tier.common)

        // PlayerName: Ja Morant, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6468, tier: TopShotTiers.Tier.common)

        // PlayerName: Nickeil Alexander-Walker, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6469, tier: TopShotTiers.Tier.common)

        // PlayerName: Jalen Suggs, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6470, tier: TopShotTiers.Tier.common)

        // PlayerName: Bol Bol, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6471, tier: TopShotTiers.Tier.common)

        // PlayerName: Tyus Jones, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6472, tier: TopShotTiers.Tier.common)

        // PlayerName: Shaedon Sharpe, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6473, tier: TopShotTiers.Tier.common)

        // PlayerName: Luka Dončić, setName: Hoop Vision, momentCount: 569, subeditionIDs: [None], possibleTiers: [fandom, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6474, tier: TopShotTiers.Tier.common)

        // PlayerName: Damian Lillard, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6506, tier: TopShotTiers.Tier.common)

        // PlayerName: Jaylen Brown, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6610, tier: TopShotTiers.Tier.common)

        // PlayerName: Josh Giddey, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6611, tier: TopShotTiers.Tier.common)

        // PlayerName: Darius Garland, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6612, tier: TopShotTiers.Tier.common)

        // PlayerName: Ausar Thompson, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6613, tier: TopShotTiers.Tier.common)

        // PlayerName: Stephen Curry, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6614, tier: TopShotTiers.Tier.common)

        // PlayerName: Fred VanVleet, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6615, tier: TopShotTiers.Tier.common)

        // PlayerName: Bogdan Bogdanović, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6616, tier: TopShotTiers.Tier.common)

        // PlayerName: James Harden, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6617, tier: TopShotTiers.Tier.common)

        // PlayerName: LeBron James, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6618, tier: TopShotTiers.Tier.common)

        // PlayerName: Rui Hachimura, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6619, tier: TopShotTiers.Tier.common)

        // PlayerName: Jalen Brunson, setName: Hoop Vision, momentCount: 2500, subeditionIDs: [None], possibleTiers: [common, fandom]
        self.adminRef.addOrUpdatePlayIDTier(setID: 184, playID: 6620, tier: TopShotTiers.Tier.common)

        // --------------------------------------
        // Set 185 - "Rookie Revelation"
        // --------------------------------------
        // PlayerName: Zaccharie Risacher, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6510, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Tidjane Salaün, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6511, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Matas Buzelis, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6512, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Ron Holland II, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6513, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Quinten Post, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6514, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Reed Sheppard, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6515, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Dalton Knecht, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6516, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Jaylen Wells, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6517, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Zach Edey, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6518, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Kel'el Ware, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6519, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Rob Dillingham, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6520, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Terrence Shannon Jr., setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6521, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Karlo Matkovic, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6522, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Yves Missi, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6523, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Ajay Mitchell, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6524, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Tristan da Silva, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6525, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Adem Bona, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6526, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Jared McCain, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6527, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Justin Edwards, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6528, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Ryan Dunn, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6529, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Donovan Clingan, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6530, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Stephon Castle, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6531, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Ja'Kobe Walter, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6532, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Jamal Shead, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6533, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Jonathan Mogbo, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6534, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Isaiah Collier, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6535, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Kyle Filipowski, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6536, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Alex Sarr, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6537, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Carlton Carrington, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6538, tier: TopShotTiers.Tier.legendary)

        // PlayerName: Kyshawn George, setName: Rookie Revelation, momentCount: 75, subeditionIDs: [None], possibleTiers: [fandom, legendary, rare]
        self.adminRef.addOrUpdatePlayIDTier(setID: 185, playID: 6539, tier: TopShotTiers.Tier.legendary)

    }
}