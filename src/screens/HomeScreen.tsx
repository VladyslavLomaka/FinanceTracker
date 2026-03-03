import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ListRenderItem,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Asset, FilterConfig, SortConfig } from '../types/asset';
import { filterAndSortAssets } from '../utils/assetUtils';
import { useAssets } from '../context/AssetsContext';
import AssetItem, { ITEM_HEIGHT } from '../components/AssetItem';
import FilterBar from '../components/FilterBar';
import SortBar from '../components/SortBar';
import { RootStackParamList } from '../navigation/RootNavigator';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeNavProp;
}

const DEFAULT_FILTER: FilterConfig = { performance: 'all', type: 'all' };
const DEFAULT_SORT: SortConfig = { field: 'name', direction: 'asc' };

const ITEM_MARGIN = 8;
const EFFECTIVE_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_MARGIN;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const assets = useAssets();
  const [filter, setFilter] = useState<FilterConfig>(DEFAULT_FILTER);
  const [sort, setSort] = useState<SortConfig>(DEFAULT_SORT);

  /**
   * useMemo is critical here: filterAndSortAssets is O(n log n).
   * Without memoization it would run on every price-update re-render (every 3s).
   * With memo it only runs when filter, sort, or assets actually change.
   */
  const displayedAssets = useMemo(
    () => filterAndSortAssets(assets, filter, sort),
    [assets, filter, sort],
  );

  const handleAssetPress = useCallback(
    (asset: Asset) => {
      navigation.navigate('AssetDetail', { assetId: asset.id });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<Asset> = useCallback(
    ({ item }) => <AssetItem asset={item} onPress={handleAssetPress} />,
    [handleAssetPress],
  );

  const keyExtractor = useCallback((item: Asset) => String(item.id), []);

  /**
   * getItemLayout skips the layout measurement phase for each item.
   * Critical for smooth infinite scroll on 500+ items — without it,
   * FlatList must measure every item as it enters the viewport.
   * Requires all items to have a consistent, fixed height.
   */
  const getItemLayout = useCallback(
    (_: ArrayLike<Asset> | null | undefined, index: number) => ({
      length: EFFECTIVE_ITEM_HEIGHT,
      offset: EFFECTIVE_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D2B" />
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio Tracker</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{displayedAssets.length} assets</Text>
        </View>
      </View>
      <FilterBar filter={filter} onFilterChange={setFilter} />
      <View style={styles.divider} />
      <SortBar sort={sort} onSortChange={setSort} />
      <View style={styles.divider} />
      <FlatList
        data={displayedAssets}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={12}
        windowSize={7}
        initialNumToRender={14}
        updateCellsBatchingPeriod={80}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D2B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: 'rgba(68,85,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    color: '#8899FF',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 12,
  },
  listContent: {
    paddingVertical: 8,
  },
});
