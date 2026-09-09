import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { StatusPill } from '../../components/ui';
import { orderAPI } from '../../services/api';

export default function CustomerOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getMyOrders();
      setOrders(res.data.orders || []);
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, []));

  const openOrder = (item) => {
    if (['picked_up', 'in_transit', 'delivered'].includes(item.status)) {
      navigation.navigate('Tracking', { prefillId: String(item.id) });
    } else {
      navigation.navigate('OrderWaiting', { orderId: item.id });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => openOrder(item)}
    >
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="package-variant-closed" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.num}>Order {item.order_number}</Text>
          {item.shop_name ? <Text style={styles.shop}>{item.shop_name}</Text> : null}
          <Text style={styles.sub}>{item.quantity} items • KES {item.total_price}</Text>
          <Text style={styles.addr} numberOfLines={1}>{item.delivery_address}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.faint} />
      </View>
      <View style={styles.foot}>
        <StatusPill status={item.status} />
        <View style={[styles.pay, { backgroundColor: item.payment_status === 'completed' ? colors.primarySoft : '#FFF4E5' }]}>
          <Text style={[styles.payText, { color: item.payment_status === 'completed' ? colors.primaryDark : '#B45309' }]}>
            {String(item.payment_status || '').toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.head}>
        <Text style={styles.title}>Orders</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          <Text style={styles.newText}>New</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} tintColor={colors.primary} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="shopping-outline" size={44} color={colors.faint} />
              <Text style={styles.emptyT}>No orders yet</Text>
              <Text style={styles.emptyS}>Find a cleaner on Home and schedule your first pickup.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14 },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  newText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 110, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  num: { fontSize: 15, fontWeight: '800', color: colors.ink },
  shop: { fontSize: 12, fontWeight: '700', color: colors.primaryDark, marginTop: 1 },
  sub: { fontSize: 13, color: colors.ink, fontWeight: '600', marginTop: 2 },
  addr: { fontSize: 12, color: colors.muted, marginTop: 2 },
  foot: { flexDirection: 'row', gap: 8, marginTop: 12 },
  pay: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  payText: { fontSize: 10, fontWeight: '800' },
  empty: { alignItems: 'center', marginTop: 70, paddingHorizontal: 30 },
  emptyT: { fontSize: 17, fontWeight: '800', color: colors.ink, marginTop: 12 },
  emptyS: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 6 },
});
