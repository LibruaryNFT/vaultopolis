# Test Implementation Guide

This guide provides specific code examples and test scenarios for implementing the test plan.

## Unit Test Examples

### Testing `passes()` Function

```javascript
// Test: passes() correctly omits specific filter dimension
describe('passes() function', () => {
  const mockMoment = {
    id: '1',
    series: 2,
    tier: 'common',
    teamAtMoment: 'Lakers',
    name: 'Set A',
    fullName: 'LeBron James',
    subeditionID: 0,
    isLocked: false,
    serialNumber: 100,
    excludeIds: []
  };

  it('should omit series filter when omit="series"', () => {
    const filter = {
      selectedSeries: [3], // Moment has series 2, but we're omitting series
      selectedTiers: ['common'],
      selectedLeague: ['NBA'],
      selectedSetName: [],
      selectedTeam: [],
      selectedPlayer: [],
      selectedSubedition: []
    };
    
    // Should pass because series filter is omitted
    expect(passes(mockMoment, 'series')).toBe(true);
  });

  it('should apply all filters when omit=null', () => {
    const filter = {
      selectedSeries: [3], // Moment has series 2
      selectedTiers: ['common'],
      selectedLeague: ['NBA'],
      selectedSetName: [],
      selectedTeam: [],
      selectedPlayer: [],
      selectedSubedition: []
    };
    
    // Should fail because series doesn't match
    expect(passes(mockMoment, null)).toBe(false);
  });
});
```

### Testing Base Collections

```javascript
// Test: baseNoSet includes all filters except set
describe('baseNoSet collection', () => {
  const moments = [
    { series: 2, tier: 'common', league: 'NBA', name: 'Set A', ... },
    { series: 2, tier: 'common', league: 'NBA', name: 'Set B', ... },
    { series: 3, tier: 'fandom', league: 'NBA', name: 'Set A', ... },
  ];

  it('should include only moments matching Series, Tier, League filters', () => {
    const filter = {
      selectedSeries: [2],
      selectedTiers: ['common'],
      selectedLeague: ['NBA'],
      selectedSetName: [], // Empty = all sets
      // ... other filters
    };

    const baseNoSet = moments.filter(m => passes(m, 'set'));
    
    // Should include both Set A and Set B from Series 2, common, NBA
    expect(baseNoSet.length).toBe(2);
    expect(baseNoSet.every(m => m.series === 2)).toBe(true);
    expect(baseNoSet.every(m => m.tier === 'common')).toBe(true);
  });
});
```

## Integration Test Examples

### Testing Filter Cascading

```javascript
// Test: Changing Tier updates all other filter counts
describe('Filter cascading', () => {
  it('should update Set counts when Tier changes', () => {
    // Initial state: All series, all tiers
    const initialFilter = {
      selectedSeries: [2, 3, 4],
      selectedTiers: ['common', 'fandom'],
      // ...
    };

    // Change to: All series, fandom only
    const updatedFilter = {
      selectedSeries: [2, 3, 4],
      selectedTiers: ['fandom'],
      // ...
    };

    const initialBaseNoSet = calculateBaseNoSet(initialFilter);
    const updatedBaseNoSet = calculateBaseNoSet(updatedFilter);

    // Updated base should have fewer moments (only fandom)
    expect(updatedBaseNoSet.length).toBeLessThan(initialBaseNoSet.length);
    
    // Set counts should update
    const initialSetCount = initialBaseNoSet.filter(m => m.name === 'Set A').length;
    const updatedSetCount = updatedBaseNoSet.filter(m => m.name === 'Set A').length;
    
    expect(updatedSetCount).toBeLessThanOrEqual(initialSetCount);
  });
});
```

### Testing URL Sync

```javascript
// Test: URL params load correctly
describe('URL synchronization', () => {
  it('should load filters from URL and not auto-select', () => {
    const urlParams = new URLSearchParams('series=2,4&tier=fandom&team=Lakers');
    
    const { filter, loadedFromURL } = loadFiltersFromURL(urlParams);
    
    expect(filter.selectedSeries).toEqual([2, 4]);
    expect(filter.selectedTiers).toEqual(['fandom']);
    expect(filter.selectedTeam).toEqual(['Lakers']);
    expect(loadedFromURL).toBe(true);
    
    // Auto-select should be skipped
    expect(filter.selectedSeries).not.toEqual([2, 3, 4, 5, 6, 7, 8]); // Not all series
  });

  it('should only include non-default values in URL', () => {
    const filter = {
      selectedSeries: [2, 3, 4, 5, 6, 7, 8], // All series (default)
      selectedTiers: ['fandom'], // Not default
      selectedLeague: ['NBA', 'WNBA'], // Default
      selectedSetName: [], // Empty (default)
      // ...
    };

    const urlParams = filtersToSearchParams(filter, defaultFilter, seriesOptions);
    
    // Should not include series (all selected = default)
    expect(urlParams.has('series')).toBe(false);
    
    // Should include tier (not default)
    expect(urlParams.get('tier')).toBe('fandom');
    
    // Should not include league (default)
    expect(urlParams.has('league')).toBe(false);
    
    // Should not include set (empty = default)
    expect(urlParams.has('set')).toBe(false);
  });
});
```

## Manual Test Scenarios

### Scenario 1: Required Filter Empty State

**Steps**:
1. Navigate to swap page
2. Open Series dropdown
3. Click "Clear" to deselect all series
4. Observe results

**Expected**:
- Series button shows "None"
- Results grid shows 0 items
- No auto-reselect happens
- Dropdown shows "None" as summary

### Scenario 2: Optional Filter Empty State

**Steps**:
1. Navigate to swap page
2. Ensure Set filter is empty (default)
3. Open Set dropdown
4. Observe state

**Expected**:
- Set button shows "All"
- "All" checkbox is checked
- Results include all sets
- Counts show totals across all sets

### Scenario 3: Filter Cascading

**Steps**:
1. Navigate to swap page
2. Note initial counts for Set filter
3. Select Tier = "fandom" only
4. Observe Set filter counts

**Expected**:
- Set counts update (only fandom moments)
- Set "All" count = total fandom moments
- Individual set counts = fandom moments in that set

### Scenario 4: Zero Count Selection Persists

**Steps**:
1. Select a specific set (e.g., "Metallic Silver FE")
2. Change filters (e.g., select Tier = "fandom", League = "WNBA")
3. If set has 0 count, observe dropdown

**Expected**:
- Set remains in dropdown
- Shows (0) count
- Has disabled/faded appearance
- Tooltip: "No results due to current filters"
- Can still be deselected

### Scenario 5: URL Sync

**Steps**:
1. Clear localStorage
2. Navigate to `/swap?series=2,4&tier=fandom&team=Lakers`
3. Observe filter state

**Expected**:
- Series: [2, 4] selected
- Tier: ["fandom"] selected
- Team: ["Lakers"] selected
- League: All selected (default)
- Set: Empty array (default)
- URL matches current state

### Scenario 6: Invalid URL Values

**Steps**:
1. Navigate to `/swap?series=abc&tier=lol&page=-5`
2. Observe filter state

**Expected**:
- Invalid series values ignored
- Invalid tier values ignored
- Invalid page values ignored
- Falls back to defaults
- No crashes or errors

### Scenario 7: Browser Navigation

**Steps**:
1. Start at `/swap`
2. Change filters (URL updates)
3. Change filters again (URL updates)
4. Click browser back button
5. Click browser forward button

**Expected**:
- Back button restores previous state
- Forward button restores later state
- Filter state matches URL at each step

## Performance Test Scenarios

### Large Collection Test

**Setup**: Use wallet with 1000+ moments

**Steps**:
1. Open filter dropdowns
2. Change filters rapidly (5-10 changes in quick succession)
3. Scroll through results grid
4. Measure performance

**Metrics**:
- Popover open time: < 100ms
- Count update time: < 200ms
- Grid render time: < 300ms
- No UI freezing

### Rapid Filter Changes

**Steps**:
1. Start with default filters
2. Rapidly change: Series → Tier → League → Set → Team
3. Observe final state

**Expected**:
- All changes applied correctly
- Final state is correct
- No race conditions
- URL updates correctly

## Accessibility Test Scenarios

### Keyboard Navigation

**Steps**:
1. Tab to filter buttons
2. Press Enter/Space to open dropdown
3. Use arrow keys to navigate options
4. Press Enter to select
5. Press Escape to close

**Expected**:
- All elements reachable via keyboard
- Focus indicators visible
- Options navigable via arrow keys
- Proper ARIA attributes

### Screen Reader Test

**Steps**:
1. Enable screen reader
2. Navigate through filters
3. Listen to announcements

**Expected**:
- Filter buttons announce state
- Dropdowns announce open/closed
- Options announce selected/unselected
- "All" checkbox announces checked/unchecked

## Test Data Setup

### Synthetic Test Dataset

```javascript
const testMoments = [
  // Series 2, Common, NBA, Set A, Lakers, LeBron
  { id: '1', series: 2, tier: 'common', teamAtMoment: 'Lakers', name: 'Set A', fullName: 'LeBron James', subeditionID: 0, isLocked: false },
  // Series 2, Common, NBA, Set A, Warriors, Curry
  { id: '2', series: 2, tier: 'common', teamAtMoment: 'Warriors', name: 'Set A', fullName: 'Stephen Curry', subeditionID: 0, isLocked: false },
  // Series 2, Fandom, NBA, Set B, Lakers, LeBron
  { id: '3', series: 2, tier: 'fandom', teamAtMoment: 'Lakers', name: 'Set B', fullName: 'LeBron James', subeditionID: 0, isLocked: false },
  // Series 3, Common, WNBA, Set A, Team A, Player A
  { id: '4', series: 3, tier: 'common', teamAtMoment: 'WNBA Team A', name: 'Set A', fullName: 'Player A', subeditionID: 0, isLocked: false },
  // Series 0, Common, NBA, Set A, Lakers, LeBron (Series 0 test)
  { id: '5', series: 0, tier: 'common', teamAtMoment: 'Lakers', name: 'Set A', fullName: 'LeBron James', subeditionID: 0, isLocked: false },
  // Series 2, Common, NBA, Set A, Lakers, LeBron (Locked)
  { id: '6', series: 2, tier: 'common', teamAtMoment: 'Lakers', name: 'Set A', fullName: 'LeBron James', subeditionID: 0, isLocked: true },
];
```

## Checklist for Test Implementation

- [ ] Unit tests for `passes()` function
- [ ] Unit tests for base collections
- [ ] Integration tests for filter cascading
- [ ] Integration tests for URL sync
- [ ] Manual test scenarios documented
- [ ] Performance benchmarks established
- [ ] Accessibility tests documented
- [ ] Test data prepared
- [ ] Test results documented

