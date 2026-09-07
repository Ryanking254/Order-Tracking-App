import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Button, Headline, Paragraph, Chip } from 'react-native-paper';
import { adminAPI } from '../../services/api';

export default function AdminDeliveriesScreen({ navigation }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getActiveDeliveries();
      setDeliveries(response.data.deliveries);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch active deliveries');
    } finally {
      setLoading(false);
    }
  };

  const renderDelivery = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Headline style={styles.deliveryId}>Delivery #{item.id}</Headline>
        <Paragraph>Driver: {item.driver_name} ({item.driver_phone})</Paragraph>
        <Paragraph>Orders: {item.order_count}</Paragraph>
        <Paragraph>Units: {item.total_quantity}</Paragraph>
        <Paragraph>
          Last location:{' '}
          {item.latest_location
            ? `${item.latest_location.latitude}, ${item.latest_location.longitude}`
            : 'No GPS data yet'}
        </Paragraph>

        <View style={styles.statusRow}>
          <Chip
            icon="truck"
            style={{ backgroundColor: '#f44336' }}
            textStyle={{ color: '#fff' }}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AssignDelivery')}
        style={styles.assignButton}
      >
        Assign New Delivery
      </Button>
      <FlatList
        data={deliveries}
        renderItem={renderDelivery}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={fetchDeliveries}
        refreshing={loading}
        ListEmptyComponent={
          <Headline style={styles.empty}>No active deliveries</Headline>
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
  assignButton: {
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
  },
  deliveryId: {
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
