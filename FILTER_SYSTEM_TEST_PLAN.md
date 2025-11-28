# Filter System Test Plan

Based on architecture review, the system is solid. This document outlines focused testing on "spicy" areas that need explicit validation.

## Test Category 1: Required vs Optional Semantics

### Test Matrix (No URL, Fresh localStorage)

#### Required Filters (Series/Tier/League)

**Test 1.1: Empty Array Behavior**
- **Setup**: Clear all selections for Series
- **Expected**:
  - Label shows "None"
  - 0 results displayed
  - No auto-reselect (user explicitly cleared it)
  - Dropdown shows "None" as summary
- **Verify**: `emptyMeansAll=false` is working correctly

**Test 1.2: Single Selection**
- **Setup**: Select only Series 2
- **Expected**:
  - Counts for other filters (Tier, League, Set, Team, Player, Parallel) update correctly
  - No "ghost options" (options that don't exist in Series 2)
  - Options list only shows options that exist in Series 2
- **Verify**: Options generation respects current selections

**Test 1.3: All Selected**
- **Setup**: Select all available series
- **Expected**:
  - Label shows "All"
  - "All" checkbox is checked in dropdown
  - Individual series checkboxes are unchecked (because "All" is selected)
- **Verify**: `showAsAllSelected` logic works

**Test 1.4: Deselect All**
- **Setup**: Start with all selected, then deselect all
- **Expected**:
  - Label shows "None"
  - 0 results
  - No auto-reselect
- **Verify**: User can explicitly clear required filters

#### Optional Filters (Set/Team/Player/Parallel)

**Test 1.5: Empty Array Behavior**
- **Setup**: Ensure Set filter has empty array `[]`
- **Expected**:
  - Label shows "All"
  - "All" checkbox is checked in dropdown
  - No filter applied (all sets included in results)
  - Counts show total across all sets
- **Verify**: `emptyMeansAll=true` is working correctly

**Test 1.6: Partial Selection**
- **Setup**: Select 2-3 sets (not all)
- **Expected**:
  - Label shows selected sets (e.g., "Set A, Set B")
  - "All" checkbox is unchecked
  - Selected sets are checked
  - Counts are accurate for selected sets
- **Verify**: Partial selection works correctly

**Test 1.7: All Options Selected**
- **Setup**: Select all available sets
- **Expected**:
  - Label shows "All"
  - "All" checkbox is checked
  - Individual set checkboxes are unchecked (because "All" is selected)
- **Verify**: Selecting all options shows as "All"

**Test 1.8: Zero Count Selections Persist**
- **Setup**: Select a set, then change filters so that set has 0 count
- **Expected**:
  - Selected option remains visible in dropdown
  - Shows (0) count
  - Has disabled/faded styles
  - Tooltip says "No results due to current filters"
  - Can still be deselected
- **Verify**: Invalid selections don't disappear

## Test Category 2: baseNoX / Cascading Correctness

### Synthetic Dataset Test

**Setup**: Create small test dataset (10-20 moments) with known properties:
- Multiple series (2, 3, 4)
- Multiple tiers (common, fandom)
- Multiple leagues (NBA, WNBA)
- Multiple sets (Set A, Set B, Set C)
- Multiple teams (Lakers, Warriors, etc.)

**Test 2.1: Set Count Calculation**
- **Setup**: Select Series 2, Tier = common, League = NBA
- **Action**: Check Set counts
- **Expected**: 
  - `baseNoSet` includes only Series 2, common, NBA moments
  - Set counts are calculated from `baseNoSet`
  - Counts match manual calculation
- **Verify**: `passes(n, "set")` correctly omits set filter

**Test 2.2: Team Count Calculation**
- **Setup**: Select Series 2, Tier = common, Set = "Set A"
- **Action**: Check Team counts
- **Expected**:
  - `baseNoTeam` includes only Series 2, common, Set A moments
  - Team counts are calculated from `baseNoTeam`
  - Counts match manual calculation
- **Verify**: `passes(n, "team")` correctly omits team filter

**Test 2.3: Series Count Calculation**
- **Setup**: Select Tier = fandom, League = NBA, Set = "Set A"
- **Action**: Check Series counts
- **Expected**:
  - `baseNoSeries` includes only fandom, NBA, Set A moments
  - Series counts are calculated from `baseNoSeries`
  - Counts match manual calculation
- **Verify**: `passes(n, "series")` correctly omits series filter

**Test 2.4: Filter Change Cascade**
- **Setup**: Start with all filters at default
- **Action**: Change Tier from "all" to "fandom" only
- **Expected**:
  - Series counts update (only fandom moments)
  - League counts update (only fandom moments)
  - Set counts update (only fandom moments)
  - Team counts update (only fandom moments)
  - Player counts update (only fandom moments)
  - Parallel counts update (only fandom moments)
- **Verify**: All counts cascade correctly

**Test 2.5: No Double-Filtering**
- **Setup**: Select Series 2, Tier = common
- **Action**: Check Set counts
- **Expected**:
  - Set counts include ALL sets that exist in Series 2 + common
  - No additional filtering applied (e.g., no league filter leaking in)
- **Verify**: Only intended filters are applied in base collections

**Test 2.6: Locked Moments Exclusion**
- **Setup**: On swap page (`showLockedMoments=false`), select various filters
- **Action**: Check all counts
- **Expected**:
  - No locked moments included in any counts
  - `baseNoX` collections exclude locked moments
  - Results exclude locked moments
- **Verify**: Locked moments properly excluded from all calculations

## Test Category 3: Hidden Options & ensureInOpts

**Test 3.1: Option Becomes Hidden**
- **Setup**: Select a set, then change filters until that set has 0 count
- **Expected**:
  - Set remains in dropdown (because it's selected)
  - Shows (0) count
  - Has disabled/faded styles
  - Tooltip: "No results due to current filters"
  - Can be deselected
- **Verify**: Selected options with 0 count remain visible

**Test 3.2: Unselected Option Becomes Hidden**
- **Setup**: Don't select a set, change filters so it has 0 count
- **Expected**:
  - Set disappears from dropdown
  - "All" option remains visible
- **Verify**: Unselected options with 0 count are hidden

**Test 3.3: Series 0 Handling**
- **Setup**: Collection has Series 0 moments
- **Expected**:
  - Series 0 appears in dropdown as "Series 1"
  - Can be selected
  - Counts work correctly
  - "All" includes Series 0
- **Verify**: Series 0 not filtered out by `filter(Boolean)`

**Test 3.4: ensureInOpts with Arrays**
- **Setup**: Select multiple sets, then change filters so some sets disappear from options
- **Expected**:
  - Selected sets that are missing from options are added back via `ensureInOpts`
  - All selected sets remain in options list
- **Verify**: `ensureInOpts` handles arrays correctly

## Test Category 4: URL Sync Precedence & Navigation

**Test 4.1: URL with Filters + Empty localStorage**
- **Setup**: Clear localStorage, navigate to `/swap?series=2,4&tier=fandom&team=Lakers`
- **Expected**:
  - Series: [2, 4] selected
  - Tier: ["fandom"] selected
  - Team: ["Lakers"] selected
  - League: All selected (default, not in URL)
  - Set: Empty array (default, not in URL)
  - Auto-select doesn't overwrite URL values
- **Verify**: URL takes precedence over defaults

**Test 4.2: URL Empty + localStorage Present**
- **Setup**: Save filter preferences, then navigate to `/swap` (no query params)
- **Expected**:
  - Filters load from localStorage
  - No URL params added
  - URL remains clean
- **Verify**: localStorage used when URL is empty

**Test 4.3: Filter Change → URL Update**
- **Setup**: Start with clean URL, change filters
- **Expected**:
  - URL updates with query params
  - Only non-default values appear in URL
  - History not spammed (using `replace: true`)
  - URL format is correct (comma-separated arrays, URL-encoded)
- **Verify**: URL sync works correctly

**Test 4.4: Manual URL Edit - Invalid Values**
- **Setup**: Navigate to `/swap?series=abc&tier=lol&page=-5`
- **Expected**:
  - Invalid series values ignored (not parsed as numbers)
  - Invalid tier values ignored (not in tier options)
  - Invalid page values ignored (negative numbers)
  - Falls back to defaults gracefully
  - No crashes or broken state
- **Verify**: URL parsing handles invalid values gracefully

**Test 4.5: Back/Forward Navigation**
- **Setup**: 
  1. Start at `/swap`
  2. Change filters (URL updates)
  3. Change filters again (URL updates)
  4. Click browser back button
  5. Click browser forward button
- **Expected**:
  - Back button restores previous filter state
  - Forward button restores later filter state
  - Filter state matches URL at each step
- **Verify**: Browser navigation works correctly

## Test Category 5: Performance / Large Dataset

**Test 5.1: Large Collection (1000+ moments)**
- **Setup**: Use wallet with 1000+ moments
- **Actions**:
  - Open filter dropdowns
  - Change filters rapidly
  - Scroll through results
- **Expected**:
  - No visible lag in popover opening (< 100ms)
  - Count updates are fast (< 200ms)
  - Grid renders smoothly
  - No UI freezing
- **Verify**: Performance is acceptable

**Test 5.2: Rapid Filter Changes**
- **Setup**: Large collection
- **Actions**: Rapidly change multiple filters in succession
- **Expected**:
  - All filter changes are applied
  - No race conditions
  - Final state is correct
  - URL updates correctly
- **Verify**: System handles rapid changes correctly

**Test 5.3: Memoization Effectiveness**
- **Setup**: Large collection, change one filter
- **Expected**:
  - Only affected base collections recalculate
  - Unchanged base collections are reused (memoized)
  - No unnecessary recalculations
- **Verify**: `useMemo` is working correctly

## Test Category 6: Accessibility / Keyboard Behavior

**Test 6.1: Tab Navigation**
- **Actions**:
  - Tab through filter buttons
  - Tab into filter dropdowns
  - Tab through options in dropdown
- **Expected**:
  - All filter buttons are reachable via Tab
  - Focus indicators are visible
  - Tab order is logical
- **Verify**: Keyboard navigation works

**Test 6.2: Popover Keyboard Interaction**
- **Actions**:
  - Focus on filter button, press Enter/Space
  - Use arrow keys to navigate options
  - Press Enter to select option
  - Press Escape to close
- **Expected**:
  - Popover opens via keyboard
  - Options navigable via arrow keys
  - Options selectable via Enter
  - Popover closes via Escape
- **Verify**: Popover is keyboard accessible

**Test 6.3: "All" Checkbox Accessibility**
- **Actions**:
  - Focus on "All" checkbox
  - Press Space to toggle
- **Expected**:
  - "All" behaves like proper checkbox
  - `aria-checked` reflects state
  - Screen reader announces state correctly
- **Verify**: "All" checkbox is accessible

**Test 6.4: ARIA Attributes**
- **Check**:
  - Filter buttons have `aria-pressed` or `aria-checked`
  - Dropdowns have proper `role` attributes
  - Options have proper `role` and `aria-selected`
  - Focus management is correct
- **Expected**:
  - All interactive elements have proper ARIA attributes
  - Screen reader can navigate and understand state
- **Verify**: ARIA implementation is correct

## Implementation Priority

### High Priority (Critical Path)
1. Test Category 1: Required vs Optional semantics
2. Test Category 2: baseNoX / cascading correctness
3. Test Category 4.1-4.3: URL sync basic functionality

### Medium Priority (Important Edge Cases)
4. Test Category 3: Hidden options & ensureInOpts
5. Test Category 4.4-4.5: URL sync edge cases
6. Test Category 5: Performance checks

### Low Priority (Nice to Have)
7. Test Category 6: Accessibility / keyboard behavior

## Test Implementation Notes

- **Unit Tests**: For `passes(n, omit)` and base collection calculations
- **Integration Tests**: For filter interactions and URL sync
- **E2E Tests**: For full user workflows
- **Manual Tests**: For accessibility and performance

## Success Criteria

All tests should pass with:
- ✅ No crashes or broken states
- ✅ Correct filter behavior
- ✅ Accurate counts
- ✅ Proper URL sync
- ✅ Good performance (< 200ms for filter changes)
- ✅ Keyboard accessible

