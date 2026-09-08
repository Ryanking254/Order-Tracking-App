import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { AppButton, StatusPill } from '../../components/ui';
import { deliveryAPI, trackingAPI } from '../../services/api';
import socketService from '../../services/socketService';

export default function DriverActiveDeliveryScreen({ route, navigation }) {
  const { deliveryId } = route.params || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await deliveryAPI.getDeliveryOrders(deliveryId);
      setOrders(res.data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); socketService.connect(); }, []));

  const setStatus = async (orderId, s) => {
    try {
      await trackingAPI.updateOrderStatus(orderId, s);
      socketService.notifyOrderStatusChange(orderId, s, deliveryId);
      setOrders((p) => p.map((o) => (o.id === orderId ? { ...o, status: s } : o)));
    } catch {
      Alert.alert('Failed', 'Could not update status');
    }
  };

  const complete = async () => {
    Alert.alert('Complete delivery?', 'Mark all as done?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Complete', onPress: async () => { try { await deliveryAPI.completeDelivery(deliveryId); navigation.goBack(); } catch {} } },
    ]);
  };

  const nextAction = (o) => {
    if (o.status === 'picked_up') return { t: 'In transit', s: 'in_transit' };
    if (o.status === 'in_transit') return { t: 'Delivered', s: 'delivered' };
    return { t: 'Picked up', s: 'picked_up' };
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.head}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <MaterialCommunityIcons name="chevron-left" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery #{deliveryId}</Text>
        <View style={{ width: 36 }} />
      </View>
      <FlatList
        data={orders}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={load}
        renderItem={({ item }) => {
          const n = nextAction(item);
          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.t}>{item.order_number}</Text>
                  <Text style={styles.s}>{item.customer_name} • {item.quantity} items</Text>
                  <Text style={styles.a} numberOfLines={2}>{item.delivery_address}</Text>
                </View>
                <StatusPill status={item.status} />
              </View>
              <AppButton title={n.t} variant="secondary" onPress={() => setStatus(item.id, n.s)} style={{ marginTop: 10 }} />
            </View>
          );
        }}
      />
      <View style={styles.foot}>
        <AppButton title="Complete delivery" onPress={complete} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.input, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: colors.ink },
  list: { padding: 16, gap: 12, paddingBottom: 110 },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  t: { fontWeight: '800', color: colors.ink, fontSize: 15 },
  s: { fontSize: 12, color: colors.muted, marginTop: 2 },
  a: { fontSize: 12, color: colors.ink, marginTop: 4 },
  foot: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border },
});
