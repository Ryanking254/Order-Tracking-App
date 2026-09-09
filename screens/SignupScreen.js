import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { colors, radius, shadow } from '../theme';
import { AppButton } from '../components/ui';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('customer');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!name || !phone || !password) {
      Alert.alert('Missing info', 'Please fill name, phone and password');
      return;
    }
    if (role === 'driver' && !inviteCode.trim()) {
      Alert.alert('Invite code required', 'Ask your shop owner for the 6-letter invite code');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match', 'Please re-enter');
      return;
    }
    setLoading(true);
    try {
      await signup(name, phone, password, role, email || null, { inviteCode: inviteCode.trim() || null });
    } catch (err) {
      Alert.alert('Signup failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.sub}>Join to order from local shops in a couple of taps.</Text>

      <View style={styles.card}>
        {[
          { label: 'Full name', icon: 'account-outline', v: name, s: setName, ph: 'Jane Doe', kb: 'default', sec: false },
          { label: 'Phone number', icon: 'phone-outline', v: phone, s: setPhone, ph: '0700000001', kb: 'phone-pad', sec: false },
          { label: 'Email (optional)', icon: 'email-outline', v: email, s: setEmail, ph: 'you@mail.com', kb: 'email-address', sec: false },
          { label: 'Password', icon: 'lock-outline', v: password, s: setPassword, ph: '••••••••', kb: 'default', sec: true },
          { label: 'Confirm password', icon: 'lock-check-outline', v: confirm, s: setConfirm, ph: '••••••••', kb: 'default', sec: true },
        ].map((f) => (
          <View key={f.label}>
            <Text style={styles.label}>{f.label}</Text>
            <View style={styles.field}>
              <MaterialCommunityIcons name={f.icon} size={18} color={colors.muted} />
              <TextInput
                value={f.v}
                onChangeText={f.s}
                placeholder={f.ph}
                placeholderTextColor={colors.faint}
                keyboardType={f.kb}
                secureTextEntry={f.sec}
                style={styles.input}
                editable={!loading}
              />
            </View>
          </View>
        ))}

        <Text style={styles.label}>I am a</Text>
        <View style={styles.roles}>
          {[
            { id: 'customer', icon: 'home-variant-outline', t: 'Customer', d: 'Order & track' },
            { id: 'driver', icon: 'truck-outline', t: 'Driver', d: 'Deliver' },
            { id: 'admin', icon: 'storefront-outline', t: 'Shop owner', d: 'Onboard shop' },
          ].map((r) => (
            <TouchableOpacity
              key={r.id}
              onPress={() => setRole(r.id)}
              style={[styles.role, role === r.id && styles.roleActive]}
            >
              <MaterialCommunityIcons name={r.icon} size={22} color={role === r.id ? colors.primary : colors.muted} />
              <Text style={[styles.roleT, role === r.id && { color: colors.primaryDark }]}>{r.t}</Text>
              <Text style={styles.roleD}>{r.d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {role === 'driver' ? (
          <View>
            <Text style={styles.label}>Shop invite code</Text>
            <View style={styles.field}>
              <MaterialCommunityIcons name="ticket-confirmation-outline" size={18} color={colors.muted} />
              <TextInput
                value={inviteCode}
                onChangeText={(t) => setInviteCode(t.toUpperCase())}
                placeholder="e.g. MLDRYM"
                placeholderTextColor={colors.faint}
                autoCapitalize="characters"
                style={[styles.input, { fontWeight: '800', letterSpacing: 2 }]}
                editable={!loading}
                maxLength={12}
              />
            </View>
            <Text style={styles.hint}>Get this 6-letter code from your shop owner.</Text>
          </View>
        ) : null}

        {role === 'admin' ? (
          <View style={styles.ownerNote}>
            <MaterialCommunityIcons name="storefront-outline" size={18} color={colors.primaryDark} />
            <Text style={styles.ownerNoteT}>Next: add your shop name + photo, then invite drivers.</Text>
          </View>
        ) : null}

        <AppButton title="Create account" onPress={handleSignup} loading={loading} disabled={loading} style={{ marginTop: 6 }} />
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchBtn}>
          <Text style={styles.switchText}>Have an account? <Text style={{ color: colors.primary, fontWeight: '800' }}>Log in</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 52, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: radius.xl, padding: 18, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginTop: 12, marginBottom: 7 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.input, borderRadius: radius.md, paddingHorizontal: 13, paddingVertical: 12 },
  input: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 0 },
  roles: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 14 },
  role: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, padding: 14, alignItems: 'center', backgroundColor: '#fff' },
  roleActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  roleT: { fontWeight: '800', color: colors.ink, marginTop: 6 },
  roleD: { fontSize: 12, color: colors.muted, marginTop: 2 },
  hint: { fontSize: 12, color: colors.muted, marginTop: 6 },
  ownerNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 12, marginTop: 4, marginBottom: 8 },
  ownerNoteT: { fontSize: 13, fontWeight: '600', color: colors.primaryDark, flex: 1 },
  switchBtn: { marginTop: 14, alignItems: 'center' },
  switchText: { fontSize: 13, color: colors.muted },
});
