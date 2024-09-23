import NFTCatalog from 0x49a7cda3a1eecc29

access(all) fun main(): [String] {
		let catalog: {String : NFTCatalog.NFTCatalogMetadata} = NFTCatalog.getCatalog()
		let catalogNames: [String] = []
		for collectionIdentifier in catalog.keys {
			catalogNames.append(catalog[collectionIdentifier]!.collectionDisplay.name)
    }
    return catalogNames
}
