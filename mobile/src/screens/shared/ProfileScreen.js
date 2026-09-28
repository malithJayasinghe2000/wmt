// MEMBER 6 - profile with avatar upload, and logout
import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ImageUploadField from '../../components/ImageUploadField';
import { useAuth } from '../../context/AuthContext';
import { updateMe } from '../../api/authApi';
import { isEmpty, isPhone } from '../../utils/validation';
import { colors, shadow, radius } from '../../utils/theme';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSave = async () => {
    if (isEmpty(form.name)) return setError('Name is required');
    if (!isEmpty(form.phone) && !isPhone(form.phone)) return setError('Phone must be 9 to 12 digits');
    if (form.password && form.password.length < 6) return setError('Password must be at least 6 characters');

    try {
      setError('');
      setSaving(true);
      const payload = { name: form.name, phone: form.phone, avatar: form.avatar };
      if (form.password) payload.password = form.password;
      await updateMe(payload);
      await refreshUser();
      setForm((prev) => ({ ...prev, password: '' }));
      Alert.alert('Saved', 'Your profile was updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const initial = (form.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      {/* The one and only place the avatar is shown */}
      <View style={styles.header}>
        {form.avatar ? (
          <Image source={{ uri: form.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholder]}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}

        <Text style={styles.name}>{form.name || 'Your name'}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.rolePill}>
          <Ionicons name="shield-checkmark-outline" size={12} color={colors.primary} />
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Edit details</Text>

        <AppInput label="Name" value={form.name} onChangeText={(v) => onChange('name', v)} autoCapitalize="words" />
        <AppInput label="Phone" value={form.phone} onChangeText={(v) => onChange('phone', v)} keyboardType="phone-pad" placeholder="0771234567" />
        <AppInput
          label="New password (optional)"
          value={form.password}
          onChangeText={(v) => onChange('password', v)}
          secureTextEntry
          placeholder="Leave empty to keep the old one"
        />

        {/* showPreview is off: the circle above already shows the picture */}
        <ImageUploadField
          label="Profile photo"
          value={form.avatar}
          onUploaded={(url) => onChange('avatar', url)}
          showPreview={false}
        />

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <AppButton title="Save changes" onPress={onSave} loading={saving} />
      </View>

      <AppButton title="Logout" variant="danger" style={styles.logout} onPress={logout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  header: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: '#fff', ...shadow },
  placeholder: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#fff', fontSize: 34, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 12 },
  email: { color: colors.muted, marginTop: 2, fontSize: 13 },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', marginTop: 8,
    backgroundColor: '#E3F1F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  roleText: { color: colors.primary, fontSize: 11, fontWeight: '700', marginLeft: 4, textTransform: 'uppercase' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, ...shadow },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 14 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FDECEA', borderRadius: 8, padding: 10, marginBottom: 12,
  },
  error: { color: colors.danger, marginLeft: 6, flex: 1, fontSize: 13 },
  logout: { marginTop: 16 },
});
