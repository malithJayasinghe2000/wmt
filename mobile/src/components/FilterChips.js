import React from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';

// The row of filter buttons used on every list screen, so they all match.
// flexGrow: 0 is important: without it a horizontal ScrollView stretches
// down the whole screen and the chips become very tall.
export default function FilterChips({ options, value, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {options.map((option) => {
        const active = value === option;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(option)}
            activeOpacity={0.8}
          >
            <Text style={[styles.text, active && styles.textActive]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, maxHeight: 54 },
  row: { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    height: 34,
    justifyContent: 'center',
    borderRadius: 17,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 12, color: colors.text, fontWeight: '600' },
  textActive: { color: '#fff' },
});
