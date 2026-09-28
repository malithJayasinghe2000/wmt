// MEMBER 4 - admin dashboard counts
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Loader from '../../components/Loader';
import { getStats } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { colors, shadow, radius, tint } from '../../utils/theme';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setStats(await getStats());
    } catch (err) {
      setError(err.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (!stats && !error) return <Loader />;

  const tiles = stats
    ? [
        { label: 'Patients', value: stats.patients, icon: 'people-outline', color: '#0E7C7B' },
        { label: 'Doctors', value: stats.doctors, icon: 'medkit-outline', color: '#2D6CDF' },
        { label: 'Pending', value: stats.pending, icon: 'hourglass-outline', color: '#B8860B' },
        { label: 'Confirmed', value: stats.confirmed, icon: 'checkmark-circle-outline', color: '#2E7D32' },
        { label: 'Completed', value: stats.completed, icon: 'clipboard-outline', color: '#6A4C93' },
        { label: 'Total visits', value: stats.totalAppointments, icon: 'calendar-outline', color: '#C0392B' },
      ]
    : [];

  return (
    <ScrollView
      style={styles.wrap}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.greeting}>
        <View>
          <Text style={styles.hello}>Welcome back</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#fff" />
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>Clinic at a glance</Text>

      <View style={styles.grid}>
        {tiles.map((tile) => (
          <View key={tile.label} style={styles.tile}>
            <View style={[styles.bubble, { backgroundColor: tint(tile.color) }]}>
              <Ionicons name={tile.icon} size={18} color={tile.color} />
            </View>
            <Text style={styles.value}>{tile.value}</Text>
            <Text style={styles.label}>{tile.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>Pull down to refresh</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  greeting: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.primary, borderRadius: radius.lg, padding: 18, marginBottom: 20, ...shadow,
  },
  hello: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  name: { color: '#fff', fontSize: 19, fontWeight: '800', marginTop: 2 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: {
    width: '48%', backgroundColor: colors.card, borderRadius: radius.md, padding: 16,
    marginBottom: 12, ...shadow,
  },
  bubble: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  value: { fontSize: 24, fontWeight: '800', color: colors.text },
  label: { color: colors.muted, marginTop: 2, fontSize: 12 },
  error: { color: colors.danger, marginBottom: 12 },
  hint: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 8 },
});
