import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Headline, Card, Paragraph, Chip } from 'react-native-paper';
import { orderAPI } from '../../services/api';
import socketService from '../../services/socketService';

export default function CustomerTrackingScreen() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.offOrderStatusUpdate();
    };
  }, []);

  const trackOrder = async () => {
    if (!orderId) {
      Alert.alert('Error', 'Please enter order ID');
      return;
    }

    setLoading(true);
    try {
      const response = await orderAPI.getOrderById(orderId);
      setOrder(response.data.order);

      // Join Socket.io room for this order
      socketService.joinOrderRoom(orderId);

      // Listen for updates
      socketService.onOrderStatusUpdate((data) => {
        if (data.order_id === parseInt(orderId)) {
          setOrder((prev) => ({
            ...prev,
            status: data.status,
          }));
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      assigned: '#2196f3',
      picked_up: '#9c27b0',
      in_transit: '#f44336',
      delivered: '#4caf50',
    };
    return colors[status] || '#999';
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Enter Order ID"
        value={orderId}
        onChangeText={setOrderId}
        keyboardType="number-pad"
        style={styles.input}
        disabled={loading}
      />

      <Button
        mode="contained"
        onPress={trackOrder}
        loading={loading}
        style={styles.button}
        disabled={loading}
      >
        Track Order
      </Button>

      {order && (
        <Card style={styles.card}>
          <Card.Content>
            <Headline>Order #{order.order_number}</Headline>
            <Paragraph style={styles.detail}>
              Quantity: {order.quantity} units
            </Paragraph>
            <Paragraph style={styles.detail}>
              Address: {order.delivery_address}
            </Paragraph>
            <Paragraph style={styles.detail}>
              Total: KES {order.total_price}
            </Paragraph>

            <View style={styles.statusContainer}>
              <Headline style={styles.statusLabel}>Status:</Headline>
              <Chip
                icon="truck"
                style={{ backgroundColor: getStatusColor(order.status) }}
                textStyle={{ color: '#fff' }}
              >
                {order.status.toUpperCase()}
              </Chip>
            </View>

            {order.driver_name && (
              <View style={styles.driverInfo}>
                <Headline style={styles.driverLabel}>Driver</Headline>
                <Paragraph>Name: {order.driver_name}</Paragraph>
              </View>
            )}
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginBottom: 20,
  },
  card: {
    marginTop: 20,
  },
  detail: {
    marginVertical: 4,
  },
  statusContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  driverInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  driverLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
});
