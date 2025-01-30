import "NFTStorefrontV2"

access(all) fun main(account: Address): Bool {
    let storefrontCap = getAccount(account)
        .capabilities
        .get<&{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontPublicPath)
    
    return storefrontCap.check() && 
           storefrontCap.borrow() != nil
}