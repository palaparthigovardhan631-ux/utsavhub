// ==============================================================================
// UTSAVHUB TOP NAVIGATION HEADER
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showRoleToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'UtsavHub',
  subtitle,
  showRoleToggle = true,
}) => {
  const { profile, role, signOut, demoLoginAs } = useAuth();

  const handleRoleToggle = () => {
    if (role === 'client') {
      demoLoginAs('vendor');
    } else {
      demoLoginAs('client');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.left}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🎉</Text>
            </View>
            <View>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? (
                <Text style={styles.subtitle}>{subtitle}</Text>
              ) : (
                <Text style={styles.tagline}>Catering & Event Marketplace</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.right}>
          {showRoleToggle && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRoleToggle}
              style={[
                styles.roleToggleBtn,
                role === 'vendor' ? styles.vendorRoleBtn : styles.clientRoleBtn,
              ]}
            >
              <Text style={styles.roleToggleText}>
                {role === 'vendor' ? '💼 VENDOR' : '👤 CLIENT'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={signOut}
            style={styles.logoutBtn}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoIcon: {
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginRight: 8,
  },
  clientRoleBtn: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  vendorRoleBtn: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#C084FC',
  },
  roleToggleText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  logoutBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});
