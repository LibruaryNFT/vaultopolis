import "TopShot"

transaction(playIDList: [UInt32]) {

    let adminRef: &TopShot.Admin

    prepare(acct: auth(BorrowValue) &Account) {
        // Borrow a reference to the Admin resource in storage
        self.adminRef = acct.storage.borrow<&TopShot.Admin>(from: /storage/TopShotAdmin)
            ?? panic("No admin resource in storage")
    }

    execute {
       // Loop through the list of play IDs and create a play with minimal metadata for each
        for playID in playIDList {
            let minimalMetadata: {String: String} = {
                "placeholder": "placeholder_value"
            }
            self.adminRef.createPlay(metadata: minimalMetadata)
        }
    }
}