import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Headline, Paragraph, Chip } from 'react-native-paper';
import { adminAPI } from '../../services/api';

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllOrders();
      setOrders(response.data.orders);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch orders');
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
      cancelled: '#999',
    };
    return colors[status] || '#999';
  };

  const renderOrder = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Headline style={styles.orderNumber}>Order {item.order_number}</Headline>
        <Paragraph>Customer: {item.customer_name} ({item.customer_phone})</Paragraph>
        <Paragraph>Driver: {item.driver_name || 'Not assigned'}</Paragraph>
        <Paragraph>Quantity: {item.quantity} units</Paragraph>
        <Paragraph>Address: {item.delivery_address}</Paragraph>
        <Paragraph>Total: KES {item.total_price}</Paragraph>

        <View style={styles.statusRow}>
          <Chip
            icon="truck"
            style={{ backgroundColor: getStatusColor(item.status) }}
            textStyle={{ color: '#fff' }}
          >
            {item.status.toUpperCase()}
          </Chip>
          <Chip
            icon="wallet"
            style={{
              backgroundColor: item.payment_status === 'completed' ? '#4caf50' : '#ff9800',
              marginLeft: 8,
            }}
            textStyle={{ color: '#fff' }}
          >
            {item.payment_status.toUpperCase()}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={fetchOrders}
        refreshing={loading}
        ListEmptyComponent={
          <Headline style={styles.empty}>No orders yet</Headline>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 10,
  },
  orderNumber: {
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
  },
});
