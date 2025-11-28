# Filter Behavior Analysis

## Issues Found

### 1. "All" Checkbox Not Showing Checked State
**Problem**: When all options are selected, the "All" checkbox in the dropdown doesn't show as checked.

**Root Cause**: The `allSelected` calculation compares `selectedValues` against `normalizedOptions`, but there's a potential issue:
- If some options are hidden (0 count), they're not in `filteredOptions` but ARE in `normalizedOptions`
- When user selects all visible options, `allSelected` is `false` because hidden options aren't selected
- This causes the "All" checkbox to show as unchecked even though all visible options are selected

**Location**: `src/components/MultiSelectFilterPopover.js` lines 67-82, 237

**Expected Behavior**: 
- If all visible options are selected, "All" should show as checked
- OR: "All" should only show as checked if ALL options (including hidden) are selected

### 2. Reset Button Behavior
**Current Behavior**: 
- Sets `selectedTiers: tierOptions` (all available tiers)
- Sets `selectedSeries: seriesOptions` (all available series)
- Sets `selectedSetName: []` (empty = "All")
- Sets `selectedLeague: leagueOptions` (all available leagues)
- Sets `selectedTeam: []` (empty = "All")
- Sets `selectedPlayer: []` (empty = "All")
- Sets `selectedSubedition: []` (empty = "All")
- Sets `excludeSpecialSerials: true`
- Sets `excludeLowSerials: true`

**Issue**: 
- For Series/Tier/League: Reset selects ALL options (correct)
- For Set/Team/Player/Parallel: Reset sets to empty array (which means "All" due to `emptyMeansAll=true`)
- This is inconsistent - some filters reset to "all selected", others reset to "empty = All"

**Location**: `src/components/MomentSelection.js` lines 672-691

### 3. "Select All" vs "All" Option Behavior
**Current Behavior**:
- "Select all" button: Selects all options from `normalizedOptions` (including hidden ones)
- "All" option: Also selects all options from `normalizedOptions` (same behavior)

**Issue**: 
- If there are hidden options (0 count), clicking "All" selects them too, but they won't be visible
- This might confuse users - they see "All" selected but some options are hidden

### 4. Clear Button Behavior
**Current Behavior**:
- Clears selection (sets to empty array)
- For filters with `emptyMeansAll=true`: Empty array displays as "All"
- For filters with `emptyMeansAll=false`: Empty array displays as "None"

**Issue**:
- Series/Tier/League have `emptyMeansAll=false`, so clearing shows "None" (correct)
- Set/Team/Player/Parallel have `emptyMeansAll=true`, so clearing shows "All" (correct)
- But this might be confusing - "Clear" doesn't actually clear, it sets to "All"

## Test Cases

### Test Case 1: Select All
1. Open Series filter dropdown
2. Click "All" option
3. **Expected**: "All" checkbox should be checked, button shows "All"
4. **Actual**: Need to verify

### Test Case 2: Deselect All (Series/Tier/League)
1. Have all series selected
2. Click "All" again to deselect
3. **Expected**: All series deselected, button shows "None"
4. **Actual**: Need to verify

### Test Case 3: Deselect All (Set/Team/Player/Parallel)
1. Have some options selected
2. Click "Clear" button
3. **Expected**: All options deselected, button shows "All" (because empty = All)
4. **Actual**: Need to verify

### Test Case 4: Reset Filters
1. Apply various filters
2. Click "Reset" button
3. **Expected**: 
   - Series: All selected
   - Tier: All selected
   - League: All selected
   - Set: "All" (empty array)
   - Team: "All" (empty array)
   - Player: "All" (empty array)
   - Parallel: "All" (empty array)
   - Exclusions: Both enabled
4. **Actual**: Need to verify

### Test Case 5: Partial Selection
1. Select some but not all options
2. **Expected**: Button shows selected items (e.g., "Series 2, Series 3 +2")
3. **Actual**: Need to verify

## Recommendations

1. **Fix "All" checkbox display**: Make it show checked when all visible options are selected
2. **Clarify "All" vs "Select All"**: Consider making "All" only select visible options
3. **Consistent reset behavior**: Decide if reset should mean "all selected" or "empty = All" for all filters
4. **Improve "Clear" button**: For filters with `emptyMeansAll=true`, maybe rename to "Reset to All" or change behavior

