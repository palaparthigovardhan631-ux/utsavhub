// ==============================================================================
// UTSAVHUB VENDOR SERVICE
// Public Catalog, Filtering, Profile Management, and Cloud Storage Uploads
// ==============================================================================

import { supabase, isSupabaseConfigured } from './supabase';
import { Vendor, VendorCategory } from '../types';

// Fallback Authentic Indian Event Vendors (matching seed.sql)
export const SEED_VENDORS: Vendor[] = [
  {
    id: 'v1_royal_rasoi',
    user_id: 'vendor_usr_1',
    business_name: 'Royal Rasoi Gourmet Caterers',
    category: 'Catering',
    phone: '+91 98111 22334',
    address: '42, Ring Road, South Extension Part II',
    city: 'Delhi NCR',
    description: 'Award-winning 5-star wedding & corporate caterers specializing in Awadhi, Mughlai, Punjabi, and authentic Gujarati live thalis with 25+ years of heritage.',
    pricing_packages: [
      {
        id: 'pkg_silver',
        title: 'Silver Heritage Buffet',
        price: 650,
        unit: 'per plate',
        description: '3 Mocktails, 4 Starters (Paneer Tikka, Dahi Kebab, Spring Rolls), 6 Main Courses, Dal Makhani, Assorted Breads, Kulfi & Gulab Jamun.',
      },
      {
        id: 'pkg_gold',
        title: 'Gold Shahi Feast',
        price: 950,
        unit: 'per plate',
        description: '5 Artisanal Mocktails, 6 Live Appetizers, 2 Live Pasta & Chaat Counters, 8 Main Courses, 4 Exotic Desserts.',
      },
      {
        id: 'pkg_royal',
        title: 'Imperial Maharaja Banquet',
        price: 1450,
        unit: 'per plate',
        description: 'Full Signature VIP Experience: International Sushi bar, Tandoori pavilion, Awadhi Biryani, Jalebi Rabri live counter, Dedicated Captains.',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    ],
    is_subscribed: true,
    subscription_expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 4.9,
    review_count: 86,
    bank_name: 'State Bank of India',
    bank_account_number: '30987654321',
    bank_ifsc: 'SBIN0001234',
    bank_account_holder: 'Royal Rasoi Catering LLP',
    upi_id: 'royalrasoi@oksbi',
  },
  {
    id: 'v2_jea_band',
    user_id: 'vendor_usr_2',
    business_name: 'Master Jea Royal Brass Band',
    category: 'Band Mela',
    phone: '+91 98222 33445',
    address: 'Shop 14, Chandni Chowk Near Town Hall',
    city: 'Delhi NCR',
    description: 'Prestigious 35-piece royal brass band procession with antique Victorian horse carriage (Bagghi), uniform fanfare trumpeters, flower doli, and Punjabi dhol troupe.',
    pricing_packages: [
      {
        id: 'pkg_band_basic',
        title: 'Classic Baraat Band',
        price: 25000,
        unit: 'per event',
        description: '16 Uniformed brass musicians, 2 Punjabi dhol players, battery trolley lighting.',
      },
      {
        id: 'pkg_band_royal',
        title: 'Royal Brass & Dhol Symphony',
        price: 55000,
        unit: 'per event',
        description: '25 Royal musicians, 4 Nashik dhol players, 2 Shenai players, crystal chandelier lights, vintage flower Bagghi.',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
    ],
    is_subscribed: true,
    subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 4.8,
    review_count: 52,
    bank_name: 'Punjab National Bank',
    bank_account_number: '0123002100054321',
    bank_ifsc: 'PUNB0012300',
    bank_account_holder: 'Master Jea Band',
    upi_id: 'jeaband@okpnb',
  },
  {
    id: 'v3_shree_tent',
    user_id: 'vendor_usr_3',
    business_name: 'Shree Ram German Hangar & Tent House',
    category: 'Tent House',
    phone: '+91 98333 44556',
    address: 'Sector 18, Noida & Chattarpur Mandir Road',
    city: 'Delhi NCR',
    description: 'Turnkey wedding infrastructure provider specializing in all-weather German Hangars, waterproof air-conditioned marquees, red carpet pathways, and modular staging.',
    pricing_packages: [
      {
        id: 'pkg_tent_intimate',
        title: 'Lawn & Mehendi Setup (300 Guests)',
        price: 75000,
        unit: 'complete setup',
        description: 'Canopy tents, bohemian seating, low diwans with vibrant bolster pillows, stage truss, and entrance arch.',
      },
      {
        id: 'pkg_tent_grand',
        title: 'AC German Hangar Pavilion (800 Guests)',
        price: 180000,
        unit: 'complete setup',
        description: 'Fully waterproof 10,000 sq ft insulated German Hangar, centralized tower ACs, wooden carpeted floor, grand 40ft stage.',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80',
    ],
    is_subscribed: true,
    subscription_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 4.7,
    review_count: 41,
    bank_name: 'HDFC Bank',
    bank_account_number: '50200098765432',
    bank_ifsc: 'HDFC0002345',
    bank_account_holder: 'Shree Ram Tent House Pvt Ltd',
    upi_id: 'shreeram.tents@okhdfcbank',
  },
  {
    id: 'v4_maharaja_shamiana',
    user_id: 'vendor_usr_4',
    business_name: 'Maharaja Royal Shamiana Decor',
    category: 'Shamiana',
    phone: '+91 98444 55667',
    address: 'Plot 88, Udyog Vihar Phase 4',
    city: 'Delhi NCR',
    description: 'Handcrafted traditional royal Shamianas, Banarasi silk canopies, hand-block printed ceiling fabrics, and royal Mughal style garden pavilions.',
    pricing_packages: [
      {
        id: 'pkg_shamiana_classic',
        title: 'Traditional Floral Shamiana',
        price: 35000,
        unit: 'per setup',
        description: '50x50 ft traditional floral print shamiana, ceiling tassels, side jali walls, bolster seating for 150 guests.',
      },
      {
        id: 'pkg_shamiana_mughal',
        title: 'Royal Sheesh Mahal Shamiana',
        price: 85000,
        unit: 'per setup',
        description: 'Mirror work embroidered ceilings, velvet side curtains, brass lanterns, royal divan seating with silk cushions.',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&auto=format&fit=crop&q=80',
    ],
    is_subscribed: true,
    subscription_expires_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 4.8,
    review_count: 33,
    bank_name: 'ICICI Bank',
    bank_account_number: '001205001234',
    bank_ifsc: 'ICIC0000012',
    bank_account_holder: 'Maharaja Shamiana Works',
    upi_id: 'maharajashamiana@okicici',
  },
  {
    id: 'v5_lumina_lights',
    user_id: 'vendor_usr_5',
    business_name: 'Lumina Intelligent Event Lighting',
    category: 'Lighting',
    phone: '+91 98555 66778',
    address: 'C-12, Okhla Industrial Area Phase 1',
    city: 'Delhi NCR',
    description: 'State-of-the-art DMX architectural illumination, Sharpy moving beams, LED pixel tunnels, warm fairy light canopies, and programmed ambient stage lights.',
    pricing_packages: [
      {
        id: 'pkg_light_warm',
        title: 'Fairy Light Dream Canopy',
        price: 40000,
        unit: 'per night',
        description: '10,000 warm white micro-LED fairy lights covering lawn trees, pathway hanging chandeliers, entrance tunnel.',
      },
      {
        id: 'pkg_light_concert',
        title: 'Concert & Sangeet Stage Truss',
        price: 90000,
        unit: 'per night',
        description: '16 Sharpy 10R beam fixtures, 24 RGBWA LED par cans, 4 haze machines, CO2 jet blast cannons.',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
    ],
    is_subscribed: true,
    subscription_expires_at: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 4.9,
    review_count: 67,
    bank_name: 'Axis Bank',
    bank_account_number: '912010045678901',
    bank_ifsc: 'UTIB0000123',
    bank_account_holder: 'Lumina Lighting Solutions',
    upi_id: 'luminalights@okaxis',
  },
];

export const getPublicVendors = async (
  category?: VendorCategory | string,
  searchQuery?: string,
  city?: string
): Promise<{ data: Vendor[]; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    let filtered = [...SEED_VENDORS].filter((v) => v.is_subscribed);

    if (category && category !== 'All') {
      filtered = filtered.filter((v) => v.category === category);
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (v) =>
          v.business_name.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          (v.description && v.description.toLowerCase().includes(q)) ||
          v.city.toLowerCase().includes(q)
      );
    }

    if (city && city.trim() !== '') {
      filtered = filtered.filter((v) => v.city.toLowerCase().includes(city.toLowerCase()));
    }

    return { data: filtered, error: null };
  }

  try {
    let query = supabase
      .from('vendors')
      .select('*')
      .eq('is_subscribed', true);

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (city && city.trim() !== '') {
      query = query.ilike('city', `%${city}%`);
    }

    if (searchQuery && searchQuery.trim() !== '') {
      query = query.or(
        `business_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`
      );
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || 'Error fetching vendors' };
  }
};

export const getVendorById = async (vendorId: string): Promise<{ data: Vendor | null; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    const found = SEED_VENDORS.find((v) => v.id === vendorId);
    return { data: found || null, error: found ? null : 'Vendor not found' };
  }

  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Vendor not found' };
  }
};

export const updateVendorProfile = async (
  vendorId: string,
  updates: Partial<Vendor>
): Promise<{ data: Vendor | null; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    const idx = SEED_VENDORS.findIndex((v) => v.id === vendorId);
    if (idx !== -1) {
      SEED_VENDORS[idx] = { ...SEED_VENDORS[idx], ...updates, updated_at: new Date().toISOString() };
      return { data: SEED_VENDORS[idx], error: null };
    }
    return { data: null, error: 'Vendor not found' };
  }

  try {
    const { data, error } = await supabase
      .from('vendors')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error updating vendor profile' };
  }
};

export const uploadPortfolioImage = async (
  vendorId: string,
  fileUri: string,
  fileName?: string
): Promise<{ url: string | null; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    // Return sample CDN image in offline demo mode
    return { url: fileUri, error: null };
  }

  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const cleanFileName = `${vendorId}/${Date.now()}_${fileName || 'image.jpg'}`;

    const { error: uploadError } = await supabase.storage
      .from('vendor-portfolio')
      .upload(cleanFileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('vendor-portfolio')
      .getPublicUrl(cleanFileName);

    return { url: publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Error uploading image' };
  }
};
