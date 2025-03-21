import "TopShot"

transaction {

     // Local variable for the topshot Admin object
    let adminRef: &TopShot.Admin
    let currPlayID: UInt32

    let playMetadataList: [{String: String}]

    prepare(acct: auth(BorrowValue) &Account) {

        // borrow a reference to the admin resource
        self.currPlayID = TopShot.nextPlayID;

        // borrow a reference to the admin resource
        self.adminRef = acct.storage.borrow<&TopShot.Admin>(from: /storage/TopShotAdmin)
            ?? panic("No admin resource in storage")

        // Create play metadata
        self.playMetadataList = [
            // Larry Bird (1979-80, MVP Year)
            {
                "FirstName": "Larry",
                "LastName": "Bird",
                "NbaSeason": "1979-80",
                "FullName": "Larry Bird",
                "DraftTeam": "Boston Celtics",
                "DraftYear": "1978",
                "PlayerPosition": "F",
                "TeamAtMoment": "Boston Celtics",
                "Height": "81",
                "Weight": "220",
                "Birthdate": "1956-12-07",
                "PlayType": "3-pointer",
                "PlayCategory": "Highlight",
                "HomeTeamScore": "125",
                "DateOfMoment": "1980-02-10 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612738",
                "TotalYearsExperience": "0",
                "DraftSelection": "6",
                "Tagline": "Larry Bird drains a clutch 3-pointer.",
                "DraftRound": "1",
                "JerseyNumber": "33",
                "Birthplace": "West Baden Springs, IN, USA",
                "AwayTeamName": "Boston Celtics",
                "HomeTeamName": "Los Angeles Lakers",
                "AwayTeamScore": "120",
                "PrimaryPosition": "SF"
            },
            // Magic Johnson (1980-81, Rookie Year)
            {
                "FirstName": "Magic",
                "LastName": "Johnson",
                "NbaSeason": "1980-81",
                "FullName": "Magic Johnson",
                "DraftTeam": "Los Angeles Lakers",
                "DraftYear": "1979",
                "PlayerPosition": "G",
                "TeamAtMoment": "Los Angeles Lakers",
                "Height": "81",
                "Weight": "215",
                "Birthdate": "1959-08-14",
                "PlayType": "Assist",
                "PlayCategory": "Highlight",
                "HomeTeamScore": "110",
                "DateOfMoment": "1981-03-15 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612747",
                "TotalYearsExperience": "0",
                "DraftSelection": "1",
                "Tagline": "Magic Johnson with an incredible assist.",
                "DraftRound": "1",
                "JerseyNumber": "32",
                "Birthplace": "Lansing, MI, USA",
                "AwayTeamName": "Los Angeles Lakers",
                "HomeTeamName": "Boston Celtics",
                "AwayTeamScore": "108",
                "PrimaryPosition": "PG"
            },
            // LeBron James (2003-04, Rookie Mint and Rookie Year)
            {
                "FirstName": "LeBron",
                "LastName": "James",
                "NbaSeason": "2003-04",
                "FullName": "LeBron James",
                "DraftTeam": "Cleveland Cavaliers",
                "DraftYear": "2003",
                "PlayerPosition": "F",
                "TeamAtMoment": "Cleveland Cavaliers",
                "Height": "81",
                "Weight": "250",
                "Birthdate": "1984-12-30",
                "PlayType": "Dunk",
                "PlayCategory": "Highlight",
                "HomeTeamScore": "105",
                "DateOfMoment": "2004-01-15 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612739",
                "TotalYearsExperience": "0",
                "DraftSelection": "1",
                "Tagline": "LeBron James throws down a powerful dunk.",
                "DraftRound": "1",
                "JerseyNumber": "23",
                "Birthplace": "Akron, OH, USA",
                "AwayTeamName": "Cleveland Cavaliers",
                "HomeTeamName": "Miami Heat",
                "AwayTeamScore": "101",
                "PrimaryPosition": "SF"
            },
            // Wilt Chamberlain (1959-60, Rookie of the Year)
            {
                "FirstName": "Wilt",
                "LastName": "Chamberlain",
                "NbaSeason": "1959-60",
                "FullName": "Wilt Chamberlain",
                "DraftTeam": "Philadelphia Warriors",
                "DraftYear": "1959",
                "PlayerPosition": "C",
                "TeamAtMoment": "Philadelphia Warriors",
                "Height": "84",
                "Weight": "275",
                "Birthdate": "1936-08-21",
                "PlayType": "Rebound",
                "PlayCategory": "Offensive",
                "HomeTeamScore": "120",
                "DateOfMoment": "1960-02-10 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612744",
                "TotalYearsExperience": "0",
                "DraftSelection": "1",
                "Tagline": "Wilt Chamberlain dominates the game with an impressive rebound.",
                "DraftRound": "1",
                "JerseyNumber": "13",
                "Birthplace": "Philadelphia, PA, USA",
                "AwayTeamName": "Philadelphia Warriors",
                "HomeTeamName": "Boston Celtics",
                "AwayTeamScore": "115",
                "PrimaryPosition": "C"
            },
            // Dave Cowens (1972-73, MVP Year)
            {
                "FirstName": "Dave",
                "LastName": "Cowens",
                "NbaSeason": "1972-73",
                "FullName": "Dave Cowens",
                "DraftTeam": "Boston Celtics",
                "DraftYear": "1970",
                "PlayerPosition": "C",
                "TeamAtMoment": "Boston Celtics",
                "Height": "81",
                "Weight": "230",
                "Birthdate": "1948-10-25",
                "PlayType": "Block",
                "PlayCategory": "Defensive",
                "HomeTeamScore": "110",
                "DateOfMoment": "1973-03-15 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612738",
                "TotalYearsExperience": "3",
                "DraftSelection": "4",
                "Tagline": "Dave Cowens showcases his defensive prowess with a powerful block.",
                "DraftRound": "1",
                "JerseyNumber": "18",
                "Birthplace": "Newport, KY, USA",
                "AwayTeamName": "Boston Celtics",
                "HomeTeamName": "New York Knicks",
                "AwayTeamScore": "105",
                "PrimaryPosition": "C"
            },
            // Michael Jordan (1996-97, Rookie Year)
            {
                "FirstName": "Michael",
                "LastName": "Jordan",
                "NbaSeason": "1996-97",
                "FullName": "Michael Jordan",
                "DraftTeam": "Chicago Bulls",
                "DraftYear": "1984",
                "PlayerPosition": "G",
                "TeamAtMoment": "Chicago Bulls",
                "Height": "78",
                "Weight": "216",
                "Birthdate": "1963-02-17",
                "PlayType": "Dunk",
                "PlayCategory": "Highlight",
                "HomeTeamScore": "130",
                "DateOfMoment": "1997-02-15 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612741",
                "TotalYearsExperience": "13",
                "DraftSelection": "3",
                "Tagline": "Michael Jordan's explosive dunk leaves the crowd in awe.",
                "DraftRound": "1",
                "JerseyNumber": "23",
                "Birthplace": "Brooklyn, NY, USA",
                "AwayTeamName": "Chicago Bulls",
                "HomeTeamName": "Los Angeles Lakers",
                "AwayTeamScore": "125",
                "PrimaryPosition": "SG"
            },
            // Shaquille O'Neal (1992-93, Rookie of the Year)
            {
                "FirstName": "Shaquille",
                "LastName": "O'Neal",
                "NbaSeason": "1992-93",
                "FullName": "Shaquille O'Neal",
                "DraftTeam": "Orlando Magic",
                "DraftYear": "1992",
                "PlayerPosition": "C",
                "TeamAtMoment": "Orlando Magic",
                "Height": "84",
                "Weight": "325",
                "Birthdate": "1972-03-06",
                "PlayType": "Dunk",
                "PlayCategory": "Highlight",
                "HomeTeamScore": "112",
                "DateOfMoment": "1993-01-15 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612753",
                "TotalYearsExperience": "0",
                "DraftSelection": "1",
                "Tagline": "Shaquille O'Neal with a powerful dunk.",
                "DraftRound": "1",
                "JerseyNumber": "32",
                "Birthplace": "Newark, NJ, USA",
                "AwayTeamName": "Orlando Magic",
                "HomeTeamName": "Boston Celtics",
                "AwayTeamScore": "109",
                "PrimaryPosition": "C"
            },
            // Tim Duncan (1997-98, Rookie of the Year)
            {
                "FirstName": "Tim",
                "LastName": "Duncan",
                "NbaSeason": "1997-98",
                "FullName": "Tim Duncan",
                "DraftTeam": "San Antonio Spurs",
                "DraftYear": "1997",
                "PlayerPosition": "F",
                "TeamAtMoment": "San Antonio Spurs",
                "Height": "83",
                "Weight": "250",
                "Birthdate": "1976-04-25",
                "PlayType": "Block",
                "PlayCategory": "Defensive",
                "HomeTeamScore": "104",
                "DateOfMoment": "1998-03-12 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612759",
                "TotalYearsExperience": "0",
                "DraftSelection": "1",
                "Tagline": "Tim Duncan with a strong block.",
                "DraftRound": "1",
                "JerseyNumber": "21",
                "Birthplace": "Christiansted, Virgin Islands",
                "AwayTeamName": "San Antonio Spurs",
                "HomeTeamName": "Houston Rockets",
                "AwayTeamScore": "102",
                "PrimaryPosition": "PF"
            },
            // Allen Iverson (1996-97, Rookie of the Year)
            {
                "FirstName": "Allen",
                "LastName": "Iverson",
                "NbaSeason": "1996-97",
                "FullName": "Allen Iverson",
                "DraftTeam": "Philadelphia 76ers",
                "DraftYear": "1996",
                "PlayerPosition": "G",
                "TeamAtMoment": "Philadelphia 76ers",
                "Height": "72",
                "Weight": "165",
                "Birthdate": "1975-06-07",
                "PlayType": "Steal",
                "PlayCategory": "Defensive",
                "HomeTeamScore": "98",
                "DateOfMoment": "1997-02-05 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612755",
                "TotalYearsExperience": "0",
                "DraftSelection": "1",
                "Tagline": "Allen Iverson with a quick steal.",
                "DraftRound": "1",
                "JerseyNumber": "3",
                "Birthplace": "Hampton, VA, USA",
                "AwayTeamName": "Philadelphia 76ers",
                "HomeTeamName": "Chicago Bulls",
                "AwayTeamScore": "97",
                "PrimaryPosition": "SG"
            },
            // Kevin Durant (2007-08, Rookie of the Year)
            {
                "FirstName": "Kevin",
                "LastName": "Durant",
                "NbaSeason": "2007-08",
                "FullName": "Kevin Durant",
                "DraftTeam": "Seattle SuperSonics",
                "DraftYear": "2007",
                "PlayerPosition": "F",
                "TeamAtMoment": "Seattle SuperSonics",
                "Height": "82",
                "Weight": "240",
                "Birthdate": "1988-09-29",
                "PlayType": "3-pointer",
                "PlayCategory": "Highlight",
                "HomeTeamScore": "120",
                "DateOfMoment": "2008-02-20 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612760",
                "TotalYearsExperience": "0",
                "DraftSelection": "2",
                "Tagline": "Kevin Durant with a clutch 3-pointer.",
                "DraftRound": "1",
                "JerseyNumber": "35",
                "Birthplace": "Washington, D.C., USA",
                "AwayTeamName": "Seattle SuperSonics",
                "HomeTeamName": "Los Angeles Lakers",
                "AwayTeamScore": "115",
                "PrimaryPosition": "SF"
            },
            // Luka Dončić (2018-19, Rookie of the Year)
            {
                "FirstName": "Luka",
                "LastName": "Dončić",
                "NbaSeason": "2018-19",
                "FullName": "Luka Dončić",
                "DraftTeam": "Dallas Mavericks",
                "DraftYear": "2018",
                "PlayerPosition": "G",
                "TeamAtMoment": "Dallas Mavericks",
                "Height": "79",
                "Weight": "230",
                "Birthdate": "1999-02-28",
                "PlayType": "3-pointer",
                "PlayCategory": "Highlight",
                "HomeTeamScore": "122",
                "DateOfMoment": "2019-01-30 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612742",
                "TotalYearsExperience": "0",
                "DraftSelection": "3",
                "Tagline": "Luka Dončić with a deep 3-pointer.",
                "DraftRound": "1",
                "JerseyNumber": "77",
                "Birthplace": "Ljubljana, Slovenia",
                "AwayTeamName": "Dallas Mavericks",
                "HomeTeamName": "New York Knicks",
                "AwayTeamScore": "117",
                "PrimaryPosition": "PG"
            },
            // Giannis Antetokounmpo (2019-20, MVP Year)
            {
                "FirstName": "Giannis",
                "LastName": "Antetokounmpo",
                "NbaSeason": "2019-20",
                "FullName": "Giannis Antetokounmpo",
                "DraftTeam": "Milwaukee Bucks",
                "DraftYear": "2013",
                "PlayerPosition": "F",
                "TeamAtMoment": "Milwaukee Bucks",
                "Height": "83",
                "Weight": "242",
                "Birthdate": "1994-12-06",
                "PlayType": "Dunk",
                "PlayCategory": "Highlight",
                "HomeTeamScore": "115",
                "DateOfMoment": "2020-02-05 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612749",
                "TotalYearsExperience": "6",
                "DraftSelection": "15",
                "Tagline": "Giannis Antetokounmpo with a monstrous dunk.",
                "DraftRound": "1",
                "JerseyNumber": "34",
                "Birthplace": "Athens, Greece",
                "AwayTeamName": "Milwaukee Bucks",
                "HomeTeamName": "Los Angeles Lakers",
                "AwayTeamScore": "110",
                "PrimaryPosition": "PF"
            },
            // Joel Embiid (2022-23, MVP Year)
            {
                "FirstName": "Joel",
                "LastName": "Embiid",
                "NbaSeason": "2022-23",
                "FullName": "Joel Embiid",
                "DraftTeam": "Philadelphia 76ers",
                "DraftYear": "2014",
                "PlayerPosition": "C",
                "TeamAtMoment": "Philadelphia 76ers",
                "Height": "84",
                "Weight": "280",
                "Birthdate": "1994-03-16",
                "PlayType": "Block",
                "PlayCategory": "Defensive",
                "HomeTeamScore": "112",
                "DateOfMoment": "2023-01-15 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612755",
                "TotalYearsExperience": "8",
                "DraftSelection": "3",
                "Tagline": "Joel Embiid with a huge block.",
                "DraftRound": "1",
                "JerseyNumber": "21",
                "Birthplace": "Yaoundé, Cameroon",
                "AwayTeamName": "Philadelphia 76ers",
                "HomeTeamName": "Boston Celtics",
                "AwayTeamScore": "110",
                "PrimaryPosition": "C"
            },
            // Bill Russell (1956-57, Rookie of the Year and Championship Year)
            {
                "FirstName": "Bill",
                "LastName": "Russell",
                "NbaSeason": "1956-57",
                "FullName": "Bill Russell",
                "DraftTeam": "Boston Celtics",
                "DraftYear": "1956",
                "PlayerPosition": "C",
                "TeamAtMoment": "Boston Celtics",
                "Height": "82",
                "Weight": "220",
                "Birthdate": "1934-02-12",
                "PlayType": "Rebound",
                "PlayCategory": "Defensive",
                "HomeTeamScore": "110",
                "DateOfMoment": "1957-04-13 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612738",
                "TotalYearsExperience": "0",
                "DraftSelection": "2",
                "Tagline": "Bill Russell dominates with a crucial rebound.",
                "DraftRound": "1",
                "JerseyNumber": "6",
                "Birthplace": "Monroe, LA, USA",
                "AwayTeamName": "Boston Celtics",
                "HomeTeamName": "St. Louis Hawks",
                "AwayTeamScore": "105",
                "PrimaryPosition": "C"
            },
            // Bruce Brown (2018-19, Rookie Year)
            {
                "FirstName": "Bruce",
                "LastName": "Brown",
                "NbaSeason": "2018-19",
                "FullName": "Bruce Brown",
                "DraftTeam": "Detroit Pistons",
                "DraftYear": "2018",
                "PlayerPosition": "G",
                "TeamAtMoment": "Detroit Pistons",
                "Height": "76",
                "Weight": "202",
                "Birthdate": "1996-08-15",
                "PlayType": "Assist",
                "PlayCategory": "Highlight",
                "HomeTeamScore": "115",
                "DateOfMoment": "2019-01-10 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612765",
                "TotalYearsExperience": "0",
                "DraftSelection": "42",
                "Tagline": "Bruce Brown with an impressive assist.",
                "DraftRound": "2",
                "JerseyNumber": "6",
                "Birthplace": "Boston, MA, USA",
                "AwayTeamName": "Detroit Pistons",
                "HomeTeamName": "Los Angeles Clippers",
                "AwayTeamScore": "110",
                "PrimaryPosition": "SG"
            },
            // Marcus Camby (1996-97, Rookie Year)
            {
                "FirstName": "Marcus",
                "LastName": "Camby",
                "NbaSeason": "1996-97",
                "FullName": "Marcus Camby",
                "DraftTeam": "Toronto Raptors",
                "DraftYear": "1996",
                "PlayerPosition": "C",
                "TeamAtMoment": "Toronto Raptors",
                "Height": "83",
                "Weight": "240",
                "Birthdate": "1974-03-22",
                "PlayType": "Block",
                "PlayCategory": "Defensive",
                "HomeTeamScore": "104",
                "DateOfMoment": "1997-03-12 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612761",
                "TotalYearsExperience": "0",
                "DraftSelection": "2",
                "Tagline": "Marcus Camby with a powerful block.",
                "DraftRound": "1",
                "JerseyNumber": "21",
                "Birthplace": "Hartford, CT, USA",
                "AwayTeamName": "Toronto Raptors",
                "HomeTeamName": "New York Knicks",
                "AwayTeamScore": "102",
                "PrimaryPosition": "C"
            },
            // De'Aaron Fox (2017-18, Rookie Mint)
            {
                "FirstName": "De'Aaron",
                "LastName": "Fox",
                "NbaSeason": "2017-18",
                "FullName": "De'Aaron Fox",
                "DraftTeam": "Sacramento Kings",
                "DraftYear": "2017",
                "PlayerPosition": "G",
                "TeamAtMoment": "Sacramento Kings",
                "Height": "75",
                "Weight": "185",
                "Birthdate": "1997-12-20",
                "PlayType": "Layup",
                "PlayCategory": "Highlight",
                "HomeTeamScore": "102",
                "DateOfMoment": "2018-02-15 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612758",
                "TotalYearsExperience": "0",
                "DraftSelection": "5",
                "Tagline": "De'Aaron Fox with a quick layup.",
                "DraftRound": "1",
                "JerseyNumber": "5",
                "Birthplace": "New Orleans, LA, USA",
                "AwayTeamName": "Sacramento Kings",
                "HomeTeamName": "Dallas Mavericks",
                "AwayTeamScore": "100",
                "PrimaryPosition": "PG"
            },
            // Jayson Tatum (2017-18, Rookie Mint)
            {
                "FirstName": "Jayson",
                "LastName": "Tatum",
                "NbaSeason": "2017-18",
                "FullName": "Jayson Tatum",
                "DraftTeam": "Boston Celtics",
                "DraftYear": "2017",
                "PlayerPosition": "F",
                "TeamAtMoment": "Boston Celtics",
                "Height": "80",
                "Weight": "210",
                "Birthdate": "1998-03-03",
                "PlayType": "3-pointer",
                "PlayCategory": "Highlight",
                "HomeTeamScore": "115",
                "DateOfMoment": "2018-02-20 02:00:00 +0000 UTC",
                "TeamAtMomentNBAID": "1610612738",
                "TotalYearsExperience": "0",
                "DraftSelection": "3",
                "Tagline": "Jayson Tatum with a clutch 3-pointer.",
                "DraftRound": "1",
                "JerseyNumber": "0",
                "Birthplace": "St. Louis, MO, USA",
                "AwayTeamName": "Boston Celtics",
                "HomeTeamName": "New York Knicks",
                "AwayTeamScore": "110",
                "PrimaryPosition": "SF"
            }
        ]
    }

    execute {
        for metadata in self.playMetadataList {
            self.adminRef.createPlay(metadata: metadata)
        }
    }

}