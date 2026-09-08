import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { AppButton } from '../../components/ui';
import { adminAPI } from '../../services/api';

export default function AssignDeliveryScreen({ navigation }) {
  const [drivers, setDrivers] = useState([]);
  const [pending, setPending] = useState([]);
  const [driverId, setDriverId] = useState(null);
  const [picked, setPicked] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [d, o] = await Promise.all([adminAPI.getDrivers(), adminAPI.getAllOrders()]);
        setDrivers(d.data.drivers || []);
        setPending((o.data.orders || []).filter((x) => x.status === 'pending'));
      } catch {
        Alert.alert('Error', 'Failed to load');
      }
    })();
  }, []);

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const assign = async () => {
    if (!driverId || picked.length === 0) {
      Alert.alert('Select driver + orders', 'Pick at least one of each');
      return;
    }
    setBusy(true);
    try {
      await adminAPI.createDelivery(driverId, picked);
      Alert.alert('Assigned 🎉', 'Delivery created', [{ text: 'Done', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Failed', e.response?.data?.message || 'Could not assign');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Assign delivery</Text>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.h}>1 • Driver</Text>
        {drivers.map((d) => (
          <TouchableOpacity key={d.id} style={[styles.opt, driverId === d.id && styles.on]} onPress={() => setDriverId(d.id)}>
            <MaterialCommunityIcons name={driverId === d.id ? 'radiobox-marked' : 'radiobox-blank'} size={20} color={driverId === d.id ? colors.primary : colors.faint} />
            <Text style={styles.ot}>{d.name} ({d.phone})</Text>
          </TouchableOpacity>
        ))}
        <Text style={[styles.h, { marginTop: 16 }]}>2 • Pending orders</Text>
        {pending.map((o) => (
          <TouchableOpacity key={o.id} style={[styles.opt, picked.includes(o.id) && styles.on]} onPress={() => toggle(o.id)}>
            <MaterialCommunityIcons name={picked.includes(o.id) ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={picked.includes(o.id) ? colors.primary : colors.faint} />
            <Text style={styles.ot}>{o.order_number} — {o.customer_name}</Text>
          </TouchableOpacity>
        ))}
        {pending.length === 0 ? <Text style={styles.empty}>No pending orders</Text> : null}
        <AppButton title={`Assign ${picked.length} order(s)`} onPress={assign} loading={busy} disabled={busy} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, padding: 18 },
  body: { padding: 16, paddingBottom: 40 },
  h: { fontSize: 14, fontWeight: '800', color: colors.ink, marginBottom: 10 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: radius.lg, padding: 13, marginBottom: 8, borderWidth: 1.5, borderColor: colors.border },
  on: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  ot: { fontSize: 14, fontWeight: '600', color: colors.ink },
  empty: { color: colors.muted, marginTop: 8 },
});
