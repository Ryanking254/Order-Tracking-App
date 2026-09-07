import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAuth} from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

//Customer Screens
import CustomerHomeScreen from '../screens/customer/HomeScreen';
import CustomerOrdersScreen from '../screens/customer/OrdersScreen';
import CustomerTrackingScreen from '../screens/customer/TrackingScreen';
import PaymentScreen from '../screens/customer/PaymentScreen';

//Driver Screens
import DriverDeliveriesScreen from '../screens/driver/DeliveriesScreen';
import OrderStatusScreen from '../screens/driver/OrderStatusScreen';
import DriverMapScreen from '../screens/driver/MapScreen';
import DriverActiveDeliveryScreen from '../screens/driver/ActiveDeliveryScreen';

//Admin (Owner) Screens
import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminOrdersScreen from '../screens/admin/OrdersScreen';
import AdminDeliveriesScreen from '../screens/admin/DeliveriesScreen';
import AssignDeliveryScreen from '../screens/admin/AssignDeliveryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
        tabBarActiveTintColor: '#2196f3',
      }}
    >
      <Tab.Screen
        name="Home"
        component={CustomerHomeScreen}
        options={{
          title: 'Create Order',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="plus-circle" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={CustomerOrdersScreen}
        options={{
          title: 'My Orders',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="package-multiple" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Tracking"
        component={CustomerTrackingScreen}
        options={{
          title: 'Track Order',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map-marker" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function CustomerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CustomerTabs"
        component={CustomerTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
    </Stack.Navigator>
  );
}

function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#f44336',
      }}
    >
      <Tab.Screen
        name="Deliveries"
        component={DriverDeliveriesScreen}
        options={{
          title: 'My Deliveries',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="truck" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={DriverMapScreen}
        options={{
          title: 'Live Map',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="navigation" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function DriverStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DriverTabs"
        component={DriverTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ActiveDelivery"
        component={DriverActiveDeliveryScreen}
        options={{ title: 'Active Delivery' }}
      />
      <Stack.Screen
        name="OrderStatus"
        component={OrderStatusScreen}
        options={{ title: 'Update Order Status' }}
      />
    </Stack.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#4caf50',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="AllOrders"
        component={AdminOrdersScreen}
        options={{
          title: 'All Orders',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="package-multiple" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="ActiveDeliveries"
        component={AdminDeliveriesScreen}
        options={{
          title: 'Deliveries',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="truck" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminTabs"
        component={AdminTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AssignDelivery"
        component={AssignDeliveryScreen}
        options={{ title: 'Assign Delivery' }}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {user?.role === 'admin' ? (
        <AdminStack />
      ) : user?.role === 'driver' ? (
        <DriverStack />
      ) : (
        <CustomerStack />
      )}
    </NavigationContainer>
  );
}

export default RootNavigator;
