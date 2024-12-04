import "TopShot"

// This transaction is for the admin to create multiple new set resources
// and store them in the Top Shot smart contract

transaction() {

    // Local variable for the TopShot Admin object
    let adminRef: &TopShot.Admin

    prepare(acct: auth(BorrowValue) &Account) {

        // Borrow a reference to the Admin resource in storage
        self.adminRef = acct.storage.borrow<&TopShot.Admin>(from: /storage/TopShotAdmin)
            ?? panic("Could not borrow a reference to the Admin resource")
    }

    execute {
        // List of set names to be created
        let setNames: [String] = [
            
            "WNBA Holo Icon",
            "WNBA Rookie Revelation",
            "2024 WNBA Playoffs",
            "Rookie Debut",
            "Supernova",
            "Metallic Gold LE",
            "Metallic Silver",
            "Fresh Threads",
            "Holo Icon",
            "For The Win",
            "Base Set",
            "Throwdowns",
            "Denied!",
            "NBA Cup"
        ]

        // Iterate over each set name and create a set
        for setName in setNames {
            let currentSetID = TopShot.nextSetID
            self.adminRef.createSet(name: setName)

        }
    }
}