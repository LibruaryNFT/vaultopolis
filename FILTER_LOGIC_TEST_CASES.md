# Filter Logic Test Cases - Manual Testing Guide

## Test Scenario 1: Basic Filter Flow
1. **Initial State**
   - Load swap page
   - ✅ Series: All selected (auto-select)
   - ✅ Tier: All selected (auto-select)  
   - ✅ League: All selected (auto-select)
   - ✅ Set: Empty array (shows "All")
   - ✅ Team: Empty array (shows "All")
   - ✅ Player: Empty array (shows "All")
   - ✅ Parallel: Empty array (shows "All")

2. **Select Single Series**
   - Select Series 2 only
   - ✅ Series button shows "Series 2" or "Series 2 (X)"
   - ✅ Other filter counts update based on Series 2 only
   - ✅ Set/Team/Player/Parallel still show "All" (empty array)

3. **Select Tier = Fandom**
   - Select Fandom tier only
   - ✅ Series "All" count = total fandom moments
   - ✅ Individual series counts = fandom moments in that series
   - ✅ Set/Team/Player/Parallel counts = fandom moments only

## Test Scenario 2: Empty Array Behavior (Set/Team/Player/Parallel)
1. **Select League = NBA**
   - Set filter should show "All" (empty array)
   - ✅ Open Set dropdown → "All" checkbox is CHECKED
   - ✅ Set "All" count = all sets in NBA league
   - ✅ Individual set counts = sets in NBA league

2. **Select a Set**
   - Select "Metallic Silver FE"
   - ✅ Set button shows "Metallic Silver FE" or "Metallic Silver FE (X)"
   - ✅ "All" checkbox is UNCHECKED
   - ✅ Selected set checkbox is CHECKED

3. **Clear Set Selection**
   - Click "Clear" in Set dropdown
   - ✅ Set filter returns to empty array []
   - ✅ Set button shows "All"
   - ✅ "All" checkbox is CHECKED

## Test Scenario 3: "All" Selection State
1. **Select All Series**
   - Start with all series selected
   - ✅ Series button shows "All"
   - ✅ Open Series dropdown → "All" checkbox is CHECKED
   - ✅ Individual series checkboxes are UNCHECKED (because "All" is selected)

2. **Deselect One Series**
   - Uncheck Series 2
   - ✅ "All" checkbox is UNCHECKED
   - ✅ Series 2 checkbox is UNCHECKED
   - ✅ Other series checkboxes remain CHECKED

3. **Select All Again**
   - Click "All" checkbox
   - ✅ All series checkboxes become CHECKED
   - ✅ "All" checkbox is CHECKED

## Test Scenario 4: Filter Interactions
1. **Cascade Filtering**
   - Start: All series, all tiers
   - Select: Tier = Fandom
   - ✅ Series counts update (only fandom moments)
   - ✅ Set counts update (only fandom moments)
   - ✅ Team counts update (only fandom moments)
   - ✅ Player counts update (only fandom moments)

2. **Multiple Filters**
   - Select: Series 2, Tier = Fandom, League = NBA
   - ✅ Set counts = fandom moments in Series 2, NBA league
   - ✅ Team counts = fandom moments in Series 2, NBA league
   - ✅ Player counts = fandom moments in Series 2, NBA league

## Test Scenario 5: Hidden Options (0 Count)
1. **Select Filters That Hide Options**
   - Select: Tier = Fandom, League = NBA
   - Some sets have 0 fandom moments in NBA
   - ✅ Open Set dropdown
   - ✅ Sets with 0 count are HIDDEN (unless selected)
   - ✅ "All" option always visible
   - ✅ Selected sets with 0 count remain visible (but disabled/faded)

2. **Select Hidden Option**
   - If a set is selected but then becomes hidden (0 count)
   - ✅ It remains in selection
   - ✅ It shows in dropdown as disabled/faded
   - ✅ Count shows (0)
   - ✅ Results show 0 items

## Test Scenario 6: Reset Button
1. **Apply Various Filters**
   - Select: Series 2, Tier = Fandom, Set = "Metallic Silver FE", Team = "Lakers"
   - Click "Reset" button
   - ✅ Series: All selected
   - ✅ Tier: All selected
   - ✅ League: All selected
   - ✅ Set: Empty array (shows "All")
   - ✅ Team: Empty array (shows "All")
   - ✅ Player: Empty array (shows "All")
   - ✅ Parallel: Empty array (shows "All")
   - ✅ Exclusions: Both enabled

## Test Scenario 7: URL Sync
1. **Apply Filters**
   - Select: Series 2, Tier = Fandom, League = NBA
   - ✅ URL updates with query params
   - ✅ URL only includes non-default values

2. **Reload Page**
   - Copy URL and reload
   - ✅ Filters load from URL
   - ✅ Series: [2] selected
   - ✅ Tier: ["fandom"] selected
   - ✅ League: ["NBA"] selected
   - ✅ Set: Empty array (shows "All")
   - ✅ Auto-select doesn't override URL values

## Test Scenario 8: Series 0 Handling
1. **Collection Has Series 0**
   - ✅ Series 0 appears in dropdown (labeled "Series 1")
   - ✅ Can select series 0
   - ✅ Counts work correctly for series 0
   - ✅ "All" includes series 0

## Test Scenario 9: Locked Moments
1. **On Swap Page (showLockedMoments=false)**
   - ✅ Locked moments excluded from counts
   - ✅ Locked moments excluded from results
   - ✅ Permanent "Locked" exclusion button visible

## Test Scenario 10: Edge Cases
1. **Deselect All Series**
   - Start with all series selected
   - Deselect all series
   - ✅ Series: [] (empty)
   - ✅ Button shows "None"
   - ✅ No results shown (empty = no matches for Series/Tier/League)

2. **Invalid Selections After Filter Change**
   - Select: Set = "Set A"
   - Change: League = NBA (Set A has 0 moments in NBA)
   - ✅ Set A remains selected (but disabled/faded)
   - ✅ Count shows (0)
   - ✅ Results show 0 items
   - ✅ Can still deselect Set A

