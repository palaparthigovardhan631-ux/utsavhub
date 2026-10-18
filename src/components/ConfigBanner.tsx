// ==============================================================================
// UTSAVHUB CONFIGURATION & LIVE BACKEND STATUS BANNER
// Guides developers and users on connecting real Supabase & Razorpay keys
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export const ConfigBanner: React.FC = () => {
  const { isConfigured } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (isConfigured || collapsed) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.badge}>READY FOR SUPABASE & RAZORPAY</Text>
        <Text style={styles.title}>Live Backend Sandbox Mode</Text>
        <Text style={styles.text}>
          Running with embedded PostgreSQL seed data & schema. To connect your live Supabase database and Razorpay account, update the keys in <Text style={styles.code}>.env</Text> and run <Text style={styles.code}>schema.sql</Text> in your Supabase SQL editor.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => setCollapsed(true)}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFFBEB',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  badge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  text: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 15,
    marginTop: 2,
  },
  code: {
    fontFamily: 'monospace',
    fontWeight: '700',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '700',
  },
});
