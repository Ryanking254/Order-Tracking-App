import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { colors, radius, shadow } from '../theme';
import { AppButton } from '../components/ui';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Missing info', 'Please enter phone and password');
      return;
    }
    setLoading(true);
    try {
      await login(phone, password);
    } catch (err) {
      Alert.alert('Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.hero}>
        <View style={styles.logo}>
          <MaterialCommunityIcons name="water" size={30} color="#fff" />
        </View>
        <Text style={styles.eyebrow}>ORDER TRACKING</Text>
        <Text style={styles.title}>Welcome back 👋</Text>
        <Text style={styles.sub}>Find nearby refill stations, schedule pickup and track live.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Phone number</Text>
        <View style={styles.field}>
          <MaterialCommunityIcons name="phone-outline" size={18} color={colors.muted} />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="0700000001"
            placeholderTextColor={colors.faint}
            style={styles.input}
            editable={!loading}
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.field}>
          <MaterialCommunityIcons name="lock-outline" size={18} color={colors.muted} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            placeholder="••••••••"
            placeholderTextColor={colors.faint}
            style={styles.input}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPw((v) => !v)}>
            <MaterialCommunityIcons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <AppButton title="Log in" onPress={handleLogin} loading={loading} disabled={loading} style={{ marginTop: 8 }} />

        <TouchableOpacity style={styles.switchBtn} onPress={() => navigation.navigate('Signup')} disabled={loading}>
          <Text style={styles.switchText}>New here? <Text style={{ color: colors.primary, fontWeight: '800' }}>Create account</Text></Text>
        </TouchableOpacity>
      </View>

      <View style={styles.demo}>
        <Text style={styles.demoTitle}>Demo accounts</Text>
        <Text style={styles.demoText}>Customer  0700000001 / password123</Text>
        <Text style={styles.demoText}>Driver  0711111111 / password123</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  hero: { marginBottom: 18 },
  logo: {
    width: 56, height: 56, borderRadius: 18, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14, ...shadow.card,
  },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.6, color: colors.primary, marginBottom: 6 },
  title: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -0.4 },
  sub: { fontSize: 14, color: colors.muted, marginTop: 6, lineHeight: 20 },
  card: { backgroundColor: '#fff', borderRadius: radius.xl, padding: 18, ...shadow.card, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginTop: 12, marginBottom: 7 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.input, borderRadius: radius.md, paddingHorizontal: 13, paddingVertical: 13,
  },
  input: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 0 },
  switchBtn: { marginTop: 16, alignItems: 'center' },
  switchText: { fontSize: 13, color: colors.muted },
  demo: { marginTop: 16, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: 14 },
  demoTitle: { fontSize: 13, fontWeight: '800', color: colors.primaryDark, marginBottom: 4 },
  demoText: { fontSize: 12, color: '#2F5D3A', marginTop: 2 },
});
