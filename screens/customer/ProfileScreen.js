import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, shadow } from '../../theme';

export default function ProfileScreen({ navigation }) {
  const { user, shop, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  const customerRows = [
    { icon: 'map-marker-path', t: 'Track order', s: 'Live status & courier', go: () => navigation.navigate('Tracking') },
    { icon: 'package-variant-closed', t: 'My orders', s: 'History & receipts', go: () => navigation.navigate('CustomerTabs', { screen: 'Orders' }) },
    { icon: 'credit-card-outline', t: 'Payments', s: 'Spark debit •• 9087', go: () => navigation.navigate('CustomerTabs', { screen: 'Orders' }) },
    { icon: 'bell-outline', t: 'Notifications', s: 'Pickup reminders on', go: () => {} },
  ];
  const driverRows = [
    { icon: 'truck-fast-outline', t: 'New orders', s: 'Claim shop orders', go: () => navigation.navigate('Queue') },
    { icon: 'package-variant-closed', t: 'My deliveries', s: 'Assigned jobs', go: () => navigation.navigate('Deliveries') },
    { icon: 'map-marker-path', t: 'Live map', s: 'Share GPS', go: () => navigation.navigate('Map') },
  ];
  const adminRows = [
    { icon: 'view-dashboard-outline', t: 'Dashboard', s: 'Stats & invite code', go: () => navigation.navigate('Dashboard') },
    { icon: 'package-variant-closed', t: 'All orders', s: 'Shop orders', go: () => navigation.navigate('AllOrders') },
    { icon: 'truck-fast-outline', t: 'Active deliveries', s: 'Live couriers', go: () => navigation.navigate('ActiveDeliveries') },
  ];
  const rows = user?.role === 'driver' ? driverRows : user?.role === 'admin' ? adminRows : customerRows;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.hero}>
        <View style={styles.avatar}><Text style={{ fontSize: 32 }}>🧑‍🦱</Text></View>
        <Text style={styles.name}>{user?.name || 'Guest'}</Text>
        <Text style={styles.phone}>{user?.phone || ''} • {user?.role === 'admin' ? 'shop owner' : user?.role || 'customer'}</Text>
        {shop?.name ? (
          <View style={styles.locPill}>
            <MaterialCommunityIcons name="storefront-outline" size={13} color={colors.primary} />
            <Text style={styles.locT}>{shop.name}</Text>
          </View>
        ) : (
          <View style={styles.locPill}>
            <MaterialCommunityIcons name="map-marker" size={13} color={colors.primary} />
            <Text style={styles.locT}>85 Great Portland Street, London</Text>
          </View>
        )}
      </View>

      <View style={styles.list}>
        {rows.map((r) => (
          <TouchableOpacity key={r.t} style={styles.row} onPress={r.go}>
            <View style={styles.rowIcon}><MaterialCommunityIcons name={r.icon} size={20} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowT}>{r.t}</Text>
              <Text style={styles.rowS}>{r.s}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.faint} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.row, { borderColor: '#FECACA' }]} onPress={confirmLogout}>
          <View style={[styles.rowIcon, { backgroundColor: '#FEF2F2' }]}>
            <MaterialCommunityIcons name="logout" size={20} color="#DC2626" />
          </View>
          <Text style={[styles.rowT, { color: '#DC2626' }]}>Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: 'center', paddingTop: 20, paddingBottom: 16 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#F6D9C3', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', ...shadow.card },
  name: { fontSize: 20, fontWeight: '800', color: colors.ink, marginTop: 10 },
  phone: { fontSize: 13, color: colors.muted, marginTop: 3 },
  locPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginTop: 10, borderWidth: 1, borderColor: colors.border },
  locT: { fontSize: 12, fontWeight: '600', color: colors.ink },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 120 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  rowIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  rowT: { fontSize: 15, fontWeight: '800', color: colors.ink },
  rowS: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
