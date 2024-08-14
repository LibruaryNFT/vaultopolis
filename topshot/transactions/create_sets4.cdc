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
            
            "Archive Set 2014-19",
            "Run It Back: Origins 2014-19",
            "Run It Back: Legacies 2014-19",
            "Road To Royalty",
            "WNBA Origins",
            "Base Set6",
            "Rookie Debut6",
            "Fresh Threads",
            "Throwdowns6",
            "For the Win",
            "Archive Set",
            "Video Game Numbers",
            "Holo Icon",
            "Hustle and Show",
            "Extra Spice",
            "Metallic Gold LE",
            "Freshman Gems",
            "Squad Goals",
            "Crunch Time",
            "2024 NBA All-Star",
            "Rookie Revelation",
            "2023 Rookie Ultimates",
            "The Champion's Path 2024",
            "Best of 2024 NBA Playoffs",
            "2024 NBA Playoffs",
            "WNBA Rookie Debut 2024",
            "WNBA 2024",
            "Level Up",
            "2024 NBA Finals",
            "WNBA Metallic Gold LE 2024",
            "2023-24 Honors",
            "WNBA Fresh Gems",
            "2024 WNBA Rookie Ultimates",
            "2023-24 Honors (Diced)",
            "2023-24 Hardware",
            "Season Rewind: Signature Victory",
            "Run It Back: Legacies",
            "Run It Back",
            "Run It Back: Origins",
            "Run It Back: Origins",
            "Run It Back",
            "Run It Back: Legacies"
        ]

        // Iterate over each set name and create a set
        for setName in setNames {
            let currentSetID = TopShot.nextSetID
            self.adminRef.createSet(name: setName)

        }
    }
}