// ==============================================================================
// UTSAVHUB TYPES & DATA MODELS
// ==============================================================================

export type UserRole = 'client' | 'vendor';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export type VendorCategory = 
  | 'Catering'
  | 'Band Mela'
  | 'Tent House'
  | 'Shamiana'
  | 'Lighting'
  | 'Decoration'
  | 'Sound & DJ'
  | 'Photography';

export interface PricingPackage {
  id: string;
  title: string;
  price: number;
  unit: string; // e.g. "per plate", "per event", "per day", "complete setup"
  description: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  category: VendorCategory;
  phone: string;
  address: string;
  city: string;
  description?: string;
  pricing_packages: PricingPackage[];
  images: string[];
  is_subscribed: boolean;
  subscription_expires_at?: string | null;
  rating: number;
  review_count: number;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_account_holder?: string;
  upi_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  client_id: string;
  vendor_id: string;
  event_type: string;
  event_date: string; // YYYY-MM-DD
  guest_count: number;
  status: BookingStatus;
  special_notes?: string;
  total_estimated_amount?: number;
  created_at: string;
  updated_at?: string;
  vendor?: Vendor;
  client?: Profile;
}

export interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: Profile;
}

export type PaymentMethod = 'razorpay' | 'bank_transfer' | 'upi';
export type PaymentStatus = 'pending' | 'verified' | 'failed';

export interface SubscriptionTransaction {
  id: string;
  vendor_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  bank_reference_number?: string;
  bank_receipt_url?: string;
  status: PaymentStatus;
  created_at: string;
  verified_at?: string;
}

export interface PlatformBankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId: string;
  monthlyFee: number;
  currency: string;
}

// Navigation Param Lists
export type RootStackParamList = {
  Auth: undefined;
  ClientTabs: undefined;
  VendorTabs: undefined;
  VendorDetail: { vendorId: string };
  Chat: { bookingId: string; counterpartyName: string };
};

export type ClientTabParamList = {
  Home: undefined;
  MyBookings: undefined;
  ClientProfile: undefined;
};

export type VendorTabParamList = {
  VendorDashboard: undefined;
  VendorLeads: undefined;
  VendorProfileEdit: undefined;
};
