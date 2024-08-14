import "TSHOT"
import "TopShot"

transaction(momentIDs: [UInt64]) {

    prepare(signer: AuthAccount) {
        // Borrow a reference to the signer's Vault
        let vaultRef = signer
            .capabilities
            .borrow<&TSHOT.Vault>(/public/tshotReceiver)
            ?? panic("Could not borrow reference to the signer's Vault")

        // Borrow a reference to the moment collection
        let momentCollectionRef = signer.borrow<&TopShot.Collection>(from: /storage/MomentCollection)
            ?? panic("Could not borrow reference to the signer's Moment Collection")

        // Create an empty array to store the moments
        var moments: @[TopShot.NFT] <- []

        // Iterate through the provided moment IDs and withdraw each moment
        for momentID in momentIDs {
            let moment <- momentCollectionRef.withdraw(withdrawID: momentID) as! @TopShot.NFT
            moments.append(<-moment)
        }

        // Mint the TSHOT tokens to the signer's Vault in exchange for the moments
        TSHOT.mintTSHOTWithMoments(to: vaultRef, moments: <-moments)
    }
}
