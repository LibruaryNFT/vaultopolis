import "NonFungibleToken"
import "TopShot"
import "ViewResolver"
import "TopShotTiers"

access(all) contract TopShotShardedCollectionV2 {

    // Define a MomentFilter interface for validation logic
    access(all) struct interface MomentFilter {
        access(all) fun isSupported(moment: &TopShot.NFT): Bool
        access(all) fun unsupportedError(moment: &TopShot.NFT): String
    }

    // Implementation of a filter to validate "common-tier" moments
    access(all) struct TSHOTCommonFilter: MomentFilter {
        access(all) fun isSupported(moment: &TopShot.NFT): Bool {
            // Use TopShotTiers to determine the tier of the NFT
            let nftTier = TopShotTiers.getTier(nft: moment)
            let nftTierStr = TopShotTiers.tierToString(tier: nftTier!)
            return nftTierStr == "common"
        }

        access(all) fun unsupportedError(moment: &TopShot.NFT): String {
            return "Moment is not supported. Only common-tier moments are allowed."
        }
    }

    // ShardedCollection resource stores a dictionary of TopShot Collections
    access(all) resource ShardedCollection: TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver {

        access(contract) var collections: @{UInt64: TopShot.Collection}
        access(all) let numBuckets: UInt64
        access(all) let filter: {MomentFilter}?

        init(numBuckets: UInt64, filter: {MomentFilter}?) {
            self.collections <- {}
            self.numBuckets = numBuckets
            self.filter = filter

            // Create a new empty collection for each bucket
            var i: UInt64 = 0
            while i < numBuckets {
                self.collections[i] <-! TopShot.createEmptyCollection(nftType: Type<@TopShot.NFT>()) as! @TopShot.Collection
                i = i + UInt64(1)
            }
        }

        access(all) fun forEachID(_ f: fun (UInt64): Bool): Void {
            for key in self.collections.keys {
                let col = &self.collections[key] as &TopShot.Collection?
                col?.forEachID(f)
            }
        }

        access(all) fun getNumBuckets(): UInt64 {
            return self.numBuckets
        }

        access(all) fun getShardIDs(shardIndex: UInt64): [UInt64] {
            pre {
                shardIndex < self.numBuckets: "Invalid shard index"
            }
            let shard = &self.collections[shardIndex] as &TopShot.Collection?
                ?? panic("Shard not found")
            return shard.getIDs()
        }

        access(NonFungibleToken.Withdraw) fun batchWithdrawFromShard(shardIndex: UInt64, ids: [UInt64]): @{NonFungibleToken.Collection} {
            pre {
                shardIndex < self.numBuckets: "Invalid shard index"
            }

            let shard = (&self.collections[shardIndex] as auth(NonFungibleToken.Withdraw) &TopShot.Collection?)
                ?? panic("Shard not found")

            var batchCollection <- TopShot.createEmptyCollection(nftType: Type<@TopShot.NFT>())

            for id in ids {
                batchCollection.deposit(token: <- shard.withdraw(withdrawID: id))
            }

            return <-batchCollection
        }

        access(NonFungibleToken.Withdraw) fun withdraw(withdrawID: UInt64): @{NonFungibleToken.NFT} {
            post {
                result.id == withdrawID: "The ID of the withdrawn NFT is incorrect"
            }
            let bucket = withdrawID % self.numBuckets
            let token <- self.collections[bucket]?.withdraw(withdrawID: withdrawID)!
            return <-token
        }

        access(NonFungibleToken.Withdraw) fun batchWithdraw(ids: [UInt64]): @{NonFungibleToken.Collection} {
            var batchCollection <- TopShot.createEmptyCollection(nftType: Type<@TopShot.NFT>())
            for id in ids {
                batchCollection.deposit(token: <-self.withdraw(withdrawID: id))
            }
            return <-batchCollection
        }

        access(all) fun deposit(token: @{NonFungibleToken.NFT}) {
            let moment: @TopShot.NFT <- token as! @TopShot.NFT
            let momentRef: &TopShot.NFT = &moment as &TopShot.NFT
            if let filter = self.filter {
                assert(
                    filter.isSupported(moment: momentRef),
                    message: filter.unsupportedError(moment: momentRef)
                )
            }

            let bucket = moment.id % self.numBuckets
            let collectionRef = (&self.collections[bucket] as &TopShot.Collection?)!
            collectionRef.deposit(token: <-moment)
        }

        access(all) fun batchDeposit(tokens: @{NonFungibleToken.Collection}) {
            let keys = tokens.getIDs()
            for key in keys {
                let token <- tokens.withdraw(withdrawID: key)
                let moment: @TopShot.NFT <- token as! @TopShot.NFT
                let momentRef: &TopShot.NFT = &moment as &TopShot.NFT
                if let filter = self.filter {
                    assert(
                        filter.isSupported(moment: momentRef),
                        message: "Batch deposit failed: ".concat(filter.unsupportedError(moment: momentRef))
                    )
                }
                self.deposit(token: <-moment)
            }
            destroy tokens
        }

        access(all) view fun getIDs(): [UInt64] {
            var ids: [UInt64] = []
            for key in self.collections.keys {
                let collectionIDs = self.collections[key]?.getIDs() ?? []
                ids = ids.concat(collectionIDs)
            }
            return ids
        }

        access(all) view fun borrowNFT(_ id: UInt64): &{NonFungibleToken.NFT}? {
            let bucket = id % self.numBuckets
            return self.collections[bucket]?.borrowNFT(id)!
        }

        access(all) view fun borrowMoment(id: UInt64): &TopShot.NFT? {
            let bucket = id % self.numBuckets
            return self.collections[bucket]?.borrowMoment(id: id)!
        }

        access(all) view fun getSupportedNFTTypes(): {Type: Bool} {
            let supportedTypes: {Type: Bool} = {}
            supportedTypes[Type<@TopShot.NFT>()] = true
            return supportedTypes
        }

        access(all) view fun isSupportedNFTType(type: Type): Bool {
            if type == Type<@TopShot.NFT>() {
                return true
            }
            return false
        }

        access(all) view fun getLength(): Int {
            return self.getIDs().length
        }
    }

    access(all) fun createEmptyCollection(numBuckets: UInt64, filter: {MomentFilter}?): @ShardedCollection {
        return <-create ShardedCollection(numBuckets: numBuckets, filter: filter)
    }
}
