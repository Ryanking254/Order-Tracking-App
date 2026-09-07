import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Button, Headline, Paragraph, Chip } from 'react-native-paper';
import { deliveryAPI } from '../../services/api';

export default function DriverDeliveriesScreen({ navigation }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await deliveryAPI.getMyDeliveries();
      setDeliveries(response.data.deliveries);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const startDelivery = async (deliveryId) => {
    try {
      await deliveryAPI.startDelivery(deliveryId);
      Alert.alert('Success', 'Delivery started!');
      navigation.navigate('ActiveDelivery', { deliveryId });
    } catch (error) {
      Alert.alert('Error', 'Failed to start delivery');
    }
  };

  const renderDelivery = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Headline>Delivery #{item.id}</Headline>
        <Paragraph>Orders: {item.order_count}</Paragraph>
        <Paragraph>Total Quantity: {item.total_quantity || 0} units</Paragraph>
        
        <Chip
          style={{
            backgroundColor: item.status === 'pending' ? '#ff9800' : '#4caf50',
            marginTop: 10,
          }}
          textStyle={{ color: '#fff' }}
        >
          {item.status.toUpperCase()}
        </Chip>
      </Card.Content>
      <Card.Actions>
        {item.status === 'pending' && (
          <Button onPress={() => startDelivery(item.id)}>Start</Button>
        )}
        <Button onPress={() => navigation.navigate('Map', { deliveryId: item.id })}>
          View Orders
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={deliveries}
        renderItem={renderDelivery}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={fetchDeliveries}
        refreshing={loading}
        ListEmptyComponent={
          <Headline style={styles.empty}>No deliveries assigned</Headline>
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
  empty: {
    textAlign: 'center',
    marginTop: 50,
  },
});
