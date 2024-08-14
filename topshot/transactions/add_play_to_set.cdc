import "TopShot"

transaction(setID: UInt32, playID: UInt32) {

    // Local variable for the topshot Admin object
    let adminRef: auth(TopShot.NFTMinter) &TopShot.Admin

    prepare(acct: auth(BorrowValue) &Account) {

        // borrow a reference to the Admin resource in storage
        self.adminRef = acct.storage.borrow<auth(TopShot.NFTMinter) &TopShot.Admin>(from: /storage/TopShotAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }
    execute {

        // Borrow a reference to the specified set
        let setRef = self.adminRef.borrowSet(setID: setID)

        // Add the specified play ID
        setRef.addPlay(playID: playID)
    }
}