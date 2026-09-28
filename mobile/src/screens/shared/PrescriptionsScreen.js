// MEMBER 5 - prescription history (patient sees own, doctor sees written ones)
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import AttachedFile from '../../components/AttachedFile';
import { getMyPrescriptions } from '../../api/prescriptionApi';
import { useAuth } from '../../context/AuthContext';
import { colors, shadow, radius } from '../../utils/theme';

export default function PrescriptionsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setItems(await getMyPrescriptions());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <Loader />;

  return (
    <View style={styles.wrap}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState message="No prescriptions yet" icon="document-text-outline" />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.bubble}>
                <Ionicons name="document-text-outline" size={16} color={colors.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.who} numberOfLines={1}>
                  {user?.role === 'doctor' ? item.patientId?.name : item.doctorId?.userId?.name}
                </Text>
                <Text style={styles.date}>{new Date(item.createdAt).toDateString()}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.label}>Diagnosis</Text>
            <Text style={styles.value}>{item.diagnosis}</Text>

            {item.medicines?.length > 0 && (
              <>
                <Text style={styles.label}>Medicines</Text>
                {item.medicines.map((m, index) => (
                  <View key={index} style={styles.medRow}>
                    <Ionicons name="ellipse" size={6} color={colors.primary} />
                    <Text style={styles.medText}>{m}</Text>
                  </View>
                ))}
              </>
            )}

            {item.notes ? (
              <>
                <Text style={styles.label}>Notes</Text>
                <Text style={styles.value}>{item.notes}</Text>
              </>
            ) : null}

            <AttachedFile label="Attached report" url={item.reportFile} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, marginBottom: 10, ...shadow },
  header: { flexDirection: 'row', alignItems: 'center' },
  bubble: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#E3F1F0',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  headerText: { flex: 1 },
  who: { fontWeight: '700', color: colors.text },
  date: { color: colors.muted, fontSize: 11, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  label: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 10 },
  value: { color: colors.text, marginTop: 3, lineHeight: 19 },
  medRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  medText: { color: colors.text, marginLeft: 8, flex: 1 },
  error: { color: colors.danger, paddingHorizontal: 16 },
});
