import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthBackground from '../../components/AuthBackground';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { validateLogin } from '../../utils/validation';
import { colors } from '../../utils/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async () => {
    const message = validateLogin(form);
    if (message) return setError(message);

    try {
      setError('');
      setLoading(true);
      await login(form.email.trim(), form.password);
      // RootNavigator swaps to the right tabs automatically
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
          <View style={styles.logoCircle}>
            <Ionicons name="medkit" size={34} color="#fff" />
          </View>

          <Text style={styles.title}>Clinic Appointments</Text>
          <Text style={styles.subtitle}>Book a doctor in a few taps</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in</Text>

            <AppInput
              label="Email"
              value={form.email}
              onChangeText={(v) => onChange('email', v)}
              placeholder="you@example.com"
              keyboardType="email-address"
            />

            <View>
              <AppInput
                label="Password"
                value={form.password}
                onChangeText={(v) => onChange('password', v)}
                placeholder="Your password"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eye} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <AppButton title="Login" onPress={onSubmit} loading={loading} />

            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>new here?</Text>
              <View style={styles.line} />
            </View>

            <AppButton
              title="Create a patient account"
              variant="outline"
              onPress={() => navigation.navigate('Register')}
            />
          </View>

          <Text style={styles.footer}>SE2020 Web and Mobile Technologies</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36, alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center', marginTop: 14 },
  subtitle: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 4, marginBottom: 24 },
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
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 14 },
  eye: { position: 'absolute', right: 12, top: 32 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FDECEA', borderRadius: 8, padding: 10, marginBottom: 12,
  },
  error: { color: colors.danger, marginLeft: 6, flex: 1, fontSize: 13 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.muted, fontSize: 12, marginHorizontal: 10 },
  footer: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: 11, marginTop: 24 },
});
