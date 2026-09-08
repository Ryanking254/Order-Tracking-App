import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { AppButton } from '../../components/ui';
import { paymentAPI } from '../../services/api';

export default function PaymentScreen({ route, navigation }) {
  const { orderId, totalPrice, paymentMethod } = route.params || {};
  const [txn, setTxn] = useState('');
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    setLoading(true);
    try {
      await paymentAPI.processPayment(orderId, paymentMethod, txn || null);
      Alert.alert('Paid 🎉', 'Payment processed', [{ text: 'Done', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Payment failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Payment</Text>
        <View style={styles.amountCard}>
          <Text style={styles.aLabel}>Total amount</Text>
          <Text style={styles.aVal}>KES {totalPrice}</Text>
          <Text style={styles.aSub}>Order #{orderId} • {paymentMethod === 'on_app' ? 'Pay in app' : 'Pay on delivery'}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.payRow}>
            <View style={styles.bankIcon}><MaterialCommunityIcons name="bank" size={20} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardT}>Spark debit card</Text>
              <Text style={styles.cardS}>ending with 9087</Text>
            </View>
            <Text style={styles.change}>Change  ›</Text>
          </View>
          {paymentMethod === 'on_app' ? (
            <>
              <Text style={styles.label}>Transaction ID (optional)</Text>
              <View style={styles.field}>
                <TextInput value={txn} onChangeText={setTxn} placeholder="e.g. TXN123456" placeholderTextColor={colors.faint} style={styles.input} editable={!loading} />
              </View>
            </>
          ) : (
            <Text style={styles.info}>Payment will be collected during delivery.</Text>
          )}
          <AppButton title={`Pay Now (KES ${totalPrice})`} onPress={pay} loading={loading} disabled={loading} style={{ marginTop: 12 }} />
        </View>

        <View style={styles.secure}>
          <MaterialCommunityIcons name="shield-check-outline" size={18} color={colors.primary} />
          <Text style={styles.secureT}>Secure & encrypted checkout</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, marginBottom: 12 },
  amountCard: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 20, alignItems: 'center', ...shadow.card },
  aLabel: { color: '#9CA3AF', fontSize: 13 },
  aVal: { color: '#fff', fontSize: 34, fontWeight: '800', marginTop: 6 },
  aSub: { color: '#9CA3AF', fontSize: 12, marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: radius.xl, padding: 16, marginTop: 14, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bankIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardT: { fontWeight: '800', color: colors.ink, fontSize: 14 },
  cardS: { color: colors.muted, fontSize: 12 },
  change: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginTop: 14, marginBottom: 7 },
  field: { backgroundColor: colors.input, borderRadius: radius.md, paddingHorizontal: 13, paddingVertical: 13 },
  input: { fontSize: 15, color: colors.ink, paddingVertical: 0 },
  info: { color: colors.muted, fontSize: 13, marginTop: 14 },
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  secureT: { color: colors.muted, fontSize: 12, fontWeight: '600' },
});
