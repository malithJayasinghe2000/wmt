// MEMBER 4 - block and unblock accounts
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import FilterChips from '../../components/FilterChips';
import { getUsers, toggleBlockUser } from '../../api/adminApi';
import { colors, shadow, radius } from '../../utils/theme';

const ROLES = ['All', 'patient', 'doctor', 'admin'];

export default function ManageUsersScreen() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (selected = role) => {
    try {
      setError('');
      setUsers(await getUsers(selected === 'All' ? {} : { role: selected }));
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

  useFocusEffect(useCallback(() => { load(); }, [role]));

  const onToggle = (user) => {
    const action = user.isActive ? 'Block' : 'Unblock';
    Alert.alert(action, `${action} ${user.name}?`, [
      { text: 'No' },
      {
        text: action,
        onPress: async () => {
          try {
            await toggleBlockUser(user._id);
            load();
          } catch (err) {
            Alert.alert('Could not update', err.message);
          }
        },
      },
    ]);
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.wrap}>
      <FilterChips
        options={ROLES}
        value={role}
        onChange={(r) => { setLoading(true); setRole(r); }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={<EmptyState message="No users found" icon="people-outline" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.avatar, !item.isActive && styles.avatarBlocked]}>
              <Text style={styles.initial}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.email} numberOfLines={1}>{item.email}</Text>

              <View style={styles.badges}>
                <View style={styles.rolePill}>
                  <Text style={styles.roleText}>{item.role}</Text>
                </View>
                {!item.isActive && (
                  <View style={styles.blockedPill}>
                    <Ionicons name="ban-outline" size={10} color={colors.danger} />
                    <Text style={styles.blockedText}>blocked</Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.action, item.isActive ? styles.blockBtn : styles.unblockBtn]}
              onPress={() => onToggle(item)}
            >
              <Text style={item.isActive ? styles.block : styles.unblock}>
                {item.isActive ? 'Block' : 'Unblock'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, paddingTop: 4 },
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', ...shadow,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarBlocked: { backgroundColor: colors.muted },
  initial: { color: '#fff', fontWeight: '700', fontSize: 17 },
  info: { flex: 1 },
  name: { fontWeight: '700', color: colors.text },
  email: { color: colors.muted, fontSize: 12, marginTop: 2 },
  badges: { flexDirection: 'row', marginTop: 6 },
  rolePill: { backgroundColor: '#E3F1F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  roleText: { color: colors.primary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  blockedPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDECEA',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 6,
  },
  blockedText: { color: colors.danger, fontSize: 10, fontWeight: '700', marginLeft: 3 },
  action: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  blockBtn: { borderColor: colors.danger },
  unblockBtn: { borderColor: colors.success },
  block: { color: colors.danger, fontWeight: '700', fontSize: 12 },
  unblock: { color: colors.success, fontWeight: '700', fontSize: 12 },
  error: { color: colors.danger, paddingHorizontal: 16 },
});
