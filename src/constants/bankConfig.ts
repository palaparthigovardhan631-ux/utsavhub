// ==============================================================================
// UTSAVHUB PLATFORM SUBSCRIPTION BANK & PAYMENT CONFIGURATION
// Used for processing real-world vendor monthly subscription payments
// ==============================================================================

import { PlatformBankDetails } from '../types';

export const PLATFORM_BANK_DETAILS: PlatformBankDetails = {
  bankName: process.env.EXPO_PUBLIC_PLATFORM_BANK_NAME || 'HDFC Bank',
  accountHolder: process.env.EXPO_PUBLIC_PLATFORM_BANK_HOLDER || 'UtsavHub Marketplace Private Limited',
  accountNumber: process.env.EXPO_PUBLIC_PLATFORM_BANK_ACCOUNT || '50200084920194',
  ifscCode: process.env.EXPO_PUBLIC_PLATFORM_BANK_IFSC || 'HDFC0001234',
  branch: 'Connaught Place Main Branch, New Delhi 110001',
  upiId: process.env.EXPO_PUBLIC_PLATFORM_UPI_ID || 'utsavhub@okhdfcbank',
  monthlyFee: Number(process.env.EXPO_PUBLIC_SUBSCRIPTION_MONTHLY_PRICE) || 1499,
  currency: 'INR',
};

export const RAZORPAY_CONFIG = {
  keyId: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_utsavhub_production',
  merchantName: 'UtsavHub Partner Program',
  subscriptionPlanName: 'Monthly Verified Vendor Membership',
  currency: 'INR',
  description: '1-Month Access to Lead Inquiries & Public Marketplace Catalog',
};
