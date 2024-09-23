import NFTCatalog from 0x49a7cda3a1eecc29

/*
	The catalog is returned as a `String: NFTCatalogMetadata`
	The key string is intended to be a unique identifier for a specific collection.
	The NFTCatalogMetadata contains collection-level views corresponding to each
	collection identifier.
*/
access(all) fun main(): {String : NFTCatalog.NFTCatalogMetadata} {
    return NFTCatalog.getCatalog()

}
