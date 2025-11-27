# Loading States Analysis & Recommendations

## Current Problem

**Issue:** When collection data is loading, users often see:
- Empty grids (no indication it's loading)
- Stale/old data (no indication it's refreshing)
- No visual feedback during multi-step loading processes

**User Experience Impact:**
- Users think the page is broken
- Users don't know if they should wait or refresh
- Users might try to interact with stale data

---

## Current Loading State Implementation

### ✅ **What's Working Well**

1. **Bounties Page**
   - Shows `"Loading bounties…"` text
   - Clear loading state

2. **TSHOTVault**
   - Has `loading.moments` and `loading.filters` states
   - Disables pagination during loading
   - Shows "No moments match your filters" when appropriate

3. **Transaction Modal**
   - Shows spinner during transactions
   - Clear status messages

### ⚠️ **What's Not Working Well**

1. **MomentSelection Component** (NFT to TSHOT swap)
   - **Problem:** When `isRefreshing` is true, shows nothing
   - **Current code:** Only shows message if `!hasCollection && !isRefreshing`
   - **Result:** Empty grid during loading, no feedback

2. **MyCollection Page**
   - **Problem:** Similar issue - no loading indicator when refreshing
   - **Current code:** Only shows message if `!hasCollection && !isRefreshing`
   - **Result:** Users see empty grid or stale data with no indication

3. **Collection Loading States** (UserContext)
   - **Problem:** `collectionLoadStatus` exists but isn't used in UI
   - **Available states:** `'idle'`, `'loading_snapshot'`, `'loading_full'`, `'success'`, `'error'`
   - **Result:** Rich loading state data exists but UI doesn't show it

4. **GrailBountiesVault / AllDayGrailsVault**
   - **Problem:** Shows "No moments" immediately, even while loading
   - **Result:** Confusing - is it empty or still loading?

---

## Phase 3: Loading State Improvements

### Option A: Skeleton Loaders (Recommended)

**What it is:** Placeholder cards that look like the actual content but are animated/greyed out.

**Benefits:**
- ✅ Users immediately see something is loading
- ✅ Shows the layout/structure (reduces perceived wait time)
- ✅ Professional, modern UX pattern
- ✅ Works well with your existing card components

**Implementation:**
```jsx
// Example skeleton for MomentCard
<div className="w-[112px] h-[160px] bg-brand-secondary animate-pulse rounded border border-brand-border">
  <div className="h-24 bg-brand-primary/30 rounded-t" />
  <div className="p-2 space-y-1">
    <div className="h-3 bg-brand-primary/30 rounded w-3/4" />
    <div className="h-2 bg-brand-primary/20 rounded w-1/2" />
  </div>
</div>
```

**Where to add:**
1. **MomentSelection** - Show 12-20 skeleton cards when `isRefreshing` or `collectionLoadStatus === 'loading_full'`
2. **MyCollection** - Show skeleton cards when `isRefreshing` or `isRefreshingAllDay`
3. **GrailBountiesVault / AllDayGrailsVault** - Show skeletons when `loadingIds` or `loadingDetails`
4. **TSHOTVault** - Show skeletons when `loading.moments`

### Option B: Loading Spinner + Text (Simpler)

**What it is:** Centered spinner with "Loading your collection..." text.

**Benefits:**
- ✅ Quick to implement
- ✅ Clear feedback
- ❌ Less polished than skeletons
- ❌ Doesn't show layout structure

**Implementation:**
```jsx
{isRefreshing && (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-brand-accent mb-4" />
    <p className="text-brand-text/70">Loading your collection...</p>
  </div>
)}
```

### Option C: Hybrid Approach (Best UX)

**What it is:** 
- Show skeleton loaders for initial load
- Show subtle spinner + "Refreshing..." for refresh actions
- Use `collectionLoadStatus` to show different states

**Benefits:**
- ✅ Best of both worlds
- ✅ Clear distinction between initial load vs refresh
- ✅ Uses existing `collectionLoadStatus` state

**Implementation:**
```jsx
// Initial load - show skeletons
{collectionLoadStatus === 'loading_full' && !hasCollection && (
  <div className="grid ...">
    {[...Array(20)].map((_, i) => <MomentCardSkeleton key={i} />)}
  </div>
)}

// Refresh - show subtle indicator
{isRefreshing && hasCollection && (
  <div className="absolute top-2 right-2 flex items-center gap-2 text-xs text-brand-text/60">
    <Loader2 className="w-3 h-3 animate-spin" />
    <span>Refreshing...</span>
  </div>
)}
```

---

## Recommended Implementation Plan

### Priority 1: Critical Loading States (Do First)

1. **MomentSelection Component**
   - Show skeleton cards when `collectionLoadStatus === 'loading_full'` or `isRefreshing`
   - Use `collectionLoadStatus` from UserContext (it's already there!)

2. **MyCollection Page**
   - Show skeleton cards when `isRefreshing` or `isRefreshingAllDay`
   - Show skeletons for both TopShot and AllDay collections

### Priority 2: Vault Loading States

3. **GrailBountiesVault / AllDayGrailsVault**
   - Show skeleton cards when `loadingIds` or `loadingDetails`
   - Don't show "No moments" until loading is complete

4. **TSHOTVault**
   - Already has loading states, but could add skeletons for better UX

### Priority 3: Enhanced Feedback

5. **Use `collectionLoadStatus` Properly**
   - `'loading_snapshot'` → "Loading from cache..."
   - `'loading_full'` → Show skeletons
   - `'success'` → Show content
   - `'error'` → Show error message

6. **Refresh Indicators**
   - Subtle spinner in corner during refresh
   - Don't replace content, just indicate it's updating

---

## Code Examples

### Skeleton Component

```jsx
// src/components/MomentCardSkeleton.js
export const MomentCardSkeleton = () => (
  <div className="w-[80px] sm:w-[112px] aspect-[4/7] rounded overflow-hidden border border-brand-border bg-brand-secondary animate-pulse">
    <div className="w-full h-[60%] bg-brand-primary/30" />
    <div className="p-1.5 space-y-1">
      <div className="h-2.5 bg-brand-primary/30 rounded w-3/4" />
      <div className="h-2 bg-brand-primary/20 rounded w-1/2" />
      <div className="h-2 bg-brand-primary/20 rounded w-2/3" />
    </div>
  </div>
);
```

### Usage in MomentSelection

```jsx
// In MomentSelection.js
const { collectionLoadStatus } = useContext(UserDataContext);

// Show skeletons during initial load
if (collectionLoadStatus === 'loading_full' && !accountData.hasCollection) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-1.5">
      {[...Array(20)].map((_, i) => <MomentCardSkeleton key={i} />)}
    </div>
  );
}

// Show skeletons during refresh (overlay or replace)
if (isRefreshing && accountData.hasCollection) {
  return (
    <>
      {/* Subtle refresh indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-2 text-xs text-brand-text/60 bg-brand-primary/80 px-2 py-1 rounded">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Refreshing...</span>
      </div>
      {/* Show existing content with slight opacity */}
      <div className="opacity-60">
        {/* Existing grid */}
      </div>
    </>
  );
}
```

---

## Decision: Which Approach?

**My Recommendation: Hybrid Approach (Option C)**

1. **Initial Load** → Skeleton loaders (20 cards)
2. **Refresh** → Subtle spinner + "Refreshing..." badge
3. **Use `collectionLoadStatus`** → Show appropriate state
4. **Error States** → Clear error messages

**Why:**
- Best user experience
- Clear distinction between initial load vs refresh
- Uses existing state management
- Professional and modern

**Time Estimate:**
- Skeleton component: 30 minutes
- Update MomentSelection: 1 hour
- Update MyCollection: 1 hour
- Update Vaults: 1 hour
- **Total: ~3-4 hours**

---

## Questions for You

1. **Do you want skeleton loaders or just spinners?**
   - Skeletons = more polished, more work
   - Spinners = simpler, faster to implement

2. **How should refresh work?**
   - Replace content with skeletons?
   - Show overlay with "Refreshing..." badge?
   - Keep content visible but dimmed?

3. **Should we use `collectionLoadStatus`?**
   - It's already in UserContext but not used in UI
   - Could show "Loading from cache..." vs "Loading from blockchain..."

4. **What about empty states?**
   - Should "No moments" only show after loading completes?
   - Or show immediately if we know there are none?

---

## Next Steps

Once you decide on the approach, I can implement:
1. Skeleton component (if going that route)
2. Update loading states in key components
3. Add proper `collectionLoadStatus` usage
4. Test with slow network conditions

What's your preference?

