import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { adminAPI } from '../../services/api';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDashboardStats();
      setStats(res.data.stats);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const cards = stats ? [
    { label: "Today's orders", value: stats.today_orders, icon: 'package-variant-closed', bg: '#E7F6EC', c: colors.primary },
    { label: 'Pending', value: stats.pending_orders, icon: 'clock-outline', bg: '#FFF4E5', c: '#B45309' },
    { label: 'Active deliveries', value: stats.active_deliveries, icon: 'truck-fast-outline', bg: '#E8F0FE', c: '#2563EB' },
    { label: 'Completed today', value: stats.completed_today, icon: 'check-circle-outline', bg: '#E7F6EC', c: colors.primary },
    { label: "Today's revenue", value: `KES ${stats.today_revenue}`, icon: 'wallet-outline', bg: '#F3E8FF', c: '#7C3AED' },
    { label: 'Customers', value: stats.total_customers, icon: 'account-group-outline', bg: '#E8F0FE', c: '#2563EB' },
  ] : [];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Dashboard</Text>
      <ScrollView contentContainerStyle={styles.body} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>
        <View style={styles.grid}>
          {cards.map((c) => (
            <View key={c.label} style={styles.card}>
              <View style={[styles.ic, { backgroundColor: c.bg }]}>
                <MaterialCommunityIcons name={c.icon} size={22} color={c.c} />
              </View>
              <Text style={styles.v}>{c.value}</Text>
              <Text style={styles.l}>{c.label}</Text>
            </View>
          ))}
        </View>
        {!stats && !loading ? <Text style={styles.empty}>No stats available</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, padding: 18 },
  body: { padding: 16, paddingBottom: 120 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: radius.lg, padding: 15, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  ic: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  v: { fontSize: 19, fontWeight: '800', color: colors.ink },
  l: { fontSize: 12, color: colors.muted, marginTop: 3 },
  empty: { textAlign: 'center', marginTop: 60, color: colors.muted },
});
