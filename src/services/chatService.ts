// ==============================================================================
// UTSAVHUB CHAT SERVICE
// Real-time bidirectional messaging per booking lead
// ==============================================================================

import { supabase, isSupabaseConfigured } from './supabase';
import { ChatMessage } from '../types';

// In-memory demo chat storage for instant testing
const DEMO_CHATS: Record<string, ChatMessage[]> = {
  b1_demo_lead: [
    {
      id: 'm1',
      booking_id: 'b1_demo_lead',
      sender_id: 'client_user_123',
      message: 'Namaste Rajesh ji, we are confirming the Gold Shahi Feast for 450 guests on our reception day.',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'm2',
      booking_id: 'b1_demo_lead',
      sender_id: 'vendor_user_123',
      message: 'Namaste Aarav ji! Thank you for choosing Royal Rasoi. Our executive chef and service team are locked in for your date. We will make it grand!',
      created_at: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
    },
    {
      id: 'm3',
      booking_id: 'b1_demo_lead',
      sender_id: 'client_user_123',
      message: 'Please ensure the separate Jain live counter is placed next to the mocktail lounge.',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'm4',
      booking_id: 'b1_demo_lead',
      sender_id: 'vendor_user_123',
      message: 'Noted with priority! Our head captain Mr. Sharma will manage the Jain counter personally.',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
  ],
};

export const getBookingMessages = async (
  bookingId: string
): Promise<{ data: ChatMessage[]; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    const list = DEMO_CHATS[bookingId] || [];
    return { data: list, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*, sender:profiles(*)')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || 'Error fetching chat messages' };
  }
};

export const sendChatMessage = async (
  bookingId: string,
  senderId: string,
  message: string
): Promise<{ data: ChatMessage | null; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    const newMsg: ChatMessage = {
      id: 'm_' + Date.now(),
      booking_id: bookingId,
      sender_id: senderId,
      message,
      created_at: new Date().toISOString(),
    };
    if (!DEMO_CHATS[bookingId]) {
      DEMO_CHATS[bookingId] = [];
    }
    DEMO_CHATS[bookingId].push(newMsg);
    return { data: newMsg, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('chats')
      .insert({
        booking_id: bookingId,
        sender_id: senderId,
        message,
      })
      .select('*, sender:profiles(*)')
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error sending message' };
  }
};

export const subscribeToChatMessages = (
  bookingId: string,
  onMessageReceived: (message: ChatMessage) => void
) => {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel(`chats:${bookingId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chats',
        filter: `booking_id=eq.${bookingId}`,
      },
      (payload) => {
        onMessageReceived(payload.new as ChatMessage);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
