import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';

// A small icon + text line used inside appointment and prescription cards.
export default function InfoRow({ icon, text, color = colors.muted }) {
  if (!text) return null;
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={[styles.text, { color }]} numberOfLines={2}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  text: { fontSize: 13, marginLeft: 6, flex: 1 },
});
