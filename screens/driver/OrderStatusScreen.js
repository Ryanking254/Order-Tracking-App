import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { AppButton } from '../../components/ui';
import { trackingAPI } from '../../services/api';
import socketService from '../../services/socketService';

const OPTIONS = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'];

export default function OrderStatusScreen({ route, navigation }) {
  const { orderId, deliveryId, initialStatus } = route.params || {};
  const [status, setStatus] = useState(initialStatus || 'pending');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await trackingAPI.updateOrderStatus(orderId, status);
      socketService.notifyOrderStatusChange(orderId, status, deliveryId);
      Alert.alert('Updated', `Status → ${status}`, [{ text: 'Done', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Order #{orderId}</Text>
      <ScrollView contentContainerStyle={styles.body}>
        {OPTIONS.map((o) => (
          <TouchableOpacity key={o} style={[styles.opt, status === o && styles.optActive]} onPress={() => setStatus(o)}>
            <MaterialCommunityIcons name={status === o ? 'radiobox-marked' : 'radiobox-blank'} size={22} color={status === o ? colors.primary : colors.faint} />
            <Text style={[styles.optT, status === o && { color: colors.primaryDark }]}>{o.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
        <AppButton title="Update status" onPress={save} loading={loading} disabled={loading || status === initialStatus} style={{ marginTop: 14 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, padding: 18 },
  body: { padding: 16, paddingBottom: 40 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: radius.lg, padding: 15, marginBottom: 10, borderWidth: 1.5, borderColor: colors.border },
  optActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optT: { fontSize: 15, fontWeight: '700', color: colors.ink, textTransform: 'capitalize' },
});
