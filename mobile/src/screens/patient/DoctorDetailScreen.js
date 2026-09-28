import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../../components/AppButton';
import Loader from '../../components/Loader';
import { getDoctor } from '../../api/doctorApi';
import { colors, shadow, radius } from '../../utils/theme';

export default function DoctorDetailScreen({ route, navigation }) {
  const { doctorId } = route.params;
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDoctor(doctorId).then(setDoctor).catch((err) => setError(err.message));
  }, [doctorId]);

  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!doctor) return <Loader />;

  const name = doctor.userId?.name || 'Doctor';

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        {doctor.photo ? (
          <Image source={{ uri: doctor.photo }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.placeholder]}>
            <Text style={styles.initial}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <Text style={styles.name}>{name}</Text>

        <View style={styles.specPill}>
          <Ionicons name="pulse-outline" size={12} color={colors.primary} />
          <Text style={styles.spec}>{doctor.specializationId?.name}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Stat icon="ribbon-outline" value={`${doctor.experienceYears}`} label="years" />
        <Stat icon="cash-outline" value={`Rs. ${doctor.consultationFee}`} label="per visit" />
        <Stat
          icon={doctor.isAvailable ? 'checkmark-circle-outline' : 'close-circle-outline'}
          value={doctor.isAvailable ? 'Open' : 'Closed'}
          label="booking"
        />
      </View>

      <View style={styles.card}>
        <Row icon="school-outline" label="Qualifications" value={doctor.qualifications || 'Not listed'} />
        <Row icon="call-outline" label="Contact" value={doctor.userId?.phone || 'Via clinic'} />
        {doctor.about ? <Row icon="information-circle-outline" label="About" value={doctor.about} /> : null}
      </View>

      <AppButton
        title="See available times"
        onPress={() => navigation.navigate('BookAppointment', { doctor })}
      />
    </ScrollView>
  );
}

const Stat = ({ icon, value, label }) => (
  <View style={styles.stat}>
    <Ionicons name={icon} size={16} color={colors.primary} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Row = ({ icon, label, value }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={15} color={colors.muted} style={styles.rowIcon} />
    <View style={styles.rowBody}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  hero: { alignItems: 'center', marginBottom: 18 },
  photo: { width: 104, height: 104, borderRadius: 52, borderWidth: 3, borderColor: '#fff', ...shadow },
  placeholder: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#fff', fontSize: 38, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 12 },
  specPill: {
    flexDirection: 'row', alignItems: 'center', marginTop: 8,
    backgroundColor: '#E3F1F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  spec: { color: colors.primary, marginLeft: 4, fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  stat: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: 12,
    alignItems: 'center', marginHorizontal: 4, ...shadow,
  },
  statValue: { fontWeight: '800', color: colors.text, marginTop: 6, fontSize: 14 },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 2 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, marginBottom: 16, ...shadow },
  row: { flexDirection: 'row', paddingVertical: 8 },
  rowIcon: { marginTop: 2 },
  rowBody: { flex: 1, marginLeft: 10 },
  rowLabel: { color: colors.muted, fontSize: 11, textTransform: 'uppercase', fontWeight: '700' },
  rowValue: { color: colors.text, marginTop: 3, lineHeight: 19 },
  error: { color: colors.danger, padding: 16 },
});
