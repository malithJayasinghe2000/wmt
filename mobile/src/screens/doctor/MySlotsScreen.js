// MEMBER 2 - the doctor creates and deletes their own time slots
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppButton from '../../components/AppButton';
import DateTimeField from '../../components/DateTimeField';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { getSchedules, createSchedule, deleteSchedule } from '../../api/scheduleApi';
import { isValidDate, isValidTime, isAfter, isPastDate } from '../../utils/validation';
import { colors, shadow, radius } from '../../utils/theme';

export default function MySlotsScreen() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ date: '', startTime: '', endTime: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setSlots(await getSchedules());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onAdd = async () => {
    const { date, startTime, endTime } = form;

    if (!isValidDate(date)) return setError('Date must look like 2026-10-05');
    if (isPastDate(date)) return setError('The date cannot be in the past');
    if (!isValidTime(startTime) || !isValidTime(endTime)) return setError('Times must look like 09:30');
    if (!isAfter(startTime, endTime)) return setError('End time must be after start time');

    try {
      setError('');
      setSaving(true);
      await createSchedule(form);
      setForm({ date: '', startTime: '', endTime: '' });
      load();
    } catch (err) {
      setError(err.message); // includes the clash message from the server
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (slot) => {
    Alert.alert('Delete slot', `Remove ${slot.date} ${slot.startTime}?`, [
      { text: 'No' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSchedule(slot._id);
            load();
          } catch (err) {
            Alert.alert('Could not delete', err.message);
          }
        },
      },
    ]);
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.wrap}>
      <View style={styles.form}>
        <Text style={styles.heading}>Add a time slot</Text>
        <DateTimeField
          label="Date"
          mode="date"
          value={form.date}
          onChange={(v) => onChange('date', v)}
          placeholder="Tap to choose a date"
          minimumDate={new Date()}
        />
        <DateTimeField
          label="Start time"
          mode="time"
          value={form.startTime}
          onChange={(v) => onChange('startTime', v)}
          placeholder="Tap to choose a start time"
        />
        <DateTimeField
          label="End time"
          mode="time"
          value={form.endTime}
          onChange={(v) => onChange('endTime', v)}
          placeholder="Tap to choose an end time"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title="Add slot" onPress={onAdd} loading={saving} />
      </View>

      <FlatList
        data={slots}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No time slots added yet" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.bubble, item.isBooked && styles.bubbleBooked]}>
              <Ionicons
                name={item.isBooked ? 'lock-closed-outline' : 'time-outline'}
                size={16}
                color={item.isBooked ? colors.muted : colors.primary}
              />
            </View>

            <View style={styles.slotInfo}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
            </View>

            {item.isBooked ? (
              <View style={styles.bookedPill}>
                <Text style={styles.booked}>Booked</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item)}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
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
  form: { padding: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  heading: { fontWeight: '800', color: colors.text, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  list: { padding: 16 },
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', ...shadow,
  },
  bubble: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#E3F1F0',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  bubbleBooked: { backgroundColor: colors.background },
  slotInfo: { flex: 1 },
  date: { fontWeight: '700', color: colors.text },
  time: { color: colors.muted, marginTop: 2, fontSize: 13 },
  bookedPill: { backgroundColor: '#E3F1F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  booked: { color: colors.primary, fontWeight: '700', fontSize: 11 },
  deleteBtn: { padding: 8 },
  error: { color: colors.danger, marginBottom: 10 },
});
