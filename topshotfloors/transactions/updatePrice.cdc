import "TopShotFloors"

transaction(newFlowPerNFT: UFix64) {

    prepare(signer: auth(BorrowValue, Storage, LoadValue) &Account) {
        // Borrow the Admin resource from storage
        let adminRef = signer
            .storage
            .borrow<&TopShotFloors.Admin>(from: /storage/TopShotFloorsAdmin)
            ?? panic("Could not borrow the Admin resource")

        // Use the Admin resource to update the flowPerNFT value
        adminRef.updateFlowPerNFT(newValue: newFlowPerNFT)
    }

    execute {
        log("Updated flowPerNFT value successfully")
    }
}

