import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../theme';

export function AppButton({ title, onPress, variant = 'primary', disabled, loading, style }) {
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.btn,
        isSecondary && styles.btnSecondary,
        isGhost && styles.btnGhost,
        disabled && { opacity: 0.6 },
        style,
      ]}
    >
      <Text style={[styles.btnText, (isSecondary || isGhost) && styles.btnTextDark]}>
        {loading ? 'Please wait…' : title}
      </Text>
    </TouchableOpacity>
  );
}

export function SearchBar({ value, onChangeText, placeholder, onClear }) {
  return (
    <View style={styles.search}>
      <MaterialCommunityIcons name="magnify" size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        style={styles.searchInput}
      />
      {value ? (
        <TouchableOpacity onPress={onClear}>
          <MaterialCommunityIcons name="close" size={18} color={colors.muted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function FilterPill({ icon, label, active }) {
  return (
    <View style={[styles.pill, active && styles.pillActive]}>
      {icon ? <MaterialCommunityIcons name={icon} size={13} color={active ? colors.primary : colors.ink} /> : null}
      <Text style={[styles.pillText, active && { color: colors.primary }]}>{label}</Text>
    </View>
  );
}

export function PricePin({ label, dark, style, onPress }) {
  const Inner = (
    <View style={[styles.pin, dark && styles.pinDark, style]}>
      <Text style={[styles.pinText, dark && { color: '#fff' }]}>{label}</Text>
      <View style={[styles.pinTail, dark && styles.pinTailDark]} />
    </View>
  );
  if (onPress) {
    return <TouchableOpacity activeOpacity={0.85} onPress={onPress}>{Inner}</TouchableOpacity>;
  }
  return Inner;
}

export function TagPill({ label }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

export function QtyStepper({ value, onMinus, onPlus }) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity style={styles.stepBtn} onPress={onMinus}>
        <Text style={styles.stepBtnText}>–</Text>
      </TouchableOpacity>
      <Text style={styles.stepVal}>{value}</Text>
      <TouchableOpacity style={styles.stepBtn} onPress={onPlus}>
        <Text style={styles.stepBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function StatusPill({ status }) {
  const map = {
    pending: '#F59E0B',
    assigned: '#3B82F6',
    picked_up: '#8B5CF6',
    in_transit: '#EF4444',
    delivered: '#1BA34A',
    completed: '#1BA34A',
  };
  const bg = map[status] || '#6B7280';
  return (
    <View style={[styles.status, { backgroundColor: bg }]}>
      <Text style={styles.statusText}>{String(status || '').replace('_', ' ').toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  btnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnGhost: {
    backgroundColor: colors.primarySoft,
    elevation: 0,
    shadowOpacity: 0,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnTextDark: { color: colors.ink },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.ink, paddingVertical: 0 },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  pillActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  pillText: { fontSize: 12, fontWeight: '600', color: colors.ink },

  pin: {
    backgroundColor: colors.primary,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    alignItems: 'center',
    ...shadow.pin,
  },
  pinDark: { backgroundColor: colors.dark },
  pinText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  pinTail: {
    position: 'absolute',
    bottom: -4,
    width: 10,
    height: 10,
    backgroundColor: colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  pinTailDark: { backgroundColor: colors.dark },

  tag: {
    backgroundColor: colors.input,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  tagText: { fontSize: 11, color: colors.muted, fontWeight: '600' },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 10,
  },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: colors.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: -1 },
  stepVal: { fontSize: 13, fontWeight: '700', color: colors.ink, minWidth: 14, textAlign: 'center' },

  status: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: 'flex-start' },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
});
