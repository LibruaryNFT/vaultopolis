import "TopShotFloors"

transaction(newPrice: UFix64) {

    prepare(signer: auth(contract) &Account) {

        // Update the price per TopShot moment in the TopShotFloors contract
        TopShotFloors.updateFlowPerNFT(newAmount: newPrice)
    }

    execute {
        
    }
}
