// ==============================================================================
// UTSAVHUB PLATFORM OWNER BANKING & UPI SETTINGS MODAL
// Allows platform administrator to configure their personal/business UPI & Bank
// for receiving vendor subscription payouts directly
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
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import {
  getStoredPlatformBankDetails,
  saveStoredPlatformBankDetails,
  PLATFORM_BANK_DETAILS,
} from '../constants/bankConfig';
import { Button } from './Button';
import { Input } from './Input';

interface PlatformBankSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const PlatformBankSettingsModal: React.FC<PlatformBankSettingsModalProps> = ({
  visible,
  onClose,
  onSaved,
}) => {
  const [accountHolder, setAccountHolder] = useState(PLATFORM_BANK_DETAILS.accountHolder);
  const [upiId, setUpiId] = useState(PLATFORM_BANK_DETAILS.upiId);
  const [accountNumber, setAccountNumber] = useState(PLATFORM_BANK_DETAILS.accountNumber);
  const [ifscCode, setIfscCode] = useState(PLATFORM_BANK_DETAILS.ifscCode);
  const [bankName, setBankName] = useState(PLATFORM_BANK_DETAILS.bankName);
  const [branch, setBranch] = useState(PLATFORM_BANK_DETAILS.branch);
  const [monthlyFee, setMonthlyFee] = useState(String(PLATFORM_BANK_DETAILS.monthlyFee));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      getStoredPlatformBankDetails().then((details) => {
        setAccountHolder(details.accountHolder);
        setUpiId(details.upiId);
        setAccountNumber(details.accountNumber);
        setIfscCode(details.ifscCode);
        setBankName(details.bankName);
        setBranch(details.branch);
        setMonthlyFee(String(details.monthlyFee));
      });
    }
  }, [visible]);

  const handleSave = async () => {
    if (!accountHolder.trim() || !upiId.trim() || !accountNumber.trim() || !ifscCode.trim()) {
      Alert.alert('Required Fields', 'Please fill in your Account Holder Name, UPI ID, Account Number, and IFSC Code.');
      return;
    }

    setIsSaving(true);
    await saveStoredPlatformBankDetails({
      accountHolder: accountHolder.trim(),
      upiId: upiId.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      bankName: bankName.trim(),
      branch: branch.trim(),
      monthlyFee: Number(monthlyFee) || 499,
    });
    setIsSaving(false);

    Alert.alert(
      'Banking Credentials Saved! ✅',
      'Vendor subscription fees will now be directed to your configured UPI ID and Bank Account.'
    );

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.badge}>PLATFORM OWNER REVENUE SETTINGS</Text>
              <Text style={styles.title}>Your Bank & UPI Credentials</Text>
              <Text style={styles.sub}>
                Vendors will transfer subscription payments directly to this account.
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            <View style={styles.infoBanner}>
              <Text style={styles.infoText}>
                💡 Enter your personal or company bank details below. The app will generate a direct UPI payment link and dynamic QR code automatically.
              </Text>
            </View>

            <Input
              label="Account Holder / Beneficiary Name"
              placeholder="e.g. Palaparthi Govardhan"
              value={accountHolder}
              onChangeText={setAccountHolder}
            />

            <Input
              label="Your Primary UPI ID (for instant GPay / PhonePe / Paytm payments)"
              placeholder="e.g. yourname@okhdfcbank or yourphone@ybl"
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
            />

            <Input
              label="Bank Account Number"
              placeholder="e.g. 50200084920194"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="IFSC Code"
                  placeholder="e.g. HDFC0001234"
                  value={ifscCode}
                  onChangeText={setIfscCode}
                  autoCapitalize="characters"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Monthly Fee (₹)"
                  placeholder="499"
                  value={monthlyFee}
                  onChangeText={setMonthlyFee}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Input
              label="Bank Name"
              placeholder="e.g. State Bank of India / HDFC Bank"
              value={bankName}
              onChangeText={setBankName}
            />

            <Input
              label="Branch Name / Location"
              placeholder="e.g. Connaught Place, New Delhi"
              value={branch}
              onChangeText={setBranch}
            />

            <Button
              title="Save My Platform Bank Details"
              onPress={handleSave}
              loading={isSaving}
              style={{ marginVertical: SPACING.md }}
            />
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
    maxHeight: '92%',
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
  badge: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  sub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  body: {
    marginTop: SPACING.sm,
  },
  infoBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
});
