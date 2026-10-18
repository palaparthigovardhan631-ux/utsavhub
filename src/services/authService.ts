// ==============================================================================
// UTSAVHUB AUTHENTICATION SERVICE
// Supabase Auth with dual-role user mapping (Client vs Vendor)
// ==============================================================================

import { supabase, isSupabaseConfigured } from './supabase';
import { Profile, UserRole, Vendor } from '../types';

export interface AuthResponse {
  user: any | null;
  profile: Profile | null;
  vendor?: Vendor | null;
  error?: string | null;
}

// In-memory session store when keys aren't configured yet
let mockSessionUser: any = null;
let mockSessionProfile: Profile | null = null;
let mockSessionVendor: Vendor | null = null;

export const signUpUser = async (
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
  phone: string,
  businessName?: string,
  category?: string
): Promise<AuthResponse> => {
  if (!isSupabaseConfigured()) {
    // Development / offline fallback demo session
    const fakeId = 'user_' + Date.now();
    mockSessionUser = { id: fakeId, email };
    mockSessionProfile = {
      id: fakeId,
      email,
      full_name: fullName,
      role,
      phone,
      created_at: new Date().toISOString(),
    };

    if (role === 'vendor') {
      mockSessionVendor = {
        id: 'vendor_' + Date.now(),
        user_id: fakeId,
        business_name: businessName || `${fullName}'s Event Services`,
        category: (category as any) || 'Catering',
        phone,
        address: 'Connaught Place, New Delhi',
        city: 'Delhi NCR',
        description: 'Premium event and catering partner on UtsavHub.',
        pricing_packages: [
          {
            id: 'pkg_default',
            title: 'Standard Package',
            price: 550,
            unit: 'per plate',
            description: 'Delicious authentic menu with 4 starters, 6 main courses, and 2 desserts.',
          },
        ],
        images: [
          'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80',
        ],
        is_subscribed: true,
        subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 5.0,
        review_count: 1,
      };
    }
    return { user: mockSessionUser, profile: mockSessionProfile, vendor: mockSessionVendor };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          phone,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Sign up failed. Please try again.');

    const userId = authData.user.id;

    // Check if trigger created profile or insert explicitly
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: fullName,
          role,
          phone,
        })
        .select()
        .single();

      if (profileError) console.warn('Profile creation notice:', profileError.message);
      profile = newProfile;
    }

    let vendorRecord: Vendor | null = null;
    if (role === 'vendor') {
      const { data: newVendor, error: vendorError } = await supabase
        .from('vendors')
        .insert({
          user_id: userId,
          business_name: businessName || `${fullName}'s Catering & Events`,
          category: category || 'Catering',
          phone,
          address: 'Main Market, City Center',
          city: 'Delhi NCR',
          description: 'Verified professional service provider on UtsavHub.',
          pricing_packages: [
            {
              id: 'pkg_starter',
              title: 'Standard Package',
              price: 550,
              unit: 'per plate',
              description: 'Quality curated event package including premium service.',
            },
          ],
          images: [
            'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80',
          ],
          is_subscribed: false, // Must subscribe to go live
          rating: 4.8,
          review_count: 0,
        })
        .select()
        .single();

      if (vendorError) console.warn('Vendor creation notice:', vendorError.message);
      vendorRecord = newVendor;
    }

    return { user: authData.user, profile, vendor: vendorRecord };
  } catch (err: any) {
    return { user: null, profile: null, error: err.message || 'Error signing up' };
  }
};

export const signInUser = async (email: string, password: string): Promise<AuthResponse> => {
  if (!isSupabaseConfigured()) {
    // Provide instant login test accounts for quick developer inspection
    const isVendorTest = email.toLowerCase().includes('vendor') || email.toLowerCase().includes('royal');
    const fakeId = isVendorTest ? 'vendor_user_123' : 'client_user_123';
    
    mockSessionUser = { id: fakeId, email };
    mockSessionProfile = {
      id: fakeId,
      email,
      full_name: isVendorTest ? 'Rajesh Aggarwal' : 'Aarav Sharma',
      role: isVendorTest ? 'vendor' : 'client',
      phone: '+91 98111 22334',
      created_at: new Date().toISOString(),
    };

    if (isVendorTest) {
      mockSessionVendor = {
        id: 'v1_royal_rasoi',
        user_id: fakeId,
        business_name: 'Royal Rasoi Gourmet Caterers',
        category: 'Catering',
        phone: '+91 98111 22334',
        address: '42, Ring Road, South Extension Part II',
        city: 'Delhi NCR',
        description: 'Award-winning 5-star wedding & corporate caterers specializing in Awadhi, Mughlai, Punjabi, and authentic Gujarati live thalis.',
        pricing_packages: [
          {
            id: 'pkg_silver',
            title: 'Silver Heritage Buffet',
            price: 650,
            unit: 'per plate',
            description: '3 Mocktails, 4 Starters, 6 Main Courses, Dal Makhani, Assorted Breads, Kulfi & Gulab Jamun.',
          },
          {
            id: 'pkg_gold',
            title: 'Gold Shahi Feast',
            price: 950,
            unit: 'per plate',
            description: '5 Artisanal Mocktails, 6 Live Appetizers, 2 Live Pasta & Chaat Counters, 8 Main Courses, 4 Exotic Desserts.',
          },
        ],
        images: [
          'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
        ],
        is_subscribed: true,
        subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 4.9,
        review_count: 86,
        bank_name: 'State Bank of India',
        bank_account_number: '30987654321',
        bank_ifsc: 'SBIN0001234',
        bank_account_holder: 'Royal Rasoi Catering LLP',
        upi_id: 'royalrasoi@oksbi',
      };
    } else {
      mockSessionVendor = null;
    }

    return { user: mockSessionUser, profile: mockSessionProfile, vendor: mockSessionVendor };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Login failed. Please check credentials.');

    const userId = authData.user.id;

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    let vendorRecord: Vendor | null = null;
    if (profile.role === 'vendor') {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', userId)
        .single();
      vendorRecord = vendorData;
    }

    return { user: authData.user, profile, vendor: vendorRecord };
  } catch (err: any) {
    return { user: null, profile: null, error: err.message || 'Invalid email or password' };
  }
};

export const signOutUser = async (): Promise<void> => {
  mockSessionUser = null;
  mockSessionProfile = null;
  mockSessionVendor = null;

  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signout error
    }
  }
};

export const getCurrentSession = async (): Promise<AuthResponse> => {
  if (!isSupabaseConfigured()) {
    return {
      user: mockSessionUser,
      profile: mockSessionProfile,
      vendor: mockSessionVendor,
    };
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return { user: null, profile: null, vendor: null };
    }

    const userId = session.user.id;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    let vendorRecord: Vendor | null = null;
    if (profile?.role === 'vendor') {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', userId)
        .single();
      vendorRecord = vendorData;
    }

    return { user: session.user, profile, vendor: vendorRecord };
  } catch {
    return { user: null, profile: null, vendor: null };
  }
};
