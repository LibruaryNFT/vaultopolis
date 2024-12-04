import "TopShotTiers"

transaction(setID: UInt32, tierRawValue: UInt8?) {
    let adminRef: &TopShotTiers.Admin

    prepare(signer: auth(Storage) &Account) {
        self.adminRef = signer.storage.borrow<&TopShotTiers.Admin>(from: /storage/TopShotTiersAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }

    execute {
        let tierEnum: TopShotTiers.Tier? = tierRawValue != nil 
            ? TopShotTiers.Tier(rawValue: tierRawValue!) ?? panic("Invalid tier value")
            : nil

        self.adminRef.addOrUpdateDefaultTier(setID: setID, tier: tierEnum)
    }
}
