# Filter System Analysis: Multi-Select Support & Count Behavior

## Current Filter Implementation

### ✅ **Multi-Select Filters** (Using `MultiSelectFilterPopover`)
These filters allow users to select **multiple values** simultaneously:

1. **Series** - Can select multiple series (e.g., Series 1, Series 2, Series 3)
2. **Tier** - Can select multiple tiers (e.g., Common, Fandom, Rare)
   - **Note**: Has `minSelection={1}` - requires at least one tier to be selected
3. **League** - Can select multiple leagues (e.g., NBA, WNBA)
   - **Note**: Has `minSelection={1}` - requires at least one league to be selected

### ❌ **Single-Select Filters** (Using `FilterPopover`)
These filters only allow **one value** at a time:

1. **Set** - Only one set can be selected (e.g., "2020-21 Base Set")
2. **Team** - Only one team can be selected (e.g., "Los Angeles Lakers")
3. **Player** - Only one player can be selected (e.g., "LeBron James")
4. **Parallel** - Only one parallel/subedition can be selected

### 🔘 **Exclusion Filters** (Toggle Buttons)
These are binary on/off toggles, not dropdowns:

1. **Special Serials** - Toggle to exclude/include special serials
2. **Low Serials** - Toggle to exclude/include low serial numbers

---

## Count Behavior: What Do the Numbers Mean?

### ⚠️ **Critical Finding: Counts Show FILTERED Results, Not Total Collection**

All filter counts are calculated from `eligibleMoments`, which is **already filtered** by:
- Other active filters
- Exclusion toggles (Special Serials, Low Serials)
- Tier restrictions (if applicable)
- Locked status (if applicable)

**Example Scenario:**
- User has 1000 total moments in collection
- User selects "Series 1" filter → Shows 200 moments
- User then opens "Player" filter
- The count for "LeBron James" shows how many LeBron moments exist **within those 200 Series 1 moments**, NOT how many LeBron moments exist in the entire 1000-moment collection

### Count Calculation Logic

```javascript
getCount={(player) =>
  player === "All"
    ? eligibleMoments.length  // Total filtered moments
    : eligibleMoments.filter((m) => m.fullName === player).length  // Filtered moments matching this player
}
```

**This means:**
- ✅ Counts are **contextual** - they show what's available given current filters
- ❌ Counts are **NOT absolute** - they don't show total collection counts
- ⚠️ This can be **confusing** - users might expect to see total counts

---

## User Complaint Analysis

### Issue: "Users expect some filters to support multi-select"

**Most Likely Candidates:**
1. **Player Filter** - Users likely want to filter by multiple players (e.g., "Show me LeBron, Curry, and Durant moments")
2. **Team Filter** - Users likely want to filter by multiple teams (e.g., "Show me Lakers and Warriors moments")
3. **Set Filter** - Possibly, but less common

**Current Limitation:**
- Player and Team filters use `FilterPopover` (single-select only)
- Users can only select one player or one team at a time
- This is a **legitimate UX limitation**

---

## Recommendations

### Option 1: Convert Player & Team to Multi-Select (Recommended)
**Pros:**
- Matches user expectations
- Consistent with Series/Tier/League filters
- More flexible filtering

**Cons:**
- Requires changing `FilterPopover` to `MultiSelectFilterPopover`
- Need to update filter state handling (array instead of string)
- Need to update filter logic in `useMomentFilters.js`

### Option 2: Keep Current Behavior, Improve UX
**Pros:**
- No code changes needed
- Single-select might be intentional for performance

**Cons:**
- Doesn't address user complaint
- Inconsistent with other filters

### Option 3: Hybrid Approach
- Keep Set and Parallel as single-select (less common use case)
- Convert Player and Team to multi-select (common use case)

---

## Count Display Options

### Current: Contextual Counts (Filtered Results)
- Shows counts based on currently filtered collection
- **Pro**: Shows what's actually available
- **Con**: Can be confusing, numbers change as filters change

### Alternative: Absolute Counts (Total Collection)
- Shows counts from entire collection
- **Pro**: Always shows true totals
- **Con**: May show high counts for options that have 0 results after filtering

### Alternative: Dual Display
- Show both: `(filtered / total)` format
- Example: "LeBron James (15 / 120)" = 15 in current filter, 120 total

---

## Implementation Notes

### To Convert Player/Team to Multi-Select:

1. **In `MomentSelection.js`:**
   - Change `FilterPopover` to `MultiSelectFilterPopover` for Player and Team
   - Update `onChange` handlers to accept arrays
   - Update `selectedValue` to `selectedValues` (array)

2. **In `useMomentFilters.js`:**
   - Update `FILTER_SCHEMA` default values:
     - `selectedTeam: { def: [] }` (array instead of "All")
     - `selectedPlayer: { def: [] }` (array instead of "All")
   - Update filter logic in `passes()` function to handle arrays
   - Update option generation logic

3. **Filter Logic Changes:**
   ```javascript
   // Current (single-select):
   if (filter.selectedPlayer !== "All" && n.fullName !== filter.selectedPlayer) return false;
   
   // New (multi-select):
   if (filter.selectedPlayer.length > 0 && !filter.selectedPlayer.includes(n.fullName)) return false;
   ```

---

## Summary

| Filter | Type | Multi-Select? | Count Source | User Expectation |
|--------|------|--------------|--------------|------------------|
| Series | Multi | ✅ Yes | Filtered | ✅ Matches |
| Tier | Multi | ✅ Yes | Filtered | ✅ Matches |
| League | Multi | ✅ Yes | Filtered | ✅ Matches |
| Set | Single | ❌ No | Filtered | ⚠️ Probably OK |
| Team | Single | ❌ No | Filtered | ❌ **Users want multi-select** |
| Player | Single | ❌ No | Filtered | ❌ **Users want multi-select** |
| Parallel | Single | ❌ No | Filtered | ⚠️ Probably OK |
| Special Serials | Toggle | N/A | N/A | ✅ Matches |
| Low Serials | Toggle | N/A | N/A | ✅ Matches |

**Key Issues:**
1. ❌ Player and Team filters don't support multi-select (user complaint)
2. ⚠️ Counts show filtered results, not total collection (potentially confusing)
3. ✅ Series, Tier, League already support multi-select (good)

