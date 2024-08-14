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
            "Genesis",
            "Base Set",
            "Platinum Ice",
            "Holo MMXX",
            "Metallic Gold LE",
            "Early Adopters",
            "Rookie Debut",
            "Cosmic",
            "For the Win",
            "Denied!",
            "Throwdowns",
            "From the Top",
            "With the Strip",
            "Hometown Showdown: Cali vs. NY",
            "So Fresh",
            "First Round",
            "Conference Semifinals",
            "Western Conference Finals",
            "Eastern Conference Finals",
            "2020 NBA Finals",
            "The Finals",
            "Got Game",
            "Lace 'Em Up",
            "MVP Moves",
            "Run It Back"
        ]

        // Iterate over each set name and create a set
        for setName in setNames {
            let currentSetID = TopShot.nextSetID
            self.adminRef.createSet(name: setName)

        }
    }
}