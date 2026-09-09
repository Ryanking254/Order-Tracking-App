import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import FloatingTabBar from '../components/FloatingTabBar';
import { colors } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

import CustomerHomeScreen from '../screens/customer/HomeScreen';
import CustomerOrdersScreen from '../screens/customer/OrdersScreen';
import CustomerTrackingScreen from '../screens/customer/TrackingScreen';
import OrderWaitingScreen from '../screens/customer/OrderWaitingScreen';
import PaymentScreen from '../screens/customer/PaymentScreen';
import SchedulePickupScreen from '../screens/customer/SchedulePickupScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import ChooseShopScreen from '../screens/shop/ChooseShopScreen';

import DriverDeliveriesScreen from '../screens/driver/DeliveriesScreen';
import ShopQueueScreen from '../screens/driver/ShopQueueScreen';
import JoinShopScreen from '../screens/driver/JoinShopScreen';
import DriverMapScreen from '../screens/driver/MapScreen';
import DriverActiveDeliveryScreen from '../screens/driver/ActiveDeliveryScreen';
import OrderStatusScreen from '../screens/driver/OrderStatusScreen';

import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminOrdersScreen from '../screens/admin/OrdersScreen';
import AdminDeliveriesScreen from '../screens/admin/DeliveriesScreen';
import AssignDeliveryScreen from '../screens/admin/AssignDeliveryScreen';
import CreateShopScreen from '../screens/admin/CreateShopScreen';

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
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="Orders" component={CustomerOrdersScreen} options={{ tabBarBadge: 2 }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function CustomerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F3F4F6' },
      }}
    >
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
      <Stack.Screen name="SchedulePickup" component={SchedulePickupScreen} />
      <Stack.Screen name="OrderWaiting" component={OrderWaitingScreen} />
      <Stack.Screen name="Tracking" component={CustomerTrackingScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}

function CustomerOnboarding() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChooseShop" component={ChooseShopScreen} />
    </Stack.Navigator>
  );
}

function DriverTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Queue" component={ShopQueueScreen} />
      <Tab.Screen name="Deliveries" component={DriverDeliveriesScreen} />
      <Tab.Screen name="Map" component={DriverMapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function DriverOnboarding() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JoinShop" component={JoinShopScreen} />
    </Stack.Navigator>
  );
}

function DriverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F3F4F6' } }}>
      <Stack.Screen name="DriverTabs" component={DriverTabs} />
      <Stack.Screen name="ActiveDelivery" component={DriverActiveDeliveryScreen} />
      <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
    </Stack.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="AllOrders" component={AdminOrdersScreen} />
      <Tab.Screen name="ActiveDeliveries" component={AdminDeliveriesScreen} />
    </Tab.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="AssignDelivery" component={AssignDeliveryScreen} />
      <Stack.Screen name="CreateShop" component={CreateShopScreen} />
    </Stack.Navigator>
  );
}

function AdminOnboarding() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreateShop" component={CreateShopScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }
  const needsShop = !user?.shop_id;
  return (
    <NavigationContainer>
      {user?.role === 'admin' ? (
        needsShop ? <AdminOnboarding /> : <AdminStack />
      ) : user?.role === 'driver' ? (
        needsShop ? <DriverOnboarding /> : <DriverStack />
      ) : needsShop ? (
        <CustomerOnboarding />
      ) : (
        <CustomerStack />
      )}
    </NavigationContainer>
  );
}
