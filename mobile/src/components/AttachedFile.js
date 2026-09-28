import React from 'react';
import { View, Text, Image, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';

// Shows a file that was uploaded with an appointment or a prescription.
// Images are shown directly. A PDF cannot be drawn, so it opens in the browser.
export default function AttachedFile({ label = 'Attached report', url }) {
  if (!url) return null;

  const isPdf = url.toLowerCase().endsWith('.pdf');

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>

      {isPdf ? (
        <TouchableOpacity onPress={() => Linking.openURL(url)}>
          <Text style={styles.link}>Open PDF report</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => Linking.openURL(url)} activeOpacity={0.9}>
          <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
          <Text style={styles.hint}>Tap to open full size</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  label: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  image: {
    width: '100%', height: 170, borderRadius: 8, marginTop: 6,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
  },
  hint: { color: colors.muted, fontSize: 11, marginTop: 4 },
  link: { color: colors.primary, marginTop: 4, textDecorationLine: 'underline' },
});
