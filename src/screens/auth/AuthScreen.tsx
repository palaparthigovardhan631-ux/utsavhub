// ==============================================================================
// UTSAVHUB AUTHENTICATION SCREEN
// Dual-Role Mapping: Client ("Book Events") vs. Vendor ("Service Provider")
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { UserRole, VendorCategory } from '../../types';
import { CATEGORIES } from '../../constants/categories';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ConfigBanner } from '../../components/ConfigBanner';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, demoLoginAs } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<VendorCategory>('Catering');

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    if (isLoginMode) {
      const res = await signIn(email.trim(), password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } else {
      if (!fullName.trim()) {
        setIsLoading(false);
        setErrorMessage('Please enter your full name.');
        return;
      }

      if (selectedRole === 'vendor' && !businessName.trim()) {
        setIsLoading(false);
        setErrorMessage('Please enter your registered Business / Service Name.');
        return;
      }

      const res = await signUp(
        email.trim(),
        password,
        fullName.trim(),
        selectedRole,
        phone.trim(),
        businessName.trim(),
        category
      );
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ConfigBanner />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.brandIconWrapper}>
            <Text style={styles.brandIcon}>🎪</Text>
          </View>
          <Text style={styles.brandTitle}>UtsavHub</Text>
          <Text style={styles.brandSubtitle}>
            India's Premier Multi-Vendor Catering & Event Services App
          </Text>
        </View>

        {/* Card Container */}
        <View style={styles.card}>
          {/* Dual Role Selector */}
          <Text style={styles.sectionLabel}>Select Your Account Type</Text>
          <View style={styles.roleToggleRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedRole('client')}
              style={[
                styles.roleCard,
                selectedRole === 'client' && styles.roleCardActive,
              ]}
            >
              <Text style={styles.roleEmoji}>🎉</Text>
              <Text
                style={[
                  styles.roleCardTitle,
                  selectedRole === 'client' && styles.roleCardTitleActive,
                ]}
              >
                I want to book events
              </Text>
              <Text style={styles.roleCardSubtitle}>Client / Host</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedRole('vendor')}
              style={[
                styles.roleCard,
                selectedRole === 'vendor' && styles.roleCardActive,
              ]}
            >
              <Text style={styles.roleEmoji}>💼</Text>
              <Text
                style={[
                  styles.roleCardTitle,
                  selectedRole === 'vendor' && styles.roleCardTitleActive,
                ]}
              >
                I am a service provider
              </Text>
              <Text style={styles.roleCardSubtitle}>Vendor / Caterer</Text>
            </TouchableOpacity>
          </View>

          {/* Login / Sign Up Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setIsLoginMode(true);
                setErrorMessage(null);
              }}
              style={[styles.tabBtn, isLoginMode && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, isLoginMode && styles.tabBtnTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setIsLoginMode(false);
                setErrorMessage(null);
              }}
              style={[styles.tabBtn, !isLoginMode && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, !isLoginMode && styles.tabBtnTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          {/* Form Fields */}
          {!isLoginMode && (
            <Input
              label="Full Name"
              placeholder="e.g. Aarav Sharma"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          )}

          <Input
            label="Email Address"
            placeholder="e.g. contact@utsavhub.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {!isLoginMode && (
            <Input
              label="Phone Number"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          )}

          {/* Vendor-Specific Fields */}
          {!isLoginMode && selectedRole === 'vendor' && (
            <>
              <Input
                label="Business / Enterprise Name"
                placeholder="e.g. Royal Rasoi Caterers"
                value={businessName}
                onChangeText={setBusinessName}
              />

              <Text style={styles.fieldLabel}>Primary Service Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.8}
                    onPress={() => setCategory(cat.id)}
                    style={[
                      styles.categoryChip,
                      category === cat.id && styles.categoryChipActive,
                    ]}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text
                      style={[
                        styles.catText,
                        category === cat.id && styles.catTextActive,
                      ]}
                    >
                      {cat.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <Input
            label="Password"
            placeholder="Enter secure password (min 6 chars)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title={isLoginMode ? `Sign In as ${selectedRole === 'vendor' ? 'Vendor' : 'Client'}` : 'Register & Continue'}
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitBtn}
          />

          {/* Quick Demo Credentials Switcher */}
          <View style={styles.demoSection}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR EXPLORE INSTANTLY</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={styles.demoClientBtn}
                onPress={() => demoLoginAs('client')}
              >
                <Text style={styles.demoBtnText}>👤 Explore as Client</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoVendorBtn}
                onPress={() => demoLoginAs('vendor')}
              >
                <Text style={styles.demoBtnText}>💼 Explore as Vendor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  brandIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandIcon: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.md,
  },
  roleCard: {
    flex: 1,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  roleEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  roleCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  roleCardTitleActive: {
    color: COLORS.primaryDark,
  },
  roleCardSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    padding: 4,
    marginVertical: SPACING.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: COLORS.dangerLight,
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  catEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  catTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 8,
  },
  demoSection: {
    marginTop: SPACING.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoClientBtn: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#7DD3FC',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  demoVendorBtn: {
    flex: 1,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
