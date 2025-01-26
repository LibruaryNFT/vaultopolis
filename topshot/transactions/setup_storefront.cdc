import "NFTStorefrontV2"

transaction {
    prepare(acct: auth(Storage, Capabilities) &Account) {
        if acct.storage.borrow<&NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath) == nil {
            let storefront <- NFTStorefrontV2.createStorefront()
            acct.storage.save(<-storefront, to: NFTStorefrontV2.StorefrontStoragePath)
            
            let cap = acct.capabilities.storage.issue<&NFTStorefrontV2.Storefront>(
                NFTStorefrontV2.StorefrontStoragePath
            )
            acct.capabilities.publish(cap, at: NFTStorefrontV2.StorefrontPublicPath)
        }
    }
}