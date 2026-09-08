import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { colors, radius, shadow } from '../../theme';
import { SearchBar, FilterPill, AppButton } from '../../components/ui';
import LiveMap from '../../components/LiveMap';

const LONDON = { latitude: 51.5202, longitude: -0.1406 };

const VENDOR_DEFS = [
  { id: 'v1', price: '$9', dLat: 0.008, dLng: -0.012, name: 'Sparkle Wash & Fold', address: '12 Kent Street, London', dist: '0.8 km from you', rating: '4.5 (212)', perKg: '$2 per kg', tags: ['Dry cleaning', 'Laundry', 'Iron'] },
  { id: 'v2', price: '$10', dLat: 0.002, dLng: -0.004, name: 'Mary Dry Cleaners & Dyers', address: '661 Stanley Road, London', dist: '1.5 km from you', rating: '4.2 (389)', perKg: '$2 per kg', tags: ['Dry cleaning', 'Laundry', 'Dyeing & Darning', 'Roll polish'] },
  { id: 'v3', price: '$13', dLat: -0.003, dLng: 0.01, name: 'Prentice Express Laundry', address: '44 Prentice Gate, London', dist: '2.1 km from you', rating: '4.6 (158)', perKg: '$3 per kg', tags: ['Express', 'Laundry'] },
  { id: 'v4', price: '$15', dLat: -0.01, dLng: -0.006, name: 'Kent Premium Cleaners', address: '9 Kent Rise, London', dist: '2.4 km from you', rating: '4.8 (97)', perKg: '$4 per kg', tags: ['Premium', 'Dyeing'] },
  { id: 'v5', price: '$8', dLat: 0.011, dLng: 0.006, name: 'Haymaker Budget Wash', address: '21 Haymaker Pkwy, London', dist: '0.5 km from you', rating: '4.0 (301)', perKg: '$1 per kg', tags: ['Budget', 'Wash & Fold'] },
];

export default function CustomerHomeScreen({ navigation }) {
  const [address, setAddress] = useState('85 Great Portland Street, London');
  const [selectedId, setSelectedId] = useState('v2');
  const [userLoc, setUserLoc] = useState(null);
  const [locStatus, setLocStatus] = useState('loading');
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocStatus('denied');
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLoc({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocStatus('live');
        const rev = await Location.reverseGeocodeAsync(pos.coords).catch(() => []);
        if (rev?.[0]) {
          const r = rev[0];
          const label = [r.streetNumber, r.street, r.city || r.region].filter(Boolean).join(' ').trim();
          if (label) setAddress(label);
        }
      } catch {
        setLocStatus('denied');
      }
    })();
  }, []);

  const base = userLoc || LONDON;
  const vendors = VENDOR_DEFS.map((v) => ({
    ...v,
    latitude: base.latitude + v.dLat,
    longitude: base.longitude + v.dLng,
  }));

  const shop = vendors.find((v) => v.id === selectedId) || vendors[1];

  const focusPin = (v) => {
    setSelectedId(v.id);
    mapRef.current?.animateToRegion(
      { latitude: v.latitude, longitude: v.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 },
      400
    );
  };

  const recenter = async () => {
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setUserLoc(c);
      setLocStatus('live');
      mapRef.current?.animateToRegion({ ...c, latitudeDelta: 0.03, longitudeDelta: 0.03 }, 400);
    } catch {
      Alert.alert('Location', 'Could not get a fresh fix');
    }
  };

  const searchAddress = async () => {
    if (!address.trim()) return;
    try {
      const res = await Location.geocodeAsync(address);
      if (res?.[0]) {
        const c = { latitude: res[0].latitude, longitude: res[0].longitude };
        mapRef.current?.animateToRegion({ ...c, latitudeDelta: 0.03, longitudeDelta: 0.03 }, 500);
      }
    } catch {
      // keep map where it is — geocoding is best-effort
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.homeRow}>
          <MaterialCommunityIcons name="navigation" size={15} color={colors.primary} />
          <Text style={styles.homeText}>Home</Text>
          <MaterialCommunityIcons name="chevron-down" size={18} color={colors.ink} />
        </TouchableOpacity>
        <View style={[styles.livePill, locStatus === 'live' && styles.liveOn]}>
          <View style={[styles.liveDot, locStatus === 'live' && styles.liveDotOn]} />
          <Text style={styles.liveText}>{locStatus === 'live' ? 'Live GPS' : locStatus === 'denied' ? 'GPS off' : 'Locating…'}</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          value={address}
          onChangeText={setAddress}
          onClear={() => setAddress('')}
          placeholder="Search address…"
        />
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 12 }}>
          <FilterPill icon="map-marker-radius" label="0.5 Km" />
          <FilterPill icon="shopping-outline" label="10kg" />
          <FilterPill icon="currency-usd" label="$ $2 - $10" />
          <TouchableOpacity style={styles.filterBtn} onPress={searchAddress}>
            <MaterialCommunityIcons name="magnify" size={17} color={colors.ink} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.mapWrap}>
        <LiveMap
          mapRef={mapRef}
          userLocation={userLoc}
          markers={vendors}
          selectedId={selectedId}
          onSelectPin={focusPin}
        />
        <TouchableOpacity style={styles.locate} onPress={recenter}>
          <MaterialCommunityIcons name="crosshairs-gps" size={20} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <View style={styles.sheet}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.photos}>
            <View style={[styles.photo, { backgroundColor: '#DCE7EF' }]}>
              <Text style={styles.photoEmoji}>🧺</Text>
              <Text style={styles.photoLabel}>Wash hall</Text>
            </View>
            <View style={[styles.photo, { backgroundColor: '#E8DDD2' }]}>
              <Text style={styles.photoEmoji}>👔</Text>
              <Text style={styles.photoLabel}>Folded & fresh</Text>
            </View>
          </View>

          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.shopTags}>{shop.tags.join('   •   ')}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="star" size={14} color={colors.star} />
              <Text style={styles.metaText}>{shop.rating}</Text>
            </View>
            <View style={styles.dot} />
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="map-marker" size={14} color={colors.primary} />
              <Text style={styles.metaText}>{shop.dist}</Text>
            </View>
            <View style={styles.dot} />
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="currency-usd" size={14} color={colors.ink} />
              <Text style={styles.metaText}>{shop.perKg}</Text>
            </View>
          </View>

          <View style={styles.subBanner}>
            <MaterialCommunityIcons name="calendar-check-outline" size={16} color={colors.primary} />
            <Text style={styles.subText}>Yearly subscription available</Text>
          </View>

          <Text style={styles.desc} numberOfLines={2}>
            {shop.name} is leading shop for your garments — pickup, expert clean and crisp delivery.
          </Text>

          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert('Call shop', `${shop.name}\n${shop.address}`)}>
              <MaterialCommunityIcons name="phone" size={16} color={colors.ink} />
              <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>
            <AppButton
              title="Schedule to pickup"
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('SchedulePickup', { shop, address })}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 18, paddingTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  homeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  homeText: { fontSize: 17, fontWeight: '800', color: colors.ink },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F2F3F5', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  liveOn: { backgroundColor: '#E7F6EC' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#9CA3AF' },
  liveDotOn: { backgroundColor: colors.primary },
  liveText: { fontSize: 11, fontWeight: '700', color: colors.ink },
  searchWrap: { paddingHorizontal: 16, marginTop: 10 },
  filters: { paddingLeft: 16, marginTop: 10, marginBottom: 10 },
  filterBtn: { width: 36, height: 32, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  mapWrap: { flex: 1, marginHorizontal: 12, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, position: 'relative' },
  locate: { position: 'absolute', right: 12, bottom: 12, width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 5, borderWidth: 1, borderColor: colors.border },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -26, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, maxHeight: '46%', ...shadow.tab, borderWidth: 1, borderColor: colors.border },
  photos: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  photo: { flex: 1, height: 108, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  photoEmoji: { fontSize: 34 },
  photoLabel: { fontSize: 11, color: colors.muted, fontWeight: '600', marginTop: 4 },
  shopName: { fontSize: 19, fontWeight: '800', color: colors.ink },
  shopTags: { fontSize: 12, color: colors.muted, marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '700', color: colors.ink },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.faint },
  subBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primarySoft, borderRadius: 10, padding: 10, marginTop: 12 },
  subText: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
  desc: { fontSize: 12, color: colors.faint, marginTop: 8, lineHeight: 17 },
  ctaRow: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 6 },
  callBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 20 },
  callText: { fontWeight: '700', color: colors.ink, fontSize: 14 },
});
