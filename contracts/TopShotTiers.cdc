import "TopShot"

access(all)
contract TopShotTiers {

    // 0=common, 1=fandom, 2=rare, 3=legendary, 4=ultimate
    access(all)
    enum Tier: UInt8 {
        access(all)
        case common
        access(all)
        case fandom
        access(all)
        case rare
        access(all)
        case legendary
        access(all)
        case ultimate
    }

    // Define the mixed-tier sets with their play IDs and corresponding tiers
    access(all)
    var mixedTierSets: {UInt32: {UInt32: Tier}}
    // Define default tiers based on set IDs
    access(all)
    var defaultTiers: {UInt32: Tier}

    access(all)
    resource interface AdminPublic {
        access(all)
        fun addOrUpdateMixedTierSet(setID: UInt32, playID: UInt32, tier: Tier)
        access(all)
        fun addOrUpdateDefaultTier(setID: UInt32, tier: Tier)
        access(all)
        fun removePlayIDFromMixedTierSet(setID: UInt32, playID: UInt32)
    }

    // Resource to manage the tier mappings
    access(all)
    resource Admin: AdminPublic {
        access(all)
        fun addOrUpdateMixedTierSet(setID: UInt32, playID: UInt32, tier: Tier) {
            if let existingSet = TopShotTiers.mixedTierSets[setID] {
                var updatedSet = existingSet
                updatedSet[playID] = tier
                TopShotTiers.mixedTierSets[setID] = updatedSet
            } else {
                TopShotTiers.mixedTierSets[setID] = {playID: tier}
            }
        }

        access(all)
        fun removePlayIDFromMixedTierSet(setID: UInt32, playID: UInt32) {
            if let existingSet = TopShotTiers.mixedTierSets[setID] {
                var updatedSet = existingSet
                updatedSet.remove(key: playID)
                TopShotTiers.mixedTierSets[setID] = updatedSet
            }
        }

        access(all)
        fun addOrUpdateDefaultTier(setID: UInt32, tier: Tier) {
            TopShotTiers.defaultTiers[setID] = tier
        }
    }

    init() {
        self.mixedTierSets = {
            74: {
                2648: Tier.legendary,
                2649: Tier.legendary,
                2650: Tier.rare,
                2651: Tier.rare,
                2837: Tier.legendary
            },
            100: {
                3345: Tier.legendary,
                3919: Tier.legendary,
                4163: Tier.rare,
                5301: Tier.rare,
                5304: Tier.legendary
            },
            109: {
                3938: Tier.legendary,
                4162: Tier.rare,
                5299: Tier.legendary,
                5300: Tier.rare
            },
            114: {
                4066: Tier.legendary,
                4164: Tier.rare,
                5302: Tier.legendary,
                5303: Tier.rare
            },
            117: {
                4124: Tier.rare,
                4125: Tier.rare,
                4126: Tier.legendary,
                4127: Tier.rare,
                4128: Tier.legendary,
                5305: Tier.legendary,
                5306: Tier.rare
            },
            141: {
                5149: Tier.fandom,
                5150: Tier.fandom,
                5151: Tier.fandom,
                5152: Tier.fandom,
                5153: Tier.fandom,
                5154: Tier.fandom,
                5155: Tier.fandom,
                5156: Tier.fandom,
                5157: Tier.fandom,
                5158: Tier.fandom,
                5159: Tier.fandom,
                5160: Tier.fandom,
                5161: Tier.fandom,
                5162: Tier.fandom,
                5163: Tier.fandom,
                5164: Tier.fandom,
                5165: Tier.fandom,
                5166: Tier.fandom,
                5167: Tier.fandom,
                5168: Tier.fandom,
                5169: Tier.fandom,
                5170: Tier.fandom,
                5171: Tier.fandom,
                5172: Tier.fandom,
                5173: Tier.fandom,
                5174: Tier.fandom,
                5175: Tier.fandom,
                5176: Tier.fandom,
                5177: Tier.rare,
                5178: Tier.rare,
                5179: Tier.rare,
                5180: Tier.rare,
                5181: Tier.rare,
                5182: Tier.rare,
                5183: Tier.rare,
                5184: Tier.rare,
                5185: Tier.rare,
                5186: Tier.rare,
                5187: Tier.rare,
                5188: Tier.rare,
                5189: Tier.rare,
                5190: Tier.rare,
                5192: Tier.rare,
                5193: Tier.rare,
                5194: Tier.fandom,
                5195: Tier.fandom,
                5196: Tier.fandom,
                5197: Tier.fandom
            },
            163: {
                5655: Tier.rare,
                5656: Tier.legendary,
                5657: Tier.rare,
                5658: Tier.rare,
                5659: Tier.rare,
                5660: Tier.legendary,
                5661: Tier.rare,
                5662: Tier.legendary,
                5663: Tier.rare,
                5664: Tier.rare,
                5665: Tier.rare,
                5666: Tier.rare,
                5667: Tier.rare,
                5668: Tier.rare,
                5669: Tier.legendary,
                5670: Tier.rare,
                5671: Tier.rare,
                5672: Tier.rare,
                5673: Tier.legendary,
                5674: Tier.rare,
                5675: Tier.rare,
                5676: Tier.rare,
                5677: Tier.rare,
                5678: Tier.rare,
                5679: Tier.rare,
                5680: Tier.rare,
                5681: Tier.rare,
                5682: Tier.legendary,
                5683: Tier.rare,
                5684: Tier.rare,
                5685: Tier.rare,
                5686: Tier.rare,
                5687: Tier.rare
            }
        }

        self.defaultTiers = {
            1: Tier.ultimate,
            2: Tier.common,
            3: Tier.ultimate,
            4: Tier.legendary,
            5: Tier.rare,
            6: Tier.rare,
            7: Tier.rare,
            8: Tier.legendary,
            9: Tier.rare,
            10: Tier.rare,
            11: Tier.rare,
            12: Tier.legendary,
            13: Tier.rare,
            14: Tier.common,
            15: Tier.rare,
            16: Tier.rare,
            17: Tier.rare,
            18: Tier.rare,
            19: Tier.rare,
            20: Tier.legendary,
            21: Tier.rare,
            22: Tier.common,
            23: Tier.legendary,
            24: Tier.rare,
            25: Tier.rare,
            26: Tier.common,
            27: Tier.ultimate,
            28: Tier.legendary,
            29: Tier.rare,
            30: Tier.rare,
            31: Tier.legendary,
            32: Tier.common,
            33: Tier.common,
            34: Tier.common,
            35: Tier.rare,
            36: Tier.common,
            37: Tier.rare,
            38: Tier.rare,
            39: Tier.common,
            40: Tier.rare,
            41: Tier.legendary,
            42: Tier.ultimate,
            43: Tier.fandom,
            44: Tier.common,
            45: Tier.fandom,
            46: Tier.rare,
            47: Tier.rare,
            48: Tier.common,
            49: Tier.fandom,
            50: Tier.legendary,
            51: Tier.common,
            52: Tier.ultimate,
            53: Tier.legendary,
            54: Tier.rare,
            55: Tier.rare,
            56: Tier.fandom,
            57: Tier.legendary,
            58: Tier.common,
            59: Tier.common,
            60: Tier.common,
            61: Tier.legendary,
            62: Tier.fandom,
            63: Tier.rare,
            64: Tier.rare,
            65: Tier.common,
            66: Tier.fandom,
            67: Tier.common,
            68: Tier.rare,
            69: Tier.legendary,
            70: Tier.fandom,
            71: Tier.rare,
            72: Tier.common,
            73: Tier.common,
            75: Tier.rare,
            76: Tier.fandom,
            77: Tier.fandom,
            78: Tier.fandom,
            79: Tier.rare,
            80: Tier.fandom,
            81: Tier.rare,
            82: Tier.legendary,
            83: Tier.rare,
            84: Tier.common,
            85: Tier.rare,
            86: Tier.fandom,
            87: Tier.fandom,
            88: Tier.fandom,
            89: Tier.rare,
            90: Tier.common,
            91: Tier.common,
            92: Tier.common,
            93: Tier.rare,
            94: Tier.rare,
            95: Tier.rare,
            96: Tier.legendary,
            97: Tier.rare,
            98: Tier.common,
            99: Tier.rare,
            101: Tier.fandom,
            102: Tier.rare,
            103: Tier.legendary,
            104: Tier.common,
            105: Tier.common,
            106: Tier.legendary,
            107: Tier.fandom,
            108: Tier.common,
            110: Tier.legendary,
            111: Tier.common,
            112: Tier.rare,
            113: Tier.common,
            115: Tier.rare,
            116: Tier.legendary,
            118: Tier.legendary,
            119: Tier.common,
            120: Tier.rare,
            121: Tier.legendary,
            122: Tier.legendary,
            123: Tier.legendary,
            124: Tier.common,
            125: Tier.common,
            126: Tier.common,
            127: Tier.rare,
            128: Tier.rare,
            129: Tier.common,
            130: Tier.rare,
            131: Tier.legendary,
            132: Tier.common,
            133: Tier.common,
            134: Tier.rare,
            135: Tier.rare,
            136: Tier.rare,
            137: Tier.common,
            138: Tier.fandom,
            139: Tier.legendary,
            140: Tier.ultimate,
            142: Tier.rare,
            143: Tier.fandom,
            144: Tier.common,
            145: Tier.common,
            146: Tier.rare,
            147: Tier.legendary,
            148: Tier.rare,
            149: Tier.rare,
            150: Tier.rare,
            151: Tier.ultimate,
            152: Tier.rare,
            153: Tier.legendary,
            154: Tier.legendary,
            155: Tier.common,
            156: Tier.common,
            157: Tier.rare,
            158: Tier.common,
            159: Tier.rare,
            160: Tier.legendary,
            161: Tier.legendary,
            162: Tier.legendary
        }

        self.account.storage.save<@Admin>(<-create Admin(), to: /storage/TopShotTiersAdmin)
        let cap = self.account.capabilities.storage.issue<&TopShotTiers.Admin>(/storage/TopShotTiersAdmin)
        self.account.capabilities.publish(cap, at: /public/TopShotTiersAdmin)
    }

    access(all)
    fun tierToString(tier: Tier): String {
        switch tier {
        case Tier.ultimate:
            return "ultimate"
        case Tier.legendary:
            return "legendary"
        case Tier.rare:
            return "rare"
        case Tier.common:
            return "common"
        case Tier.fandom:
            return "fandom"
        }
        return "unknown" // Default return to handle all cases
    }

    // Function to get the tier of a TopShot moment based on its setID and playID
    access(all)
    fun getTier(nft: &TopShot.NFT): Tier? {
        let setID = nft.data.setID
        let playID = nft.data.playID

        if let mixedSet = self.mixedTierSets[setID] {
            if let tier = mixedSet[playID] {
                return tier
            }
        }
        if let tier = self.defaultTiers[setID] {
            return tier
        }
        return nil
    }

    // Add a function to return mixedTierSets
    access(all)
    fun getMixedTierSets(): {UInt32: {UInt32: String}} {
        var mixedTierResult: {UInt32: {UInt32: String}} = {}
        for setID in self.mixedTierSets.keys {
            var playIDToTierMap: {UInt32: String} = {}
            let playIDs = self.mixedTierSets[setID]!
            for playID in playIDs.keys {
                let tier = playIDs[playID]!
                playIDToTierMap[playID] = self.tierToString(tier: tier)
            }
            mixedTierResult[setID] = playIDToTierMap
        }
        return mixedTierResult
    }

    // Add a function to return defaultTiers
    access(all)
    fun getDefaultTiers(): {UInt32: String} {
        var defaultTierResult: {UInt32: String} = {}
        for setID in self.defaultTiers.keys {
            let tier = self.defaultTiers[setID]!
            defaultTierResult[setID] = self.tierToString(tier: tier)
        }
        return defaultTierResult
    }

}
