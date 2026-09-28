// MEMBER 5 - notification feed with unread count
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { colors, shadow, radius, tint } from '../../utils/theme';
import { getNotifications, markNotificationRead } from '../../api/notificationApi';

const iconFor = (type) => {
  if (type === 'prescription') return 'document-text-outline';
  if (type === 'appointment') return 'calendar-outline';
  return 'notifications-outline';
};

export default function NotificationsScreen() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const response = await getNotifications();
      setItems(response.data);
      setUnread(response.unread);
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

  const onRead = async (item) => {
    if (item.isRead) return;
    try {
      await markNotificationRead(item._id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.count}>
          {unread > 0 ? `${unread} unread` : 'All caught up'}
        </Text>
        {unread > 0 && <View style={styles.dot} />}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState message="No notifications yet" icon="notifications-outline" />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.isRead && styles.unreadCard]}
            onPress={() => onRead(item)}
            activeOpacity={0.8}
          >
            <View style={[styles.bubble, { backgroundColor: tint(colors.primary) }]}>
              <Ionicons name={iconFor(item.type)} size={16} color={colors.primary} />
            </View>

            <View style={styles.body}>
              <Text style={[styles.message, !item.isRead && styles.unreadText]}>
                {item.message}
              </Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>

            {!item.isRead && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 6 },
  count: { color: colors.muted, fontWeight: '700', fontSize: 13 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginLeft: 6 },
  list: { padding: 16, paddingTop: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.md, padding: 14, marginBottom: 10, ...shadow,
  },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  bubble: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  body: { flex: 1 },
  message: { color: colors.text, fontSize: 14 },
  unreadText: { fontWeight: '700' },
  date: { color: colors.muted, fontSize: 11, marginTop: 5 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: 8 },
  error: { color: colors.danger, paddingHorizontal: 16 },
});
