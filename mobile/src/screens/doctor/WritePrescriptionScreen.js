// MEMBER 5 - the doctor writes the prescription after a completed visit
import React, { useState } from 'react';
import { Text, ScrollView, StyleSheet, Alert } from 'react-native';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ImageUploadField from '../../components/ImageUploadField';
import { createPrescription } from '../../api/prescriptionApi';
import { colors } from '../../utils/theme';

export default function WritePrescriptionScreen({ route, navigation }) {
  const { appointment } = route.params;
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('');
  const [notes, setNotes] = useState('');
  const [reportFile, setReportFile] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onSave = async () => {
    if (!diagnosis.trim()) return setError('Diagnosis is required');

    try {
      setError('');
      setSaving(true);
      await createPrescription({
        appointmentId: appointment._id,
        diagnosis: diagnosis.trim(),
        // one medicine per line in the box, sent as an array
        medicines: medicines.split('\n').map((m) => m.trim()).filter(Boolean),
        notes: notes.trim(),
        reportFile,
      });
      Alert.alert('Saved', 'The patient can now see the prescription.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Text style={styles.patient}>{appointment.patientId?.name}</Text>
      <Text style={styles.meta}>
        Visit on {appointment.scheduleId?.date} at {appointment.scheduleId?.startTime}
      </Text>

      <AppInput label="Diagnosis" value={diagnosis} onChangeText={setDiagnosis} placeholder="Viral fever" autoCapitalize="sentences" />
      <AppInput
        label="Medicines (one per line)"
        value={medicines}
        onChangeText={setMedicines}
        placeholder={'Paracetamol 500mg - twice a day\nVitamin C - once a day'}
        multiline
        numberOfLines={4}
        style={styles.multiline}
        autoCapitalize="sentences"
      />
      <AppInput label="Notes" value={notes} onChangeText={setNotes} placeholder="Rest for 3 days, drink water" multiline autoCapitalize="sentences" />

      <ImageUploadField label="Attach a report (optional)" value={reportFile} onUploaded={setReportFile} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton title="Save prescription" onPress={onSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  patient: { fontSize: 18, fontWeight: '800', color: colors.text },
  meta: { color: colors.muted, marginBottom: 16 },
  multiline: { minHeight: 90 },
  error: { color: colors.danger, marginBottom: 12 },
});
