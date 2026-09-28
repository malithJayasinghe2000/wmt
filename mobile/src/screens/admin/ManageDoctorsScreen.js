// MEMBER 1 - admin side of doctor CRUD
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppButton from '../../components/AppButton';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import DoctorCard from '../../components/DoctorCard';
import { getDoctors, deleteDoctor } from '../../api/doctorApi';
import { colors } from '../../utils/theme';

export default function ManageDoctorsScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setDoctors(await getDoctors());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onDelete = (doctor) => {
    Alert.alert('Delete doctor', `Remove ${doctor.userId?.name} and their login?`, [
      { text: 'No' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoctor(doctor._id);
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
      <View style={styles.bar}>
        <AppButton title="Add doctor" style={styles.barButton} onPress={() => navigation.navigate('DoctorForm', {})} />
        <AppButton title="Specializations" variant="outline" style={styles.barButton} onPress={() => navigation.navigate('ManageSpecializations')} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={doctors}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No doctors added yet" />}
        renderItem={({ item }) => (
          <DoctorCard
            doctor={item}
            onPress={() => navigation.navigate('DoctorForm', { doctor: item })}
            onDelete={() => onDelete(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  bar: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  barButton: { width: '48%' },
  list: { padding: 16, paddingTop: 8 },
  error: { color: colors.danger, paddingHorizontal: 16 },
});
