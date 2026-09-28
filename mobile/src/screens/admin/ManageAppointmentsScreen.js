// MEMBER 4 - admin sees every appointment and changes its status
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
import DateTimeField from '../../components/DateTimeField';
import { getAllAppointments, updateAppointmentStatus } from '../../api/appointmentApi';
import { isValidDate } from '../../utils/validation';
import { colors, shadow, radius } from '../../utils/theme';

const FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Rejected', 'Cancelled'];

export default function ManageAppointmentsScreen() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (status = filter, day = date) => {
    try {
      setError('');
      const params = {};
      if (status !== 'All') params.status = status;
      if (day && isValidDate(day)) params.date = day;
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
      <View style={styles.top}>
        <View style={styles.dateRow}>
          <DateTimeField
            label="Filter by date"
            mode="date"
            value={date}
            onChange={(v) => { setDate(v); setLoading(true); load(filter, v); }}
            placeholder="Any date"
            style={styles.dateField}
          />
          {date ? (
            <TouchableOpacity
              style={styles.clear}
              onPress={() => { setDate(''); setLoading(true); load(filter, ''); }}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

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
          <EmptyState message="No appointments match this filter" icon="calendar-outline" />
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

            <InfoRow icon="medkit-outline" text={item.doctorId?.userId?.name} color={colors.primary} />
            <InfoRow
              icon="calendar-outline"
              text={`${item.scheduleId?.date}  ·  ${item.scheduleId?.startTime} - ${item.scheduleId?.endTime}`}
            />
            <InfoRow icon="chatbubble-ellipses-outline" text={item.reason} />

            <AttachedFile label="Patient's report" url={item.attachment} />

            {['Pending', 'Confirmed'].includes(item.status) && (
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
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: 16, paddingTop: 16 },
  dateRow: { flexDirection: 'row', alignItems: 'flex-end' },
  dateField: { flex: 1, marginBottom: 0 },
  clear: { paddingHorizontal: 12, paddingBottom: 12 },
  clearText: { color: colors.danger, fontWeight: '600' },
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
