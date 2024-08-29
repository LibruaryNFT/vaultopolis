import "TopShot"

access(all)
contract TopShotBadges {

    // Resource to manage the badge mappings
    access(all)
    resource Admin {

        // Function to check if a moment has the "Rookie of the Year" badge
        access(all)
        fun hasRookieOfTheYearBadge(playMetadata: {String: String}): Bool {
            let firstName = playMetadata["FirstName"] ?? ""
            let lastName = playMetadata["LastName"] ?? ""
            let nbaSeason = playMetadata["NbaSeason"] ?? ""

            let rookieData: {String: [{String: String}]} = {
                "1952-53": [{"FirstName": "Don", "LastName": "Meineke"}],
                "1953-54": [{"FirstName": "Ray", "LastName": "Felix"}],
                "1954-55": [{"FirstName": "Bob", "LastName": "Pettit"}],
                "1955-56": [{"FirstName": "Maurice", "LastName": "Stokes"}],
                "1956-57": [{"FirstName": "Tom", "LastName": "Heinsohn"}],
                "1957-58": [{"FirstName": "Woody", "LastName": "Sauldsberry"}],
                "1958-59": [{"FirstName": "Elgin", "LastName": "Baylor"}],
                "1959-60": [{"FirstName": "Wilt", "LastName": "Chamberlain"}],
                "1960-61": [{"FirstName": "Oscar", "LastName": "Robertson"}],
                "1961-62": [{"FirstName": "Walt", "LastName": "Bellamy"}],
                "1962-63": [{"FirstName": "Terry", "LastName": "Dischinger"}],
                "1963-64": [{"FirstName": "Jerry", "LastName": "Lucas"}],
                "1964-65": [{"FirstName": "Willis", "LastName": "Reed"}],
                "1965-66": [{"FirstName": "Rick", "LastName": "Barry"}],
                "1966-67": [{"FirstName": "Dave", "LastName": "Bing"}],
                "1967-68": [{"FirstName": "Earl", "LastName": "Monroe"}],
                "1968-69": [{"FirstName": "Wes", "LastName": "Unseld"}],
                "1969-70": [{"FirstName": "Lew", "LastName": "Alcindor"}],
                "1970-71": [{"FirstName": "Dave", "LastName": "Cowens"}, {"FirstName": "Geoff", "LastName": "Petrie"}],
                "1971-72": [{"FirstName": "Sidney", "LastName": "Wicks"}],
                "1972-73": [{"FirstName": "Bob", "LastName": "McAdoo"}],
                "1973-74": [{"FirstName": "Ernie", "LastName": "DiGregorio"}],
                "1974-75": [{"FirstName": "Jamaal", "LastName": "Wilkes"}],
                "1975-76": [{"FirstName": "Alvan", "LastName": "Adams"}],
                "1976-77": [{"FirstName": "Adrian", "LastName": "Dantley"}],
                "1977-78": [{"FirstName": "Walter", "LastName": "Davis"}],
                "1978-79": [{"FirstName": "Phil", "LastName": "Ford"}],
                "1979-80": [{"FirstName": "Larry", "LastName": "Bird"}],
                "1980-81": [{"FirstName": "Darrell", "LastName": "Griffith"}],
                "1981-82": [{"FirstName": "Buck", "LastName": "Williams"}],
                "1982-83": [{"FirstName": "Terry", "LastName": "Cummings"}],
                "1983-84": [{"FirstName": "Ralph", "LastName": "Sampson"}],
                "1984-85": [{"FirstName": "Michael", "LastName": "Jordan"}],
                "1985-86": [{"FirstName": "Patrick", "LastName": "Ewing"}],
                "1986-87": [{"FirstName": "Chuck", "LastName": "Person"}],
                "1987-88": [{"FirstName": "Mark", "LastName": "Jackson"}],
                "1988-89": [{"FirstName": "Mitch", "LastName": "Richmond"}],
                "1989-90": [{"FirstName": "David", "LastName": "Robinson"}],
                "1990-91": [{"FirstName": "Derrick", "LastName": "Coleman"}],
                "1991-92": [{"FirstName": "Larry", "LastName": "Johnson"}],
                "1992-93": [{"FirstName": "Shaquille", "LastName": "O'Neal"}],
                "1993-94": [{"FirstName": "Chris", "LastName": "Webber"}],
                "1994-95": [{"FirstName": "Grant", "LastName": "Hill"}, {"FirstName": "Jason", "LastName": "Kidd"}],
                "1995-96": [{"FirstName": "Damon", "LastName": "Stoudamire"}],
                "1996-97": [{"FirstName": "Allen", "LastName": "Iverson"}],
                "1997-98": [{"FirstName": "Tim", "LastName": "Duncan"}],
                "1998-99": [{"FirstName": "Vince", "LastName": "Carter"}],
                "1999-00": [{"FirstName": "Elton", "LastName": "Brand"}, {"FirstName": "Steve", "LastName": "Francis"}],
                "2000-01": [{"FirstName": "Mike", "LastName": "Miller"}],
                "2001-02": [{"FirstName": "Pau", "LastName": "Gasol"}],
                "2002-03": [{"FirstName": "Amar'e", "LastName": "Stoudemire"}],
                "2003-04": [{"FirstName": "LeBron", "LastName": "James"}],
                "2004-05": [{"FirstName": "Emeka", "LastName": "Okafor"}],
                "2005-06": [{"FirstName": "Chris", "LastName": "Paul"}],
                "2006-07": [{"FirstName": "Brandon", "LastName": "Roy"}],
                "2007-08": [{"FirstName": "Kevin", "LastName": "Durant"}],
                "2008-09": [{"FirstName": "Derrick", "LastName": "Rose"}],
                "2009-10": [{"FirstName": "Tyreke", "LastName": "Evans"}],
                "2010-11": [{"FirstName": "Blake", "LastName": "Griffin"}],
                "2011-12": [{"FirstName": "Kyrie", "LastName": "Irving"}],
                "2012-13": [{"FirstName": "Damian", "LastName": "Lillard"}],
                "2013-14": [{"FirstName": "Michael", "LastName": "Carter-Williams"}],
                "2014-15": [{"FirstName": "Andrew", "LastName": "Wiggins"}],
                "2015-16": [{"FirstName": "Karl-Anthony", "LastName": "Towns"}],
                "2016-17": [{"FirstName": "Malcolm", "LastName": "Brogdon"}],
                "2017-18": [{"FirstName": "Ben", "LastName": "Simmons"}],
                "2018-19": [{"FirstName": "Luka", "LastName": "Dončić"}],
                "2019-20": [{"FirstName": "Ja", "LastName": "Morant"}],
                "2020-21": [{"FirstName": "LaMelo", "LastName": "Ball"}],
                "2021-22": [{"FirstName": "Scottie", "LastName": "Barnes"}],
                "2022-23": [{"FirstName": "Paolo", "LastName": "Banchero"}],
                "2023-24": [{"FirstName": "Victor", "LastName": "Wembanyama"}]
            }

            if let rookies = rookieData[nbaSeason] {
                for rookie in rookies {
                    if rookie["FirstName"] == firstName && rookie["LastName"] == lastName {
                        return true
                    }
                }
            }

            return false
        }

        // Function to check if a moment has the "Rookie Year" badge
        access(all)
        fun hasRookieYearBadge(playMetadata: {String: String}): Bool {
            let totalYearsExperience = playMetadata["TotalYearsExperience"] ?? ""
            if totalYearsExperience == "0" {
                return true
            }
            return false
        }

        // Function to check if a moment has the "Rookie Mint" badge
        access(all)
        fun hasRookieMintBadge(playMetadata: {String: String}, setID: UInt32): Bool {
            let totalYearsExperience = playMetadata["TotalYearsExperience"] ?? ""
            let nbaSeason = playMetadata["NbaSeason"] ?? ""

            var setSeason: String = ""

            if setID >= 1 && setID <= 25 {
                setSeason = "2019-20"
            } else if setID >= 26 && setID <= 50 {
                setSeason = "2020-21"
            } else if setID >= 51 && setID <= 69 {
                setSeason = "2021-22"
            } else if setID >= 70 && setID <= 123 {
                setSeason = "2022-23"
            } else if setID >= 124 && setID <= 153 {
                setSeason = "2023-24"
            }

            if totalYearsExperience == "0" && nbaSeason == setSeason {
                return true
            }
            return false
        }

        // Function to check if a moment has the "Championship Year" badge
        access(all)
        fun hasChampionshipYearBadge(playMetadata: {String: String}): Bool {
            let nbaSeason = playMetadata["NbaSeason"] ?? ""
            let teamAtMoment = playMetadata["TeamAtMoment"] ?? ""

            let championshipData: {String: [String]} = {
                "1946-47": ["Philadelphia Warriors"],
                "1947-48": ["Baltimore Bullets"],
                "1948-49": ["Minneapolis Lakers"],
                "1949-50": ["Minneapolis Lakers"],
                "1950-51": ["Rochester Royals"],
                "1951-52": ["Minneapolis Lakers"],
                "1952-53": ["Minneapolis Lakers"],
                "1953-54": ["Minneapolis Lakers"],
                "1954-55": ["Syracuse Nationals"],
                "1955-56": ["Philadelphia Warriors"],
                "1956-57": ["Boston Celtics"],
                "1957-58": ["St. Louis Hawks"],
                "1958-59": ["Boston Celtics"],
                "1959-60": ["Boston Celtics"],
                "1960-61": ["Boston Celtics"],
                "1961-62": ["Boston Celtics"],
                "1962-63": ["Boston Celtics"],
                "1963-64": ["Boston Celtics"],
                "1964-65": ["Boston Celtics"],
                "1965-66": ["Boston Celtics"],
                "1966-67": ["Philadelphia 76ers"],
                "1967-68": ["Boston Celtics"],
                "1968-69": ["Boston Celtics"],
                "1969-70": ["New York Knicks"],
                "1970-71": ["Milwaukee Bucks"],
                "1971-72": ["Los Angeles Lakers"],
                "1972-73": ["New York Knicks"],
                "1973-74": ["Boston Celtics"],
                "1974-75": ["Golden State Warriors"],
                "1975-76": ["Boston Celtics"],
                "1976-77": ["Portland Trail Blazers"],
                "1977-78": ["Washington Bullets"],
                "1978-79": ["Seattle SuperSonics"],
                "1979-80": ["Los Angeles Lakers"],
                "1980-81": ["Boston Celtics"],
                "1981-82": ["Los Angeles Lakers"],
                "1982-83": ["Philadelphia 76ers"],
                "1983-84": ["Boston Celtics"],
                "1984-85": ["Los Angeles Lakers"],
                "1985-86": ["Boston Celtics"],
                "1986-87": ["Los Angeles Lakers"],
                "1987-88": ["Los Angeles Lakers"],
                "1988-89": ["Detroit Pistons"],
                "1989-90": ["Detroit Pistons"],
                "1990-91": ["Chicago Bulls"],
                "1991-92": ["Chicago Bulls"],
                "1992-93": ["Chicago Bulls"],
                "1993-94": ["Houston Rockets"],
                "1994-95": ["Houston Rockets"],
                "1995-96": ["Chicago Bulls"],
                "1996-97": ["Chicago Bulls"],
                "1997-98": ["Chicago Bulls"],
                "1998-99": ["San Antonio Spurs"],
                "1999-00": ["Los Angeles Lakers"],
                "2000-01": ["Los Angeles Lakers"],
                "2001-02": ["Los Angeles Lakers"],
                "2002-03": ["San Antonio Spurs"],
                "2003-04": ["Detroit Pistons"],
                "2004-05": ["San Antonio Spurs"],
                "2005-06": ["Miami Heat"],
                "2006-07": ["San Antonio Spurs"],
                "2007-08": ["Boston Celtics"],
                "2008-09": ["Los Angeles Lakers"],
                "2009-10": ["Los Angeles Lakers"],
                "2010-11": ["Dallas Mavericks"],
                "2011-12": ["Miami Heat"],
                "2012-13": ["Miami Heat"],
                "2013-14": ["San Antonio Spurs"],
                "2014-15": ["Golden State Warriors"],
                "2015-16": ["Cleveland Cavaliers"],
                "2016-17": ["Golden State Warriors"],
                "2017-18": ["Golden State Warriors"],
                "2018-19": ["Toronto Raptors"],
                "2019-20": ["Los Angeles Lakers"],
                "2020-21": ["Milwaukee Bucks"],
                "2021-22": ["Golden State Warriors"],
                "2022-23": ["Denver Nuggets"],
                "2023-24": ["Boston Celtics"]
            }

            if let champions = championshipData[nbaSeason] {
                if champions.contains(teamAtMoment) {
                    return true
                }
            }

            return false
        }

        // Function to check if a moment has the "MVP Year" badge
        access(all)
        fun hasMVPYearBadge(playMetadata: {String: String}): Bool {
            let firstName = playMetadata["FirstName"] ?? ""
            let lastName = playMetadata["LastName"] ?? ""
            let nbaSeason = playMetadata["NbaSeason"] ?? ""

            let mvpData: {String: [{String: String}]} = {
                "1955-56": [{"FirstName": "Bob", "LastName": "Pettit"}],
                "1956-57": [{"FirstName": "Bob", "LastName": "Cousy"}],
                "1957-58": [{"FirstName": "Bill", "LastName": "Russell"}],
                "1958-59": [{"FirstName": "Bob", "LastName": "Pettit"}],
                "1959-60": [{"FirstName": "Wilt", "LastName": "Chamberlain"}],
                "1960-61": [{"FirstName": "Bill", "LastName": "Russell"}],
                "1961-62": [{"FirstName": "Bill", "LastName": "Russell"}],
                "1962-63": [{"FirstName": "Bill", "LastName": "Russell"}],
                "1963-64": [{"FirstName": "Oscar", "LastName": "Robertson"}],
                "1964-65": [{"FirstName": "Bill", "LastName": "Russell"}],
                "1965-66": [{"FirstName": "Wilt", "LastName": "Chamberlain"}],
                "1966-67": [{"FirstName": "Wilt", "LastName": "Chamberlain"}],
                "1967-68": [{"FirstName": "Wilt", "LastName": "Chamberlain"}],
                "1968-69": [{"FirstName": "Wes", "LastName": "Unseld"}],
                "1969-70": [{"FirstName": "Willis", "LastName": "Reed"}],
                "1970-71": [{"FirstName": "Lew", "LastName": "Alcindor"}],
                "1971-72": [{"FirstName": "Kareem", "LastName": "Abdul-Jabbar"}],
                "1972-73": [{"FirstName": "Dave", "LastName": "Cowens"}],
                "1973-74": [{"FirstName": "Kareem", "LastName": "Abdul-Jabbar"}],
                "1974-75": [{"FirstName": "Bob", "LastName": "McAdoo"}],
                "1975-76": [{"FirstName": "Kareem", "LastName": "Abdul-Jabbar"}],
                "1976-77": [{"FirstName": "Kareem", "LastName": "Abdul-Jabbar"}],
                "1977-78": [{"FirstName": "Bill", "LastName": "Walton"}],
                "1978-79": [{"FirstName": "Moses", "LastName": "Malone"}],
                "1979-80": [{"FirstName": "Kareem", "LastName": "Abdul-Jabbar"}],
                "1980-81": [{"FirstName": "Julius", "LastName": "Erving"}],
                "1981-82": [{"FirstName": "Moses", "LastName": "Malone"}],
                "1982-83": [{"FirstName": "Moses", "LastName": "Malone"}],
                "1983-84": [{"FirstName": "Larry", "LastName": "Bird"}],
                "1984-85": [{"FirstName": "Larry", "LastName": "Bird"}],
                "1985-86": [{"FirstName": "Larry", "LastName": "Bird"}],
                "1986-87": [{"FirstName": "Magic", "LastName": "Johnson"}],
                "1987-88": [{"FirstName": "Michael", "LastName": "Jordan"}],
                "1988-89": [{"FirstName": "Magic", "LastName": "Johnson"}],
                "1989-90": [{"FirstName": "Magic", "LastName": "Johnson"}],
                "1990-91": [{"FirstName": "Michael", "LastName": "Jordan"}],
                "1991-92": [{"FirstName": "Michael", "LastName": "Jordan"}],
                "1992-93": [{"FirstName": "Charles", "LastName": "Barkley"}],
                "1993-94": [{"FirstName": "Hakeem", "LastName": "Olajuwon"}],
                "1994-95": [{"FirstName": "David", "LastName": "Robinson"}],
                "1995-96": [{"FirstName": "Michael", "LastName": "Jordan"}],
                "1996-97": [{"FirstName": "Karl", "LastName": "Malone"}],
                "1997-98": [{"FirstName": "Michael", "LastName": "Jordan"}],
                "1998-99": [{"FirstName": "Karl", "LastName": "Malone"}],
                "1999-00": [{"FirstName": "Shaquille", "LastName": "O'Neal"}],
                "2000-01": [{"FirstName": "Allen", "LastName": "Iverson"}],
                "2001-02": [{"FirstName": "Tim", "LastName": "Duncan"}],
                "2002-03": [{"FirstName": "Tim", "LastName": "Duncan"}],
                "2003-04": [{"FirstName": "Kevin", "LastName": "Garnett"}],
                "2004-05": [{"FirstName": "Steve", "LastName": "Nash"}],
                "2005-06": [{"FirstName": "Steve", "LastName": "Nash"}],
                "2006-07": [{"FirstName": "Dirk", "LastName": "Nowitzki"}],
                "2007-08": [{"FirstName": "Kobe", "LastName": "Bryant"}],
                "2008-09": [{"FirstName": "LeBron", "LastName": "James"}],
                "2009-10": [{"FirstName": "LeBron", "LastName": "James"}],
                "2010-11": [{"FirstName": "Derrick", "LastName": "Rose"}],
                "2011-12": [{"FirstName": "LeBron", "LastName": "James"}],
                "2012-13": [{"FirstName": "LeBron", "LastName": "James"}],
                "2013-14": [{"FirstName": "Kevin", "LastName": "Durant"}],
                "2014-15": [{"FirstName": "Stephen", "LastName": "Curry"}],
                "2015-16": [{"FirstName": "Stephen", "LastName": "Curry"}],
                "2016-17": [{"FirstName": "Russell", "LastName": "Westbrook"}],
                "2017-18": [{"FirstName": "James", "LastName": "Harden"}],
                "2018-19": [{"FirstName": "Giannis", "LastName": "Antetokounmpo"}],
                "2019-20": [{"FirstName": "Giannis", "LastName": "Antetokounmpo"}],
                "2020-21": [{"FirstName": "Nikola", "LastName": "Jokić"}],
                "2021-22": [{"FirstName": "Nikola", "LastName": "Jokić"}],
                "2022-23": [{"FirstName": "Joel", "LastName": "Embiid"}],
                "2023-24": [{"FirstName": "Nikola", "LastName": "Jokić"}]
            }

            if let mvpPlayers = mvpData[nbaSeason] {
                for mvp in mvpPlayers {
                    if mvp["FirstName"] == firstName && mvp["LastName"] == lastName {
                        return true
                    }
                }
            }

            return false
        }

        // Function to get all badges for a given moment
        access(all)
        fun getBadges(playMetadata: {String: String}, setID: UInt32): [String] {
            var badges: [String] = []

            if self.hasRookieOfTheYearBadge(playMetadata: playMetadata) {
                badges.append("Rookie of the Year")
            }
            if self.hasRookieYearBadge(playMetadata: playMetadata) {
                badges.append("Rookie Year")
            }
            if self.hasRookieMintBadge(playMetadata: playMetadata, setID: setID) {
                badges.append("Rookie Mint")
            }
            if self.hasMVPYearBadge(playMetadata: playMetadata) {
                badges.append("MVP Year")
            }

            if self.hasChampionshipYearBadge(playMetadata: playMetadata) {
                badges.append("Championship Year")
            }

            // Add other badge checks here

            return badges
        }
    }

    init() {
        self.account.storage.save(<-create Admin(), to: /storage/TopShotBadgesAdmin)
        let cap = self.account.capabilities.storage.issue<&TopShotBadges.Admin>(/storage/TopShotBadgesAdmin)
        self.account.capabilities.publish(cap, at: /public/TopShotBadgesAdmin)
    }

    // Function to get the badges of an NBA Top Shot moment
    access(all)
    fun getMomentBadges(account: Address, momentID: UInt64): [String] {
        let collectionRef = getAccount(account)
            .capabilities.get<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection)
            .borrow()
            ?? panic("Could not borrow capability from public collection")

        let momentRef = collectionRef.borrowMoment(id: momentID)
            ?? panic("Could not borrow moment reference")

        let playMetadata = TopShot.getPlayMetaData(playID: momentRef.data.playID) ?? panic("Play doesn't exist")
        let setID = momentRef.data.setID

        let adminRef = getAccount(self.account.address)
            .capabilities.get<&TopShotBadges.Admin>(/public/TopShotBadgesAdmin)
            .borrow()
            ?? panic("Could not borrow a reference to the Admin resource")

        return adminRef.getBadges(playMetadata: playMetadata, setID: setID)
    }
}
