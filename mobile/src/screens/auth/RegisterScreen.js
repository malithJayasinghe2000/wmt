import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthBackground from '../../components/AuthBackground';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { validateRegister } from '../../utils/validation';
import { colors } from '../../utils/theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async () => {
    const message = validateRegister(form);
    if (message) return setError(message);

    try {
      setError('');
      setLoading(true);
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>For patients booking a visit</Text>

          <View style={styles.card}>
            <AppInput label="Full name" value={form.name} onChangeText={(v) => onChange('name', v)} placeholder="Nimal Perera" autoCapitalize="words" />
            <AppInput label="Email" value={form.email} onChangeText={(v) => onChange('email', v)} placeholder="you@example.com" keyboardType="email-address" />
            <AppInput label="Phone" value={form.phone} onChangeText={(v) => onChange('phone', v)} placeholder="0771234567" keyboardType="phone-pad" />
            <AppInput label="Password" value={form.password} onChangeText={(v) => onChange('password', v)} placeholder="At least 6 characters" secureTextEntry />
            <AppInput label="Confirm password" value={form.confirm} onChangeText={(v) => onChange('confirm', v)} placeholder="Repeat the password" secureTextEntry />

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <AppButton title="Register" onPress={onSubmit} loading={loading} />
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.footer}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FDECEA', borderRadius: 8, padding: 10, marginBottom: 12,
  },
  error: { color: colors.danger, marginLeft: 6, flex: 1, fontSize: 13 },
  footer: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 20, fontWeight: '600' },
});
