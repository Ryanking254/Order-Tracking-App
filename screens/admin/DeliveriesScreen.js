import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { AppButton } from '../../components/ui';
import { adminAPI } from '../../services/api';

export default function AdminDeliveriesScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getActiveDeliveries();
      setItems(res.data.deliveries || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Deliveries</Text>
      <View style={{ paddingHorizontal: 16 }}>
        <AppButton title="+ Assign new delivery" onPress={() => navigation.navigate('AssignDelivery')} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.ic}><MaterialCommunityIcons name="truck-fast-outline" size={20} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.t}>Delivery #{item.id}</Text>
                <Text style={styles.s}>{item.driver_name} • {item.order_count} orders</Text>
                <Text style={styles.a}>{item.latest_location ? `${item.latest_location.latitude}, ${item.latest_location.longitude}` : 'No GPS yet'}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No active deliveries</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, padding: 18 },
  list: { padding: 16, gap: 12, paddingBottom: 120 },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  ic: { width: 44, height: 44, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  t: { fontWeight: '800', color: colors.ink, fontSize: 15 },
  s: { fontSize: 12, color: colors.ink, fontWeight: '600', marginTop: 2 },
  a: { fontSize: 12, color: colors.muted, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 60, color: colors.muted },
});
