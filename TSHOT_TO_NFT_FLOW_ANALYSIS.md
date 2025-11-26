# TSHOT to NFTs Flow - Complete Analysis

## Overview
The TSHOT to NFTs swap is a **two-step process** that allows users to commit TSHOT tokens and receive random NBA Top Shot Moments in return. The flow uses a receipt-based system where users first commit TSHOT (creating a receipt), then later reveal to receive their Moments.

---

## Step Detection Logic

### State Variables
```javascript
const depositStep = !accountData?.hasReceipt;  // Step 1: No receipt exists
const revealStep = accountData?.hasReceipt;     // Step 2: Receipt exists
```

**Key Point**: The UI switches between two completely different views based on whether `accountData?.hasReceipt` is true or false.

---

## STEP 1: Commit TSHOT (No Receipt)

### UI Components

**1. Primary Button**
- **Text**: "Commit TSHOT"
- **State**: 
  - Enabled when: `!btnDisabledDeposit` (amount > 0, amount ≤ 50, sufficient balance)
  - Disabled when: amount = 0, amount > 50, or insufficient balance
- **Variant**: `opolis` (green) when enabled, `secondary` (gray) when disabled
- **Action**: Calls `handleDeposit()` → executes `commitSwap` Cadence transaction

**2. Stepper Component**
- **Visual Design**: Horizontal stepper with two steps
- **Step 1 (Active)**:
  - Circle: `bg-brand-accent` (green) with white "1"
  - Label: "Commit TSHOT" in `text-brand-accent` (green)
- **Step 2 (Inactive)**:
  - Circle: `bg-brand-text/20` (gray) with "2" in `text-brand-text/40`
  - Label: "Reveal Moments" in `text-brand-text/40` (gray)
- **Connector**: Horizontal line (`w-12 h-px bg-brand-border`) between steps

**3. Helper Text**
- **Removed**: Previously showed "Burns your TSHOT and creates a receipt for your reveal." (removed per user request)
- **Error Messages**: All removed (previously showed "Enter an amount to continue", "Maximum 50 TSHOT per swap", "Insufficient TSHOT balance")

### Transaction Flow

**Function**: `handleDeposit()`

1. **Validation**: Checks `btnDisabledDeposit` (returns early if disabled)
2. **Format Amount**: Converts `numericValue` to `"${numericValue}.0"` (UFix64 format)
3. **Transaction Start**: Calls `onTransactionStart` with:
   - `status: "Awaiting Approval"`
   - `transactionAction: "COMMIT_SWAP"`
   - `swapType: "TSHOT_TO_NFT"`
   - `tshotAmount: bet`
4. **Execute Transaction**: Calls `fcl.mutate` with `commitSwap` Cadence script
5. **Subscribe to Updates**: Monitors transaction status (Pending → Finalized → Executed → Sealed)
6. **On Success**: 
   - Refreshes user data (`loadAllUserData`)
   - Receipt is now stored in user's account
   - UI automatically switches to Step 2 (because `hasReceipt` becomes true)
7. **On Error**: Updates transaction status with error message

**Transaction Modal Text**:
- Active: "Committing X TSHOT"
- Completed: "Committed X TSHOT"

---

## STEP 2: Reveal Moments (Has Receipt)

### UI Components

**1. Stepper with Committed Amount**
- **Container**: `bg-brand-accent/10 border border-brand-accent/30 rounded-lg` (light green background with border)
- **Step 1 (Completed)**:
  - Circle: `bg-brand-text/20` (gray) with green checkmark icon (`Check`)
  - Label: "Commit TSHOT (X TSHOT)" where X is the committed amount
  - Text: `text-brand-text/40` (gray, indicating completed)
- **Step 2 (Active)**:
  - Circle: `bg-brand-accent` (green) with white "2"
  - Label: "Reveal Moments" in `text-brand-accent` (green)
- **Connector**: Horizontal line between steps

**2. Primary Button**
- **Text**: 
  - "Checking collection..." (when `checkingCol === true`)
  - "Reveal Moments" (when `checkingCol === false`)
- **State**:
  - Enabled when: `!step2Disabled` (has collection AND not checking)
  - Disabled when: `step2Disabled` (no collection OR checking)
- **Variant**: `opolis` (green) when enabled, `secondary` (gray) when disabled
- **Loading State**: Shows spinning icon on left when `checkingCol === true`
- **Action**: Calls `handleReveal()` → executes `revealSwap` Cadence transaction

**3. Account Selection** (Rendered in `Swap.js`, not `TSHOTToNFTPanel.js`)
- **Condition**: Only shown when `hasReceipt === true`
- **Label**: "Select Receiving Account:" (custom `labelText` prop)
- **Layout**: Label above accounts (vertical stack on all screen sizes)
- **Requirement**: `requireCollection={true}` (only shows accounts with Top Shot collection)
- **Purpose**: User chooses which account receives the revealed Moments

**4. Error Helper Text**
- **Shown when**: `step2Disabled && !checkingCol`
- **Text**: "To reveal, choose an account that has a Top Shot collection set up."
- **Styling**: `text-xs text-brand-text/70 text-center`

**5. Helper Text**
- **Removed**: Previously showed "Redeems your receipt and delivers random Moments to your collection." (removed per user request)

### Collection Check Logic

**When**: `useEffect` triggers whenever `selectedAccount` changes

**Process**:
1. Queries Flow blockchain using `verifyTopShotCollection` Cadence script
2. Sets `hasCollection` state based on result
3. Sets `checkingCol` to true during check, false after
4. Button is disabled while checking OR if no collection found

### Transaction Flow

**Function**: `handleReveal()`

1. **Get Amount**: Retrieves committed amount from `accountData?.receiptDetails?.betAmount` or falls back to `sellAmount`
2. **Format Amount**: Ensures proper UFix64 format (adds `.0` if needed)
3. **Transaction Start**: Calls `onTransactionStart` with:
   - `status: "Awaiting Approval"`
   - `transactionAction: "REVEAL_SWAP"`
   - `swapType: "TSHOT_TO_NFT"`
   - `tshotAmount: betAmount`
4. **Load Metadata**: Ensures metadata cache is loaded (`ensureMetadataCache`)
5. **Execute Transaction**: Calls `fcl.mutate` with `revealSwap` Cadence script
   - **Argument**: `selectedAccount` (Address) - where to send the Moments
6. **Subscribe to Updates**: Monitors transaction status
7. **Parse Events**: Extracts `TopShot.Deposit` events to get Moment IDs
8. **Fetch Details**: Queries `getTopShotBatched` to get full Moment metadata
9. **Enrich Metadata**: Adds subedition info, parallel icons, etc.
10. **On Success**:
    - Updates transaction with revealed NFT details
    - Refreshes user data (parent + child accounts)
    - Receipt is consumed (no longer exists)
    - UI automatically switches back to Step 1 (because `hasReceipt` becomes false)
11. **On Error**: Updates transaction status with error message

**Transaction Modal Text**:
- Active: "Revealing X TSHOT"
- Completed: "Revealed X TSHOT" (with grid of received Moments)

---

## Amount Formatting

**Function**: `formatTSHOTAmount(amount)`

**Logic**:
- If whole number: Shows as integer (e.g., "5 TSHOT")
- If decimal: Shows one decimal place (e.g., "5.5 TSHOT")
- Handles NaN/undefined: Returns "0 TSHOT"

**Usage**:
- Step 2 stepper: Shows committed amount in parentheses
- Transaction modal: Shows amount being committed/revealed

---

## Button Disable Logic

### Step 1 (Commit)
```javascript
const btnDisabledDeposit =
  depositDisabled ||           // External prop (usually false)
  numericValue === 0 ||        // No amount entered
  numericValue > parentTSHOT || // Insufficient balance
  isOverMax;                   // Amount > 50 TSHOT
```

### Step 2 (Reveal)
```javascript
const step2Disabled = revealStep 
  ? (checkingCol || !hasCollection)  // Checking OR no collection
  : true;                            // Not in reveal step (shouldn't happen)
```

---

## Visual States

### Step 1 Stepper
- **Active Step**: Green circle, green text
- **Inactive Step**: Gray circle, gray text
- **Purpose**: Shows user is on step 1 of 2

### Step 2 Stepper
- **Completed Step**: Gray circle with checkmark, gray text, shows committed amount
- **Active Step**: Green circle, green text
- **Purpose**: Shows step 1 is done, user is on step 2

### Button States
- **Enabled**: Green (`opolis` variant), hover effects, scale animations
- **Disabled**: Gray (`secondary` variant), reduced opacity, no interactions
- **Loading**: Spinning icon, disabled state, text changes to "Checking collection..."

---

## Integration Points

### Swap.js Integration
- **Component**: `<TSHOTToNFTPanel />` rendered when `fromAsset === "TSHOT"`
- **Props**:
  - `sellAmount={formattedFrom}` - Amount from input field
  - `depositDisabled={false}` - Always false (no external disable)
  - `onTransactionStart={handleTransactionStart}` - Transaction callback
  - `onTransactionComplete` - Resets input fields
- **Account Selection**: Rendered separately below `TSHOTToNFTPanel` when `hasReceipt === true`

### Transaction Center Integration
- **Transaction Types**: `COMMIT_SWAP`, `REVEAL_SWAP`
- **Swap Type**: `TSHOT_TO_NFT`
- **Status Updates**: Real-time via `fcl.tx().subscribe()`
- **Auto-open Drawer**: Transactions auto-open transaction drawer for visibility

---

## User Experience Flow

### First-Time User Journey
1. User enters TSHOT amount in swap panel
2. Sees Step 1 UI: "Commit TSHOT" button + stepper showing step 1 active
3. Clicks "Commit TSHOT"
4. Transaction modal opens: "Committing X TSHOT"
5. Transaction completes: "Committed X TSHOT"
6. UI automatically switches to Step 2
7. Sees Step 2 UI: Stepper showing step 1 completed, "Reveal Moments" button
8. Sees Account Selection: "Select Receiving Account:" with account cards
9. Selects account (must have Top Shot collection)
10. Button enables: "Reveal Moments"
11. Clicks "Reveal Moments"
12. Transaction modal opens: "Revealing X TSHOT"
13. Transaction completes: Shows grid of received Moments
14. UI automatically switches back to Step 1 (receipt consumed)

### Returning User (Has Receipt)
1. User opens swap page
2. Sees Step 2 UI immediately (because `hasReceipt === true`)
3. Can proceed directly to reveal

---

## Key Design Decisions

### 1. Two-Step Process
- **Why**: Separates commitment from reveal, allows for delayed reveal
- **Benefit**: Users can commit TSHOT and reveal later when ready

### 2. Receipt-Based System
- **Why**: Stores commitment on-chain, prevents double-spending
- **Benefit**: Secure, verifiable, allows for delayed reveal

### 3. Account Selection in Step 2
- **Why**: User may want to send Moments to different account than committed from
- **Benefit**: Flexibility in where Moments are received

### 4. Collection Requirement
- **Why**: Moments must be deposited to a Top Shot collection
- **Benefit**: Prevents errors, ensures valid destination

### 5. Automatic Step Switching
- **Why**: Seamless UX, no manual navigation needed
- **Benefit**: Users don't need to understand receipt state

### 6. Stepper Visual Design
- **Why**: Clear progress indication, shows completed vs active steps
- **Benefit**: Users understand where they are in the process

### 7. Removed Helper Text
- **Why**: User feedback indicated text was confusing or unnecessary
- **Benefit**: Cleaner UI, less clutter

---

## Potential Issues & Edge Cases

### 1. Receipt State Sync
- **Issue**: If receipt exists but UI doesn't reflect it
- **Mitigation**: `loadAllUserData` refreshes receipt state after commit

### 2. Collection Check Timing
- **Issue**: Collection check happens async, button may flicker
- **Mitigation**: `checkingCol` state prevents button interaction during check

### 3. Amount Formatting
- **Issue**: Different formats between input and transaction
- **Mitigation**: `formatTSHOTAmount` ensures consistent display

### 4. Transaction Stuck
- **Issue**: Transaction may appear stuck if status doesn't update
- **Mitigation**: 20-second timeout warning logs to console

### 5. Account Selection Required
- **Issue**: User may not understand why button is disabled
- **Mitigation**: Error helper text explains requirement

---

## Code Structure

### Component: `TSHOTToNFTPanel.js`
- **Location**: `src/components/TSHOTToNFTPanel.js`
- **Props**: `sellAmount`, `depositDisabled`, `onTransactionStart`, `onTransactionComplete`
- **State**: `hasCollection`, `checkingCol`
- **Functions**: `handleDeposit()`, `handleReveal()`, `formatTSHOTAmount()`
- **Conditional Rendering**: `depositStep` vs `revealStep`

### Integration: `Swap.js`
- **Location**: `src/pages/Swap.js`
- **Renders**: `<TSHOTToNFTPanel />` when `fromAsset === "TSHOT"`
- **Renders**: `<AccountSelection />` when `hasReceipt === true`
- **State Management**: `selectedAccount`, `accountCollections`, `hasReceipt`

### Cadence Scripts
- **Commit**: `src/flow/commitSwap.js` - Creates receipt, stores on-chain
- **Reveal**: `src/flow/revealSwap.js` - Consumes receipt, delivers Moments
- **Check Collection**: `src/flow/verifyTopShotCollection.js` - Verifies Top Shot collection exists
- **Get Receipt**: `src/flow/getReceiptDetails.js` - Retrieves receipt details

---

## Summary

The TSHOT to NFTs flow is a well-structured two-step process with clear visual indicators, automatic state management, and robust error handling. The UI adapts based on receipt state, providing a seamless experience whether the user is committing or revealing. Key improvements include removed helper text for clarity and account selection positioned above accounts for better mobile UX.

