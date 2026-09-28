import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, tint } from '../utils/theme';

export default function EmptyState({ message = 'Nothing here yet', icon = 'file-tray-outline' }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bubble}>
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 36, alignItems: 'center' },
  bubble: {
    width: 62, height: 62, borderRadius: 31, marginBottom: 12,
    backgroundColor: tint(colors.primary),
    alignItems: 'center', justifyContent: 'center',
  },
  text: { color: colors.muted, textAlign: 'center' },
});
