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
            "WNBA Run It Back 2008",
            "WNBA Archive Set 2008",
            "WNBA Base Set",
            "The Anthology: Magic Johnson",
            "Squad Goals",
            "The Tour",
            "Shining Stars",
            "For the Cup",
            "WNBA Metallic Gold LE",
            "Chasing the Trophy",
            "WNBA Game Recognize Game",
            "Run It Back: Legacies 1986-87",
            "Run It Back 1986-87",
            "Archive Set 1986-87",
            "Dynamic Duos",
            "The Challenge: Pro",
            "The Challenge: Icon",
            "The Challenge: Champion",
            "WNBA Squad Goals",
            "Base Set",
            "Rookie Debut",
            "Spotlight Series",
            "Fresh Threads",
            "Throwdowns",
            "For the Win",
            "In Their Bag",
            "Video Game Numbers",
            "Clamps",
            "Metallic Gold LE",
            "The Anthology: LeBron James",
            "2023 NBA All-Star",
            "Fit Check",
            "Top Shot 50",
            "The Champion's Path",
            "2023 NBA Playoffs",
            "Rookie Revelation",
            "Rise With Us 2023",
            "Hustle and Show",
            "The Anthology: Kevin Durant",
            "2023 NBA Finals",
            "WNBA 2023",
            "WNBA Metallic Gold LE 2023",
            "Extra Spice",
            "The Anthology: Steph Curry",
            "2022-23 Honors",
            "2022-23 Hardware",
            "The Anthology: Larry Bird",
            "2022-23 Season Rewind"
        ]

        // Iterate over each set name and create a set
        for setName in setNames {
            let currentSetID = TopShot.nextSetID
            self.adminRef.createSet(name: setName)

        }
    }
}