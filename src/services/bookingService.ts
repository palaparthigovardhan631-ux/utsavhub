// ==============================================================================
// UTSAVHUB BOOKING & LEAD MANAGEMENT SERVICE
// Direct Supabase table operations and Realtime synchronization
// ==============================================================================

import { supabase, isSupabaseConfigured } from './supabase';
import { Booking, BookingStatus } from '../types';
import { SEED_VENDORS } from './vendorService';

// In-memory demo bookings
let DEMO_BOOKINGS: Booking[] = [
  {
    id: 'b1_demo_lead',
    client_id: 'client_user_123',
    vendor_id: 'v1_royal_rasoi',
    event_type: 'Grand Wedding Reception',
    event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    guest_count: 450,
    status: 'confirmed',
    special_notes: 'Need pure vegetarian live counter for Jains and Awadhi chaat stall.',
    total_estimated_amount: 427500,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    vendor: SEED_VENDORS[0],
    client: {
      id: 'client_user_123',
      email: 'client.demo@utsavhub.com',
      full_name: 'Aarav Sharma',
      role: 'client',
      phone: '+91 98765 43210',
    },
  },
  {
    id: 'b2_new_inquiry',
    client_id: 'client_user_456',
    vendor_id: 'v1_royal_rasoi',
    event_type: 'Sangeet & Cocktail Night',
    event_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    guest_count: 200,
    status: 'pending',
    special_notes: 'Requires live pasta counter and customized signature mocktail bar.',
    total_estimated_amount: 190000,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    vendor: SEED_VENDORS[0],
    client: {
      id: 'client_user_456',
      email: 'priya.kapoor@example.com',
      full_name: 'Priya Kapoor',
      role: 'client',
      phone: '+91 98711 00223',
    },
  },
];

export const createBooking = async (
  bookingData: Omit<Booking, 'id' | 'created_at' | 'status'>
): Promise<{ data: Booking | null; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    const newBooking: Booking = {
      ...bookingData,
      id: 'b_' + Date.now(),
      status: 'pending',
      created_at: new Date().toISOString(),
      vendor: SEED_VENDORS.find((v) => v.id === bookingData.vendor_id),
      client: {
        id: bookingData.client_id,
        email: 'client@utsavhub.com',
        full_name: 'Demo Client',
        role: 'client',
        phone: '+91 98765 43210',
      },
    };
    DEMO_BOOKINGS.unshift(newBooking);
    return { data: newBooking, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        client_id: bookingData.client_id,
        vendor_id: bookingData.vendor_id,
        event_type: bookingData.event_type,
        event_date: bookingData.event_date,
        guest_count: bookingData.guest_count,
        status: 'pending',
        special_notes: bookingData.special_notes,
        total_estimated_amount: bookingData.total_estimated_amount,
      })
      .select('*, vendor:vendors(*), client:profiles(*)')
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error submitting booking request' };
  }
};

export const getClientBookings = async (
  clientId: string
): Promise<{ data: Booking[]; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    const list = DEMO_BOOKINGS.filter((b) => b.client_id === clientId || clientId === 'client_user_123');
    return { data: list, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, vendor:vendors(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || 'Error fetching client bookings' };
  }
};

export const getVendorBookings = async (
  vendorId: string
): Promise<{ data: Booking[]; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    const list = DEMO_BOOKINGS.filter((b) => b.vendor_id === vendorId || vendorId === 'v1_royal_rasoi');
    return { data: list, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, client:profiles(*)')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || 'Error fetching vendor leads' };
  }
};

export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
): Promise<{ data: Booking | null; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    const idx = DEMO_BOOKINGS.findIndex((b) => b.id === bookingId);
    if (idx !== -1) {
      DEMO_BOOKINGS[idx] = {
        ...DEMO_BOOKINGS[idx],
        status,
        updated_at: new Date().toISOString(),
      };
      return { data: DEMO_BOOKINGS[idx], error: null };
    }
    return { data: null, error: 'Booking lead not found' };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select('*, vendor:vendors(*), client:profiles(*)')
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error updating booking status' };
  }
};

export const subscribeToBookings = (
  vendorId: string,
  onPayload: (booking: Booking) => void
) => {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel(`bookings:vendor:${vendorId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `vendor_id=eq.${vendorId}`,
      },
      (payload) => {
        onPayload(payload.new as Booking);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
