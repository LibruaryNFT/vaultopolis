# Filter System Quick Reference

## TL;DR

Multi-select cascading filter system for NBA Top Shot moments. Two filter types: required (Series/Tier/League) and optional (Set/Team/Player/Parallel). Filters cascade - changing one updates counts for others. URL sync enabled. All identified bugs fixed.

## Key Concepts

### Filter Types
- **Required** (`emptyMeansAll=false`): Series, Tier, League - must have selection, empty = "None"
- **Optional** (`emptyMeansAll=true`): Set, Team, Player, Parallel - can be empty, empty = "All"

### Count Calculation
Uses "base collections" that omit specific dimensions:
- `baseNoSeries` = all filters except series
- `baseNoSet` = all filters except set
- etc.

Counts update when other filters change (cascading).

### "All" State Logic
```javascript
showAsAllSelected = 
  allOptionsSelected || 
  allVisibleOptionsSelected || 
  (emptyArray && emptyMeansAll)
```

## What Was Fixed

1. ✅ Empty arrays for Set/Team/Player/Parallel now show "All" as checked
2. ✅ "All" checkbox shows checked when all options selected
3. ✅ `ensureInOpts()` now handles arrays correctly
4. ✅ Series 0 no longer filtered out
5. ✅ Locked moments excluded from counts
6. ✅ URL update loop prevented
7. ✅ URL values don't get overwritten by auto-select

## Test Coverage

✅ Basic: Select, deselect, reset, initial load
✅ Empty arrays: Display and checkbox state
✅ Filter interactions: Count updates, cascading
✅ Edge cases: Hidden options, invalid selections, Series 0, locked moments
✅ URL sync: Load from URL, save to URL, reload

## Files

- `src/hooks/useMomentFilters.js` - Core logic
- `src/components/MultiSelectFilterPopover.js` - UI component
- `src/components/MomentSelection.js` - Main component
- `src/utils/urlFilters.js` - URL handling

## For Additional Testing

See `FILTER_SYSTEM_EXPLANATION.md` for full details and areas needing more test cases.

