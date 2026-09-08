import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { colors } from '../theme';
import StylishMap from './StylishMap';

// Unified live map with web fallback.
// markers: [{ id, latitude, longitude, price, ... }]
export default function LiveMap({
  initialRegion,
  userLocation,
  markers = [],
  selectedId,
  onSelectPin,
  driverLocation,
  style,
  mapRef,
}) {
  // Web: react-native-maps web needs JS API key — fall back to stylish mock.
  if (Platform.OS === 'web') {
    const pins = markers.map((m, i) => ({
      id: m.id,
      price: m.price || `$${i + 8}`,
      // spread faux positions around for visual parity
      x: `${15 + ((i * 17) % 60)}%`,
      y: `${30 + ((i * 13) % 45)}%`,
    }));
    return <StylishMap pins={pins} selectedId={selectedId} onSelectPin={onSelectPin} />;
  }

  const region =
    initialRegion ||
    (userLocation
      ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }
      : {
          latitude: 51.5202,
          longitude: -0.1406,
          latitudeDelta: 0.035,
          longitudeDelta: 0.035,
        });

  return (
    <MapView
      ref={mapRef}
      style={[styles.map, style]}
      initialRegion={region}
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      // Default provider: Apple on iOS, Google on Android (works in Expo Go, no key needed for testing)
    >
      {markers.map((m) => {
        const selected = m.id === selectedId;
        return (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            onPress={() => onSelectPin && onSelectPin(m)}
            tracksViewChanges={false}
          >
            <View style={[styles.pin, selected ? styles.pinSel : styles.pinDark]}>
              <Text style={styles.pinText}>{m.price}</Text>
              <View style={[styles.tail, selected ? styles.tailSel : styles.tailDark]} />
            </View>
          </Marker>
        );
      })}

      {driverLocation ? (
        <Marker coordinate={driverLocation} title="Courier" tracksViewChanges={false}>
          <View style={styles.driverDot}>
            <Text style={{ fontSize: 18 }}>🛵</Text>
          </View>
        </Marker>
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  pin: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pinSel: { backgroundColor: colors.primary },
  pinDark: { backgroundColor: '#111111' },
  pinText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  tail: {
    position: 'absolute',
    bottom: -5,
    width: 10,
    height: 10,
    transform: [{ rotate: '45deg' }],
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fff',
  },
  tailSel: { backgroundColor: colors.primary },
  tailDark: { backgroundColor: '#111111' },
  driverDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
    elevation: 5,
  },
});
