import React, {memo} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {SortConfig, SortField, SortDirection} from '../types/asset';

interface Props {
  sort: SortConfig;
  onSortChange: (sort: SortConfig) => void;
}

interface SortButton {
  label: string;
  field: SortField;
  direction: SortDirection;
}

const SORT_BUTTONS: SortButton[] = [
  {label: 'Name ↑', field: 'name', direction: 'asc'},
  {label: 'Name ↓', field: 'name', direction: 'desc'},
  {label: 'Perf ↑', field: 'dailyChangePercent', direction: 'asc'},
  {label: 'Perf ↓', field: 'dailyChangePercent', direction: 'desc'},
];

const SortBar: React.FC<Props> = ({sort, onSortChange}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sort</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.buttons}>
        {SORT_BUTTONS.map(btn => {
          const isActive =
            sort.field === btn.field && sort.direction === btn.direction;
          return (
            <TouchableOpacity
              key={`${btn.field}-${btn.direction}`}
              style={[styles.button, isActive && styles.buttonActive]}
              onPress={() =>
                onSortChange({field: btn.field, direction: btn.direction})
              }
              activeOpacity={0.7}>
              <Text
                style={[styles.buttonText, isActive && styles.buttonTextActive]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default memo(SortBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  label: {
    color: '#8899BB',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttons: {
    flexDirection: 'row',
    gap: 6,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'transparent',
  },
  buttonActive: {
    backgroundColor: '#4455FF',
    borderColor: '#4455FF',
  },
  buttonText: {
    color: '#8899BB',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
});
