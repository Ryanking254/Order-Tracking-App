# Water Order Tracking — Mobile App (Frontend)

Expo (React Native) frontend for the real-time water order tracking system.
Uses React Navigation (bottom tabs + native stack, **not** expo-router file routing),
`react-native-paper` for UI, `axios` for REST, `socket.io-client` for live tracking,
and `AsyncStorage` for session persistence.

Backend: `../backend-server` (Express + Socket.io + MySQL/TiDB).
Production backend: `https://order-tracking-backend-00rd.onrender.com`

## Project structure

```
mobile-app/
├── App.js                      # Entry: AuthProvider + RootNavigator
├── navigation/
│   └── RootNavigator.js        # Role-based routing (auth / customer / driver / admin)
├── context/
│   └── AuthContext.js          # Login, signup, logout, saved session, JWT
├── services/
│   ├── api.js                  # REST client (orderAPI, paymentAPI, deliveryAPI,
│   │                           #   trackingAPI, adminAPI) — token attached automatically
│   └── socketService.js        # Socket.io live-tracking rooms + location events
├── screens/
│   ├── LoginScreen.js
│   ├── SignupScreen.js
│   ├── customer/               # Customer pages (4)
│   ├── driver/                 # Driver pages (4)
│   └── admin/                  # Owner (admin) pages (4)
└── components/
```

## Backend URL configuration

The backend base URL is hardcoded in **three** files — keep them in sync:

| File | Value |
|---|---|
| `services/api.js` (`API_URL`) | `https://order-tracking-backend-00rd.onrender.com/api` |
| `context/AuthContext.js` (`API_URL`) | `https://order-tracking-backend-00rd.onrender.com/api` |
| `services/socketService.js` (`SOCKET_URL`) | `https://order-tracking-backend-00rd.onrender.com` (root, no `/api`) |

After changing any of them, restart Expo with cache clear: `npx expo start -c`.

## Pages

### Auth (not logged in)

| Page | File | What it does |
|---|---|---|
| Login | `screens/LoginScreen.js` | Phone + password login |
| Signup | `screens/SignupScreen.js` | Create account as **Customer** or **Driver** only |

### Customer (role `customer`)

| Page | File | What it does |
|---|---|---|
| Create Order (Home tab) | `screens/customer/HomeScreen.js` | Place a new water order (quantity, address, payment) |
| My Orders (Orders tab) | `screens/customer/OrdersScreen.js` | List of own orders with status + payment chips |
| Track Order (Tracking tab) | `screens/customer/TrackingScreen.js` | Live driver location + order status via sockets |
| Payment (stack screen) | `screens/customer/PaymentScreen.js` | Pay for an order (in-app) |

### Driver (role `driver`)

| Page | File | What it does |
|---|---|---|
| My Deliveries (Deliveries tab) | `screens/driver/DeliveriesScreen.js` | Deliveries assigned to this driver |
| Live Map (Map tab) | `screens/driver/MapScreen.js` | Map view of the active delivery route |
| Active Delivery (stack screen) | `screens/driver/ActiveDeliveryScreen.js` | Current delivery detail + broadcast GPS location |
| Update Order Status (stack screen) | `screens/driver/OrderStatusScreen.js` | Move orders picked_up → in_transit → delivered |

### Owner / Admin (role `admin`)

| Page | File | Backend used | What it does |
|---|---|---|---|
| Dashboard (tab) | `screens/admin/DashboardScreen.js` | `GET /api/admin/dashboard/stats` | Today's orders, pending orders, active/completed deliveries, revenue, customers, avg order value |
| All Orders (tab) | `screens/admin/OrdersScreen.js` | `GET /api/admin/orders` | Every order with customer + driver, status/payment chips |
| Deliveries (tab) | `screens/admin/DeliveriesScreen.js` | `GET /api/admin/deliveries/active` | In-progress deliveries with driver + last GPS fix; entry point to assignment |
| Assign Delivery (stack screen) | `screens/admin/AssignDeliveryScreen.js` | `GET /api/admin/drivers`, `GET /api/admin/orders`, `POST /api/admin/deliveries` | Pick a driver + pending orders and assign them as one delivery |

## Roles & owner accounts

- Navigation is role-gated in `navigation/RootNavigator.js` from `user.role` returned at login:
  `admin` → `AdminStack`, `driver` → `DriverStack`, anything else → `CustomerStack`.
- Backend enforces it too: all `/api/admin/*` routes require `verifyToken` + `checkRole(['admin'])`
  (`backend-server/routes/admin.js`).
- **Public signup can only create `customer` or `driver`** — `admin` is rejected in
  `backend-server/controllers/authController.js`. Owner accounts must be created
  directly in the database (passwords are bcrypt hashes):

```bash
# 1. Generate a hash (from backend-server/, needs its node_modules)
node -e "import('bcryptjs').then(m => m.default.hash('CHOOSE_A_PASSWORD', 10).then(console.log))"

# 2. Insert the owner (TiDB/MySQL)
INSERT INTO users (name, phone, password, role)
VALUES ('Owner Name', '07XXXXXXXX', '<HASH_FROM_STEP_1>', 'admin');
```

The owner then logs in on the Login page with that phone + password and lands on the Dashboard.

## Run

```bash
npm install
npx expo start      # or: npx expo start -c  (clear cache after URL/role changes)
```

## Backend endpoints used by this app

- Auth: `POST /api/auth/signup`, `POST /api/auth/login`
- Customer: `POST|GET /api/orders`, `GET /api/orders/my-orders`, payments + tracking routes
- Driver: `/api/deliveries/*`, `/api/tracking/*` + Socket.io rooms
  (`join-order-room`, `join-delivery-room`, `driver-location-update`, status events)
- Owner: `GET /api/admin/dashboard/stats`, `GET /api/admin/orders`,
  `GET /api/admin/deliveries/active`, `GET /api/admin/drivers`,
  `POST /api/admin/deliveries`
- Health: `GET /api/health`, `GET /api/health/db`
