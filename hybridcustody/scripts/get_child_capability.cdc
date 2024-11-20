import "NonFungibleToken"

access(all) fun main(child: Address): Bool {
    let cap = getAccount(child)
        .capabilities
        .get<&{NonFungibleToken.Provider}>(/public/MomentCollection)

    return cap != nil && cap!.check()
}
