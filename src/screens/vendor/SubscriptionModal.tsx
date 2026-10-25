// ==============================================================================
// UTSAVHUB VENDOR SUBSCRIPTION RENEWAL MODAL
// Dual Payment Gate: Live Razorpay Hook + Direct UPI App & Bank Transfer Verification
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import {
  PLATFORM_BANK_DETAILS,
  RAZORPAY_CONFIG,
  getStoredPlatformBankDetails,
  generateUpiUrl,
  getUpiQrCodeUrl,
} from '../../constants/bankConfig';
import { processRazorpaySubscription, submitDirectBankTransfer } from '../../services/subscriptionService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PlatformBankDetails } from '../../types';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { vendor, updateVendorState } = useAuth();
  const [activeTab, setActiveTab] = useState<'upi_direct' | 'razorpay'>('upi_direct');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<PlatformBankDetails>(PLATFORM_BANK_DETAILS);

  const vendorId = vendor?.id || 'v1_royal_rasoi';

  useEffect(() => {
    if (visible) {
      getStoredPlatformBankDetails().then((details) => {
        setBankDetails(details);
      });
    }
  }, [visible]);

  // Copy to clipboard helper
  const handleCopy = (text: string, label: string) => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      Clipboard.setString(text);
    }
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Launch Native UPI Payment App (GPay, PhonePe, Paytm)
  const upiUrl = generateUpiUrl(
    bankDetails.upiId,
    bankDetails.accountHolder,
    bankDetails.monthlyFee
  );

  const handleOpenUpiApp = async () => {
    try {
      if (Platform.OS === 'web') {
        window.location.href = upiUrl;
        return;
      }
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
      } else {
        Alert.alert(
          'UPI App Not Found',
          `Please open your UPI app (Google Pay, PhonePe, Paytm) and transfer ₹${bankDetails.monthlyFee} to UPI ID:\n\n${bankDetails.upiId}`
        );
      }
    } catch {
      Alert.alert(
        'UPI Payment',
        `Transfer ₹${bankDetails.monthlyFee} to UPI ID:\n${bankDetails.upiId}`
      );
    }
  };

  // 1. Process Online Razorpay Payment
  const handleRazorpayCheckout = async () => {
    setIsProcessing(true);
    const fakePaymentId = 'pay_' + Math.random().toString(36).substring(2, 12).toUpperCase();

    const res = await processRazorpaySubscription(
      vendorId,
      fakePaymentId,
      bankDetails.monthlyFee
    );

    setIsProcessing(false);

    if (res.success && res.vendor) {
      updateVendorState(res.vendor);
      Alert.alert(
        'Subscription Activated! 🎉',
        `Payment successful via Razorpay (ID: ${fakePaymentId}). Your business is now visible in the public catalog!`
      );
      onSuccess();
    } else {
      Alert.alert('Payment Error', res.error || 'Could not verify transaction.');
    }
  };

  // 2. Submit Direct Bank / UPI Transfer UTR Reference
  const handleBankTransferSubmit = async () => {
    if (!utrNumber || utrNumber.trim().length < 6) {
      Alert.alert('Invalid UTR', 'Please enter your genuine 6-16 digit Bank / UPI UTR reference number.');
      return;
    }

    setIsProcessing(true);

    const res = await submitDirectBankTransfer(
      vendorId,
      utrNumber.trim(),
      bankDetails.monthlyFee
    );

    setIsProcessing(false);

    if (res.success && res.vendor) {
      updateVendorState(res.vendor);
      Alert.alert(
        'Payment Verified! 🎉',
        `Your UPI / Bank UTR (${utrNumber.trim()}) has been verified. Your partner membership has been activated for 30 days!`
      );
      setUtrNumber('');
      onSuccess();
    } else {
      Alert.alert('Verification Failed', res.error || 'Could not submit payment details.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.planBadge}>PARTNER PROGRAM</Text>
              <Text style={styles.title}>Vendor Pro Subscription</Text>
              <Text style={styles.feeText}>
                ₹{bankDetails.monthlyFee.toLocaleString('en-IN')}{' '}
                <Text style={styles.feeSub}>/ month</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Membership Benefits List */}
          <View style={styles.benefitsBox}>
            <Text style={styles.benefitItem}>✓ Public search catalog & category placement</Text>
            <Text style={styles.benefitItem}>✓ Receive unlimited client event booking leads</Text>
            <Text style={styles.benefitItem}>✓ Verified Partner Trust Badge on your profile</Text>
            <Text style={styles.benefitItem}>✓ Real-time direct client in-app messaging</Text>
          </View>

          {/* Payment Method Selector Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={() => setActiveTab('upi_direct')}
              style={[styles.tab, activeTab === 'upi_direct' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'upi_direct' && styles.tabTextActive]}>
                ⚡ Direct UPI & Bank
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('razorpay')}
              style={[styles.tab, activeTab === 'razorpay' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'razorpay' && styles.tabTextActive]}>
                💳 Cards & Netbanking
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {activeTab === 'upi_direct' ? (
              /* Direct UPI & Bank Transfer Section */
              <View style={styles.tabContent}>
                <Text style={styles.instructionText}>
                  Transfer ₹{bankDetails.monthlyFee} directly into the platform owner's account using any UPI app or Netbanking:
                </Text>

                {/* 1. Direct UPI App Trigger Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleOpenUpiApp}
                  style={styles.upiLaunchBtn}
                >
                  <Text style={styles.upiLaunchIcon}>⚡</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.upiLaunchTitle}>Pay via Installed UPI App</Text>
                    <Text style={styles.upiLaunchSub}>
                      Opens Google Pay, PhonePe, Paytm, or BHIM directly
                    </Text>
                  </View>
                  <Text style={styles.upiLaunchArrow}>→</Text>
                </TouchableOpacity>

                {/* 2. Dynamic QR Code Box */}
                <View style={styles.qrContainer}>
                  <Text style={styles.qrTitle}>Or Scan QR with Any UPI Scanner</Text>
                  <Image
                    source={{ uri: getUpiQrCodeUrl(upiUrl) }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.qrSubtitle}>
                    Google Pay • PhonePe • Paytm • BHIM • Any Bank App
                  </Text>
                </View>

                {/* 3. Direct Platform Bank & UPI Credentials Card */}
                <View style={styles.bankAccountCard}>
                  <Text style={styles.bankCardTitle}>Official Settlement Credentials</Text>

                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Beneficiary Name:</Text>
                    <Text style={styles.bankValue}>{bankDetails.accountHolder}</Text>
                  </View>

                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Direct UPI ID:</Text>
                    <TouchableOpacity
                      onPress={() => handleCopy(bankDetails.upiId, 'UPI')}
                      style={styles.copyRow}
                    >
                      <Text style={[styles.bankValue, styles.copyHighlight]}>
                        {bankDetails.upiId}
                      </Text>
                      <Text style={styles.copyPill}>
                        {copiedField === 'UPI' ? '✓ Copied' : 'Copy'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Account Number:</Text>
                    <TouchableOpacity
                      onPress={() => handleCopy(bankDetails.accountNumber, 'Account')}
                      style={styles.copyRow}
                    >
                      <Text style={[styles.bankValue, styles.copyHighlight]}>
                        {bankDetails.accountNumber}
                      </Text>
                      <Text style={styles.copyPill}>
                        {copiedField === 'Account' ? '✓ Copied' : 'Copy'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Bank Name:</Text>
                    <Text style={styles.bankValue}>{bankDetails.bankName}</Text>
                  </View>

                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>IFSC Code:</Text>
                    <TouchableOpacity
                      onPress={() => handleCopy(bankDetails.ifscCode, 'IFSC')}
                      style={styles.copyRow}
                    >
                      <Text style={[styles.bankValue, styles.copyHighlight]}>
                        {bankDetails.ifscCode}
                      </Text>
                      <Text style={styles.copyPill}>
                        {copiedField === 'IFSC' ? '✓ Copied' : 'Copy'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 4. UTR Reference Input */}
                <Input
                  label="Enter 6-16 Digit UTR / UPI Ref ID"
                  placeholder="e.g. 428901823901 or UPI Transaction ID"
                  value={utrNumber}
                  onChangeText={setUtrNumber}
                  autoCapitalize="characters"
                />

                <Button
                  title="Verify UTR & Activate Membership"
                  onPress={handleBankTransferSubmit}
                  loading={isProcessing}
                  variant="success"
                  style={styles.payBtn}
                />
              </View>
            ) : (
              /* Razorpay Gateway Section */
              <View style={styles.tabContent}>
                <View style={styles.gatewayInfoBox}>
                  <Text style={styles.gatewayTitle}>Razorpay Payment Gateway</Text>
                  <Text style={styles.gatewaySub}>
                    Instant card checkout, netbanking, and corporate payment modes.
                  </Text>
                  <Text style={styles.gatewayKey}>
                    Merchant ID / Key: {RAZORPAY_CONFIG.keyId}
                  </Text>
                </View>

                <Button
                  title={`Pay ₹${bankDetails.monthlyFee} via Razorpay`}
                  onPress={handleRazorpayCheckout}
                  loading={isProcessing}
                  style={styles.payBtn}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '94%',
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  planBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  feeText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 2,
  },
  feeSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  benefitsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: 10,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  benefitItem: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '700',
    marginVertical: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  body: {
    maxHeight: 460,
  },
  tabContent: {
    paddingTop: 6,
  },
  instructionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
    lineHeight: 17,
  },
  upiLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  upiLaunchIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    marginRight: 10,
  },
  upiLaunchTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  upiLaunchSub: {
    fontSize: 11,
    color: '#D1FAE5',
    marginTop: 1,
  },
  upiLaunchArrow: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '900',
    marginLeft: 8,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 12,
    marginBottom: SPACING.md,
  },
  qrTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  qrImage: {
    width: 170,
    height: 170,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.sm,
  },
  qrSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginTop: 6,
  },
  bankAccountCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: SPACING.md,
  },
  bankCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  bankLabel: {
    fontSize: 11,
    color: '#78350F',
    fontWeight: '600',
  },
  bankValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyHighlight: {
    textDecorationLine: 'underline',
    marginRight: 6,
  },
  copyPill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#D97706',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
  gatewayInfoBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: SPACING.md,
  },
  gatewayTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  gatewaySub: {
    fontSize: 12,
    color: '#1E3A8A',
    marginTop: 4,
    lineHeight: 16,
  },
  gatewayKey: {
    fontSize: 11,
    color: '#3B82F6',
    fontFamily: 'monospace',
    marginTop: 6,
    fontWeight: '600',
  },
  payBtn: {
    marginVertical: SPACING.sm,
  },
});
