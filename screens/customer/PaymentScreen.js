import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Card, Button, Headline, Paragraph, TextInput, Divider, Chip } from 'react-native-paper';
import { paymentAPI } from '../../services/api';

export default function PaymentScreen({ route, navigation }) {
  const { orderId, totalPrice, paymentMethod } = route.params;
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      await paymentAPI.processPayment(orderId, paymentMethod, transactionId || null);
      Alert.alert('Success', 'Payment processed successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnDeliveryPayment = async () => {
    setLoading(true);
    try {
      await paymentAPI.confirmPaymentOnDelivery(orderId);
      Alert.alert('Success', 'Payment confirmed!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Headline>Payment Details</Headline>
          <Paragraph style={styles.label}>Order #{orderId}</Paragraph>
          
          <Divider style={styles.divider} />

          <View style={styles.priceSection}>
            <Headline style={styles.priceLabel}>Total Amount</Headline>
            <Headline style={styles.priceValue}>KES {totalPrice}</Headline>
          </View>

          <Divider style={styles.divider} />

          <Headline style={styles.methodTitle}>Payment Method</Headline>
          <Chip style={styles.methodChip}>
            {paymentMethod === 'on_app' ? 'Pay in App' : 'Pay on Delivery'}
          </Chip>

          {paymentMethod === 'on_app' && (
            <View style={styles.appPaymentSection}>
              <Headline style={styles.sectionTitle}>Enter Transaction ID</Headline>
              <TextInput
                label="Transaction ID (Optional)"
                value={transactionId}
                onChangeText={setTransactionId}
                placeholder="e.g., TXN123456"
                disabled={loading}
                style={styles.input}
              />
              
              <Button
                mode="contained"
                onPress={handlePayment}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Complete Payment
              </Button>
            </View>
          )}

          {paymentMethod === 'on_delivery' && (
            <View style={styles.onDeliverySection}>
              <Paragraph style={styles.infoText}>
                Payment will be collected during delivery. Click below to confirm payment received.
              </Paragraph>
              
              <Button
                mode="contained"
                onPress={handleOnDeliveryPayment}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Confirm Payment Received
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Headline style={styles.infoTitle}>Payment Security</Headline>
          <Paragraph style={styles.infoText}>
            All payments are secure and encrypted. Your transaction is protected.
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  card: { marginBottom: 15 },
  label: { marginTop: 10, fontSize: 14, color: '#666' },
  divider: { marginVertical: 15 },
  priceSection: { alignItems: 'center', paddingVertical: 20 },
  priceLabel: { fontSize: 14, color: '#666' },
  priceValue: { fontSize: 32, fontWeight: 'bold', color: '#4caf50', marginTop: 8 },
  methodTitle: { fontSize: 16, marginBottom: 10 },
  methodChip: { marginBottom: 15 },
  appPaymentSection: { marginTop: 20 },
  onDeliverySection: { marginTop: 20 },
  sectionTitle: { fontSize: 16, marginBottom: 12 },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  button: { marginTop: 15, paddingVertical: 6 },
  infoCard: { marginBottom: 30 },
  infoTitle: { fontSize: 16, marginBottom: 10 },
  infoText: { fontSize: 13, color: '#666' },
});
