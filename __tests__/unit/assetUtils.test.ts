import {
  filterAssets,
  sortAssets,
  filterAndSortAssets,
  getSimilarAssets,
} from '../../src/utils/assetUtils';
import { Asset, FilterConfig, SortConfig } from '../../src/types/asset';

const makeAsset = (overrides: Partial<Asset>): Asset => ({
  id: 1,
  name: 'Test Asset',
  symbol: 'TA',
  type: 'stock',
  currentPrice: 100,
  dailyChangePercent: 0,
  ...overrides,
});

const FIXTURES: Asset[] = [
  makeAsset({
    id: 1,
    name: 'Apple Inc.',
    type: 'stock',
    dailyChangePercent: 3.5,
    currentPrice: 180,
  }),
  makeAsset({
    id: 2,
    name: 'Bitcoin',
    type: 'crypto',
    dailyChangePercent: -2.1,
    currentPrice: 42000,
  }),
  makeAsset({
    id: 3,
    name: 'Tesla Inc.',
    type: 'stock',
    dailyChangePercent: 1.2,
    currentPrice: 250,
  }),
  makeAsset({
    id: 4,
    name: 'Ethereum',
    type: 'crypto',
    dailyChangePercent: -0.5,
    currentPrice: 2800,
  }),
  makeAsset({
    id: 5,
    name: 'Amazon.com Inc.',
    type: 'stock',
    dailyChangePercent: 0,
    currentPrice: 130,
  }),
];

describe('filterAssets', () => {
  const all: FilterConfig = { performance: 'all', type: 'all' };
  it('returns all assets when performance=all and type=all', () => {
    expect(filterAssets(FIXTURES, all)).toHaveLength(FIXTURES.length);
  });
  it('filters gainers correctly (dailyChangePercent > 0)', () => {
    const result = filterAssets(FIXTURES, { ...all, performance: 'gainers' });
    expect(result).toHaveLength(2);
    result.forEach(a => expect(a.dailyChangePercent).toBeGreaterThan(0));
  });
  it('excludes zero-change assets from gainers', () => {
    const result = filterAssets(FIXTURES, { ...all, performance: 'gainers' });
    const zeroDPC = result.find(a => a.dailyChangePercent === 0);
    expect(zeroDPC).toBeUndefined();
  });
  it('filters losers correctly (dailyChangePercent < 0)', () => {
    const result = filterAssets(FIXTURES, { ...all, performance: 'losers' });
    expect(result).toHaveLength(2);
    result.forEach(a => expect(a.dailyChangePercent).toBeLessThan(0));
  });
  it('excludes zero-change assets from losers', () => {
    const result = filterAssets(FIXTURES, { ...all, performance: 'losers' });
    const zeroDPC = result.find(a => a.dailyChangePercent === 0);
    expect(zeroDPC).toBeUndefined();
  });
  it('filters by type=stock', () => {
    const result = filterAssets(FIXTURES, { ...all, type: 'stock' });
    expect(result).toHaveLength(3);
    result.forEach(a => expect(a.type).toBe('stock'));
  });
  it('filters by type=crypto', () => {
    const result = filterAssets(FIXTURES, { ...all, type: 'crypto' });
    expect(result).toHaveLength(2);
    result.forEach(a => expect(a.type).toBe('crypto'));
  });
  it('combines performance and type filters (gainers + crypto)', () => {
    const result = filterAssets(FIXTURES, {
      performance: 'gainers',
      type: 'crypto',
    });
    expect(result).toHaveLength(0);
  });
  it('combines performance and type filters (gainers + stock)', () => {
    const result = filterAssets(FIXTURES, {
      performance: 'gainers',
      type: 'stock',
    });
    expect(result).toHaveLength(2);
    result.forEach(a => {
      expect(a.type).toBe('stock');
      expect(a.dailyChangePercent).toBeGreaterThan(0);
    });
  });
  it('does not mutate the original array', () => {
    const copy = [...FIXTURES];
    filterAssets(FIXTURES, { performance: 'gainers', type: 'all' });
    expect(FIXTURES).toEqual(copy);
  });
});

describe('sortAssets', () => {
  it('sorts by name ascending', () => {
    const sort: SortConfig = { field: 'name', direction: 'asc' };
    const result = sortAssets(FIXTURES, sort);
    const names = result.map(a => a.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
  it('sorts by name descending', () => {
    const sort: SortConfig = { field: 'name', direction: 'desc' };
    const result = sortAssets(FIXTURES, sort);
    const names = result.map(a => a.name);
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });
  it('sorts by dailyChangePercent ascending', () => {
    const sort: SortConfig = { field: 'dailyChangePercent', direction: 'asc' };
    const result = sortAssets(FIXTURES, sort);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].dailyChangePercent).toBeGreaterThanOrEqual(
        result[i - 1].dailyChangePercent,
      );
    }
  });
  it('sorts by dailyChangePercent descending', () => {
    const sort: SortConfig = { field: 'dailyChangePercent', direction: 'desc' };
    const result = sortAssets(FIXTURES, sort);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].dailyChangePercent).toBeLessThanOrEqual(
        result[i - 1].dailyChangePercent,
      );
    }
  });
  it('does NOT mutate the original array', () => {
    const original = [...FIXTURES];
    const sort: SortConfig = { field: 'name', direction: 'asc' };
    sortAssets(FIXTURES, sort);
    expect(FIXTURES.map(a => a.id)).toEqual(original.map(a => a.id));
  });
  it('returns a new array reference', () => {
    const sort: SortConfig = { field: 'name', direction: 'asc' };
    const result = sortAssets(FIXTURES, sort);
    expect(result).not.toBe(FIXTURES);
  });
});

describe('filterAndSortAssets', () => {
  it('applies filter before sort', () => {
    const filter: FilterConfig = { performance: 'gainers', type: 'all' };
    const sort: SortConfig = { field: 'dailyChangePercent', direction: 'desc' };
    const result = filterAndSortAssets(FIXTURES, filter, sort);
    result.forEach(a => expect(a.dailyChangePercent).toBeGreaterThan(0));
    for (let i = 1; i < result.length; i++) {
      expect(result[i].dailyChangePercent).toBeLessThanOrEqual(
        result[i - 1].dailyChangePercent,
      );
    }
  });

  it('returns empty array when no assets match filter', () => {
    const filter: FilterConfig = { performance: 'gainers', type: 'crypto' };
    const sort: SortConfig = { field: 'name', direction: 'asc' };
    const result = filterAndSortAssets(FIXTURES, filter, sort);
    expect(result).toHaveLength(0);
  });
});

describe('getSimilarAssets', () => {
  const multi: Asset[] = [
    makeAsset({
      id: 1,
      name: 'Bitcoin',
      type: 'crypto',
      dailyChangePercent: 1,
    }),
    makeAsset({
      id: 2,
      name: 'Bitcoin',
      type: 'crypto',
      dailyChangePercent: -2,
    }),
    makeAsset({
      id: 3,
      name: 'Ethereum',
      type: 'crypto',
      dailyChangePercent: 0.5,
    }),
    makeAsset({
      id: 4,
      name: 'Apple Inc.',
      type: 'stock',
      dailyChangePercent: 3,
    }),
  ];
  it('returns all assets matching the given name', () => {
    const result = getSimilarAssets(multi, 'Bitcoin');
    expect(result).toHaveLength(2);
    result.forEach(a => expect(a.name).toBe('Bitcoin'));
  });
  it('returns empty array when no match', () => {
    const result = getSimilarAssets(multi, 'Solana');
    expect(result).toHaveLength(0);
  });
  it('is case-sensitive (exact match)', () => {
    const result = getSimilarAssets(multi, 'bitcoin');
    expect(result).toHaveLength(0);
  });
  it('does not mutate the original array', () => {
    const copy = [...multi];
    getSimilarAssets(multi, 'Bitcoin');
    expect(multi).toEqual(copy);
  });
});
