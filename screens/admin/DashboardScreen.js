import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';
import { colors, radius, shadow } from '../../theme';
import { adminAPI, shopAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [shops, setShops] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, d] = await Promise.allSettled([adminAPI.getDashboardStats(), shopAPI.getMyShops()]);
      if (s.status === 'fulfilled') setStats(s.value.data.stats);
      else setStats(null);
      if (d.status === 'fulfilled') {
        const list = d.value.data.shops || [];
        setShops(list);
        setActiveId((prev) => {
          if (prev && list.some((x) => x.id === prev)) return prev;
          if (user?.shop_id && list.some((x) => x.id === user.shop_id)) return user.shop_id;
          return list[0]?.id ?? null;
        });
      }
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const shop = shops.find((x) => x.id === activeId) || null;
  const drivers = shop?.drivers || [];

  const copyCode = async () => {
    if (!shop?.invite_code) return;
    try {
      await Clipboard.setStringAsync(shop.invite_code);
      Alert.alert('Copied', `Invite code for ${shop.name} copied — send it to your drivers`);
    } catch {}
  };

  const regenCode = async () => {
    if (!shop) return;
    Alert.alert('New code?', `Old codes for ${shop.name} stop working immediately.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Regenerate', onPress: async () => {
        try {
          const res = await shopAPI.regenerateCode(shop.id);
          setShops((p) => p.map((x) => (x.id === shop.id ? { ...x, invite_code: res.data.invite_code } : x)));
        } catch {
          Alert.alert('Failed', 'Could not regenerate code');
        }
      } },
    ]);
  };

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
        {shops.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shopTabs}>
            {shops.map((x) => (
              <TouchableOpacity
                key={x.id}
                style={[styles.shopTab, x.id === activeId && styles.shopTabActive]}
                onPress={() => setActiveId(x.id)}
              >
                <Text style={[styles.shopTabT, x.id === activeId && styles.shopTabTActive]} numberOfLines={1}>
                  {x.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}
        {shop ? (
          <View style={styles.shopCard}>
            <View style={styles.shopRow}>
              {shop.image_url ? (
                <Image source={{ uri: shop.image_url }} style={styles.shopImg} />
              ) : (
                <View style={[styles.shopImg, styles.shopImgEmpty]}>
                  <MaterialCommunityIcons name="storefront-outline" size={26} color={colors.faint} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.shopName}>{shop.name}</Text>
                {shop.address ? <Text style={styles.shopAddr} numberOfLines={1}>{shop.address}</Text> : null}
                <Text style={styles.shopMeta}>{drivers.length} driver(s)</Text>
              </View>
            </View>
            <View style={styles.codeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.codeLabel}>Driver invite code</Text>
                <Text style={styles.code}>{shop.invite_code}</Text>
              </View>
              <TouchableOpacity style={styles.codeBtn} onPress={copyCode}>
                <MaterialCommunityIcons name="content-copy" size={16} color={colors.primary} />
                <Text style={styles.codeBtnT}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.codeBtn, styles.codeBtnGhost]} onPress={regenCode}>
                <MaterialCommunityIcons name="refresh" size={16} color={colors.muted} />
                <Text style={[styles.codeBtnT, { color: colors.muted }]}>New</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <TouchableOpacity style={styles.addShop} onPress={() => navigation.navigate('CreateShop')}>
          <MaterialCommunityIcons name="plus-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.addShopT}>Add another shop</Text>
        </TouchableOpacity>
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
  shopTabs: { gap: 8, paddingRight: 4, marginBottom: 12 },
  shopTab: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff' },
  shopTabActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  shopTabT: { fontSize: 13, fontWeight: '700', color: colors.muted, maxWidth: 140 },
  shopTabTActive: { color: colors.primaryDark },
  addShop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', marginBottom: 14 },
  addShopT: { fontSize: 14, fontWeight: '800', color: colors.primary },
  shopCard: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 14, ...shadow.card },
  shopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shopImg: { width: 58, height: 58, borderRadius: 14 },
  shopImgEmpty: { backgroundColor: colors.input, alignItems: 'center', justifyContent: 'center' },
  shopName: { fontSize: 17, fontWeight: '800', color: colors.ink },
  shopAddr: { fontSize: 12, color: colors.muted, marginTop: 2 },
  shopMeta: { fontSize: 11, color: colors.primaryDark, fontWeight: '700', marginTop: 3 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.bg, borderRadius: radius.md, padding: 10, marginTop: 12 },
  codeLabel: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  code: { fontSize: 20, fontWeight: '800', letterSpacing: 3, color: colors.ink },
  codeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  codeBtnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  codeBtnT: { fontSize: 12, fontWeight: '800', color: colors.primaryDark },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: radius.lg, padding: 15, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  ic: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  v: { fontSize: 19, fontWeight: '800', color: colors.ink },
  l: { fontSize: 12, color: colors.muted, marginTop: 3 },
  empty: { textAlign: 'center', marginTop: 60, color: colors.muted },
});
