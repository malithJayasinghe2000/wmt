// MEMBER 4 - the doctor confirms, rejects and completes appointments
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import FilterChips from '../../components/FilterChips';
import InfoRow from '../../components/InfoRow';
import AttachedFile from '../../components/AttachedFile';
import { getAllAppointments, updateAppointmentStatus } from '../../api/appointmentApi';
import { colors, shadow, radius } from '../../utils/theme';

const FILTERS = ['All', 'Pending', 'Confirmed', 'Completed'];

export default function DoctorAppointmentsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (status = filter) => {
    try {
      setError('');
      const params = status === 'All' ? {} : { status };
      setItems(await getAllAppointments(params));
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

  useFocusEffect(useCallback(() => { load(); }, [filter]));

  const changeStatus = async (item, status) => {
    try {
      await updateAppointmentStatus(item._id, status);
      load();
    } catch (err) {
      Alert.alert('Could not update', err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.wrap}>
      <FilterChips
        options={FILTERS}
        value={filter}
        onChange={(f) => { setLoading(true); setFilter(f); }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState message="No appointments in this filter" icon="calendar-outline" />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.patientRow}>
                <View style={styles.bubble}>
                  <Text style={styles.initial}>
                    {(item.patientId?.name || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.patient} numberOfLines={1}>{item.patientId?.name}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>

            <InfoRow
              icon="calendar-outline"
              text={`${item.scheduleId?.date}  ·  ${item.scheduleId?.startTime} - ${item.scheduleId?.endTime}`}
              color={colors.primary}
            />
            <InfoRow icon="chatbubble-ellipses-outline" text={item.reason} />
            <InfoRow icon="call-outline" text={item.patientId?.phone} />

            <AttachedFile label="Patient's report" url={item.attachment} />

            <View style={styles.actions}>
              {item.status === 'Pending' && (
                <>
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => changeStatus(item, 'Confirmed')}>
                    <Ionicons name="checkmark" size={15} color="#fff" />
                    <Text style={styles.primaryText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.ghostBtn} onPress={() => changeStatus(item, 'Rejected')}>
                    <Ionicons name="close" size={15} color={colors.danger} />
                    <Text style={styles.ghostText}>Reject</Text>
                  </TouchableOpacity>
                </>
              )}

              {item.status === 'Confirmed' && (
                <TouchableOpacity style={styles.primaryBtn} onPress={() => changeStatus(item, 'Completed')}>
                  <Ionicons name="checkmark-done" size={15} color="#fff" />
                  <Text style={styles.primaryText}>Mark completed</Text>
                </TouchableOpacity>
              )}

              {item.status === 'Completed' && (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => navigation.navigate('WritePrescription', { appointment: item })}
                >
                  <Ionicons name="create-outline" size={15} color="#fff" />
                  <Text style={styles.primaryText}>Write prescription</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, paddingTop: 4 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, marginBottom: 10, ...shadow },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  patientRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  bubble: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  initial: { color: '#fff', fontWeight: '700', fontSize: 13 },
  patient: { fontWeight: '700', color: colors.text, flexShrink: 1 },
  actions: {
    flexDirection: 'row', marginTop: 12, borderTopWidth: 1,
    borderTopColor: colors.border, paddingTop: 12,
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginRight: 8,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 13, marginLeft: 5 },
  ghostBtn: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.danger,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
  },
  ghostText: { color: colors.danger, fontWeight: '700', fontSize: 13, marginLeft: 5 },
  error: { color: colors.danger, paddingHorizontal: 16 },
});
