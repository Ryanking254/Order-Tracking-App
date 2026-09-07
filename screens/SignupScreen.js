import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Headline, HelperText, RadioButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const { signup, error } = useAuth();

  const handleSignup = async () => {
    if (!name || !phone || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signup(name, phone, password, role, email || null);
      // Navigation happens automatically based on user role
    } catch (err) {
      Alert.alert('Signup Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Headline style={styles.title}>Create Account</Headline>

        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          disabled={loading}
        />

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
          label="Email (Optional)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
          disabled={loading}
        />

        <View style={styles.roleSection}>
          <Headline style={styles.roleTitle}>Select Role:</Headline>
          
          <RadioButton.Group onValueChange={(value) => setRole(value)} value={role}>
            <View style={styles.radioOption}>
              <RadioButton value="customer" disabled={loading} />
              <Headline style={styles.radioLabel}>Customer</Headline>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="driver" disabled={loading} />
              <Headline style={styles.radioLabel}>Driver</Headline>
            </View>
          </RadioButton.Group>
        </View>

        {error && <HelperText type="error">{error}</HelperText>}

        <Button
          mode="contained"
          onPress={handleSignup}
          loading={loading}
          style={styles.button}
          disabled={loading}
        >
          Create Account
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          Already have an account? Login
        </Button>
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
    paddingTop: 30,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 28,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  roleSection: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  roleTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 10,
  },
  button: {
    marginTop: 20,
    paddingVertical: 6,
  },
});
