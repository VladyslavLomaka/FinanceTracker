export type AssetType = 'stock' | 'crypto';

export interface Asset {
  id: number;
  name: string;
  symbol: string;
  type: AssetType;
  currentPrice: number;
  dailyChangePercent: number;
}

export type SortField = 'name' | 'dailyChangePercent';
export type SortDirection = 'asc' | 'desc';
export type FilterPerformance = 'all' | 'gainers' | 'losers';
export type FilterAssetType = 'all' | 'stock' | 'crypto';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  performance: FilterPerformance;
  type: FilterAssetType;
}
