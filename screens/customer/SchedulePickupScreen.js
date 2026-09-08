import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { QtyStepper, AppButton } from '../../components/ui';
import { orderAPI } from '../../services/api';

const DATES = ['04 July, 2024', '05 July, 2024', '06 July, 2024'];
const TIMES = ['08:30 AM', '11:00 AM', '02:00 PM', '05:30 PM'];

export default function SchedulePickupScreen({ navigation, route }) {
  const shop = route.params?.shop || { name: 'Mary Dry Cleaners & Dyers', address: '661 Stanley Road, London' };
  const homeAddress = route.params?.address || '85 Great Portland Street, London';

  const [dateIdx, setDateIdx] = useState(0);
  const [timeIdx, setTimeIdx] = useState(0);
  const [items, setItems] = useState([
    { id: 'shirts', name: 'Shirts', emoji: '👔', tags: ['Dry clean', 'Iron', '+2'], notes: '', qty: 2, price: 2 },
    { id: 'tshirt', name: 'T-Shirt', emoji: '👕', tags: ['Dry clean', 'Iron'], notes: '', qty: 8, price: 4 },
    { id: 'jeans', name: 'Jeans', emoji: '👖', tags: ['Dry clean', 'Iron'], notes: '', qty: 4, price: 4 },
  ]);
  const [paying, setPaying] = useState(false);

  const totalQty = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);

  const bump = (id, d) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: Math.max(0, it.qty + d) } : it)));

  const payNow = async () => {
    if (totalQty === 0) {
      Alert.alert('Empty bag', 'Add at least one item');
      return;
    }
    setPaying(true);
    try {
      const perUnit = total / totalQty;
      await orderAPI.createOrder(totalQty, `${homeAddress} | ${shop.name} | ${DATES[dateIdx]} ${TIMES[timeIdx]}`, perUnit, 'on_app', items.map((i) => `${i.name}x${i.qty}`).join(', '));
      Alert.alert('Scheduled 🎉', `Pickup booked with ${shop.name} for ${DATES[dateIdx]} at ${TIMES[timeIdx]}`, [
        { text: 'View orders', onPress: () => navigation.navigate('CustomerTabs', { screen: 'Orders' }) },
        { text: 'OK', style: 'cancel' },
      ]);
    } catch (e) {
      Alert.alert('Failed to schedule', e.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <MaterialCommunityIcons name="chevron-left" size={22} color={colors.ink} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule pick up</Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.shop}>{shop.name}</Text>
        <View style={styles.addrRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color={colors.muted} />
          <Text style={styles.addr}>{shop.address}</Text>
        </View>

        <View style={styles.etaRow}>
          <MaterialCommunityIcons name="navigation" size={15} color={colors.primary} />
          <Text style={styles.etaBold}>10 –12 min</Text>
          <Text style={styles.etaMuted}> from your home  |  {homeAddress.slice(0, 22)}…</Text>
          <MaterialCommunityIcons name="chevron-down" size={15} color={colors.muted} />
        </View>

        <View style={styles.dtRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dtLabel}>Pickup date</Text>
            <TouchableOpacity style={styles.dtBox} onPress={() => setDateIdx((i) => (i + 1) % DATES.length)}>
              <Text style={styles.dtVal}>{DATES[dateIdx]}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dtLabel}>Pickup time</Text>
            <TouchableOpacity style={styles.dtBox} onPress={() => setTimeIdx((i) => (i + 1) % TIMES.length)}>
              <Text style={styles.dtVal}>{TIMES[timeIdx]}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.addMore}>
          <Text style={styles.addMoreText}>Add more items  +</Text>
        </TouchableOpacity>

        {items.map((it) => (
          <View key={it.id} style={styles.item}>
            <View style={styles.thumb}><Text style={{ fontSize: 26 }}>{it.emoji}</Text></View>
            <View style={{ flex: 1 }}>
              <View style={styles.itemTop}>
                <Text style={styles.itemName}>{it.name}</Text>
                <QtyStepper value={it.qty} onMinus={() => bump(it.id, -1)} onPlus={() => bump(it.id, 1)} />
              </View>
              <View style={styles.tags}>
                {it.tags.map((t) => (
                  <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                ))}
              </View>
              <View style={styles.itemBottom}>
                <Text style={styles.notes}>Add notes…</Text>
                <Text style={styles.price}>${it.qty * it.price}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.payRow}>
          <View style={styles.bankIcon}>
            <MaterialCommunityIcons name="bank" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardT}>Spark debit card</Text>
            <Text style={styles.cardS}>ending with 9087</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.change}>Change  ›</Text>
          </TouchableOpacity>
        </View>

        <AppButton title={`Pay Now ($${total})`} onPress={payNow} loading={paying} disabled={paying} />
        <Text style={styles.fine}>{totalQty} items • {shop.name} • {DATES[dateIdx]} {TIMES[timeIdx]}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { flexDirection: 'row', alignItems: 'center', width: 64 },
  backText: { fontSize: 14, color: colors.ink, fontWeight: '600' },
  headerTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  body: { padding: 16, paddingBottom: 30 },
  shop: { fontSize: 20, fontWeight: '800', color: colors.ink },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  addr: { fontSize: 13, color: colors.muted },
  etaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#fff', borderRadius: radius.md, padding: 11, borderWidth: 1, borderColor: colors.border },
  etaBold: { fontSize: 13, fontWeight: '800', color: colors.primary },
  etaMuted: { fontSize: 12, color: colors.muted, flex: 1 },
  dtRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  dtLabel: { fontSize: 12, color: colors.muted, marginBottom: 6 },
  dtBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.border },
  dtVal: { fontSize: 14, fontWeight: '700', color: colors.ink },
  addMore: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 12, marginTop: 14, marginBottom: 6 },
  addMoreText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  item: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: radius.lg, padding: 12, marginTop: 10, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  thumb: { width: 52, height: 62, borderRadius: 10, backgroundColor: colors.input, alignItems: 'center', justifyContent: 'center' },
  itemTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemName: { fontSize: 15, fontWeight: '800', color: colors.ink },
  tags: { flexDirection: 'row', gap: 6, marginTop: 7 },
  tag: { backgroundColor: colors.input, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  notes: { fontSize: 12, color: colors.faint },
  price: { fontSize: 14, fontWeight: '800', color: colors.ink },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: radius.lg, padding: 13, marginTop: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  bankIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardT: { fontSize: 13, fontWeight: '800', color: colors.ink },
  cardS: { fontSize: 12, color: colors.muted },
  change: { fontSize: 13, color: colors.primary, fontWeight: '700' },
  fine: { textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 10 },
});
