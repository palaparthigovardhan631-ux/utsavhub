// ==============================================================================
// UTSAVHUB PLATFORM SUBSCRIPTION BANK & PAYMENT CONFIGURATION
// Used for processing real-world vendor monthly subscription payments
// Supports UPI App Deep Linking, Dynamic QR Codes, and Real Bank Details
// ==============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlatformBankDetails } from '../types';

const STORAGE_KEY_PLATFORM_BANK = '@utsavhub_platform_bank_v1';

export const DEFAULT_PLATFORM_BANK_DETAILS: PlatformBankDetails = {
  bankName: process.env.EXPO_PUBLIC_PLATFORM_BANK_NAME || 'State Bank of India',
  accountHolder: process.env.EXPO_PUBLIC_PLATFORM_BANK_HOLDER || 'Palaparthi Govardhan',
  accountNumber: process.env.EXPO_PUBLIC_PLATFORM_BANK_ACCOUNT || '309876543210',
  ifscCode: process.env.EXPO_PUBLIC_PLATFORM_BANK_IFSC || 'SBIN0001234',
  branch: 'Main City Branch',
  upiId: process.env.EXPO_PUBLIC_PLATFORM_UPI_ID || 'palaparthigovardhan@upi',
  monthlyFee: Number(process.env.EXPO_PUBLIC_SUBSCRIPTION_MONTHLY_PRICE) || 499,
  currency: 'INR',
};

export let PLATFORM_BANK_DETAILS: PlatformBankDetails = {
  ...DEFAULT_PLATFORM_BANK_DETAILS,
};

export const getStoredPlatformBankDetails = async (): Promise<PlatformBankDetails> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_PLATFORM_BANK);
    if (raw) {
      const parsed = JSON.parse(raw);
      PLATFORM_BANK_DETAILS = { ...DEFAULT_PLATFORM_BANK_DETAILS, ...parsed };
      return PLATFORM_BANK_DETAILS;
    }
  } catch (err) {
    console.warn('Error reading stored bank details:', err);
  }
  return PLATFORM_BANK_DETAILS;
};

export const saveStoredPlatformBankDetails = async (
  details: Partial<PlatformBankDetails>
): Promise<PlatformBankDetails> => {
  try {
    const updated: PlatformBankDetails = { ...PLATFORM_BANK_DETAILS, ...details };
    await AsyncStorage.setItem(STORAGE_KEY_PLATFORM_BANK, JSON.stringify(updated));
    PLATFORM_BANK_DETAILS = updated;
    return updated;
  } catch (err) {
    console.warn('Error saving platform bank details:', err);
    return PLATFORM_BANK_DETAILS;
  }
};

// Generates native NPCI standard UPI payment URI
export const generateUpiUrl = (
  upiId: string,
  payeeName: string,
  amount: number,
  transactionNote: string = 'UtsavHub Vendor Subscription'
): string => {
  const cleanUpi = upiId.trim();
  const cleanName = payeeName.trim();
  return `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(cleanName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
};

// Generates dynamic QR code image URL for instant mobile scanning
export const getUpiQrCodeUrl = (upiUrl: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;
};

export const RAZORPAY_CONFIG = {
  keyId: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_utsavhub_production',
  merchantName: 'UtsavHub Partner Program',
  subscriptionPlanName: 'Monthly Verified Vendor Membership',
  currency: 'INR',
  description: '1-Month Access to Lead Inquiries & Public Marketplace Catalog',
};
