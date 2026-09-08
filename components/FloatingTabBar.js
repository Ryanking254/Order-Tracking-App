import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, shadow } from '../theme';

// Floating pill tab bar matching the reference (Home / Orders / Profile)
export default function FloatingTabBar({ state, descriptors, navigation }) {
  const iconFor = (name, focused) => {
    const map = {
      Home: focused ? 'home-variant' : 'home-variant-outline',
      Orders: focused ? 'shopping' : 'shopping-outline',
      Tracking: focused ? 'map-marker-path' : 'map-marker-path',
      Profile: focused ? 'account' : 'account-outline',
      Deliveries: focused ? 'truck' : 'truck-outline',
      Map: focused ? 'navigation' : 'navigation-outline',
      Dashboard: focused ? 'view-dashboard' : 'view-dashboard-outline',
      AllOrders: focused ? 'package-variant-closed' : 'package-variant',
      ActiveDeliveries: focused ? 'truck-fast' : 'truck-fast-outline',
    };
    return map[name] || 'circle-outline';
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          const badge = route.name === 'Orders' && descriptors[route.key]?.options?.tabBarBadge;
          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab}>
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <MaterialCommunityIcons name={iconFor(route.name, focused)} size={21} color={focused ? colors.primary : colors.muted} />
                {badge ? (
                  <View style={styles.count}><Text style={styles.countT}>{badge}</Text></View>
                ) : null}
              </View>
              <Text style={[styles.label, focused && styles.labelActive]}>{route.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 26,
    marginHorizontal: 22, marginBottom: 14, paddingVertical: 10, paddingHorizontal: 10,
    borderWidth: 1, borderColor: '#ECECF0', ...shadow.tab,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  iconWrap: { padding: 6, borderRadius: 14, position: 'relative' },
  iconWrapActive: { backgroundColor: '#E7F6EC' },
  label: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  labelActive: { color: colors.ink, fontWeight: '800' },
  count: { position: 'absolute', top: -2, right: -6, backgroundColor: '#EF4444', minWidth: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  countT: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
