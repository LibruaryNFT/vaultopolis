export const getCOA = `

    import EVM from 0xe467b9dd11fa00df

access(all)
fun main(address: Address): EVM.EVMAddress {
    // Get the desired Flow account holding the COA in storage
    let account = getAuthAccount<auth(Storage) &Account>(address)

    // Borrow a reference to the COA from the storage location we saved it to
    let coa = account.storage.borrow<&EVM.CadenceOwnedAccount>(
        from: /storage/evm
    ) ?? panic("Could not borrow reference to the COA")

    // Return the EVM address of the COA
    return coa.address()
}

`;
