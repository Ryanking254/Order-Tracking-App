import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme';
import { AppButton } from '../../components/ui';
import { shopAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function JoinShopScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, refreshMe, patchUser, logout } = useAuth();

  const join = async () => {
    if (!code.trim()) {
      Alert.alert('Invite code required', 'Ask your shop owner for the 6-letter code');
      return;
    }
    setLoading(true);
    try {
      const res = await shopAPI.joinWithCode(code.trim());
      const me = await refreshMe();
      if (!me?.user?.shop_id && res.data?.shop?.id) {
        await patchUser({ shop_id: res.data.shop.id });
      }
      Alert.alert('Joined 🎉', res.data?.message || 'Shop linked');
    } catch (e) {
      Alert.alert('Failed', e.response?.data?.message || 'Invalid invite code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.body}>
        <View style={styles.logo}>
          <MaterialCommunityIcons name="ticket-confirmation-outline" size={30} color="#fff" />
        </View>
        <Text style={styles.title}>Join your shop</Text>
        <Text style={styles.sub}>Enter the 6-letter invite code from your shop owner to see orders.</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Invite code</Text>
          <View style={styles.field}>
            <MaterialCommunityIcons name="ticket-confirmation-outline" size={18} color={colors.muted} />
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="e.g. MLDRYM"
              placeholderTextColor={colors.faint}
              autoCapitalize="characters"
              style={[styles.input, { fontWeight: '800', letterSpacing: 3 }]}
              editable={!loading}
              maxLength={12}
            />
          </View>
          <AppButton title="Join shop" onPress={join} loading={loading} disabled={loading} style={{ marginTop: 14 }} />
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutT}>
            Logged in as {user?.phone || user?.name || 'guest'} — not you? <Text style={{ fontWeight: '800' }}>Log out</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, paddingTop: 40, alignItems: 'stretch' },
  logo: { width: 56, height: 56, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 14, alignSelf: 'center', ...shadow.card },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  sub: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 18 },
  card: { backgroundColor: '#fff', borderRadius: radius.xl, padding: 18, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 7 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.input, borderRadius: radius.md, paddingHorizontal: 13, paddingVertical: 12 },
  input: { flex: 1, fontSize: 17, color: colors.ink, paddingVertical: 0 },
  logoutBtn: { marginTop: 16, alignItems: 'center' },
  logoutT: { fontSize: 12, color: colors.muted },
});
