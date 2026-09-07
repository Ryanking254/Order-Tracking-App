import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Button, Headline, Paragraph, Chip } from 'react-native-paper';
import { deliveryAPI, trackingAPI } from '../../services/api';
import socketService from '../../services/socketService';

export default function DriverActiveDeliveryScreen({ route, navigation }) {
  const { deliveryId } = route.params;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    socketService.connect();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await deliveryAPI.getDeliveryOrders(deliveryId);
      setOrders(response.data.orders);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await trackingAPI.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Notify via Socket.io
      socketService.notifyOrderStatusChange(orderId, newStatus, deliveryId);

      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const completeDelivery = async () => {
    Alert.alert(
      'Complete Delivery',
      'Are you sure you want to mark this delivery as complete?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await deliveryAPI.completeDelivery(deliveryId);
              socketService.notifyDeliveryStatusChange(deliveryId, 'completed');
              Alert.alert('Success', 'Delivery completed!');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to complete delivery');
            }
          },
        },
      ]
    );
  };

  const renderOrder = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Headline style={styles.orderNumber}>{item.order_number}</Headline>
        <Paragraph>Customer: {item.customer_name}</Paragraph>
        <Paragraph>Quantity: {item.quantity} units</Paragraph>
        <Paragraph>Address: {item.delivery_address}</Paragraph>
        <Chip style={styles.status}>
          {item.status.toUpperCase()}
        </Chip>
      </Card.Content>
      <Card.Actions>
        {item.status !== 'picked_up' && (
          <Button onPress={() => updateOrderStatus(item.id, 'picked_up')}>
            Picked Up
          </Button>
        )}
        {item.status === 'picked_up' && (
          <Button onPress={() => updateOrderStatus(item.id, 'in_transit')}>
            In Transit
          </Button>
        )}
        {item.status === 'in_transit' && (
          <Button onPress={() => updateOrderStatus(item.id, 'delivered')}>
            Delivered
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Headline>Delivery #{deliveryId}</Headline>
        <Button
          mode="contained"
          onPress={completeDelivery}
          style={styles.completeButton}
        >
          Complete Delivery
        </Button>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={fetchOrders}
        refreshing={loading}
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
  header: {
    marginBottom: 15,
  },
  card: {
    marginBottom: 10,
  },
  orderNumber: {
    marginBottom: 8,
  },
  status: {
    marginTop: 8,
    backgroundColor: '#2196f3',
    color: '#fff',
  },
  completeButton: {
    marginTop: 10,
    backgroundColor: '#4caf50',
  },
});
