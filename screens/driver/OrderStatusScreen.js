import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Card, Button, Headline, Paragraph, RadioButton, Divider } from 'react-native-paper';
import { trackingAPI } from '../../services/api';
import socketService from '../../services/socketService';

export default function OrderStatusScreen({ route }) {
  const { orderId, deliveryId, initialStatus } = route.params;
  const [status, setStatus] = useState(initialStatus || 'pending');
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'Picked Up', value: 'picked_up' },
    { label: 'In Transit', value: 'in_transit' },
    { label: 'Delivered', value: 'delivered' },
  ];

  const getStatusColor = (stat) => {
    const colors = {
      pending: '#ff9800',
      assigned: '#2196f3',
      picked_up: '#9c27b0',
      in_transit: '#f44336',
      delivered: '#4caf50',
    };
    return colors[stat] || '#999';
  };

  const updateStatus = async () => {
    if (status === initialStatus) {
      Alert.alert('Info', 'Status is already ' + status);
      return;
    }

    setLoading(true);
    try {
      await trackingAPI.updateOrderStatus(orderId, status);
      socketService.notifyOrderStatusChange(orderId, status, deliveryId);
      Alert.alert('Success', `Order status updated to ${status.replace('_', ' ')}`);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Headline>Update Order Status</Headline>
          <Paragraph style={styles.orderId}>Order #{orderId}</Paragraph>
          <Divider style={styles.divider} />
          <Headline style={styles.sectionTitle}>Select New Status</Headline>

          <RadioButton.Group onValueChange={(value) => setStatus(value)} value={status}>
            {statusOptions.map((option) => (
              <View key={option.value} style={styles.radioOption}>
                <RadioButton value={option.value} disabled={loading} />
                <View style={styles.radioLabel}>
                  <Paragraph>{option.label}</Paragraph>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(option.value) }]}>
                    <Paragraph style={styles.badgeText}>{option.value.toUpperCase()}</Paragraph>
                  </View>
                </View>
              </View>
            ))}
          </RadioButton.Group>

          <Divider style={styles.divider} />

          <View style={styles.currentStatusSection}>
            <Headline style={styles.sectionTitle}>Current Status</Headline>
            <View style={[styles.currentStatusBadge, { backgroundColor: getStatusColor(initialStatus) }]}>
              <Paragraph style={styles.badgeText}>{(initialStatus || 'pending').toUpperCase()}</Paragraph>
            </View>
          </View>
        </Card.Content>

        <Card.Actions>
          <Button
            mode="contained"
            onPress={updateStatus}
            loading={loading}
            disabled={loading || status === initialStatus}
            style={styles.updateButton}
          >
            Update Status
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  card: { marginBottom: 15 },
  orderId: { marginTop: 10, fontSize: 14, color: '#666' },
  divider: { marginVertical: 15 },
  sectionTitle: { fontSize: 16, marginBottom: 12 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  radioLabel: { marginLeft: 12, flex: 1 },
  statusBadge: { marginTop: 6, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  currentStatusSection: { marginTop: 10 },
  currentStatusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start', marginTop: 8 },
  updateButton: { flex: 1, marginVertical: 10 },
});
