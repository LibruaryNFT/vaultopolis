# Can ALL Filters Be Multi-Select? Complete Analysis

## Executive Summary

**✅ YES - ALL filters can be made multi-select, including fixing the Series/Tier/League "prune-only" issue.**

The infrastructure already exists (`baseNo*` collections), we just need to:
1. Add `baseNoSeries` and `baseNoTier` (missing pieces)
2. Use these "base" collections for count calculations instead of `eligibleMoments`
3. Convert Set/Team/Player/Parallel to multi-select arrays
4. This enables true multi-select for ALL filters

**Estimated Time:** 3-4 hours (includes fixing Series/Tier/League + converting others + URL sync)

---

## Current Problem: Series/Tier/League "Prune-Only" Issue

### What's Happening

**Series Filter:**
1. User selects Series 6
2. `eligibleMoments` now only contains Series 6 moments
3. Count calculation: `eligibleMoments.filter(m => m.series === 1).length` → **0**
4. Series 1-5 get hidden (count === 0)
5. User can't re-add Series 1-5 without resetting

**Same issue for Tier and League.**

### Root Cause

Counts are calculated from `eligibleMoments`, which **already has Series/Tier/League filters applied**:

```javascript
// Current (WRONG for multi-select)
getCount={(series) =>
  series === "All"
    ? eligibleMoments.length
    : eligibleMoments.filter((m) => Number(m.series) === Number(series)).length
}
```

When Series 6 is selected, `eligibleMoments` only has Series 6, so Series 1-5 show 0 count and disappear.

---

## Solution: Use "Base" Collections for Counts

### Existing Infrastructure

The code **already has** the pattern for this! Look at `baseNoSub`, `baseNoLeague`, `baseNoSet`, `baseNoTeam`, `baseNoPlayer`:

```javascript
const baseNoSub = useMemo(
  () => dDetails.filter((n) => passes(n, "subedition")),  // Omits subedition filter
  [dDetails, passes]
);
const baseNoTeam = useMemo(
  () => dDetails.filter((n) => passes(n, "team")),  // Omits team filter
  [dDetails, passes]
);
// etc...
```

These collections represent: **"All moments matching current filters, EXCEPT this dimension"**

### What's Missing

We need to add:
- `baseNoSeries` - All moments matching current filters, except series
- `baseNoTier` - All moments matching current filters, except tier

### How `passes(n, omit)` Works

The `passes` function accepts an `omit` parameter that skips that dimension:

```javascript
const passes = useCallback((n, omit = null) => {
  // ... other filters ...
  
  if (omit !== "series") {
    if (!immediateFilter.selectedSeries.includes(Number(n.series))) return false;
  }
  
  if (omit !== "tier") {
    const tier = (n.tier || "").toLowerCase();
    if (!immediateFilter.selectedTiers.includes(tier)) return false;
  }
  
  // ... rest of filters ...
}, [immediateFilter, ...]);
```

So `passes(n, "series")` applies all filters EXCEPT series → perfect for Series count calculations!

---

## Implementation Plan

### Step 1: Add Missing Base Collections

```javascript
// In useMomentFilters.js

const baseNoSeries = useMemo(
  () => dDetails.filter((n) => passes(n, "series")),  // Omits series filter
  [dDetails, passes]
);

const baseNoTier = useMemo(
  () => dDetails.filter((n) => passes(n, "tier")),  // Omits tier filter
  [dDetails, passes]
);

// Update passes() to support "series" and "tier" omit
const passes = useCallback((n, omit = null) => {
  // ... existing code ...
  
  // Series filter - skip if omit === "series"
  if (omit !== "series") {
    if (!immediateFilter.selectedSeries.includes(Number(n.series))) return false;
  }
  
  // Tier filter - skip if omit === "tier"
  if (omit !== "tier") {
    const tier = (n.tier || "").toLowerCase();
    if (!immediateFilter.selectedTiers.includes(tier)) return false;
  }
  
  // ... rest of existing code ...
}, [immediateFilter, ...]);
```

### Step 2: Update Count Calculations

**For Series:**
```javascript
// BEFORE (wrong)
getCount={(series) =>
  series === "All"
    ? eligibleMoments.length
    : eligibleMoments.filter((m) => Number(m.series) === Number(series)).length
}

// AFTER (correct)
getCount={(series) =>
  series === "All"
    ? eligibleMoments.length
    : baseNoSeries.filter((m) => Number(m.series) === Number(series)).length
}
```

**For Tier:**
```javascript
// BEFORE (wrong)
getCount={(tier) =>
  tier === "All"
    ? eligibleMoments.length
    : eligibleMoments.filter((m) => (m.tier || "").toLowerCase() === tier.toLowerCase()).length
}

// AFTER (correct)
getCount={(tier) =>
  tier === "All"
    ? eligibleMoments.length
    : baseNoTier.filter((m) => (m.tier || "").toLowerCase() === tier.toLowerCase()).length
}
```

**For League:**
```javascript
// Already has baseNoLeague, just need to use it
getCount={(league) =>
  league === "All"
    ? eligibleMoments.length
    : baseNoLeague.filter((m) =>
        league === "WNBA"
          ? WNBA_TEAMS.includes(m.teamAtMoment || "")
          : !WNBA_TEAMS.includes(m.teamAtMoment || "")
      ).length
}
```

**For Set/Team/Player/Parallel:**
```javascript
// Already have base collections, just need to use them
getCount={(setName) =>
  setName === "All"
    ? eligibleMoments.length
    : baseNoSet.filter((m) => m.name === setName).length
}

getCount={(team) =>
  team === "All"
    ? eligibleMoments.length
    : baseNoTeam.filter((m) => m.teamAtMoment === team).length
}

getCount={(player) =>
  player === "All"
    ? eligibleMoments.length
    : baseNoPlayer.filter((m) => m.fullName === player).length
}

getCount={(subId) => {
  if (subId === "All") return eligibleMoments.length;
  return baseNoSub.filter((m) => {
    const effectiveSubId = m.subeditionID === null || m.subeditionID === undefined ? 0 : m.subeditionID;
    return String(effectiveSubId) === String(subId);
  }).length;
}}
```

### Step 3: Convert Set/Team/Player/Parallel to Multi-Select

**Filter Schema:**
```javascript
// BEFORE
selectedSetName: { def: "All" },
selectedTeam: { def: "All" },
selectedPlayer: { def: "All" },
selectedSubedition: { def: "All" },

// AFTER
selectedSetName: { def: [] },  // Empty array = "All"
selectedTeam: { def: [] },
selectedPlayer: { def: [] },
selectedSubedition: { def: [] },
```

**Filter Logic:**
```javascript
// BEFORE
if (immediateFilter.selectedTeam !== "All" && n.teamAtMoment !== immediateFilter.selectedTeam) return false;

// AFTER
if (immediateFilter.selectedTeam.length > 0 && !immediateFilter.selectedTeam.includes(n.teamAtMoment)) return false;
```

**UI Components:**
```javascript
// BEFORE
<FilterPopover
  label="Team"
  selectedValue={filter.selectedTeam}
  onChange={(value) => setFilter({ selectedTeam: value, currentPage: 1 })}
/>

// AFTER
<MultiSelectFilterPopover
  label="Team"
  selectedValues={filter.selectedTeam}
  onChange={(values) => setFilter({ selectedTeam: values, currentPage: 1 })}
/>
```

---

## Complete Filter Status

| Filter | Current | Can Multi-Select? | Needs Fix? | Priority |
|--------|---------|-------------------|------------|----------|
| **Series** | Multi (broken) | ✅ Yes | ✅ Fix counts | P0 |
| **Tier** | Multi (broken) | ✅ Yes | ✅ Fix counts | P0 |
| **League** | Multi (broken) | ✅ Yes | ✅ Fix counts | P0 |
| **Team** | Single | ✅ Yes | ✅ Convert | P0 |
| **Player** | Single | ✅ Yes | ✅ Convert | P0 |
| **Set** | Single | ✅ Yes | ✅ Convert | P1 |
| **Parallel** | Single | ✅ Yes | ✅ Convert | P2 |
| **Locked Status** | Single | ❌ No | N/A | N/A |
| **Sort By** | Single | ❌ No | N/A | N/A |
| **Exclude Special** | Toggle | ❌ No | N/A | N/A |
| **Exclude Low** | Toggle | ❌ No | N/A | N/A |

---

## Benefits of Full Multi-Select

### User Experience
1. **True flexibility** - Add/remove any filter value at any time
2. **No "prune-only" trap** - Can always re-add Series/Tier/League options
3. **Consistent behavior** - All filters work the same way
4. **Power user friendly** - Complex queries like "Series 6+7, Common+Fandom, Lakers+Warriors, LeBron+Curry"

### Technical
1. **Cleaner code** - One pattern for all filters
2. **Better maintainability** - Less special-case logic
3. **Future-proof** - Easy to add new filters

---

## Implementation Complexity

| Task | Complexity | Time |
|------|------------|------|
| Add baseNoSeries & baseNoTier | ⭐⭐ Easy | 20 min |
| Update passes() to support omit | ⭐⭐ Easy | 15 min |
| Fix Series/Tier/League count calculations | ⭐⭐ Easy | 30 min |
| Convert Set/Team/Player/Parallel to arrays | ⭐⭐ Easy | 30 min |
| Update filter logic for arrays | ⭐⭐ Easy | 30 min |
| Update UI components | ⭐⭐ Easy | 30 min |
| Add URL query param sync | ⭐⭐⭐ Moderate | 1.5 hours |
| Testing & edge cases | ⭐⭐⭐ Moderate | 1 hour |
| **Total** | **Medium** | **~4 hours** |

---

## URL Query Params Integration

### Serialization Strategy

**Arrays (all filters now):**
```
series=1,2,3&tier=common,fandom&team=Lakers,Warriors&player=LeBron%20James,Stephen%20Curry
```

**Empty arrays = "All" = omit from URL:**
```
// If all filters are default, URL is just: /swap
// If only Series 6 selected: /swap?series=6
// If Series 6+7 and Lakers: /swap?series=6,7&team=Lakers
```

### Implementation

1. **Create serialization utilities** (as in URL_QUERY_PARAMS_ANALYSIS.md)
2. **Modify useMomentFilters** to accept URL sync params
3. **Update Swap page** to enable URL sync
4. **Handle array serialization** - comma-separated, URL-encoded

---

## Testing Checklist

### Series/Tier/League Fix
- [ ] Select Series 6 → Series 1-5 still visible in dropdown
- [ ] Select Series 6 → Can re-add Series 1-5
- [ ] Counts show correct numbers (based on other filters, not current selection)
- [ ] Same for Tier and League

### Multi-Select Conversion
- [ ] Team filter allows multiple selections
- [ ] Player filter allows multiple selections
- [ ] Set filter allows multiple selections
- [ ] Parallel filter allows multiple selections
- [ ] Empty array = "All" works correctly
- [ ] Filter logic correctly handles arrays

### URL Sync
- [ ] URL updates when filters change
- [ ] URL params load correctly on page load
- [ ] Arrays serialize/deserialize correctly
- [ ] Special characters work (team/player names)
- [ ] Empty arrays don't appear in URL
- [ ] Browser back/forward works

---

## Migration Strategy

### Backward Compatibility

**localStorage Preferences:**
```javascript
// On load, migrate old format to new
if (typeof filter.selectedTeam === "string") {
  filter.selectedTeam = filter.selectedTeam === "All" ? [] : [filter.selectedTeam];
}
```

**URL Params:**
- Old URLs without params → use localStorage defaults
- New URLs with params → take precedence

### Rollout

1. **Phase 1:** Fix Series/Tier/League counts (fixes existing multi-select)
2. **Phase 2:** Convert Team/Player to multi-select
3. **Phase 3:** Convert Set/Parallel to multi-select
4. **Phase 4:** Add URL query param sync
5. **Phase 5:** Test thoroughly
6. **Phase 6:** Deploy

---

## Edge Cases

### Zero Count Handling

**Current behavior:** Hide options with count === 0 (unless selected)

**With base collections:** Counts are more accurate, but still need to handle:
- Option selected but count becomes 0 → Keep it visible (faded)
- Option not selected and count is 0 → Hide it

**This behavior is already implemented** in `FilterPopover` and `MultiSelectFilterPopover`!

### Empty Selection

**Series/Tier:** Currently require at least 1 selection (`minSelection={1}` for Tier)

**Question:** Should Team/Player/Set/Parallel allow empty selection (meaning "All")?

**Recommendation:** Yes, allow empty = "All" for consistency.

### Performance

**Base collections:** Computed with `useMemo`, so only recalculate when dependencies change.

**Count calculations:** Filter operations on base collections (typically < 10,000 items) are fast.

**No performance concerns** - the existing pattern is already optimized.

---

## Conclusion

**✅ YES - ALL filters can be multi-select!**

**What needs to happen:**
1. Fix Series/Tier/League counts (use base collections)
2. Convert Set/Team/Player/Parallel to arrays
3. Add URL query param sync
4. Test thoroughly

**Benefits:**
- True multi-select for all filters
- No "prune-only" trap
- Shareable/bookmarkable URLs
- Consistent UX

**Complexity:** Medium (~4 hours)
**Risk:** Low (incremental changes, existing patterns)
**Value:** High (major UX improvement)

**Recommendation:** Proceed with full implementation!

