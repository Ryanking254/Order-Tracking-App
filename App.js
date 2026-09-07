import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import CustomerHomeScreen from './screens/customer/HomeScreen';
import CustomerOrdersScreen from './screens/customer/OrdersScreen';
import CustomerTrackingScreen from './screens/customer/TrackingScreen';
import DriverDeliveriesScreen from './screens/driver/DeliveriesScreen';
import DriverMapScreen from './screens/driver/MapScreen';
import DriverActiveDeliveryScreen from './screens/driver/ActiveDeliveryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={CustomerHomeScreen}
        options={{
          title: 'Create Order',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={CustomerOrdersScreen}
        options={{
          title: 'My Orders',
        }}
      />
      <Tab.Screen
        name="Tracking"
        component={CustomerTrackingScreen}
        options={{
          title: 'Track Order',
        }}
      />
    </Tab.Navigator>
  );
}

function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Deliveries"
        component={DriverDeliveriesScreen}
        options={{
          title: 'My Deliveries',
        }}
      />
      <Tab.Screen
        name="Map"
        component={DriverMapScreen}
        options={{
          title: 'Live Map',
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null; // Or show a splash screen
  }

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // Route based on user role
  if (user?.role === 'driver') {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="DriverMain"
          component={DriverTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ActiveDelivery"
          component={DriverActiveDeliveryScreen}
          options={{ title: 'Active Delivery' }}
        />
      </Stack.Navigator>
    );
  }

  if (user?.role === 'customer') {
    return <CustomerTabs />;
  }

  // Default to customer if role not recognized
  return <CustomerTabs />;
}

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
