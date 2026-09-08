import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { colors, radius, shadow } from '../../theme';
import { AppButton, StatusPill } from '../../components/ui';
import LiveMap from '../../components/LiveMap';
import { orderAPI, trackingAPI } from '../../services/api';
import socketService from '../../services/socketService';

const STEPS = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'];

export default function CustomerTrackingScreen({ route }) {
  const [orderId, setOrderId] = useState(route.params?.prefillId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [driverPos, setDriverPos] = useState(null);
  const [myPos, setMyPos] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    socketService.connect();
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync().catch(() => ({ status: 'denied' }));
      if (status === 'granted') {
        const cur = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).catch(() => null);
        if (cur) setMyPos({ latitude: cur.coords.latitude, longitude: cur.coords.longitude });
      }
    })();
    return () => {
      socketService.offOrderStatusUpdate();
      socketService.offLocationUpdate();
    };
  }, []);

  useEffect(() => {
    if (route.params?.prefillId) {
      setOrderId(route.params.prefillId);
      lookup(route.params.prefillId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.prefillId]);

  const subscribeLiveDriver = async (ord) => {
    const deliveryId = ord?.delivery_id;
    if (!deliveryId) {
      setDriverPos(null);
      return;
    }
    // initial fix from REST
    try {
      const res = await trackingAPI.getLatestLocation(deliveryId);
      const l = res.data?.location;
      if (l?.latitude && l?.longitude) {
        setDriverPos({ latitude: Number(l.latitude), longitude: Number(l.longitude) });
      }
    } catch {}
    // live socket
    socketService.joinDeliveryRoom(deliveryId);
    socketService.onLocationUpdate((d) => {
      if (d?.latitude && d?.longitude) {
        const c = { latitude: Number(d.latitude), longitude: Number(d.longitude) };
        setDriverPos(c);
        mapRef.current?.animateToRegion({ ...c, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 400);
      }
    });
  };

  const lookup = async (id) => {
    const target = id ?? orderId;
    if (!target) {
      Alert.alert('Enter order', 'Type your numeric order ID');
      return;
    }
    setLoading(true);
    try {
      const res = await orderAPI.getOrderById(target);
      const ord = res.data.order;
      setOrder(ord);
      socketService.joinOrderRoom(target);
      socketService.onOrderStatusUpdate((d) => {
        if (String(d.order_id) === String(target)) setOrder((p) => (p ? { ...p, status: d.status } : p));
      });
      subscribeLiveDriver(ord);
    } catch (e) {
      Alert.alert('Not found', 'Could not find that order');
    } finally {
      setLoading(false);
    }
  };

  const stepIdx = order ? STEPS.indexOf(order.status) : -1;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Track order</Text>
      <View style={styles.searchCard}>
        <View style={styles.field}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.muted} />
          <TextInput value={orderId} onChangeText={setOrderId} keyboardType="number-pad" placeholder="Enter order ID" placeholderTextColor={colors.faint} style={styles.input} editable={!loading} />
        </View>
        <AppButton title="Track" onPress={() => lookup()} loading={loading} disabled={loading} />
      </View>

      {order ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* live courier map */}
          <View style={styles.mapWrap}>
            <LiveMap
              mapRef={mapRef}
              userLocation={myPos}
              driverLocation={driverPos}
              markers={[]}
              style={{ height: 210 }}
            />
            <View style={styles.mapBadge}>
              <View style={[styles.liveDot, driverPos && styles.liveOn]} />
              <Text style={styles.mapBadgeT}>{driverPos ? 'Courier live' : 'Waiting for courier GPS…'}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.num}>Order #{order.order_number}</Text>
                <Text style={styles.sub}>{order.quantity} items • KES {order.total_price}</Text>
              </View>
              <StatusPill status={order.status} />
            </View>
            <Text style={styles.addr}>{order.delivery_address}</Text>
            {order.driver_name ? (
              <View style={styles.driver}>
                <View style={styles.avatar}><Text>🛵</Text></View>
                <View>
                  <Text style={styles.dName}>{order.driver_name}</Text>
                  <Text style={styles.dSub}>
                    {driverPos
                      ? `${driverPos.latitude.toFixed(5)}, ${driverPos.longitude.toFixed(5)} • live`
                      : 'Your courier'}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.timeline}>
              {STEPS.map((s, i) => {
                const done = stepIdx >= 0 && i <= stepIdx;
                return (
                  <View key={s} style={styles.stepRow}>
                    <View style={styles.rail}>
                      <View style={[styles.dot, done && styles.dotDone]}>
                        {done ? <MaterialCommunityIcons name="check" size={11} color="#fff" /> : null}
                      </View>
                      {i < STEPS.length - 1 ? <View style={[styles.line, done && styles.lineDone]} /> : null}
                    </View>
                    <Text style={[styles.stepText, done && styles.stepTextDone]}>{s.replace('_', ' ')}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.hint}>
          <MaterialCommunityIcons name="map-marker-path" size={44} color={colors.faint} />
          <Text style={styles.hintT}>Live status appears here</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, paddingHorizontal: 18, paddingTop: 14 },
  searchCard: { backgroundColor: '#fff', margin: 16, marginBottom: 10, borderRadius: radius.xl, padding: 14, gap: 10, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  field: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.input, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 12 },
  input: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 0 },
  mapWrap: { marginHorizontal: 16, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, height: 210, position: 'relative', ...shadow.card },
  mapBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6, elevation: 4 },
  mapBadgeT: { fontSize: 11, fontWeight: '800', color: colors.ink },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9CA3AF' },
  liveOn: { backgroundColor: colors.primary },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: radius.xl, padding: 16, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  num: { fontSize: 17, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 13, fontWeight: '600', color: colors.ink, marginTop: 3 },
  addr: { fontSize: 12, color: colors.muted, marginTop: 6 },
  driver: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.bg, borderRadius: radius.md, padding: 10, marginTop: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  dName: { fontWeight: '800', color: colors.ink, fontSize: 14 },
  dSub: { fontSize: 12, color: colors.muted },
  timeline: { marginTop: 16 },
  stepRow: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 20 },
  dot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: colors.primary },
  line: { width: 2, flex: 1, minHeight: 22, backgroundColor: '#E5E7EB' },
  lineDone: { backgroundColor: colors.primary },
  stepText: { fontSize: 13, color: colors.faint, textTransform: 'capitalize', paddingBottom: 22, fontWeight: '600' },
  stepTextDone: { color: colors.ink, fontWeight: '800' },
  hint: { alignItems: 'center', marginTop: 60 },
  hintT: { color: colors.muted, marginTop: 10, fontWeight: '600' },
});
