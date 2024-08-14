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
           "Base Set",
            "Platinum Ice",
            "Holo Icon",
            "Metallic Gold LE",
            "Season Tip-off",
            "Deck the Hoops",
            "Cool Cats",
            "The Gift",
            "Seeing Stars",
            "Rising Stars",
            "2021 All-Star Game",
            "Hustle and Show",
            "Throwdowns",
            "2021 NBA Playoffs",
            "And Then There Were Four",
            "2021 NBA Finals",
            "Platinum Ice",
            "Summer of '21",
            "WNBA: Best of 2021",
            "WNBA 2021",
            "WNBA Run It Back",
            "Run It Back 2005-06",
            "Archive Set",
            "Vintage Vibes",
            "In Her Bag",
            "Base Set",
            "Platinum Ice",
            "Holo Icon",
            "Metallic Gold LE",
            "Fresh Threads",
            "Metallic Silver FE",
            "Deck the Hoops",
            "Hustle and Show",
            "Game Recognize Game",
            "Rising Stars",
            "NBA All-Star Classics",
            "Rim Shakers",
            "2022 All-Star Game",
            "Throwdowns",
            "Extra Spice",
            "WNBA Player's Choice 2021",
            "2022 NBA Playoffs",
            "And Then There Were Four",
            "2022 NBA Finals",
            "Rise With Us"
        ]

        // Iterate over each set name and create a set
        for setName in setNames {
            let currentSetID = TopShot.nextSetID
            self.adminRef.createSet(name: setName)

        }
    }
}