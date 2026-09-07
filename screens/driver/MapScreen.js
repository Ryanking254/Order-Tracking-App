import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Headline, Card, Paragraph, ActivityIndicator } from 'react-native-paper';
import * as Location from 'expo-location';
import { trackingAPI } from '../../services/api';
import socketService from '../../services/socketService';

export default function DriverMapScreen({ route }) {
  const { deliveryId } = route.params;
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    socketService.connect();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Location permission is required');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const startTracking = async () => {
    setTracking(true);
    
    try {
      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);

      // Send to backend
      await trackingAPI.updateLocation(
        deliveryId,
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        currentLocation.coords.accuracy
      );

      // Broadcast via Socket.io
      socketService.sendLocationUpdate(
        deliveryId,
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        currentLocation.coords.accuracy
      );

      Alert.alert('Success', 'Location sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send location: ' + error.message);
    } finally {
      setTracking(false);
    }
  };

  const startContinuousTracking = () => {
    setLoading(true);
    const interval = setInterval(async () => {
      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLocation(currentLocation);

        // Send to backend
        await trackingAPI.updateLocation(
          deliveryId,
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          currentLocation.coords.accuracy
        );

        // Broadcast via Socket.io
        socketService.sendLocationUpdate(
          deliveryId,
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          currentLocation.coords.accuracy
        );
      } catch (error) {
        console.error('Tracking error:', error);
      }
    }, 10000); // Update every 10 seconds

    // Store interval ID for cleanup
    setTracking(true);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Headline>Live GPS Tracking</Headline>
          <Paragraph style={styles.label}>Delivery #{deliveryId}</Paragraph>

          {location && (
            <View style={styles.locationInfo}>
              <Paragraph>
                Latitude: {location.coords.latitude.toFixed(6)}
              </Paragraph>
              <Paragraph>
                Longitude: {location.coords.longitude.toFixed(6)}
              </Paragraph>
              <Paragraph>
                Accuracy: {location.coords.accuracy?.toFixed(2)} m
              </Paragraph>
            </View>
          )}

          {!location && (
            <ActivityIndicator size="large" style={styles.loader} />
          )}
        </Card.Content>

        <Card.Actions>
          <Button
            mode="contained"
            onPress={startTracking}
            loading={tracking}
            disabled={tracking}
          >
            Send Location
          </Button>
          <Button
            mode="outlined"
            onPress={startContinuousTracking}
            disabled={loading}
          >
            Start Continuous
          </Button>
        </Card.Actions>
      </Card>
    </View>
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
  label: {
    marginVertical: 10,
  },
  locationInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  loader: {
    marginTop: 20,
  },
});
