import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { AppButton } from '../../components/ui';
import { deliveryAPI } from '../../services/api';
import socketService from '../../services/socketService';

export default function ShopQueueScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await deliveryAPI.getShopQueue();
      setOrders(res.data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const claim = async (order) => {
    setClaimingId(order.id);
    try {
      const res = await deliveryAPI.claimOrder(order.id);
      const deliveryId = res.data.delivery?.id;
      socketService.connect();
      socketService.notifyOrderStatusChange(order.id, 'assigned', deliveryId);
      Alert.alert('Claimed 🎉', `Order ${order.order_number} is yours`, [
        { text: 'Open delivery', onPress: () => navigation.navigate('ActiveDelivery', { deliveryId }) },
        { text: 'Stay', style: 'cancel', onPress: () => load() },
      ]);
      load();
    } catch (e) {
      const msg = e.response?.data?.message || 'Could not claim order';
      Alert.alert('Failed', msg, [{ text: 'OK', onPress: () => load() }]);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>New orders</Text>
      <Text style={styles.sub}>Claim an order from your shop to start delivering</Text>
      <FlatList
        data={orders}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.icon}>
                <MaterialCommunityIcons name="package-variant-closed" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.t}>Order {item.order_number}</Text>
                <Text style={styles.s}>{item.customer_name} • {item.quantity} items • KES {item.total_price}</Text>
                <Text style={styles.a} numberOfLines={2}>{item.delivery_address}</Text>
              </View>
            </View>
            <AppButton
              title={claimingId === item.id ? 'Claiming…' : 'Take this order'}
              onPress={() => claim(item)}
              loading={claimingId === item.id}
              disabled={claimingId !== null}
              style={{ marginTop: 12 }}
            />
          </View>
        )}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="truck-check-outline" size={44} color={colors.faint} />
            <Text style={styles.emptyT}>No new orders</Text>
            <Text style={styles.emptyS}>Pull to refresh — new shop orders appear here.</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, paddingHorizontal: 18, paddingTop: 14 },
  sub: { fontSize: 13, color: colors.muted, paddingHorizontal: 18, marginBottom: 10 },
  list: { padding: 16, paddingBottom: 120, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  icon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  t: { fontSize: 15, fontWeight: '800', color: colors.ink },
  s: { fontSize: 12, color: colors.ink, fontWeight: '600', marginTop: 2 },
  a: { fontSize: 12, color: colors.muted, marginTop: 4 },
  empty: { alignItems: 'center', marginTop: 70, paddingHorizontal: 30 },
  emptyT: { fontSize: 17, fontWeight: '800', color: colors.ink, marginTop: 12 },
  emptyS: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 6 },
});
