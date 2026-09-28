// MEMBER 1 - create and update a doctor
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, Switch } from 'react-native';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ImageUploadField from '../../components/ImageUploadField';
import { createDoctor, updateDoctor } from '../../api/doctorApi';
import { getSpecializations } from '../../api/specializationApi';
import { isEmail, isEmpty } from '../../utils/validation';
import { colors } from '../../utils/theme';

export default function DoctorFormScreen({ route, navigation }) {
  const editing = route.params?.doctor;
  const [specs, setSpecs] = useState([]);
  const [form, setForm] = useState({
    name: editing?.userId?.name || '',
    email: editing?.userId?.email || '',
    phone: editing?.userId?.phone || '',
    password: '',
    specializationId: editing?.specializationId?._id || '',
    qualifications: editing?.qualifications || '',
    experienceYears: String(editing?.experienceYears ?? ''),
    consultationFee: String(editing?.consultationFee ?? ''),
    about: editing?.about || '',
    photo: editing?.photo || '',
    isAvailable: editing?.isAvailable ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSpecializations().then(setSpecs).catch((err) => setError(err.message));
  }, []);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSave = async () => {
    if (isEmpty(form.name)) return setError('Name is required');
    if (!editing) {
      if (!isEmail(form.email)) return setError('Enter a valid email address');
      if (form.password.length < 6) return setError('Password must be at least 6 characters');
    }
    if (!form.specializationId) return setError('Please choose a specialization');

    const payload = {
      ...form,
      experienceYears: Number(form.experienceYears || 0),
      consultationFee: Number(form.consultationFee || 0),
    };

    try {
      setError('');
      setSaving(true);
      if (editing) await updateDoctor(editing._id, payload);
      else await createDoctor(payload);
      Alert.alert('Saved', editing ? 'Doctor updated' : 'Doctor created', [
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
      <AppInput label="Full name" value={form.name} onChangeText={(v) => onChange('name', v)} autoCapitalize="words" placeholder="Dr. Kamal Silva" />

      {!editing && (
        <>
          <AppInput label="Login email" value={form.email} onChangeText={(v) => onChange('email', v)} keyboardType="email-address" placeholder="doctor@clinic.com" />
          <AppInput label="Temporary password" value={form.password} onChangeText={(v) => onChange('password', v)} secureTextEntry placeholder="At least 6 characters" />
        </>
      )}

      <AppInput label="Phone" value={form.phone} onChangeText={(v) => onChange('phone', v)} keyboardType="phone-pad" placeholder="0771234567" />

      <Text style={styles.label}>Specialization</Text>
      <View style={styles.chips}>
        {specs.map((spec) => (
          <TouchableOpacity
            key={spec._id}
            style={[styles.chip, form.specializationId === spec._id && styles.chipActive]}
            onPress={() => onChange('specializationId', spec._id)}
          >
            <Text style={[styles.chipText, form.specializationId === spec._id && styles.chipTextActive]}>
              {spec.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <AppInput label="Qualifications" value={form.qualifications} onChangeText={(v) => onChange('qualifications', v)} placeholder="MBBS, MD" />
      <AppInput label="Experience (years)" value={form.experienceYears} onChangeText={(v) => onChange('experienceYears', v)} keyboardType="numeric" placeholder="8" />
      <AppInput label="Consultation fee (Rs.)" value={form.consultationFee} onChangeText={(v) => onChange('consultationFee', v)} keyboardType="numeric" placeholder="2500" />
      <AppInput label="About" value={form.about} onChangeText={(v) => onChange('about', v)} multiline autoCapitalize="sentences" placeholder="Available on weekday mornings" />

      <ImageUploadField label="Doctor photo" value={form.photo} onUploaded={(url) => onChange('photo', url)} />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Accepting patients</Text>
        <Switch value={form.isAvailable} onValueChange={(v) => onChange('isAvailable', v)} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton title={editing ? 'Update doctor' : 'Create doctor'} onPress={onSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  label: { marginBottom: 6, color: colors.text, fontWeight: '600', fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: {
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, marginRight: 8, marginBottom: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 12 },
  chipTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  error: { color: colors.danger, marginBottom: 12 },
});
