import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'https://order-tracking-backend-00rd.onrender.com/api'; // Must match services/api.js baseURL

  const persistSession = async (newToken, newUser, newShop = null) => {
    setToken(newToken);
    setUser(newUser);
    setShop(newShop);
    await AsyncStorage.setItem('userToken', newToken);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    if (newShop) await AsyncStorage.setItem('shop', JSON.stringify(newShop));
    else await AsyncStorage.removeItem('shop');
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        const savedUser = await AsyncStorage.getItem('user');
        const savedShop = await AsyncStorage.getItem('shop');
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          if (savedShop) setShop(JSON.parse(savedShop));
          // Refresh shop link in background (owner creates shop, driver joins, customer chooses)
          try {
            const res = await axios.get(`${API_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${savedToken}` },
            });
            if (res.data?.user) {
              setUser(res.data.user);
              await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
            }
            if (res.data?.shop) {
              setShop(res.data.shop);
              await AsyncStorage.setItem('shop', JSON.stringify(res.data.shop));
            }
          } catch {}
        }
      } catch (err) {
        console.error('Error checking login:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  const signup = async (name, phone, password, role, email = null, extra = {}) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/signup`, {
        name,
        phone,
        password,
        role,
        email,
        invite_code: extra.inviteCode || null,
        shop_id: extra.shopId || null,
      });

      const { token: newToken, user: newUser } = response.data;
      
      await persistSession(newToken, newUser, response.data.shop || null);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const login = async (phone, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/login`, {
        phone,
        password,
      });

      const { token: newToken, user: newUser } = response.data;
      
      await persistSession(newToken, newUser, response.data.shop || null);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      setShop(null);
      setError(null);
      
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('shop');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Refresh user + shop after onboarding steps (create/join/choose shop)
  const refreshMe = async () => {
    try {
      const savedToken = token || (await AsyncStorage.getItem('userToken'));
      if (!savedToken) return null;
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (res.data?.user) {
        setUser(res.data.user);
        await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      }
      if (res.data?.shop) {
        setShop(res.data.shop);
        await AsyncStorage.setItem('shop', JSON.stringify(res.data.shop));
      } else {
        setShop(null);
        await AsyncStorage.removeItem('shop');
      }
      return res.data;
    } catch (err) {
      console.error('Error refreshing user:', err);
      return null;
    }
  };

  // Patch local user (e.g. set shop_id after onboarding) and persist.
  // Used as a fallback so onboarding always advances even if /auth/me is unreachable.
  const patchUser = async (patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...patch };
      AsyncStorage.setItem('user', JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const value = {
    user,
    token,
    shop,
    loading,
    error,
    signup,
    login,
    logout,
    refreshMe,
    patchUser,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
