/**
 * URL Filter Serialization Utilities
 * 
 * Converts filter objects to/from URL query parameters
 */

/**
 * Serialize filter object to URL search params
 * Only includes non-default values to keep URLs short
 */
export function filtersToSearchParams(filter, defaultFilter = null, seriesOptions = null) {
  const params = new URLSearchParams();
  
  // Helper to check if arrays are equal (order-independent)
  const arraysEqual = (a, b) => {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return JSON.stringify(sortedA) === JSON.stringify(sortedB);
  };
  
  // Series: Only include if not all available series (all series is the effective default after auto-select)
  if (filter.selectedSeries.length > 0) {
    // Check if selectedSeries matches all available seriesOptions
    const isAllSeries = seriesOptions && 
      filter.selectedSeries.length === seriesOptions.length &&
      filter.selectedSeries.every(s => seriesOptions.includes(s)) &&
      seriesOptions.every(s => filter.selectedSeries.includes(s));
    
    if (!isAllSeries) {
      params.set('series', filter.selectedSeries.join(','));
    }
  }
  
  // Tiers: Only include if different from default ["common", "fandom"]
  const defaultTiers = defaultFilter?.selectedTiers || ["common", "fandom"];
  if (filter.selectedTiers.length > 0 && !arraysEqual(filter.selectedTiers, defaultTiers)) {
    params.set('tier', filter.selectedTiers.join(','));
  }
  
  // League: Only include if different from default ["NBA", "WNBA"]
  const defaultLeague = defaultFilter?.selectedLeague || ["NBA", "WNBA"];
  if (filter.selectedLeague.length > 0 && !arraysEqual(filter.selectedLeague, defaultLeague)) {
    params.set('league', filter.selectedLeague.join(','));
  }
  
  // Arrays (new multi-select filters) - comma-separated
  if (Array.isArray(filter.selectedSetName) && filter.selectedSetName.length > 0) {
    params.set('set', filter.selectedSetName.join(','));
  } else if (typeof filter.selectedSetName === "string" && filter.selectedSetName !== "All") {
    // Backward compatibility: handle old string format
    params.set('set', filter.selectedSetName);
  }
  
  if (Array.isArray(filter.selectedTeam) && filter.selectedTeam.length > 0) {
    params.set('team', filter.selectedTeam.join(','));
  } else if (typeof filter.selectedTeam === "string" && filter.selectedTeam !== "All") {
    // Backward compatibility: handle old string format
    params.set('team', filter.selectedTeam);
  }
  
  if (Array.isArray(filter.selectedPlayer) && filter.selectedPlayer.length > 0) {
    params.set('player', filter.selectedPlayer.join(','));
  } else if (typeof filter.selectedPlayer === "string" && filter.selectedPlayer !== "All") {
    // Backward compatibility: handle old string format
    params.set('player', filter.selectedPlayer);
  }
  
  if (Array.isArray(filter.selectedSubedition) && filter.selectedSubedition.length > 0) {
    params.set('parallel', filter.selectedSubedition.map(String).join(','));
  } else if (typeof filter.selectedSubedition === "string" && filter.selectedSubedition !== "All") {
    // Backward compatibility: handle old string format
    params.set('parallel', filter.selectedSubedition);
  }
  
  // Booleans - only if not default
  if (!filter.excludeSpecialSerials) {
    params.set('excludeSpecial', 'false');
  }
  if (!filter.excludeLowSerials) {
    params.set('excludeLow', 'false');
  }
  
  // Other filters
  if (filter.lockedStatus !== "All") {
    params.set('locked', filter.lockedStatus);
  }
  if (filter.sortBy !== "lowest-serial") {
    params.set('sort', filter.sortBy);
  }
  
  // Page - only if > 1
  if (filter.currentPage > 1) {
    params.set('page', filter.currentPage.toString());
  }
  
  return params;
}

/**
 * Parse URL search params to filter object
 * Merges with default filter, URL takes precedence
 */
export function searchParamsToFilters(searchParams, defaultFilter) {
  const filter = { ...defaultFilter };
  
  // Arrays - comma-separated
  // Note: searchParams.get() automatically URL-decodes values
  const series = searchParams.get('series');
  if (series) {
    // Split by comma, trim whitespace, convert to numbers
    filter.selectedSeries = series.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
  }
  
  const tier = searchParams.get('tier');
  if (tier) {
    filter.selectedTiers = tier.split(',').map(t => t.trim()).filter(t => t);
  }
  
  const league = searchParams.get('league');
  if (league) {
    filter.selectedLeague = league.split(',').map(l => l.trim()).filter(l => l);
  }
  
  // Arrays (new multi-select filters) - comma-separated
  // Note: searchParams.get() automatically URL-decodes values (e.g., "Metallic+Silver+FE" becomes "Metallic Silver FE")
  const set = searchParams.get('set');
  if (set) {
    filter.selectedSetName = set.split(',').map(s => s.trim()).filter(s => s);
  }
  
  const team = searchParams.get('team');
  if (team) {
    filter.selectedTeam = team.split(',').map(t => t.trim()).filter(t => t);
  }
  
  const player = searchParams.get('player');
  if (player) {
    filter.selectedPlayer = player.split(',').map(p => p.trim()).filter(p => p);
  }
  
  const parallel = searchParams.get('parallel');
  if (parallel) {
    filter.selectedSubedition = parallel.split(',').map(p => String(p.trim())).filter(p => p);
  }
  
  // Booleans
  const excludeSpecial = searchParams.get('excludeSpecial');
  if (excludeSpecial !== null) {
    filter.excludeSpecialSerials = excludeSpecial === 'true';
  }
  
  const excludeLow = searchParams.get('excludeLow');
  if (excludeLow !== null) {
    filter.excludeLowSerials = excludeLow === 'true';
  }
  
  // Other
  const locked = searchParams.get('locked');
  if (locked) filter.lockedStatus = locked;
  
  const sort = searchParams.get('sort');
  if (sort) filter.sortBy = sort;
  
  // Page
  const page = searchParams.get('page');
  if (page) {
    const pageNum = parseInt(page, 10);
    if (!isNaN(pageNum) && pageNum > 0) {
      filter.currentPage = pageNum;
    }
  }
  
  return filter;
}

