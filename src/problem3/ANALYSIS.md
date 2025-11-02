# Code Analysis: Computational Inefficiencies and Anti-patterns

## Critical Bugs

### 1. Undefined Variable Reference
**Issue:** `lhsPriority` is used but never defined (line 49).

**Location:** Line 49
```typescript
if (lhsPriority > -99) {
```

**Why it's wrong:** The variable `lhsPriority` doesn't exist in scope. The code calculates `balancePriority` on line 48 but then references a non-existent variable, causing a runtime error.

**How to fix:** Replace `lhsPriority` with `balancePriority`:
```typescript
if (balancePriority > -99) {
```

---

### 2. Incorrect Filter Logic
**Issue:** Filter returns `true` for balances with amount <= 0, which keeps invalid balances instead of filtering them out.

**Location:** Lines 50-52
```typescript
if (balance.amount <= 0) {
  return true;  // Keeps invalid balances
}
```

**Why it's wrong:** The filter should exclude balances with amount <= 0, but returning `true` includes them. The logic is inverted.

**How to fix:** Return `false` to filter out invalid balances, or reverse the condition:
```typescript
if (balance.amount <= 0) {
  return false;  // Filter out invalid balances
}
```
Or better:
```typescript
return balancePriority > -99 && balance.amount > 0;
```

---

### 3. Incomplete Sort Comparator
**Issue:** Sort comparator doesn't return `0` when priorities are equal, leading to unstable sorting.

**Location:** Lines 55-63
```typescript
if (leftPriority > rightPriority) {
  return -1;
} else if (rightPriority > leftPriority) {
  return 1;
}
// Missing return 0
```

**Why it's wrong:** When `leftPriority === rightPriority`, the function returns `undefined`, which can cause unpredictable sorting behavior.

**How to fix:** Add return statement for equal case:
```typescript
if (leftPriority > rightPriority) {
  return -1;
} else if (rightPriority > leftPriority) {
  return 1;
}
return 0;  // Equal priorities
```

---

### 4. Missing Property in Interface
**Issue:** `WalletBalance` interface doesn't include `blockchain` property, but it's accessed in the code.

**Location:** Lines 11-14, 48
```typescript
interface WalletBalance {
  currency: string;
  amount: number;
  // Missing: blockchain property
}
// Later used: balance.blockchain (line 48)
```

**Why it's wrong:** TypeScript will fail compilation or runtime errors occur when accessing `balance.blockchain` since it's not defined in the type.

**How to fix:** Add `blockchain` property to the interface:
```typescript
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;  // Add this
}
```

---

### 5. Type Mismatch in Map Function
**Issue:** `sortedBalances` is typed as `WalletBalance[]` but used as `FormattedWalletBalance[]` in the map.

**Location:** Line 73
```typescript
const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
  // sortedBalances is WalletBalance[], not FormattedWalletBalance[]
  formattedAmount={balance.formatted}  // balance.formatted doesn't exist
```

**Why it's wrong:** `sortedBalances` doesn't have `formatted` property, but the code tries to access `balance.formatted`, causing a runtime error.

**How to fix:** Use `formattedBalances` instead, or compute `formatted` inline:
```typescript
const rows = formattedBalances.map((balance: FormattedWalletBalance, index: number) => {
```
Or compute inline:
```typescript
const rows = sortedBalances.map((balance: WalletBalance, index: number) => {
  const formatted = balance.amount.toFixed();
  // ...
```

---

### 6. Unused Computed Value
**Issue:** `formattedBalances` is computed but never used; code uses `sortedBalances` instead.

**Location:** Lines 66-71, 73
```typescript
const formattedBalances = sortedBalances.map(...)  // Computed
// Never used - line 73 uses sortedBalances instead
```

**Why it's wrong:** Wastes computation cycles and indicates logic error where the wrong variable is used.

**How to fix:** Use `formattedBalances` in the rows mapping, or remove the computation if not needed.

---

## Performance Issues

### 7. Redundant Function Calls
**Issue:** `getPriority` is called multiple times for the same balance item.

**Location:** Lines 48, 56, 57
```typescript
const balancePriority = getPriority(balance.blockchain);  // Called in filter
// Later in sort:
const leftPriority = getPriority(lhs.blockchain);   // Called again
const rightPriority = getPriority(rhs.blockchain);  // Called again
```

**Why it's wrong:** For each balance, `getPriority` is called once in filter and potentially multiple times during sorting comparisons. This is inefficient.

**How to fix:** Compute priority once and store it with the balance:
```typescript
const balancesWithPriority = balances.map(balance => ({
  ...balance,
  priority: getPriority(balance.blockchain)
}));
```

---

### 8. Incorrect useMemo Dependencies
**Issue:** `useMemo` includes `prices` in dependencies but doesn't use it in the computation.

**Location:** Line 64
```typescript
}, [balances, prices]);  // prices not used in computation
```

**Why it's wrong:** Including unused dependencies causes unnecessary re-computations when `prices` changes, even though it doesn't affect the result.

**How to fix:** Remove `prices` from dependencies:
```typescript
}, [balances]);
```

---

### 9. Function Recreated on Every Render
**Issue:** `getPriority` function is defined inside the component, causing it to be recreated on every render.

**Location:** Lines 29-44
```typescript
const WalletPage: React.FC<Props> = (props: Props) => {
  // ...
  const getPriority = (blockchain: any): number => {  // Recreated every render
```

**Why it's wrong:** While not causing bugs, it's inefficient and indicates the function should be extracted.

**How to fix:** Move function outside component, or use `useCallback`:
```typescript
// Outside component:
const getPriority = (blockchain: Blockchain): number => {
  // ...
}

// Or inside with useCallback:
const getPriority = useCallback((blockchain: Blockchain): number => {
  // ...
}, []);
```

---

### 10. Using Array Index as React Key
**Issue:** Using array `index` as React key is an anti-pattern that can cause rendering issues.

**Location:** Line 78
```typescript
key={index}
```

**Why it's wrong:** When the list order changes, React may incorrectly reuse components, leading to state bugs and performance issues.

**How to fix:** Use a unique identifier like `currency` or a combination:
```typescript
key={`${balance.currency}-${balance.blockchain}`}
```

---

## Type Safety Issues

### 11. Using `any` Type
**Issue:** `blockchain` parameter uses `any` type, losing type safety.

**Location:** Line 29
```typescript
const getPriority = (blockchain: any): number => {
```

**Why it's wrong:** `any` disables TypeScript's type checking, allowing invalid values and losing autocomplete/intellisense benefits.

**How to fix:** Create a proper type or use a union type:
```typescript
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';
const getPriority = (blockchain: Blockchain): number => {
```

---

## Code Quality Issues

### 12. Empty Interface
**Issue:** `Props` interface is empty and doesn't add value.

**Location:** Lines 21-23
```typescript
interface Props extends BoxProps {
  // Empty
}
```

**Why it's wrong:** Unnecessary abstraction that adds noise without value.

**How to fix:** Use `BoxProps` directly or add meaningful props:
```typescript
const WalletPage: React.FC<BoxProps> = (props: BoxProps) => {
```

---

### 13. Undefined Variable Reference
**Issue:** `classes` is used but never defined or imported.

**Location:** Line 77
```typescript
className={classes.row}
```

**Why it's wrong:** Will cause a runtime error when the component renders.

**How to fix:** Import or define `classes`, or remove if not needed.

---

### 14. Inconsistent Code Style
**Issue:** Mixed indentation (tabs and spaces) and missing semicolons.

**Location:** Throughout the file

**Why it's wrong:** Reduces code readability and maintainability.

**How to fix:** Use consistent formatting (prefer spaces, 2-space indentation) and add semicolons for consistency.

---

## Summary

**Total Issues Found:** 14
- **Critical Bugs:** 6
- **Performance Issues:** 4
- **Type Safety Issues:** 1
- **Code Quality Issues:** 3

The most critical issues are the undefined variable `lhsPriority`, incorrect filter logic, and type mismatches that will cause runtime errors. Performance optimizations involve reducing redundant function calls and fixing dependency arrays.

