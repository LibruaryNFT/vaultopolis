# URL Query Parameters for Filters: Feasibility Analysis

## Executive Summary

**✅ YES - Adding URL query parameters for filters is FEASIBLE and RELATIVELY STRAIGHTFORWARD.**

The app already uses React Router v7 with `useSearchParams`, and there's precedent in `Profile.js` for URL state management. The main challenge is coordinating between:
- **URL query params** (shareable, bookmarkable)
- **localStorage** (persistent user preferences)
- **Filter state** (current session)

**Estimated Implementation Time:** 2-3 hours

---

## Current State

### Filter Storage
- **Location:** `src/hooks/useMomentFilters.js`
- **Storage:** localStorage (via `momentSelectionFilterPrefs:${scope}`)
- **State Management:** React `useReducer` with filter object
- **Initialization:** Loads from localStorage on mount

### Filter Structure
```javascript
{
  selectedTiers: ["common", "fandom"],        // Array
  selectedSeries: [1, 2, 3],                // Array
  selectedSetName: "All",                    // String or "All"
  selectedLeague: ["NBA", "WNBA"],           // Array
  selectedTeam: "All",                       // String or "All"
  selectedPlayer: "All",                     // String or "All"
  selectedSubedition: "All",                 // String or "All"
  excludeSpecialSerials: true,               // Boolean
  excludeLowSerials: true,                   // Boolean
  lockedStatus: "All",                       // String
  specialSerials: "All",                     // String
  sortBy: "lowest-serial",                   // String
  currentPage: 1                             // Number
}
```

### Existing URL State Usage
- **Profile.js** uses `useSearchParams` for `tab` and `source` parameters
- **TSHOTVault.js** uses `URLSearchParams` for API calls (not URL state)
- **TSHOT.js** reads `scroll` parameter from URL

---

## Feasibility Analysis

### ✅ **Technical Feasibility: HIGH**

**Why it's feasible:**
1. **React Router v7** already installed and configured
2. **`useSearchParams` hook** available (already used in Profile.js)
3. **No breaking changes** needed to existing filter logic
4. **Serialization is straightforward** - filter values are simple types

### ⚠️ **Complexity: MEDIUM**

**Challenges:**
1. **State synchronization** - URL ↔ Filter State ↔ localStorage
2. **Serialization format** - Arrays need comma-separated or JSON encoding
3. **Priority handling** - What takes precedence: URL params or localStorage?
4. **URL length limits** - Too many filters could exceed URL length
5. **Backward compatibility** - Existing localStorage preferences

---

## Implementation Approach

### Option 1: URL Takes Precedence (Recommended)
**Behavior:**
- URL params override localStorage on page load
- Filter changes update URL immediately
- localStorage still used for "defaults" when URL is empty

**Pros:**
- Shareable/bookmarkable filters
- Clear precedence
- Works well for sharing

**Cons:**
- URL can get long with many filters
- Need to handle URL encoding

### Option 2: Hybrid Approach
**Behavior:**
- Only "important" filters in URL (Series, Tier, Team, Player)
- Other filters stay in localStorage
- URL params merge with localStorage defaults

**Pros:**
- Shorter URLs
- Most important filters shareable
- Less complexity

**Cons:**
- Incomplete state in URL
- More complex logic

### Option 3: URL as Primary, localStorage as Fallback
**Behavior:**
- URL is source of truth
- localStorage only used if URL is empty
- Filter changes always update URL

**Pros:**
- Simple precedence
- Always shareable

**Cons:**
- URL always present (even if default)
- Can't "clear" URL easily

---

## Recommended Implementation: Option 1 (URL Takes Precedence)

### URL Format Examples

**Simple (few filters):**
```
/swap?series=1,2,3&tier=common,fandom&team=Lakers
```

**Complex (many filters):**
```
/swap?series=1,2,3&tier=common&team=Lakers&player=LeBron%20James&excludeSpecial=true&excludeLow=true&page=1
```

**With encoding:**
```
/swap?series=1%2C2%2C3&tier=common%2Cfandom&team=Los%20Angeles%20Lakers
```

### Serialization Strategy

**Arrays (Series, Tier, League):**
- Format: `series=1,2,3` (comma-separated)
- Empty array = omit parameter or `series=`

**Strings (Set, Team, Player, Parallel):**
- Format: `team=Lakers` or `team=Los%20Angeles%20Lakers`
- "All" = omit parameter

**Booleans (Exclusions):**
- Format: `excludeSpecial=true` or `excludeSpecial=false`
- Default (true) = omit parameter

**Numbers (Page):**
- Format: `page=1`
- Page 1 = omit parameter

---

## Implementation Details

### 1. **Create URL Serialization Utilities**

```javascript
// utils/urlFilters.js

/**
 * Serialize filter object to URL search params
 */
export function filtersToSearchParams(filter) {
  const params = new URLSearchParams();
  
  // Arrays - comma-separated
  if (filter.selectedSeries.length > 0) {
    params.set('series', filter.selectedSeries.join(','));
  }
  if (filter.selectedTiers.length > 0) {
    params.set('tier', filter.selectedTiers.join(','));
  }
  if (filter.selectedLeague.length > 0) {
    params.set('league', filter.selectedLeague.join(','));
  }
  
  // Strings - only if not "All"
  if (filter.selectedSetName !== "All") {
    params.set('set', filter.selectedSetName);
  }
  if (filter.selectedTeam !== "All") {
    params.set('team', filter.selectedTeam);
  }
  if (filter.selectedPlayer !== "All") {
    params.set('player', filter.selectedPlayer);
  }
  if (filter.selectedSubedition !== "All") {
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
 */
export function searchParamsToFilters(searchParams, defaultFilter) {
  const filter = { ...defaultFilter };
  
  // Arrays - comma-separated
  const series = searchParams.get('series');
  if (series) {
    filter.selectedSeries = series.split(',').map(Number).filter(n => !isNaN(n));
  }
  
  const tier = searchParams.get('tier');
  if (tier) {
    filter.selectedTiers = tier.split(',').filter(t => t);
  }
  
  const league = searchParams.get('league');
  if (league) {
    filter.selectedLeague = league.split(',');
  }
  
  // Strings
  const set = searchParams.get('set');
  if (set) filter.selectedSetName = set;
  
  const team = searchParams.get('team');
  if (team) filter.selectedTeam = team;
  
  const player = searchParams.get('player');
  if (player) filter.selectedPlayer = player;
  
  const parallel = searchParams.get('parallel');
  if (parallel) filter.selectedSubedition = parallel;
  
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
```

### 2. **Modify `useMomentFilters` Hook**

**Add URL sync capability:**
```javascript
// In useMomentFilters.js

export function useMomentFilters({
  // ... existing params
  syncWithURL = false,  // New param
  searchParams = null,  // New param (from useSearchParams)
  setSearchParams = null,  // New param
}) {
  // ... existing code
  
  // On mount: Load from URL if present, else localStorage
  useEffect(() => {
    if (!syncWithURL || !searchParams) return;
    
    const urlFilter = searchParamsToFilters(searchParams, DEFAULT_FILTER);
    const hasURLParams = Array.from(searchParams.keys()).length > 0;
    
    if (hasURLParams) {
      // URL takes precedence
      dispatch({ type: "LOAD", payload: urlFilter });
    } else {
      // Fall back to localStorage (existing behavior)
      // ... existing localStorage loading code
    }
  }, []); // Only on mount
  
  // On filter change: Update URL
  useEffect(() => {
    if (!syncWithURL || !setSearchParams) return;
    
    const params = filtersToSearchParams(filter);
    setSearchParams(params, { replace: true }); // replace=true prevents history spam
  }, [filter, syncWithURL, setSearchParams]);
  
  // ... rest of existing code
}
```

### 3. **Update Swap Page**

```javascript
// In src/pages/Swap.js

import { useSearchParams } from "react-router-dom";
import { filtersToSearchParams, searchParamsToFilters } from "../utils/urlFilters";

const Swap = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ... existing code
  
  // Pass URL sync to MomentSelection
  return (
    <SwapApplication
      // ... existing props
      syncFiltersWithURL={true}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
    />
  );
};
```

### 4. **Update MomentSelection Component**

```javascript
// In src/components/MomentSelection.js

export default function MomentSelection(props) {
  // ... existing code
  
  const {
    filter,
    setFilter,
    // ... other returns
  } = useMomentFilters({
    nftDetails,
    selectedNFTs,
    allowAllTiers: props.allowAllTiers || false,
    // ... existing params
    syncWithURL: props.syncFiltersWithURL || false,
    searchParams: props.searchParams,
    setSearchParams: props.setSearchParams,
  });
  
  // ... rest of component
}
```

---

## Challenges & Solutions

### Challenge 1: URL Length Limits
**Problem:** URLs can get very long with many filters
- Browser limit: ~2000 characters (varies)
- Server limit: varies

**Solutions:**
1. **Only include non-default values** (already doing this)
2. **Use shorter parameter names** (`s` instead of `series`)
3. **Compress arrays** (base64 encoding - overkill)
4. **Hybrid approach** - Only most important filters in URL

**Recommendation:** Start with full implementation, optimize if needed.

### Challenge 2: State Synchronization
**Problem:** URL, localStorage, and filter state can get out of sync

**Solution:**
- **Clear precedence:** URL > localStorage > defaults
- **One-way flow:** Filter changes → URL updates
- **On mount:** Load from URL if present, else localStorage

### Challenge 3: Backward Compatibility
**Problem:** Existing users have localStorage preferences

**Solution:**
- **Migration:** On first load with URL sync, if URL is empty, use localStorage
- **Preserve:** localStorage still works for "defaults"
- **No breaking changes:** Existing behavior preserved when URL sync is disabled

### Challenge 4: Special Characters
**Problem:** Team names, player names have spaces and special chars

**Solution:**
- **URL encoding:** `encodeURIComponent()` / `decodeURIComponent()`
- **React Router handles this automatically** with `useSearchParams`

### Challenge 5: Array Serialization
**Problem:** Arrays need to be serialized to URL-friendly format

**Solutions:**
1. **Comma-separated:** `series=1,2,3` (simple, readable)
2. **JSON:** `series=["1","2","3"]` (more complex, but handles edge cases)
3. **Multiple params:** `series=1&series=2&series=3` (standard, but verbose)

**Recommendation:** Comma-separated for simplicity.

---

## What Should Be in URL?

### High Priority (Always Include)
- ✅ **Series** - Most common filter
- ✅ **Tier** - Very common
- ✅ **Team** - Common, shareable
- ✅ **Player** - Common, shareable

### Medium Priority (Include if Set)
- ⚠️ **Set** - Less common, but useful
- ⚠️ **League** - Usually default, but useful
- ⚠️ **Page** - For deep linking

### Low Priority (Optional)
- ❓ **Parallel** - Less common
- ❓ **Exclusions** - Usually default
- ❓ **Sort** - Usually default
- ❓ **Locked Status** - Usually default

**Recommendation:** Include all filters, but only serialize non-default values.

---

## User Experience Considerations

### Benefits
1. **Shareable links** - Users can share filtered views
2. **Bookmarkable** - Save specific filter combinations
3. **Browser back/forward** - Works with filter history
4. **Deep linking** - Direct links to filtered views

### Potential Issues
1. **URL clutter** - Long URLs can look messy
2. **History spam** - Every filter change creates history entry
   - **Solution:** Use `replace: true` in `setSearchParams`
3. **Loading state** - Need to show loading while parsing URL
4. **Invalid params** - Need to handle malformed URLs gracefully

---

## Implementation Complexity

| Task | Complexity | Time |
|------|------------|------|
| Create serialization utils | ⭐⭐ Easy | 30 min |
| Modify useMomentFilters | ⭐⭐⭐ Moderate | 45 min |
| Update Swap page | ⭐ Trivial | 10 min |
| Update MomentSelection | ⭐ Trivial | 10 min |
| Testing & edge cases | ⭐⭐⭐ Moderate | 45 min |
| **Total** | **Medium** | **~2.5 hours** |

---

## Testing Checklist

- [ ] URL params load correctly on page load
- [ ] Filter changes update URL
- [ ] URL with params loads correct filters
- [ ] Empty URL falls back to localStorage
- [ ] Special characters in team/player names work
- [ ] Arrays serialize/deserialize correctly
- [ ] Browser back/forward works
- [ ] Shareable links work
- [ ] Invalid params handled gracefully
- [ ] URL length doesn't cause issues
- [ ] localStorage still works when URL sync disabled

---

## Alternative: Minimal Implementation

If full implementation is too complex, start with **just Series and Tier**:

```javascript
// Minimal URL format
/swap?series=1,2,3&tier=common,fandom
```

**Pros:**
- Faster to implement (~30 min)
- Shorter URLs
- Covers most common use case

**Cons:**
- Incomplete state
- Less useful for sharing

---

## Recommendation

**✅ Proceed with full implementation (Option 1)**

**Reasons:**
1. **Low complexity** - ~2.5 hours
2. **High value** - Shareable/bookmarkable filters
3. **Good UX** - Users expect this behavior
4. **Future-proof** - Easy to extend

**Implementation Order:**
1. Create serialization utilities
2. Add URL sync to `useMomentFilters` (optional param)
3. Update Swap page to enable URL sync
4. Test thoroughly
5. Extend to other pages (Transfer, My Collection) if desired

**Rollout Strategy:**
- Start with Swap page only
- Test with real users
- Extend to other pages if successful
- Keep localStorage as fallback

---

## Conclusion

**Adding URL query parameters for filters is:**
- ✅ **Technically feasible** - React Router v7 supports it
- ✅ **Moderately complex** - ~2.5 hours implementation
- ✅ **High value** - Shareable/bookmarkable filters
- ✅ **Low risk** - Can be added as optional feature

**The main decision is:** Do you want full filter state in URL, or just the most important filters?

**Recommendation:** Start with full implementation, optimize URL length if needed.

