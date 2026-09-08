import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { StatusPill } from '../../components/ui';
import { adminAPI } from '../../services/api';

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllOrders();
      setOrders(res.data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>All orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.ic}><MaterialCommunityIcons name="package-variant-closed" size={20} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.t}>Order {item.order_number}</Text>
                <Text style={styles.s}>{item.customer_name} • {item.quantity} items • KES {item.total_price}</Text>
                <Text style={styles.a} numberOfLines={1}>{item.delivery_address}</Text>
              </View>
            </View>
            <View style={styles.foot}>
              <StatusPill status={item.status} />
              <Text style={styles.d}>{item.driver_name || 'Unassigned'}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No orders yet</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, padding: 18 },
  list: { padding: 16, paddingTop: 0, paddingBottom: 120, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  ic: { width: 44, height: 44, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  t: { fontWeight: '800', color: colors.ink, fontSize: 15 },
  s: { fontSize: 12, color: colors.ink, fontWeight: '600', marginTop: 2 },
  a: { fontSize: 12, color: colors.muted, marginTop: 2 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  d: { fontSize: 12, color: colors.muted },
  empty: { textAlign: 'center', marginTop: 60, color: colors.muted },
});
