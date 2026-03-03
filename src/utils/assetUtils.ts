import {Asset, FilterConfig, SortConfig} from '../types/asset';

/**
 * Filter assets by performance (gainers/losers) and type (stock/crypto).
 * Gainers: dailyChangePercent > 0
 * Losers:  dailyChangePercent < 0
 */
export function filterAssets(assets: Asset[], filter: FilterConfig): Asset[] {
  return assets.filter(asset => {
    if (
      filter.performance === 'gainers' &&
      asset.dailyChangePercent <= 0
    ) {
      return false;
    }
    if (
      filter.performance === 'losers' &&
      asset.dailyChangePercent >= 0
    ) {
      return false;
    }
    if (filter.type !== 'all' && asset.type !== filter.type) {
      return false;
    }
    return true;
  });
}

/**
 * Sort assets by name or dailyChangePercent in asc/desc order.
 * Returns a NEW array — never mutates the original.
 */
export function sortAssets(assets: Asset[], sort: SortConfig): Asset[] {
  const multiplier = sort.direction === 'asc' ? 1 : -1;
  return [...assets].sort((a, b) => {
    if (sort.field === 'name') {
      return multiplier * a.name.localeCompare(b.name);
    }
    return multiplier * (a.dailyChangePercent - b.dailyChangePercent);
  });
}

/**
 * Compose filter + sort in the correct order:
 * filter first (reduces set), then sort (deterministic on smaller set).
 */
export function filterAndSortAssets(
  assets: Asset[],
  filter: FilterConfig,
  sort: SortConfig,
): Asset[] {
  return sortAssets(filterAssets(assets, filter), sort);
}

/**
 * Returns all assets whose name matches the given name.
 * Used for the "Similar Assets" section on the detail screen.
 */
export function getSimilarAssets(assets: Asset[], name: string): Asset[] {
  return assets.filter(asset => asset.name === name);
}
