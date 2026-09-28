import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow, radius } from '../utils/theme';

export default function DoctorCard({ doctor, onPress, onDelete }) {
  const name = doctor.userId?.name || 'Doctor';
  const specialization = doctor.specializationId?.name || 'General';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {doctor.photo ? (
        <Image source={{ uri: doctor.photo }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.placeholder]}>
          <Text style={styles.initial}>{name.charAt(0).toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>

        <View style={styles.specRow}>
          <Ionicons name="pulse-outline" size={12} color={colors.primary} />
          <Text style={styles.spec} numberOfLines={1}>{specialization}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.pill}>
            <Ionicons name="ribbon-outline" size={11} color={colors.muted} />
            <Text style={styles.pillText}>{doctor.experienceYears} yrs</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="cash-outline" size={11} color={colors.muted} />
            <Text style={styles.pillText}>Rs. {doctor.consultationFee}</Text>
          </View>
        </View>

        {!doctor.isAvailable && (
          <Text style={styles.off}>Not accepting patients</Text>
        )}
      </View>

      {onDelete ? (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.border} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.md,
    padding: 12, marginBottom: 10, ...shadow,
  },
  photo: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  placeholder: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#fff', fontSize: 22, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  specRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  spec: { color: colors.primary, fontSize: 12, marginLeft: 4 },
  metaRow: { flexDirection: 'row', marginTop: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginRight: 6,
  },
  pillText: { color: colors.muted, fontSize: 11, marginLeft: 3 },
  off: { color: colors.danger, fontSize: 11, marginTop: 6 },
  deleteBtn: { padding: 6, marginLeft: 4 },
});
