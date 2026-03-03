import React, {memo} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {FilterConfig, FilterPerformance, FilterAssetType} from '../types/asset';

interface Props {
  filter: FilterConfig;
  onFilterChange: (filter: FilterConfig) => void;
}

const PERF_OPTIONS: {label: string; value: FilterPerformance}[] = [
  {label: 'All', value: 'all'},
  {label: '↑ Gainers', value: 'gainers'},
  {label: '↓ Losers', value: 'losers'},
];

const TYPE_OPTIONS: {label: string; value: FilterAssetType}[] = [
  {label: 'All', value: 'all'},
  {label: 'Stocks', value: 'stock'},
  {label: 'Crypto', value: 'crypto'},
];

const FilterBar: React.FC<Props> = ({filter, onFilterChange}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Perf</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pills}>
          {PERF_OPTIONS.map(opt => {
            const isActive = filter.performance === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() =>
                  onFilterChange({...filter, performance: opt.value})
                }
                activeOpacity={0.7}>
                <Text
                  style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pills}>
          {TYPE_OPTIONS.map(opt => {
            const isActive = filter.type === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => onFilterChange({...filter, type: opt.value})}
                activeOpacity={0.7}>
                <Text
                  style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

export default memo(FilterBar);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#8899BB',
    fontSize: 12,
    fontWeight: '600',
    width: 38,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pills: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pillActive: {
    backgroundColor: '#4455FF',
    borderColor: '#4455FF',
  },
  pillText: {
    color: '#8899BB',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
});
