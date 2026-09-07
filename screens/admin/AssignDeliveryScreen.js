import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, Headline, Paragraph, RadioButton, Checkbox } from 'react-native-paper';
import { adminAPI } from '../../services/api';

export default function AssignDeliveryScreen({ navigation }) {
  const [drivers, setDrivers] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [driversRes, ordersRes] = await Promise.all([
        adminAPI.getDrivers(),
        adminAPI.getAllOrders(),
      ]);
      setDrivers(driversRes.data.drivers);
      setPendingOrders(ordersRes.data.orders.filter((o) => o.status === 'pending'));
    } catch (error) {
      Alert.alert('Error', 'Failed to load drivers or orders');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleAssign = async () => {
    if (!selectedDriver) {
      Alert.alert('Error', 'Please select a driver');
      return;
    }
    if (selectedOrders.length === 0) {
      Alert.alert('Error', 'Please select at least one order');
      return;
    }

    setSubmitting(true);
    try {
      await adminAPI.createDelivery(selectedDriver, selectedOrders);
      Alert.alert('Success', 'Delivery assigned', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Failed', err.response?.data?.message || 'Could not assign delivery');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Paragraph style={styles.empty}>Loading...</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Headline style={styles.title}>Assign Delivery</Headline>

      <Card style={styles.section}>
        <Card.Content>
          <Headline style={styles.sectionTitle}>1. Select Driver</Headline>
          {drivers.length === 0 && <Paragraph>No drivers registered</Paragraph>}
          <RadioButton.Group
            onValueChange={(value) => setSelectedDriver(Number(value))}
            value={selectedDriver?.toString()}
          >
            {drivers.map((driver) => (
              <View key={driver.id} style={styles.option}>
                <RadioButton value={driver.id.toString()} disabled={submitting} />
                <Paragraph style={styles.optionLabel}>
                  {driver.name} ({driver.phone})
                </Paragraph>
              </View>
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Headline style={styles.sectionTitle}>2. Select Orders (pending)</Headline>
          {pendingOrders.length === 0 && <Paragraph>No pending orders</Paragraph>}
          {pendingOrders.map((order) => (
            <View key={order.id} style={styles.option}>
              <Checkbox
                status={selectedOrders.includes(order.id) ? 'checked' : 'unchecked'}
                onPress={() => toggleOrder(order.id)}
                disabled={submitting}
              />
              <Paragraph style={styles.optionLabel}>
                {order.order_number} — {order.customer_name}, {order.quantity} units
              </Paragraph>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleAssign}
        loading={submitting}
        disabled={submitting}
        style={styles.button}
      >
        Assign {selectedOrders.length} Order(s)
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    marginVertical: 15,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  optionLabel: {
    marginLeft: 8,
    flex: 1,
  },
  button: {
    marginVertical: 15,
    paddingVertical: 6,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
  },
});
