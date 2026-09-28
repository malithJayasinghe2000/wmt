// MEMBER 3 - the patient's own appointment list, with cancel
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
import { getMyAppointments, cancelAppointment } from '../../api/appointmentApi';
import { colors, shadow, radius } from '../../utils/theme';

const FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function MyAppointmentsScreen() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (status = filter) => {
    try {
      setError('');
      const params = status === 'All' ? {} : { status };
      setItems(await getMyAppointments(params));
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

  const onCancel = (item) => {
    Alert.alert('Cancel appointment', 'Do you want to cancel this appointment?', [
      { text: 'No' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelAppointment(item._id);
            load();
          } catch (err) {
            Alert.alert('Could not cancel', err.message);
          }
        },
      },
    ]);
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
          <EmptyState message="You have no appointments yet" icon="calendar-outline" />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.doctorRow}>
                <View style={styles.bubble}>
                  <Ionicons name="medkit-outline" size={15} color={colors.primary} />
                </View>
                <Text style={styles.doctor} numberOfLines={1}>
                  {item.doctorId?.userId?.name || 'Doctor'}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>

            <InfoRow
              icon="calendar-outline"
              text={`${item.scheduleId?.date}  ·  ${item.scheduleId?.startTime} - ${item.scheduleId?.endTime}`}
              color={colors.primary}
            />
            <InfoRow icon="chatbubble-ellipses-outline" text={item.reason} />
            <InfoRow icon="pricetag-outline" text={item.doctorId?.specializationId?.name} />

            <AttachedFile label="Your attached report" url={item.attachment} />

            {['Pending', 'Confirmed'].includes(item.status) && (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(item)}>
                <Ionicons name="close-circle-outline" size={15} color={colors.danger} />
                <Text style={styles.cancel}>Cancel appointment</Text>
              </TouchableOpacity>
            )}
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
  doctorRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  bubble: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#E3F1F0',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  doctor: { fontWeight: '700', color: colors.text, flexShrink: 1 },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', marginTop: 12,
    borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10,
  },
  cancel: { color: colors.danger, fontWeight: '600', marginLeft: 6 },
  error: { color: colors.danger, paddingHorizontal: 16 },
});
