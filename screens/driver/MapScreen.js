import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { colors, radius, shadow } from '../../theme';
import { AppButton } from '../../components/ui';
import LiveMap from '../../components/LiveMap';
import { trackingAPI } from '../../services/api';
import socketService from '../../services/socketService';

export default function DriverMapScreen({ route }) {
  const deliveryId = route.params?.deliveryId;
  const [pos, setPos] = useState(null);
  const [sharing, setSharing] = useState(!!deliveryId);
  const [perm, setPerm] = useState('loading');
  const subRef = useRef(null);
  const lastSent = useRef(0);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPerm(status === 'granted' ? 'granted' : 'denied');
      if (status !== 'granted') return;
      const cur = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }).catch(() => null);
      if (cur) {
        setPos({ latitude: cur.coords.latitude, longitude: cur.coords.longitude });
        mapRef.current?.animateToRegion(
          { latitude: cur.coords.latitude, longitude: cur.coords.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 },
          500
        );
      }
    })();
    socketService.connect();
    return () => subRef.current?.remove();
  }, []);

  // Continuous foreground GPS while sharing is on
  useEffect(() => {
    if (perm !== 'granted' || !sharing) {
      subRef.current?.remove();
      subRef.current = null;
      return;
    }
    let alive = true;
    (async () => {
      subRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        async (loc) => {
          if (!alive) return;
          const c = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setPos(c);
          const now = Date.now();
          if (deliveryId && now - lastSent.current > 8000) {
            lastSent.current = now;
            try {
              await trackingAPI.updateLocation(deliveryId, c.latitude, c.longitude, loc.coords.accuracy);
            } catch {}
            socketService.sendLocationUpdate(deliveryId, c.latitude, c.longitude, loc.coords.accuracy);
          }
        }
      );
    })();
    return () => {
      alive = false;
      subRef.current?.remove();
      subRef.current = null;
    };
  }, [perm, sharing, deliveryId]);

  const sendOnce = async () => {
    try {
      const cur = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const c = { latitude: cur.coords.latitude, longitude: cur.coords.longitude };
      setPos(c);
      mapRef.current?.animateToRegion({ ...c, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 400);
      if (deliveryId) {
        await trackingAPI.updateLocation(deliveryId, c.latitude, c.longitude, cur.coords.accuracy);
        socketService.sendLocationUpdate(deliveryId, c.latitude, c.longitude, cur.coords.accuracy);
        Alert.alert('Sent 📍', 'Live location shared with customers');
      }
    } catch (e) {
      Alert.alert('Failed', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Live map</Text>
          <Text style={styles.sub}>
            {deliveryId ? `Delivery #${deliveryId}` : 'No delivery selected — showing your GPS'} • {perm === 'granted' ? (pos ? `${pos.latitude.toFixed(5)}, ${pos.longitude.toFixed(5)}` : 'fixing…') : 'permission needed'}
          </Text>
        </View>
        <View style={styles.toggle}>
          <Text style={styles.toggleT}>{sharing ? 'Sharing' : 'Paused'}</Text>
          <Switch value={sharing} onValueChange={setSharing} trackColor={{ true: colors.primary }} />
        </View>
      </View>

      <View style={styles.mapWrap}>
        <LiveMap mapRef={mapRef} userLocation={pos} driverLocation={pos} markers={[]} />
      </View>

      <View style={styles.foot}>
        <AppButton title={deliveryId ? 'Broadcast my location now' : 'Center on me'} onPress={sendOnce} />
        <Text style={styles.hint}>
          {deliveryId
            ? 'Auto-broadcasts every ~8s / 10m while Sharing is on.'
            : 'Open a delivery to auto-share with customers.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 10 },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 12, color: colors.muted, marginTop: 3, maxWidth: 240 },
  toggle: { alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  toggleT: { fontSize: 11, fontWeight: '800', color: colors.ink },
  mapWrap: { flex: 1, marginHorizontal: 16, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, ...shadow.card },
  foot: { padding: 16, paddingBottom: 110 },
  hint: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 8 },
});
