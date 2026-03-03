import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { Asset } from '../types/asset';
import { formatPrice, formatPercent } from '../utils/formatters';

export const ITEM_HEIGHT = 84;

interface Props {
  asset: Asset;
  onPress?: (asset: Asset) => void;
  style?: ViewStyle;
}

const AssetItem: React.FC<Props> = ({ asset, onPress, style }) => {
  const isPositive = asset.dailyChangePercent > 0;
  const changeColor = isPositive ? '#00C853' : '#FF1744';
  const changeBackground = isPositive
    ? 'rgba(0,200,83,0.12)'
    : 'rgba(255,23,68,0.12)';

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress ? () => onPress(asset) : undefined}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.left}>
        <View style={styles.symbolBadge}>
          <Text style={styles.symbolText}>{asset.symbol}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {asset.name}
          </Text>
          <Text style={styles.type}>{asset.type.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>{formatPrice(asset.currentPrice)}</Text>
        <View
          style={[styles.changePill, { backgroundColor: changeBackground }]}
        >
          <Text style={[styles.change, { color: changeColor }]}>
            {formatPercent(asset.dailyChangePercent)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

function arePropsEqual(prev: Props, next: Props): boolean {
  return (
    prev.asset.currentPrice === next.asset.currentPrice &&
    prev.asset.dailyChangePercent === next.asset.dailyChangePercent &&
    prev.onPress === next.onPress
  );
}

export default memo(AssetItem, arePropsEqual);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ITEM_HEIGHT,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  symbolBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(100,120,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  symbolText: {
    color: '#8899FF',
    fontSize: 11,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  type: {
    color: '#8899BB',
    fontSize: 11,
    fontWeight: '500',
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  changePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  change: {
    fontSize: 12,
    fontWeight: '700',
  },
});
