import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://order-tracking-backend-00rd.onrender.com/api'; // Backend base path is /api/*

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

// Shops API (owner onboarding, driver invite codes, customer choice)
export const shopAPI = {
  listShops: () => api.get('/shops'),

  createShop: (name, image_url, address) =>
    api.post('/shops', { name, image_url, address }),

  getMyShops: () => api.get('/shops/my-shops'),

  regenerateCode: (shop_id) => api.post('/shops/regenerate-code', { shop_id }),

  joinWithCode: (invite_code) => api.post('/shops/join', { invite_code }),

  chooseShop: (shop_id) => api.post('/shops/choose', { shop_id }),
};

// Auth API
export const authAPI = {
  me: () => api.get('/auth/me'),
};

// Orders API
export const orderAPI = {
  createOrder: (quantity, delivery_address, price_per_unit, payment_method = 'on_app', notes = '', shop_id = null) =>
    api.post('/orders', {
      quantity,
      delivery_address,
      price_per_unit,
      payment_method,
      notes,
      shop_id,
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

  getShopQueue: () => api.get('/deliveries/shop-queue'),

  claimOrder: (order_id) => api.post('/deliveries/claim', { order_id }),

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

// Admin API (Owners — requires admin role)
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  getAllOrders: () => api.get('/admin/orders'),

  getActiveDeliveries: () => api.get('/admin/deliveries/active'),

  getDrivers: () => api.get('/admin/drivers'),

  createDelivery: (driver_id, order_ids) =>
    api.post('/admin/deliveries', {
      driver_id,
      order_ids,
    }),
};

export default api;
