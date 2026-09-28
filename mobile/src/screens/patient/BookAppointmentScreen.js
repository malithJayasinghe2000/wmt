// MEMBER 3 - booking an appointment against a free slot
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ImageUploadField from '../../components/ImageUploadField';
import { getSchedules } from '../../api/scheduleApi';
import { bookAppointment } from '../../api/appointmentApi';
import { colors } from '../../utils/theme';

export default function BookAppointmentScreen({ route, navigation }) {
  const { doctor } = route.params;
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSchedules({ doctorId: doctor._id, free: 'true' })
      .then(setSlots)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [doctor._id]);

  const onBook = async () => {
    if (!selected) return setError('Please select a time slot');
    if (!reason.trim()) return setError('Please describe the reason for your visit');

    try {
      setError('');
      setSaving(true);
      await bookAppointment({ scheduleId: selected._id, reason: reason.trim(), attachment });
      Alert.alert('Requested', 'Your appointment is pending approval.', [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading free times..." />;

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{doctor.userId?.name}</Text>
      <Text style={styles.sub}>Pick a free time slot</Text>

      {slots.length === 0 ? (
        <EmptyState message="This doctor has no free slots right now" />
      ) : (
        <View style={styles.slotWrap}>
          {slots.map((slot) => {
            const active = selected?._id === slot._id;
            return (
              <TouchableOpacity
                key={slot._id}
                style={[styles.slot, active && styles.slotActive]}
                onPress={() => setSelected(slot)}
              >
                <Text style={[styles.slotDate, active && styles.slotTextActive]}>{slot.date}</Text>
                <Text style={[styles.slotTime, active && styles.slotTextActive]}>
                  {slot.startTime} - {slot.endTime}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <AppInput
        label="Reason for the visit"
        value={reason}
        onChangeText={setReason}
        placeholder="Fever and sore throat for 3 days"
        multiline
        autoCapitalize="sentences"
      />

      <ImageUploadField
        label="Attach a report (optional)"
        value={attachment}
        onUploaded={setAttachment}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton title="Request appointment" onPress={onBook} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  heading: { fontSize: 18, fontWeight: '800', color: colors.text },
  sub: { color: colors.muted, marginBottom: 12 },
  slotWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  slot: {
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
    borderRadius: 8, padding: 10, marginRight: 8, marginBottom: 8, minWidth: 120,
  },
  slotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotDate: { fontWeight: '700', color: colors.text, fontSize: 13 },
  slotTime: { color: colors.muted, fontSize: 12, marginTop: 2 },
  slotTextActive: { color: '#fff' },
  error: { color: colors.danger, marginBottom: 12 },
});
