import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { StatusPill } from '../../components/ui';
import { orderAPI } from '../../services/api';
import socketService from '../../services/socketService';

// Waiting room: shown after a customer places an order. A driver from the
// shop claims it, and the moment it is picked up we auto-open live tracking.
const GO_LIVE = ['picked_up', 'in_transit'];

export default function OrderWaitingScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);
  const goneLive = useRef(false);

  const goLive = useCallback(() => {
    if (goneLive.current) return;
    goneLive.current = true;
    navigation.replace('Tracking', { prefillId: String(orderId) });
  }, [navigation, orderId]);

  const fetchOnce = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await orderAPI.getOrderById(orderId);
      const ord = res.data.order;
      setOrder(ord);
      if (ord && GO_LIVE.includes(ord.status)) goLive();
    } catch {
      // keep waiting — transient network
    } finally {
      setLoading(false);
    }
  }, [orderId, goLive]);

  useEffect(() => {
    goneLive.current = false;
    socketService.connect();
    socketService.joinOrderRoom(orderId);
    socketService.onOrderStatusUpdate((d) => {
      if (String(d.order_id) === String(orderId)) {
        setOrder((p) => (p ? { ...p, status: d.status } : p));
        if (GO_LIVE.includes(d.status)) goLive();
      }
    });
    fetchOnce();
    timer.current = setInterval(fetchOnce, 5000);
    return () => {
      clearInterval(timer.current);
      socketService.offOrderStatusUpdate();
    };
  }, [orderId, fetchOnce, goLive]);

  useFocusEffect(useCallback(() => { fetchOnce(); }, [fetchOnce]));

  const status = order?.status || 'pending';
  const assigned = status === 'assigned';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOnce} tintColor={colors.primary} />}
      >
        <View style={styles.pulse}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <Text style={styles.title}>{assigned ? 'Driver is on the way' : 'Waiting for a driver…'}</Text>
        <Text style={styles.sub}>
          {order?.shop_name ? `${order.shop_name} • ` : ''}Order {order?.order_number || `#${orderId}`} —{' '}
          {assigned
            ? `${order?.driver_name || 'Your driver'} is heading to pick it up. Live tracking opens automatically.`
            : 'A driver from the shop will pick it up shortly. Keep this screen open.'}
        </Text>

        {order ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.num}>Order {order.order_number}</Text>
                <Text style={styles.meta}>{order.quantity} items • KES {order.total_price}</Text>
                <Text style={styles.addr} numberOfLines={2}>{order.delivery_address}</Text>
              </View>
              <StatusPill status={status} />
            </View>
            {order.driver_name ? (
              <View style={styles.driver}>
                <MaterialCommunityIcons name="truck-fast-outline" size={20} color={colors.primary} />
                <Text style={styles.driverT}>{order.driver_name}</Text>
              </View>
            ) : null}
            <View style={styles.steps}>
              {['pending', 'assigned', 'picked_up'].map((s, i, arr) => {
                const order_idx = arr.indexOf(status);
                const done = order_idx >= 0 && i <= order_idx;
                return (
                  <View key={s} style={styles.step}>
                    <View style={[styles.dot, done && styles.dotDone]}>
                      {done ? <MaterialCommunityIcons name="check" size={11} color="#fff" /> : null}
                    </View>
                    <Text style={[styles.stepT, done && styles.stepTDone]}>{s.replace('_', ' ')}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        <Text style={styles.fine}>Live map opens automatically once the order is picked up.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, paddingTop: 48, alignItems: 'stretch' },
  pulse: { alignSelf: 'center', width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  sub: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  card: { backgroundColor: '#fff', borderRadius: radius.xl, padding: 16, marginTop: 20, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  num: { fontSize: 16, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 13, fontWeight: '600', color: colors.ink, marginTop: 3 },
  addr: { fontSize: 12, color: colors.muted, marginTop: 4 },
  driver: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.bg, borderRadius: radius.md, padding: 10, marginTop: 12 },
  driverT: { fontWeight: '800', color: colors.ink, fontSize: 14 },
  steps: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  step: { alignItems: 'center', gap: 6, flex: 1 },
  dot: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: colors.primary },
  stepT: { fontSize: 11, color: colors.faint, textTransform: 'capitalize', fontWeight: '600' },
  stepTDone: { color: colors.ink, fontWeight: '800' },
  fine: { fontSize: 12, color: colors.faint, textAlign: 'center', marginTop: 18 },
});
