// MEMBER 2 - specialization master data CRUD
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import ImageUploadField from '../../components/ImageUploadField';
import {
  getSpecializations, createSpecialization, updateSpecialization, deleteSpecialization,
} from '../../api/specializationApi';
import { isEmpty } from '../../utils/validation';
import { colors, shadow, radius } from '../../utils/theme';

export default function ManageSpecializationsScreen() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', icon: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setItems(await getSpecializations());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const reset = () => {
    setForm({ name: '', description: '', icon: '' });
    setEditingId(null);
  };

  const onSave = async () => {
    if (isEmpty(form.name)) return setError('Name is required');

    try {
      setError('');
      setSaving(true);
      if (editingId) await updateSpecialization(editingId, form);
      else await createSpecialization(form);
      reset();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (item) => {
    Alert.alert('Delete', `Remove ${item.name}?`, [
      { text: 'No' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSpecialization(item._id);
            load();
          } catch (err) {
            Alert.alert('Could not delete', err.message); // still used by doctors
          }
        },
      },
    ]);
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.wrap}>
      <View style={styles.form}>
        <Text style={styles.heading}>{editingId ? 'Edit specialization' : 'Add specialization'}</Text>
        <AppInput label="Name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Cardiology" autoCapitalize="words" />
        <AppInput label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Heart and blood pressure" autoCapitalize="sentences" />
        <ImageUploadField label="Icon" value={form.icon} onUploaded={(url) => setForm({ ...form, icon: url })} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title={editingId ? 'Update' : 'Add'} onPress={onSave} loading={saving} />
        {editingId ? <AppButton title="Cancel edit" variant="outline" style={styles.spaced} onPress={reset} /> : null}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No specializations yet" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.name}>{item.name}</Text>
              {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
            </View>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => { setEditingId(item._id); setForm({ name: item.name, description: item.description, icon: item.icon }); }}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => onDelete(item)}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
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
  list: { padding: 16 },
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', ...shadow,
  },
  iconBtn: { padding: 8 },
  cardInfo: { flex: 1 },
  name: { fontWeight: '700', color: colors.text },
  desc: { color: colors.muted, fontSize: 12, marginTop: 2 },
  error: { color: colors.danger, marginBottom: 10 },
  spaced: { marginTop: 8 },
});
