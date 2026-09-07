import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Headline, Card } from 'react-native-paper';
import { orderAPI } from '../../services/api';

export default function CustomerHomeScreen() {
  const [quantity, setQuantity] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const price = '100';

  const createOrder = async () => {
    if (!quantity || !address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await orderAPI.createOrder(
        parseInt(quantity),
        address,
        parseFloat(price),
        'on_app'
      );
      Alert.alert('Success', 'Order created successfully!');
      setQuantity('');
      setAddress('');
    } catch (error) {
      Alert.alert('Error', 'Failed to create order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Headline>Create Water Order</Headline>
          
          <TextInput
            label="Quantity (Units)"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            style={styles.input}
            disabled={loading}
          />
          
          <TextInput
            label="Delivery Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            disabled={loading}
            multiline
          />
          
          <TextInput
            label="Price per Unit (KES)"
            value={price}
            editable={false}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={createOrder}
            loading={loading}
            style={styles.button}
            disabled={loading}
          >
            Place Order
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 15,
  },
});
