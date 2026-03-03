# Vladyslav Lomaka — Tech Task

## Architecture & Approach

### Project Structure

```
src/
├── assets/
│   └── financial_assets.json    # 500 generated assets
├── context/
│   └── AssetsContext.tsx        # Global price-update state (Context + useRef pattern)
├── components/
│   ├── AssetItem.tsx            # Memoized list row (fixed height for getItemLayout)
│   ├── FilterBar.tsx            # Performance + type filter pills
│   └── SortBar.tsx              # 4 sort toggle buttons
├── screens/
│   ├── HomeScreen.tsx           # FlatList with filter/sort, navigates to detail
│   └── AssetDetailScreen.tsx    # Asset fields + Similar section with its own sort
├── navigation/
│   └── RootNavigator.tsx        # Native stack (headerShown: false)
├── types/
│   └── asset.ts                 # Strict TypeScript interfaces & union types
└── utils/
    ├── assetUtils.ts            # Pure functions: filter, sort, getSimilar
    └── formatters.ts            # Price and percent formatters
__tests__/
├── unit/
│   └── assetUtils.test.ts       # 22 unit tests for all utility functions
├── integration/
│   └── filtering.test.tsx       # 15 integration tests for HomeScreen user flows
└── __mocks__/
    └── financial_assets.json    # 7-item fixture, keeps test suite fast
```

### Key Architectural Decisions

**1. Global shared state via Context (not per-screen hooks)**

Each screen calling its own `useAssets()` hook would result in two independent
price-update intervals and two copies of 500 assets in memory. Instead,
`AssetsProvider` owns a single interval and exposes the live `assets[]` array
via context. Both `HomeScreen` and `AssetDetailScreen` read from the same
source — no prop drilling, no duplicated state.

**2. `useRef` to fix the stale-closure bug in the original code**

**3. `useMemo` for filter + sort computation**

**4. `React.memo` with custom `areEqual` on `AssetItem`**

Every 3 s the price update calls `assets.map(...)` which produces new object
references for all 500 items. A naive `React.memo` with reference equality
would re-render every visible row. The custom comparator checks primitive
values (`currentPrice`, `dailyChangePercent`) — so an item only re-renders
when its numbers actually change.

**5. `getItemLayout` for zero-measurement scrolling**

`AssetItem` renders at a fixed height (`ITEM_HEIGHT = 84`). Providing
`getItemLayout` to `FlatList` lets it pre-calculate every item's offset
without measuring — critical for jump-to-index, initial scroll restoration,
and smooth rendering on large lists.

---

## How to Run

### Install dependencies

```bash
npm install

# ios
cd ios && bundle install && bundle exec pod install && cd ..
```

### Generate fresh mock data (optional — already committed)

```bash
node Mobile\ Assessment/genAssetsData.js
mv financial_assets.json src/assets/
```

### Run

```bash
npx react-native run-ios

npx react-native run-android
```

### tests

```bash
npx jest
```

---

## Known Performance Bottlenecks & Mitigations

### 1. Full-array map on every price tick

**Bottleneck:** Every 3 s, `assets.map(...)` allocates 500 new objects.

**Mitigation applied:** The allocation itself is fast (~0.1 ms). React's
reconciler only schedules re-renders for components whose props actually
changed (enforced by the custom `areEqual` comparator on `AssetItem`).

**Future improvement:** Sparse update — only send a new object for assets
whose price actually changed. Requires a deterministic price-change
simulation or a WebSocket-style delta feed.

### 2. Filter + sort on 500 items on every render

**Bottleneck:** Without caching, O(n log n) sort runs on every re-render.

**Mitigation applied:** `useMemo([assets, filter, sort])` — the result is
reused as long as inputs don't change.

### 3. FlatList measurement overhead on large lists

**Bottleneck:** Without `getItemLayout`, FlatList measures each item
on-demand when it enters the viewport.

**Mitigation applied:**

- `getItemLayout` — pre-calculates offsets for all 500 items
- `removeClippedSubviews={true}` — detaches off-screen views from the GPU layer
- `windowSize={7}` — keeps ≈3.5 screens of items in memory each side
- `maxToRenderPerBatch={12}` — limits JS thread work per frame
- `initialNumToRender={14}` — only measures the first screen on mount

---

## Bugs Fixed in the Original `HomeScreen.tsx`

| #   | Bug                                     | Root Cause                                                | Fix                                             |
| --- | --------------------------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| 1   | Memory leak                             | `setInterval` never cleared                               | `return () => clearInterval(id)` in `useEffect` |
| 2   | Stale closure / interval explosion      | `[assets]` as dep → new interval on every update          | `useRef` + empty `[]` dep array                 |
| 3   | Sort mutation doesn't trigger re-render | `Array.prototype.sort()` mutates in place, same reference | `[...assets].sort(...)` creates new array       |
| 4   | Wrong TypeScript type                   | `(typeof initialAssets)[number][]` = `Asset[][]`          | Corrected to `Asset` (singular)                 |
| 5   | Sort Name buttons non-functional        | Missing `onPress` handlers                                | Implemented `SortBar` with all 4 handlers       |
| 6   | No filter functionality                 | Not implemented                                           | `FilterBar` component + `filterAssets` util     |
| 7   | No navigation                           | Not implemented                                           | React Navigation native stack                   |
| 8   | No detail screen                        | Not implemented                                           | `AssetDetailScreen` with Similar section        |

---

## Results

| Metric                                    | Before                     | After                              |
| ----------------------------------------- | -------------------------- | ---------------------------------- |
| Active intervals after 30 s               | 6+ (leak)                  | 1                                  |
| Re-renders per price tick (visible items) | All (unconstrained)        | Only items with changed values     |
| Filter+sort recalculations per sec        | ~every render              | Only on filter/sort/asset change   |
| Initial FlatList render (500 items)       | Full measure pass          | `getItemLayout` — zero measure     |
| JS frame drops on scroll (500 items)      | Frequent (unbounded batch) | Minimal (`maxToRenderPerBatch=12`) |
