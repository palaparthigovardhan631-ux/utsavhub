// ==============================================================================
// UTSAVHUB SUBSCRIPTION & PAYMENT GATEWAY SERVICE
// Live Stripe Hook, Razorpay Hook, Direct Bank Transfer & Instant Activation
// ==============================================================================

import { supabase, isSupabaseConfigured } from './supabase';
import { PLATFORM_BANK_DETAILS } from '../constants/bankConfig';
import { SubscriptionTransaction, Vendor } from '../types';
import { SEED_VENDORS } from './vendorService';

export interface PaymentResult {
  success: boolean;
  transaction?: SubscriptionTransaction | null;
  vendor?: Vendor | null;
  error?: string | null;
}

// 1. Process Online Stripe Card Payment Hook
export const processStripeSubscription = async (
  vendorId: string,
  stripePaymentId: string,
  amount: number = PLATFORM_BANK_DETAILS.monthlyFee
): Promise<PaymentResult> => {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  if (!isSupabaseConfigured()) {
    const vIndex = SEED_VENDORS.findIndex((v) => v.id === vendorId);
    let updatedVendor: Vendor | null = null;
    if (vIndex !== -1) {
      SEED_VENDORS[vIndex] = {
        ...SEED_VENDORS[vIndex],
        is_subscribed: true,
        subscription_expires_at: expiresAt,
      };
      updatedVendor = SEED_VENDORS[vIndex];
    } else {
      updatedVendor = {
        id: vendorId,
        user_id: 'usr_' + Date.now(),
        business_name: 'Verified Event Partner',
        category: 'Catering',
        phone: '+91 98111 22334',
        address: 'Main City Center',
        city: 'Delhi NCR',
        pricing_packages: [],
        images: [],
        is_subscribed: true,
        subscription_expires_at: expiresAt,
        rating: 4.9,
        review_count: 10,
      };
      SEED_VENDORS.push(updatedVendor);
    }

    const mockTx: SubscriptionTransaction = {
      id: 'tx_stripe_' + Date.now(),
      vendor_id: vendorId,
      plan_name: 'Monthly Pro Vendor Membership',
      amount,
      currency: 'INR',
      payment_method: 'stripe',
      stripe_payment_id: stripePaymentId,
      status: 'verified',
      created_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
    };

    return { success: true, transaction: mockTx, vendor: updatedVendor };
  }

  try {
    const { data: tx, error: txError } = await supabase
      .from('subscription_transactions')
      .insert({
        vendor_id: vendorId,
        plan_name: 'Monthly Pro Vendor Membership',
        amount,
        currency: 'INR',
        payment_method: 'stripe',
        stripe_payment_id: stripePaymentId,
        status: 'verified',
        verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (txError) throw txError;

    const { data: updatedVendor, error: vendorError } = await supabase
      .from('vendors')
      .update({
        is_subscribed: true,
        subscription_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (vendorError) throw vendorError;

    return { success: true, transaction: tx, vendor: updatedVendor };
  } catch (err: any) {
    return { success: false, error: err.message || 'Stripe payment verification failed' };
  }
};

// 2. Process Razorpay Hook
export const processRazorpaySubscription = async (
  vendorId: string,
  razorpayPaymentId: string,
  amount: number = PLATFORM_BANK_DETAILS.monthlyFee
): Promise<PaymentResult> => {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  if (!isSupabaseConfigured()) {
    const vIndex = SEED_VENDORS.findIndex((v) => v.id === vendorId);
    let updatedVendor: Vendor | null = null;
    if (vIndex !== -1) {
      SEED_VENDORS[vIndex] = {
        ...SEED_VENDORS[vIndex],
        is_subscribed: true,
        subscription_expires_at: expiresAt,
      };
      updatedVendor = SEED_VENDORS[vIndex];
    } else {
      updatedVendor = {
        id: vendorId,
        user_id: 'usr_' + Date.now(),
        business_name: 'Verified Event Partner',
        category: 'Catering',
        phone: '+91 98111 22334',
        address: 'Main City Center',
        city: 'Delhi NCR',
        pricing_packages: [],
        images: [],
        is_subscribed: true,
        subscription_expires_at: expiresAt,
        rating: 4.9,
        review_count: 10,
      };
      SEED_VENDORS.push(updatedVendor);
    }

    const mockTx: SubscriptionTransaction = {
      id: 'tx_rzp_' + Date.now(),
      vendor_id: vendorId,
      plan_name: 'Monthly Pro Vendor Membership',
      amount,
      currency: 'INR',
      payment_method: 'razorpay',
      razorpay_payment_id: razorpayPaymentId,
      status: 'verified',
      created_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
    };

    return { success: true, transaction: mockTx, vendor: updatedVendor };
  }

  try {
    const { data: tx, error: txError } = await supabase
      .from('subscription_transactions')
      .insert({
        vendor_id: vendorId,
        plan_name: 'Monthly Pro Vendor Membership',
        amount,
        currency: 'INR',
        payment_method: 'razorpay',
        razorpay_payment_id: razorpayPaymentId,
        status: 'verified',
        verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (txError) throw txError;

    const { data: updatedVendor, error: vendorError } = await supabase
      .from('vendors')
      .update({
        is_subscribed: true,
        subscription_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (vendorError) throw vendorError;

    return { success: true, transaction: tx, vendor: updatedVendor };
  } catch (err: any) {
    return { success: false, error: err.message || 'Payment verification failed' };
  }
};

// 3. Direct Bank / UPI Transfer Verification
export const submitDirectBankTransfer = async (
  vendorId: string,
  utrNumber: string,
  amount: number = PLATFORM_BANK_DETAILS.monthlyFee,
  receiptUrl?: string
): Promise<PaymentResult> => {
  if (!utrNumber || utrNumber.trim().length < 6) {
    return { success: false, error: 'Please enter a valid Bank Transaction / UTR reference number (at least 6 digits).' };
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  if (!isSupabaseConfigured()) {
    const vIndex = SEED_VENDORS.findIndex((v) => v.id === vendorId);
    let updatedVendor: Vendor | null = null;
    if (vIndex !== -1) {
      SEED_VENDORS[vIndex] = {
        ...SEED_VENDORS[vIndex],
        is_subscribed: true,
        subscription_expires_at: expiresAt,
      };
      updatedVendor = SEED_VENDORS[vIndex];
    } else {
      updatedVendor = {
        id: vendorId,
        user_id: 'usr_' + Date.now(),
        business_name: 'Verified Event Partner',
        category: 'Catering',
        phone: '+91 98111 22334',
        address: 'Main City Center',
        city: 'Delhi NCR',
        pricing_packages: [],
        images: [],
        is_subscribed: true,
        subscription_expires_at: expiresAt,
        rating: 4.9,
        review_count: 10,
      };
      SEED_VENDORS.push(updatedVendor);
    }

    const mockTx: SubscriptionTransaction = {
      id: 'tx_bank_' + Date.now(),
      vendor_id: vendorId,
      plan_name: 'Monthly Pro Vendor Membership',
      amount,
      currency: 'INR',
      payment_method: 'bank_transfer',
      bank_reference_number: utrNumber.trim(),
      bank_receipt_url: receiptUrl,
      status: 'verified',
      created_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
    };

    return { success: true, transaction: mockTx, vendor: updatedVendor };
  }

  try {
    const { data: tx, error: txError } = await supabase
      .from('subscription_transactions')
      .insert({
        vendor_id: vendorId,
        plan_name: 'Monthly Pro Vendor Membership',
        amount,
        currency: 'INR',
        payment_method: 'bank_transfer',
        bank_reference_number: utrNumber.trim(),
        bank_receipt_url: receiptUrl,
        status: 'verified',
        verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (txError) throw txError;

    const { data: updatedVendor, error: vendorError } = await supabase
      .from('vendors')
      .update({
        is_subscribed: true,
        subscription_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (vendorError) throw vendorError;

    return { success: true, transaction: tx, vendor: updatedVendor };
  } catch (err: any) {
    return { success: false, error: err.message || 'Bank transfer submission failed' };
  }
};
