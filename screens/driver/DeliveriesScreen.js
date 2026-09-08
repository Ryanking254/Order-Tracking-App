import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { AppButton } from '../../components/ui';
import { deliveryAPI } from '../../services/api';

export default function DriverDeliveriesScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await deliveryAPI.getMyDeliveries();
      setItems(res.data.deliveries || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchAll(); }, []));

  const start = async (id) => {
    try {
      await deliveryAPI.startDelivery(id);
      navigation.navigate('ActiveDelivery', { deliveryId: id });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Deliveries</Text>
      <Text style={styles.sub}>Pickup jobs assigned to you</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.icon}><MaterialCommunityIcons name="truck-fast-outline" size={22} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.t}>Delivery #{item.id}</Text>
                <Text style={styles.s}>{item.order_count} orders • {item.total_quantity || 0} items</Text>
              </View>
              <View style={[styles.pill, { backgroundColor: item.status === 'pending' ? '#FFF4E5' : colors.primarySoft }]}>
                <Text style={[styles.pillT, { color: item.status === 'pending' ? '#B45309' : colors.primaryDark }]}>{String(item.status).toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.btns}>
              {item.status === 'pending' ? <AppButton title="Start" onPress={() => start(item.id)} style={{ flex: 1 }} /> : null}
              <AppButton title="Open" variant="secondary" onPress={() => navigation.navigate('ActiveDelivery', { deliveryId: item.id })} style={{ flex: 1 }} />
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No deliveries assigned</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, paddingHorizontal: 18, paddingTop: 14 },
  sub: { fontSize: 13, color: colors.muted, paddingHorizontal: 18, marginBottom: 10 },
  list: { padding: 16, paddingBottom: 120, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  t: { fontSize: 15, fontWeight: '800', color: colors.ink },
  s: { fontSize: 12, color: colors.muted, marginTop: 2 },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pillT: { fontSize: 10, fontWeight: '800' },
  btns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  empty: { textAlign: 'center', marginTop: 60, color: colors.muted },
});
