import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ListRenderItem,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

import { Asset, SortConfig } from '../types/asset';
import { getSimilarAssets, sortAssets } from '../utils/assetUtils';
import { formatPrice, formatPercent } from '../utils/formatters';
import { useAssets } from '../context/AssetsContext';
import AssetItem, { ITEM_HEIGHT } from '../components/AssetItem';
import SortBar from '../components/SortBar';
import { RootStackParamList } from '../navigation/RootNavigator';

type DetailNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'AssetDetail'
>;
type DetailRouteProp = RouteProp<RootStackParamList, 'AssetDetail'>;

interface Props {
  navigation: DetailNavProp;
  route: DetailRouteProp;
}

const DEFAULT_SORT: SortConfig = { field: 'name', direction: 'asc' };
const ITEM_MARGIN = 8;
const EFFECTIVE_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_MARGIN;

const AssetDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { assetId } = route.params;
  const assets = useAssets();
  const [sort, setSort] = useState<SortConfig>(DEFAULT_SORT);

  const asset = useMemo(
    () => assets.find(a => a.id === assetId),
    [assets, assetId],
  );

  const similarAssets = useMemo(() => {
    if (!asset) {
      return [];
    }
    const withSameName = getSimilarAssets(assets, asset.name);
    return sortAssets(withSameName, sort);
  }, [assets, asset, sort]);

  const renderSimilarItem: ListRenderItem<Asset> = useCallback(
    ({ item }) => <AssetItem asset={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Asset) => String(item.id), []);

  const getItemLayout = useCallback(
    (_: ArrayLike<Asset> | null | undefined, index: number) => ({
      length: EFFECTIVE_ITEM_HEIGHT,
      offset: EFFECTIVE_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  if (!asset) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Asset not found.</Text>
      </SafeAreaView>
    );
  }

  const isPositive = asset.dailyChangePercent > 0;
  const changeColor = isPositive ? '#00C853' : '#FF1744';

  const ListHeader = (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.symbolCircle}>
            <Text style={styles.symbolText}>{asset.symbol}</Text>
          </View>
          <View style={styles.cardTitles}>
            <Text style={styles.assetName}>{asset.name}</Text>
            <Text style={styles.assetType}>{asset.type.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Symbol</Text>
          <Text style={styles.fieldValue}>{asset.symbol}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Type</Text>
          <Text style={styles.fieldValue}>{asset.type}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Current Price</Text>
          <Text style={styles.fieldValue}>
            {formatPrice(asset.currentPrice)}
          </Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Daily Change</Text>
          <Text style={[styles.fieldValue, { color: changeColor }]}>
            {formatPercent(asset.dailyChangePercent)}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Similar Assets</Text>
        <Text style={styles.sectionCount}>{similarAssets.length}</Text>
      </View>
      <SortBar sort={sort} onSortChange={setSort} />
      <View style={styles.divider} />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={similarAssets}
        renderItem={renderSimilarItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={ListHeader}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No similar assets found.</Text>
        }
      />
    </SafeAreaView>
  );
};

export default AssetDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D2B',
  },
  notFound: {
    color: '#8899BB',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: {
    color: '#8899FF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 12,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbolCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(100,120,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  symbolText: {
    color: '#8899FF',
    fontSize: 13,
    fontWeight: '800',
  },
  cardTitles: {
    flex: 1,
  },
  assetName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  assetType: {
    color: '#8899BB',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  fieldLabel: {
    color: '#8899BB',
    fontSize: 14,
    fontWeight: '500',
  },
  fieldValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  sectionCount: {
    color: '#8899FF',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(68,85,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    color: '#8899BB',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
