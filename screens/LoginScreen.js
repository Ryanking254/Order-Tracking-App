import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Headline, HelperText, Divider } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(phone, password);
      // Navigation happens automatically based on user role
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Headline style={styles.title}>Water Tracking</Headline>
        
        <TextInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="e.g., 0700000001"
          style={styles.input}
          disabled={loading}
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          disabled={loading}
        />
        
        {error && <HelperText type="error">{error}</HelperText>}
        
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
          disabled={loading}
        >
          Login
        </Button>

        <Divider style={styles.divider} />

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Signup')}
          style={styles.button}
          disabled={loading}
        >
          Create New Account
        </Button>

        <View style={styles.info}>
          <Headline style={styles.infoTitle}>Demo Credentials:</Headline>
          <HelperText>Customer: 0700000001 / password123</HelperText>
          <HelperText>Driver: 0711111111 / password123</HelperText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 32,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 15,
    paddingVertical: 6,
  },
  divider: {
    marginVertical: 20,
  },
  info: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
});
