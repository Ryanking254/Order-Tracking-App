import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { AppButton } from '../../components/ui';
import { shopAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ChooseShopScreen() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { user, refreshMe, patchUser, logout } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const res = await shopAPI.listShops();
      setShops(res.data.shops || []);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const confirm = async () => {
    if (!selectedId) {
      Alert.alert('Pick a shop', 'Choose a shop to continue');
      return;
    }
    setSaving(true);
    try {
      const res = await shopAPI.chooseShop(selectedId);
      const me = await refreshMe();
      if (!me?.user?.shop_id && (res.data?.shop?.id || selectedId)) {
        await patchUser({ shop_id: res.data?.shop?.id || selectedId });
      }
    } catch (e) {
      Alert.alert('Failed', e.response?.data?.message || 'Could not set shop');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => {
    const active = item.id === selectedId;
    return (
      <TouchableOpacity
        style={[styles.card, active && styles.cardActive]}
        onPress={() => setSelectedId(item.id)}
        activeOpacity={0.9}
      >
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.img} />
        ) : (
          <View style={[styles.img, styles.imgEmpty]}>
            <MaterialCommunityIcons name="storefront-outline" size={30} color={colors.faint} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          {item.address ? <Text style={styles.addr} numberOfLines={1}>{item.address}</Text> : null}
          <Text style={styles.meta}>
            {(item.driver_count ?? 0)} drivers{(item.active_orders ?? 0) > 0 ? ` • ${item.active_orders} active` : ''}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={active ? 'radiobox-marked' : 'radiobox-blank'}
          size={24}
          color={active ? colors.primary : colors.faint}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Choose your shop</Text>
      <Text style={styles.sub}>Orders and live tracking come from this shop.</Text>
      <FlatList
        data={shops}
        renderItem={renderItem}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No shops onboarded yet — check back soon.</Text> : null}
      />
      <View style={styles.foot}>
        <AppButton
          title={saving ? 'Saving…' : 'Continue'}
          onPress={confirm}
          loading={saving}
          disabled={saving || !selectedId}
        />
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutT}>
            Logged in as {user?.phone || user?.name || 'guest'} — not you? <Text style={{ fontWeight: '800' }}>Log out</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, paddingHorizontal: 18, paddingTop: 14 },
  sub: { fontSize: 13, color: colors.muted, paddingHorizontal: 18, marginTop: 2, marginBottom: 10 },
  list: { padding: 16, paddingBottom: 20, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: radius.lg, padding: 12, borderWidth: 1.5, borderColor: colors.border, ...shadow.card },
  cardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  img: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.input },
  imgEmpty: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '800', color: colors.ink },
  addr: { fontSize: 12, color: colors.muted, marginTop: 2 },
  meta: { fontSize: 11, color: colors.primaryDark, fontWeight: '700', marginTop: 3 },
  empty: { textAlign: 'center', marginTop: 60, color: colors.muted, paddingHorizontal: 30 },
  foot: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border },
  logoutBtn: { marginTop: 12, alignItems: 'center' },
  logoutT: { fontSize: 12, color: colors.muted },
});
