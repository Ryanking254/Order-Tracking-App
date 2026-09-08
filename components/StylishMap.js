import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../theme';
import { PricePin } from './ui';

// Lightweight faux-map that mimics the reference: river, roads, parks + price pins.
// No native dependency (react-native-maps) required.
export default function StylishMap({ pins = [], selectedId, onSelectPin, youLabel = 'You' }) {
  return (
    <View style={styles.map}>
      {/* parks */}
      <View style={[styles.block, { left: '6%', top: '12%', width: '26%', height: '18%', backgroundColor: colors.mapPark, borderRadius: 14 }]} />
      <View style={[styles.block, { right: '8%', top: '52%', width: '30%', height: '20%', backgroundColor: '#E4EFE0', borderRadius: 16 }]} />
      <View style={[styles.block, { left: '12%', bottom: '10%', width: '34%', height: '14%', backgroundColor: '#E7EFE3', borderRadius: 12 }]} />

      {/* river */}
      <View style={styles.river} />
      <View style={[styles.river, { left: '30%', width: 26, transform: [{ rotate: '18deg' }] }]} />

      {/* roads */}
      <View style={[styles.road, { top: '22%', left: -20, right: -20, height: 10 }]} />
      <View style={[styles.road, { top: '44%', left: -20, right: -20, height: 14 }]} />
      <View style={[styles.road, { top: '66%', left: -20, right: -20, height: 8 }]} />
      <View style={[styles.road, { left: '24%', top: -20, bottom: -20, width: 9 }]} />
      <View style={[styles.road, { left: '58%', top: -20, bottom: -20, width: 12 }]} />
      <View style={[styles.road, { left: '80%', top: -20, bottom: -20, width: 7 }]} />
      <View style={[styles.roadDiag, { top: '30%', left: '10%', width: '80%' }]} />

      {/* faint street labels */}
      <Text style={[styles.street, { top: '25%', left: '34%' }]}>Star Ave</Text>
      <Text style={[styles.street, { top: '47%', left: '62%' }]}>Lake St</Text>
      <Text style={[styles.street, { top: '69%', left: '30%' }]}>Prentice Gate</Text>
      <Text style={[styles.street, { top: '60%', left: '8%', transform: [{ rotate: '-18deg' }] }]}>Haymaker Pkwy</Text>

      {/* pins */}
      {pins.map((p) => (
        <View key={p.id} style={{ position: 'absolute', left: p.x, top: p.y, alignItems: 'center' }}>
          <PricePin
            label={p.price}
            dark={selectedId !== undefined && p.id !== selectedId}
            onPress={onSelectPin ? () => onSelectPin(p) : undefined}
          />
        </View>
      ))}

      {/* You marker */}
      <View style={styles.youWrap}>
        <View style={styles.youAvatar}>
          <Text style={{ fontSize: 20 }}>🧑‍🦱</Text>
        </View>
        <View style={styles.youLabel}>
          <Text style={styles.youText}>{youLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    backgroundColor: '#EDEFE9',
    overflow: 'hidden',
    position: 'relative',
  },
  block: { position: 'absolute', opacity: 0.9 },
  river: {
    position: 'absolute',
    left: '38%',
    top: -40,
    bottom: -40,
    width: 34,
    backgroundColor: '#C7DFF5',
    transform: [{ rotate: '-16deg' }],
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#fff',
  },
  road: { position: 'absolute', backgroundColor: '#fff', opacity: 0.95, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E2E5DE' },
  roadDiag: { position: 'absolute', height: 8, backgroundColor: '#fff', transform: [{ rotate: '-22deg' }], opacity: 0.95 },
  street: { position: 'absolute', fontSize: 10, color: '#9AA09A', fontWeight: '600' },
  youWrap: { position: 'absolute', left: '38%', top: '58%', alignItems: 'center' },
  youAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F6D9C3',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  youLabel: {
    marginTop: -6,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E9EAF0',
    elevation: 3,
  },
  youText: { fontSize: 11, fontWeight: '700', color: '#101828' },
});
