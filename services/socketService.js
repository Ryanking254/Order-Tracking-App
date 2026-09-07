import io from 'socket.io-client';

let socket = null;

const SOCKET_URL = 'https://order-tracking-backend-00rd.onrender.com'; // Socket.io connects at root, not /api

export const socketService = {
  connect: () => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  // Customer: Watch order status
  joinOrderRoom: (orderId) => {
    if (socket) {
      socket.emit('join-order-room', orderId);
    }
  },

  // Customer/Driver: Listen for order status changes
  onOrderStatusUpdate: (callback) => {
    if (socket) {
      socket.on('status-update', callback);
    }
  },

  // Driver: Join delivery room
  joinDeliveryRoom: (deliveryId) => {
    if (socket) {
      socket.emit('join-delivery-room', deliveryId);
    }
  },

  // Driver: Send location update
  sendLocationUpdate: (delivery_id, latitude, longitude, accuracy) => {
    if (socket) {
      socket.emit('driver-location-update', {
        delivery_id,
        latitude,
        longitude,
        accuracy,
      });
    }
  },

  // Customer: Listen for live location updates
  onLocationUpdate: (callback) => {
    if (socket) {
      socket.on('location-update', callback);
    }
  },

  // Driver: Notify order status change
  notifyOrderStatusChange: (order_id, status, delivery_id) => {
    if (socket) {
      socket.emit('order-status-changed', {
        order_id,
        status,
        delivery_id,
      });
    }
  },

  // Driver: Notify delivery status change
  notifyDeliveryStatusChange: (delivery_id, status) => {
    if (socket) {
      socket.emit('delivery-status-changed', {
        delivery_id,
        status,
      });
    }
  },

  // Leave room
  leaveRoom: (room) => {
    if (socket) {
      socket.emit('leave-room', room);
    }
  },

  // Remove listeners
  offOrderStatusUpdate: () => {
    if (socket) {
      socket.off('status-update');
    }
  },

  offLocationUpdate: () => {
    if (socket) {
      socket.off('location-update');
    }
  },

  getSocket: () => socket,
};

export default socketService;
