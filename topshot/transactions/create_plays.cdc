import "TopShot"

transaction(playMetadataList: [{UInt32: {String: String}}]) {

    let adminRef: &TopShot.Admin

    prepare(acct: auth(BorrowValue) &Account) {
        self.adminRef = acct.storage.borrow<&TopShot.Admin>(from: /storage/TopShotAdmin)
            ?? panic("No admin resource in storage")
    }

    execute {
        for play in playMetadataList {
            let playID = play.keys[0]  // Access the first (and only) key in the dictionary
            let metadata = play[playID]!
            self.adminRef.createPlay(metadata: metadata)
        }
    }
}