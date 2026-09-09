import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, shadow } from '../../theme';
import { AppButton } from '../../components/ui';
import { shopAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CreateShopScreen({ navigation }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [saving, setSaving] = useState(false);
  const { user, refreshMe, patchUser, logout } = useAuth();

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Allow photo access to add your shop image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageBase64(asset.base64 || null);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Missing info', 'Please add your shop name');
      return;
    }
    setSaving(true);
    try {
      const image_url = imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : null;
      const res = await shopAPI.createShop(name.trim(), image_url, address.trim() || null);
      const createdId = res.data?.shop?.id || null;
      const me = await refreshMe();
      if (!me?.user?.shop_id && createdId) {
        // Refresh missed (flaky network) — patch locally so onboarding still advances
        await patchUser({ shop_id: createdId });
      }
      // Inside the owner stack (adding another shop) go back to the dashboard;
      // during first-time onboarding there is nowhere to go back to —
      // RootNavigator flips to the dashboard automatically once shop_id is set.
      if (navigation?.canGoBack?.()) navigation.goBack();
    } catch (e) {
      const status = e.response?.status;
      Alert.alert(
        'Failed',
        status === 404
          ? 'Shop service not found — the backend needs to be redeployed with the latest code.'
          : e.response?.data?.message || 'Could not create shop'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.body}>
        {navigation?.canGoBack?.() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <MaterialCommunityIcons name="chevron-left" size={22} color={colors.ink} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.hero}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="storefront-outline" size={30} color="#fff" />
          </View>
          <Text style={styles.title}>Add your shop</Text>
          <Text style={styles.sub}>Customers will pick your shop from this name + photo.</Text>
        </View>

        <TouchableOpacity style={styles.photoWrap} onPress={pickImage} activeOpacity={0.85}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoEmpty}>
              <MaterialCommunityIcons name="camera-plus-outline" size={34} color={colors.faint} />
              <Text style={styles.photoEmptyT}>Add shop photo</Text>
            </View>
          )}
          <View style={styles.photoBadge}>
            <MaterialCommunityIcons name="pencil" size={13} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.label}>Shop name</Text>
          <View style={styles.field}>
            <MaterialCommunityIcons name="storefront-outline" size={18} color={colors.muted} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sparkle Wash & Fold"
              placeholderTextColor={colors.faint}
              style={styles.input}
              editable={!saving}
            />
          </View>

          <Text style={styles.label}>Shop address (optional)</Text>
          <View style={styles.field}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.muted} />
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. 12 Kent Street"
              placeholderTextColor={colors.faint}
              style={styles.input}
              editable={!saving}
            />
          </View>

          <AppButton title="Create shop" onPress={save} loading={saving} disabled={saving} style={{ marginTop: 14 }} />
          <Text style={styles.fine}>After this you will get a 6-letter invite code for your drivers.</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutT}>
            Logged in as {user?.phone || user?.name || 'guest'} — not you? <Text style={{ fontWeight: '800' }}>Log out</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  backText: { fontSize: 14, color: colors.ink, fontWeight: '600' },
  hero: { alignItems: 'center', marginTop: 12, marginBottom: 8 },
  logo: { width: 56, height: 56, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12, ...shadow.card },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 13, color: colors.muted, marginTop: 4, textAlign: 'center' },
  photoWrap: { alignSelf: 'center', marginVertical: 16, position: 'relative' },
  photo: { width: 148, height: 148, borderRadius: 24, borderWidth: 2, borderColor: '#fff' },
  photoEmpty: { width: 148, height: 148, borderRadius: 24, backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 6 },
  photoEmptyT: { fontSize: 12, fontWeight: '700', color: colors.muted },
  photoBadge: { position: 'absolute', right: 2, bottom: 2, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: radius.xl, padding: 18, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginTop: 12, marginBottom: 7 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.input, borderRadius: radius.md, paddingHorizontal: 13, paddingVertical: 12 },
  input: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 0 },
  fine: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 12 },
  logoutBtn: { marginTop: 16, alignItems: 'center' },
  logoutT: { fontSize: 12, color: colors.muted },
});
