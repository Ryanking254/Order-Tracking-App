import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'https://ots-backend.vercel.app/api'; // Must match services/api.js baseURL

  // Check if user is already logged in
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        const savedUser = await AsyncStorage.getItem('user');
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error('Error checking login:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  const signup = async (name, phone, password, role, email = null) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/signup`, {
        name,
        phone,
        password,
        role,
        email,
      });

      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      
      await AsyncStorage.setItem('userToken', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));

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
      
      setToken(newToken);
      setUser(newUser);
      
      await AsyncStorage.setItem('userToken', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));

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
      setError(null);
      
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    signup,
    login,
    logout,
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
