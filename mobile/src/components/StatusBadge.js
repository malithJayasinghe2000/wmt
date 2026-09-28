import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { statusColor } from '../utils/theme';

export default function StatusBadge({ status }) {
  const color = statusColor(status);
  return (
    <View style={[styles.badge, { backgroundColor: `${color}1A`, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  text: { fontSize: 11, fontWeight: '700' },
});
