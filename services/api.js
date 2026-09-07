import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://ots-backend.vercel.app/api'; // Backend base path is /api/*

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Orders API
export const orderAPI = {
  createOrder: (quantity, delivery_address, price_per_unit, payment_method = 'on_app', notes = '') =>
    api.post('/orders', {
      quantity,
      delivery_address,
      price_per_unit,
      payment_method,
      notes,
    }),

  getMyOrders: () => api.get('/orders/my-orders'),

  getOrderById: (orderId) => api.get(`/orders/${orderId}`),

  getOrderPaymentStatus: (orderId) => api.get(`/payments/${orderId}`),
};

// Payment API
export const paymentAPI = {
  processPayment: (orderId, payment_method, transaction_id = null) =>
    api.post('/payments/process', {
      orderId,
      payment_method,
      transaction_id,
    }),

  confirmPaymentOnDelivery: (orderId) =>
    api.put(`/payments/${orderId}/confirm-on-delivery`),
};

// Deliveries API (Driver)
export const deliveryAPI = {
  getMyDeliveries: () => api.get('/deliveries/my-deliveries'),

  getDeliveryOrders: (deliveryId) => api.get(`/deliveries/${deliveryId}/orders`),

  startDelivery: (deliveryId) => api.put(`/deliveries/${deliveryId}/start`),

  completeDelivery: (deliveryId) => api.put(`/deliveries/${deliveryId}/complete`),
};

// Tracking API (GPS & Status)
export const trackingAPI = {
  updateLocation: (delivery_id, latitude, longitude, accuracy = null) =>
    api.post('/tracking/location', {
      delivery_id,
      latitude,
      longitude,
      accuracy,
    }),

  getLatestLocation: (deliveryId) => api.get(`/tracking/${deliveryId}/latest`),

  getLocationHistory: (deliveryId) => api.get(`/tracking/${deliveryId}/history`),

  updateOrderStatus: (orderId, status) =>
    api.put(`/tracking/order/${orderId}/status`, {
      status,
    }),
};

export default api;
