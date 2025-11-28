# Moment Grid Layout Analysis

## Overview
Analysis of all pages/components where moments are displayed to identify inconsistencies in grid layouts, particularly on mobile devices.

## Grid Configurations Found

### 1. **TSHOTVault.js** ✅ CONSISTENT
- **Grid**: `grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))]`
- **Gap**: `gap-1.5` (6px)
- **Mobile (375px)**: ~4 columns (80px + 6px gap = 86px per item → 375/86 ≈ 4.36)
- **Desktop**: ~3-4 columns (112px + 6px = 118px per item)
- **Status**: ✅ Standard configuration

### 2. **MyCollection.js** ✅ CONSISTENT
- **Grid**: `grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))]`
- **Gap**: `gap-1.5` (6px)
- **Mobile (375px)**: ~4 columns
- **Desktop**: ~3-4 columns
- **Status**: ✅ Standard configuration

### 3. **MomentSelection.js** ✅ CONSISTENT
- **Grid**: `grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))]`
- **Gap**: `gap-1.5` (6px)
- **Mobile (375px)**: ~4 columns
- **Desktop**: ~3-4 columns
- **Status**: ✅ Standard configuration

### 4. **Transfer.js** ✅ CONSISTENT (but different gap)
- **Grid**: `grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))]`
- **Gap**: `gap-2` (8px) ⚠️ **Different gap size**
- **Mobile (375px)**: ~4 columns (80px + 8px = 88px → 375/88 ≈ 4.26)
- **Desktop**: ~3-4 columns
- **Status**: ✅ Same card size, but gap is different (minor inconsistency)

### 5. **SwapApplication.js** ✅ CONSISTENT (but different gap)
- **Grid**: `grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))]`
- **Gap**: `gap-2` (8px) ⚠️ **Different gap size**
- **Mobile (375px)**: ~4 columns
- **Desktop**: ~3-4 columns
- **Status**: ✅ Same card size, but gap is different (matches Transfer.js)

### 6. **GrailBountiesVault.js** ✅ CONSISTENT
- **Grid**: `grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))]`
- **Gap**: `gap-1.5` (6px)
- **Mobile (375px)**: ~4 columns
- **Desktop**: ~3-4 columns
- **Status**: ✅ Standard configuration

### 7. **AllDayGrailsVault.js** ✅ CONSISTENT
- **Grid**: `grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))]`
- **Gap**: `gap-1.5` (6px)
- **Mobile (375px)**: ~4 columns
- **Desktop**: ~3-4 columns
- **Status**: ✅ Standard configuration

### 8. **Bounties.js - Bounties Grid** ⚠️ INCONSISTENT
- **Grid**: `grid-cols-[repeat(auto-fit,minmax(130px,130px))] sm:grid-cols-[repeat(auto-fit,minmax(150px,150px))] md:grid-cols-[repeat(auto-fit,minmax(140px,140px))] lg:grid-cols-[repeat(auto-fit,minmax(160px,160px))]`
- **Gap**: `gap-1.5` (6px)
- **Mobile (375px)**: ~2-3 columns (130px + 6px = 136px → 375/136 ≈ 2.75)
- **Small (640px)**: ~4 columns (150px + 6px = 156px → 640/156 ≈ 4.10)
- **Medium (768px)**: ~5 columns (140px + 6px = 146px → 768/146 ≈ 5.26) ⚠️ **Weird: smaller than small breakpoint**
- **Large (1024px)**: ~6 columns (160px + 6px = 166px → 1024/166 ≈ 6.17)
- **Status**: ⚠️ **INCONSISTENT** - Uses larger cards (EditionOfferCard), shows 2-3 columns on mobile instead of 4

### 9. **Bounties.js - Matching Moments** ⚠️ INCONSISTENT
- **Grid**: `grid-cols-[repeat(auto-fit,minmax(140px,140px))] sm:grid-cols-[repeat(auto-fit,minmax(160px,160px))]`
- **Gap**: `gap-1.5` (6px)
- **Mobile (375px)**: ~2 columns (140px + 6px = 146px → 375/146 ≈ 2.56)
- **Desktop**: ~3-4 columns (160px + 6px = 166px)
- **Status**: ⚠️ **INCONSISTENT** - Shows only 2 columns on mobile instead of 4

## Summary

### ✅ Consistent Views (Show 4 columns on mobile)
1. TSHOTVault.js
2. MyCollection.js
3. MomentSelection.js
4. GrailBountiesVault.js
5. AllDayGrailsVault.js

### ⚠️ Minor Inconsistency (Same card size, different gap)
6. Transfer.js - Uses `gap-2` instead of `gap-1.5`
7. SwapApplication.js - Uses `gap-2` instead of `gap-1.5`

### ❌ Inconsistent Views (Show 2-3 columns on mobile)
8. **Bounties.js - Bounties Grid** - Uses 130px cards → 2-3 columns on mobile
9. **Bounties.js - Matching Moments** - Uses 140px cards → 2 columns on mobile

## Recommendations

### Option 1: Standardize Bounties to match others (Recommended)
Make Bounties pages use the same 80px/112px configuration for consistency:
- **Bounties Grid**: Change from `130px/150px/140px/160px` to `80px/112px`
- **Matching Moments**: Change from `140px/160px` to `80px/112px`

**Pros**: Complete consistency across all views
**Cons**: Bounty cards (EditionOfferCard) might be designed for larger size

### Option 2: Keep Bounties larger but fix mobile
If EditionOfferCard needs to be larger, adjust mobile breakpoint:
- **Bounties Grid**: Keep larger sizes but add explicit mobile: `grid-cols-3 sm:grid-cols-[repeat(auto-fit,minmax(130px,130px))]`
- **Matching Moments**: Change to `grid-cols-3 sm:grid-cols-[repeat(auto-fit,minmax(160px,160px))]`

**Pros**: Maintains larger card design for bounties
**Cons**: Still inconsistent with other views

### Option 3: Fix gap inconsistency
Standardize gap to `gap-1.5` across all views:
- **Transfer.js**: Change `gap-2` → `gap-1.5`
- **SwapApplication.js**: Change `gap-2` → `gap-1.5`

**Pros**: Minor improvement, easy fix
**Cons**: Doesn't solve the main 2-3 vs 4 column issue

## Mobile Column Calculation Reference

For a typical mobile width of 375px:
- **80px cards + 6px gap**: 375 ÷ 86 = **4.36** → **4 columns** ✅
- **80px cards + 8px gap**: 375 ÷ 88 = **4.26** → **4 columns** ✅
- **130px cards + 6px gap**: 375 ÷ 136 = **2.75** → **2-3 columns** ⚠️
- **140px cards + 6px gap**: 375 ÷ 146 = **2.56** → **2 columns** ⚠️

## Files to Update

If choosing Option 1 (recommended):
1. `src/pages/Bounties.js` - Line 844: Bounties grid
2. `src/pages/Bounties.js` - Line 921: Matching Moments grid

If choosing Option 3 (gap fix):
1. `src/pages/Transfer.js` - Line 378: Change `gap-2` to `gap-1.5`
2. `src/components/SwapApplication.js` - Line 352: Change `gap-2` to `gap-1.5`

