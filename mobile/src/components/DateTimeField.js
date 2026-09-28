import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../utils/theme';

// Opens the phone's own date or time picker instead of making the user type.
// It still reads and writes plain strings, so the API and the validation
// rules stay exactly the same: 'YYYY-MM-DD' for a date, 'HH:mm' for a time.

const pad = (n) => String(n).padStart(2, '0');

const toDateString = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeString = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// Turns the stored string back into a Date the picker can show
const parseValue = (value, mode) => {
  const now = new Date();
  if (!value) return now;

  if (mode === 'date') {
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return now;
    return new Date(y, m - 1, d);
  }

  const [h, min] = value.split(':').map(Number);
  const result = new Date();
  result.setHours(h || 0, min || 0, 0, 0);
  return result;
};

export default function DateTimeField({
  label,
  mode = 'date',      // 'date' or 'time'
  value,              // 'YYYY-MM-DD' or 'HH:mm'
  onChange,           // gets the new string back
  placeholder = 'Tap to choose',
  minimumDate,
  style,
}) {
  const [open, setOpen] = useState(false);
  const current = parseValue(value, mode);

  const handleChange = (event, selected) => {
    // Android closes itself; the user may also have pressed Cancel
    if (Platform.OS === 'android') setOpen(false);
    if (event.type === 'dismissed' || !selected) return;

    onChange(mode === 'date' ? toDateString(selected) : toTimeString(selected));
  };

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity style={styles.box} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={value ? styles.value : styles.placeholder}>{value || placeholder}</Text>
      </TouchableOpacity>

      {open && (
        <View>
          <DateTimePicker
            value={current}
            mode={mode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={minimumDate}
            onChange={handleChange}
          />

          {/* iOS keeps the wheel on screen, so it needs its own Done button */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.done} onPress={() => setOpen(false)}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { marginBottom: 6, color: colors.text, fontWeight: '600', fontSize: 13 },
  box: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  value: { color: colors.text },
  placeholder: { color: colors.muted },
  done: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12 },
  doneText: { color: colors.primary, fontWeight: '700' },
});
