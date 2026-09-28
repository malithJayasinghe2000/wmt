// MEMBER 1 + MEMBER 2 - browsing doctors and filtering by specialization
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DoctorCard from '../../components/DoctorCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import AppInput from '../../components/AppInput';
import { getDoctors } from '../../api/doctorApi';
import { getSpecializations } from '../../api/specializationApi';
import { colors } from '../../utils/theme';

export default function DoctorListScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (specId = selectedSpec, q = search) => {
    try {
      setError('');
      const params = { available: 'true' };
      if (specId) params.specializationId = specId;
      if (q) params.q = q;
      const [doctorList, specList] = await Promise.all([getDoctors(params), getSpecializations()]);
      setDoctors(doctorList);
      setSpecs(specList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const pickSpec = (id) => {
    const next = selectedSpec === id ? null : id;
    setSelectedSpec(next);
    setLoading(true);
    load(next, search);
  };

  if (loading) return <Loader text="Loading doctors..." />;

  return (
    <View style={styles.wrap}>
      <AppInput
        placeholder="Search by doctor name"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => { setLoading(true); load(selectedSpec, search); }}
        returnKeyType="search"
        style={styles.search}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chips}
      >
        {specs.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={[styles.chip, selectedSpec === item._id && styles.chipActive]}
            onPress={() => pickSpec(item._id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, selectedSpec === item._id && styles.chipTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={doctors}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => load()} />}
        ListEmptyComponent={<EmptyState message="No doctors found for this filter" icon="medkit-outline" />}
        renderItem={({ item }) => (
          <DoctorCard
            doctor={item}
            onPress={() => navigation.navigate('DoctorDetail', { doctorId: item._id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  search: { paddingHorizontal: 16, paddingTop: 12, marginBottom: 0 },
  chipScroll: { flexGrow: 0, maxHeight: 48 },
  chips: { paddingHorizontal: 16, paddingBottom: 10, alignItems: 'center' },
  chip: {
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
    paddingHorizontal: 14, height: 34, justifyContent: 'center',
    borderRadius: 17, marginRight: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  list: { padding: 16, paddingTop: 8 },
  error: { color: colors.danger, paddingHorizontal: 16 },
});
