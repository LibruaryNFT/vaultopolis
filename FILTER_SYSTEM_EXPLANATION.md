# Filter System Explanation & Testing Summary

## System Overview

This document explains how the filter system works in the Vaultopolis application, what we've tested, and what has been fixed. This is intended for another AI to understand the system and suggest additional test cases.

## Architecture

### Core Components

1. **`useMomentFilters` Hook** (`src/hooks/useMomentFilters.js`)
   - Central filter state management
   - Handles filter logic, count calculations, and URL synchronization
   - Returns filter state, options, and filtered results

2. **`MultiSelectFilterPopover` Component** (`src/components/MultiSelectFilterPopover.js`)
   - Reusable multi-select dropdown component
   - Handles "All" vs individual selections
   - Manages checkbox states and summary display

3. **`MomentSelection` Component** (`src/components/MomentSelection.js`)
   - Main UI component that uses the filter hook
   - Renders filter buttons and results grid
   - Handles pagination and user interactions

## Filter Types & Behavior

### Two Categories of Filters

#### Category 1: Required Multi-Select (`emptyMeansAll=false`)
- **Series, Tier, League**
- **Behavior**: Empty array = "None" (no results shown)
- **Default**: Auto-selects all available options on page load
- **Min Selection**: At least 1 option must be selected (enforced by `minSelection={1}`)
- **Display**: Shows "None" when empty, "All" when all selected, or list of selections

#### Category 2: Optional Multi-Select (`emptyMeansAll=true`)
- **Set, Team, Player, Parallel**
- **Behavior**: Empty array = "All" (no filter applied, shows all results)
- **Default**: Empty array `[]` on page load
- **Min Selection**: 0 (can be empty)
- **Display**: Shows "All" when empty, "All" when all selected, or list of selections

## How Filtering Works

### The `passes()` Function

The core filtering logic is in the `passes(n, omit)` function:

```javascript
passes(n, omit = null)
```

- **`n`**: A moment/NFT object to test
- **`omit`**: A filter dimension to skip (used for count calculations)

**How it works:**
1. Checks if moment is in `excludeIds` → return false
2. Checks if moment is locked (when `showLockedMoments=false`) → return false
3. Applies each filter in sequence:
   - Series filter (skip if `omit === "series"`)
   - Tier filter (skip if `omit === "tier"`)
   - League filter (skip if `omit === "league"`)
   - Set filter (skip if `omit === "set"`)
   - Team filter (skip if `omit === "team"`)
   - Player filter (skip if `omit === "player"`)
   - Parallel filter (skip if `omit === "subedition"`)
   - Serial exclusions (special/low serials)
   - Locked status
   - Selected NFTs (excluded from results)

### Count Calculations

Counts are calculated using "base collections" that omit specific filter dimensions:

- **`baseNoSeries`**: All filters applied EXCEPT series
- **`baseNoTier`**: All filters applied EXCEPT tier
- **`baseNoLeague`**: All filters applied EXCEPT league
- **`baseNoSet`**: All filters applied EXCEPT set
- **`baseNoTeam`**: All filters applied EXCEPT team
- **`baseNoPlayer`**: All filters applied EXCEPT player
- **`baseNoSub`**: All filters applied EXCEPT parallel

**Example**: When calculating Set counts:
- Use `baseNoSet` (which has Series, Tier, League, Team, Player, Parallel filters applied)
- Count how many moments in `baseNoSet` match each set name
- This gives accurate counts for each set option

### Filter Interactions (Cascading)

Filters cascade - when one filter changes, counts for other filters update:

1. User selects **Tier = Fandom**
2. `baseNoSet` recalculates (now only includes fandom moments)
3. Set counts update (now show counts for fandom moments only)
4. Same for Team, Player, Parallel counts

This ensures counts always reflect the current filter state.

## Options Generation

### How Options Are Built

Options (the list of available values for each filter) are generated using `buildOpts()`:

```javascript
buildOpts(extract, pred, isPlayerOptions)
```

- **`extract`**: Function to extract the value from a moment (e.g., `n => n.name` for sets)
- **`pred`**: Predicate function to filter moments before extracting options
- **`isPlayerOptions`**: Special flag for player options (uses simplified filtering)

**Example for Set options:**
```javascript
setNameOptions = buildOpts(
  (n) => n.name,  // Extract set name
  (n) => 
    dFilter.selectedSeries.includes(Number(n.series)) &&
    dFilter.selectedTiers.includes((n.tier || "").toLowerCase()) &&
    // ... league filter check
)
```

This ensures only sets that exist in the current filter context appear in the dropdown.

### `ensureInOpts()` Function

Ensures selected values are always in the options list:

```javascript
ensureInOpts(selectedValues, optionsArray)
```

- If `selectedValues` is an array, checks each value
- If a selected value is missing from options, adds it
- This prevents selected values from disappearing when filters change

**Fixed**: Now properly handles arrays (was previously only handling single values)

## UI Behavior

### "All" Checkbox State

The `showAsAllSelected` logic determines when "All" should appear checked:

```javascript
showAsAllSelected = 
  normalizedSelected.allSelected ||  // All options selected
  (allVisibleSelected && visibleOptions.length > 0 && visibleOptions.length < normalizedOptions.length) ||  // All visible selected (some hidden)
  (emptyMeansAll && normalizedSelected.items.length === 0 && normalizedOptions.length > 0)  // Empty array with emptyMeansAll=true
```

**Fixed**: Added third condition to handle empty arrays for Set/Team/Player/Parallel

### Hidden Options (0 Count)

Options with 0 count are hidden from the dropdown, EXCEPT:
- The "All" option (always visible)
- Currently selected options (remain visible but disabled/faded)

This prevents clutter while preserving user selections.

### Summary Display

The button text shows:
- **"All"**: When all options selected OR empty array with `emptyMeansAll=true`
- **"None"**: When empty array with `emptyMeansAll=false`
- **"Value1, Value2"**: When 2 selected
- **"Value1, Value2 +3"**: When 5+ selected

## URL Synchronization

### How It Works

1. **On Page Load**:
   - Check URL for query parameters
   - If present, parse and load into filter state
   - Set `loadedFromURLRef.current = true` to prevent auto-select from overriding

2. **On Filter Change**:
   - Serialize current filter state to URL query params
   - Only include non-default values (keeps URLs clean)
   - Use `replace: true` to avoid history spam

3. **Default Values**:
   - Series: All available series (not in URL if all selected)
   - Tier: ["common", "fandom"] (not in URL if default)
   - League: ["NBA", "WNBA"] (not in URL if default)
   - Set/Team/Player/Parallel: [] (empty, never in URL)

### URL Format

Example: `/swap?series=2%2C4&tier=fandom&league=NBA&set=Metallic+Silver+FE`

- Arrays are comma-separated: `series=2,4`
- URL-encoded: `series=2%2C4`
- Only non-default values included

## What We've Tested & Fixed

### ✅ Fixed Issues

1. **Empty Array Display**
   - **Problem**: Set/Team/Player/Parallel with empty arrays didn't show "All" as checked
   - **Fix**: Added `emptyMeansAll` check to `showAsAllSelected` logic
   - **Status**: Fixed

2. **"All" Checkbox State**
   - **Problem**: "All" checkbox didn't show checked when all options selected
   - **Fix**: Added logic to check all visible options selected
   - **Status**: Fixed

3. **`ensureInOpts` Array Handling**
   - **Problem**: Function only handled single values, not arrays
   - **Fix**: Updated to handle arrays by checking each value individually
   - **Status**: Fixed

4. **Series 0 Handling**
   - **Problem**: Series 0 (labeled "Series 1") was filtered out by `filter(Boolean)`
   - **Fix**: Changed to explicit check: `filter(v => v !== undefined && v !== null && v !== "")`
   - **Status**: Fixed

5. **Locked Moments in Counts**
   - **Problem**: Locked moments included in counts when `showLockedMoments=false`
   - **Fix**: Added check in `passes()` function to exclude locked moments
   - **Status**: Fixed

6. **URL Update Loop**
   - **Problem**: Browser throttling warning due to frequent URL updates
   - **Fix**: Added `lastURLParamsRef` to track last URL state and prevent unnecessary updates
   - **Status**: Fixed

7. **URL Auto-Select Override**
   - **Problem**: Auto-select logic overwrote URL-loaded filter values
   - **Fix**: Added `loadedFromURLRef` flag to skip auto-select when URL values loaded
   - **Status**: Fixed

### ✅ Verified Working

1. **Count Calculations**: `baseNoX` collections correctly omit specific filter dimensions
2. **Filter Cascading**: Counts update correctly when filters change
3. **Options Generation**: Only shows options that exist in current filter context
4. **Reset Button**: Correctly resets all filters to defaults
5. **Pagination**: Shows even for single page of results
6. **Hidden Options**: 0-count options hidden correctly (except selected ones)
7. **Invalid Selections**: Selections with 0 count remain visible but disabled

## Test Scenarios Covered

### Basic Functionality
- ✅ Initial load with auto-select
- ✅ Selecting single filter
- ✅ Selecting multiple filters
- ✅ Deselecting filters
- ✅ Reset button

### Empty Array Behavior
- ✅ Set/Team/Player/Parallel show "All" when empty
- ✅ "All" checkbox checked when empty (for `emptyMeansAll=true`)
- ✅ Series/Tier/League show "None" when empty

### Filter Interactions
- ✅ Counts update when other filters change
- ✅ Options update when other filters change
- ✅ Cascading filter effects

### Edge Cases
- ✅ Hidden options (0 count)
- ✅ Invalid selections after filter change
- ✅ Series 0 handling
- ✅ Locked moments exclusion
- ✅ URL sync and reload
- ✅ Deselect all (for Series/Tier/League)

## Known Behaviors (By Design)

1. **Invalid Selections Persist**: If a user selects "Set A", then changes filters so "Set A" has 0 count, the selection remains but shows as disabled with (0) count. This allows users to keep selections even when temporarily invalid.

2. **Options Filtering**: Options are filtered based on current selections. For example, Set options only show sets that exist in the currently selected Series/Tier/League combination.

3. **Count Accuracy**: Counts always reflect the current filter state. When you select Tier=Fandom, all other filter counts update to show only fandom moments.

## Areas for Additional Testing

The following areas could benefit from additional test cases:

1. **Performance**: Large collections (10,000+ moments) with multiple filters
2. **Concurrent Filter Changes**: Rapidly changing multiple filters
3. **URL Edge Cases**: Invalid URL parameters, malformed arrays, out-of-range values
4. **Browser Navigation**: Back/forward button with URL changes
5. **LocalStorage Integration**: Filter preferences saved/loaded correctly
6. **Account Switching**: Filter state when switching between parent/child accounts
7. **Collection Changes**: What happens when collection data updates while filters are active
8. **Accessibility**: Keyboard navigation, screen reader support
9. **Mobile/Responsive**: Filter behavior on small screens
10. **Error Handling**: Network failures, invalid data, missing properties

## Key Files

- `src/hooks/useMomentFilters.js` - Core filter logic
- `src/components/MultiSelectFilterPopover.js` - Filter dropdown UI
- `src/components/MomentSelection.js` - Main filter UI component
- `src/utils/urlFilters.js` - URL serialization/deserialization

## Data Flow

```
User Action
  ↓
MomentSelection Component
  ↓
setFilter() → useMomentFilters hook
  ↓
Filter State Updated
  ↓
passes() function recalculates
  ↓
baseNoX collections update
  ↓
Options and counts recalculate
  ↓
UI updates (buttons, dropdowns, results)
  ↓
URL updates (if syncWithURL=true)
```

## Summary

The filter system is a multi-layered, cascading filter system where:
- Filters interact with each other (counts update based on other filters)
- Two types of filters exist (required vs optional)
- Counts are calculated by omitting specific filter dimensions
- Options are dynamically generated based on current filter state
- URL synchronization allows shareable/bookmarkable filter states
- Invalid selections persist but show as disabled

All identified issues have been fixed, and the system has been tested for common use cases and edge cases.

