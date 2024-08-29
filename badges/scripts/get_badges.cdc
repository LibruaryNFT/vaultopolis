import "TopShotBadges"

access(all) fun main(account: Address, momentID: UInt64): [String] {
    return TopShotBadges.getMomentBadges(account: account, momentID: momentID)
}
