// ==============================================================================
// UTSAVHUB VENDOR LEAD MANAGER SCREEN
// Real-time incoming inquiries, instant Accept/Reject buttons, and live chat trigger
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Booking, BookingStatus } from '../../types';
import {
  getVendorBookings,
  updateBookingStatus,
  subscribeToBookings,
} from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/Badge';
import { Header } from '../../components/Header';

interface VendorLeadsScreenProps {
  navigation: any;
}

export const VendorLeadsScreen: React.FC<VendorLeadsScreenProps> = ({ navigation }) => {
  const { vendor } = useAuth();
  const [leads, setLeads] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const vendorId = vendor?.id || 'v1_royal_rasoi';

  const fetchLeads = async () => {
    setIsLoading(true);
    const res = await getVendorBookings(vendorId);
    setLeads(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeads();

    // Subscribe to real-time incoming booking inquiries
    const unsubscribe = subscribeToBookings(vendorId, (updatedBooking) => {
      setLeads((prev) => {
        const idx = prev.findIndex((b) => b.id === updatedBooking.id);
        if (idx !== -1) {
          const clone = [...prev];
          clone[idx] = { ...clone[idx], ...updatedBooking };
          return clone;
        } else {
          return [updatedBooking, ...prev];
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [vendorId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeads();
    setRefreshing(false);
  };

  // Instant Lead Status Update: Accept Lead
  const handleAcceptLead = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    const res = await updateBookingStatus(bookingId, 'confirmed');
    setActionLoadingId(null);

    if (res.error) {
      Alert.alert('Update Failed', res.error);
      return;
    }

    setLeads((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' } : b))
    );
    Alert.alert('Lead Accepted! ✅', 'Booking confirmed. You can now chat with the client to finalize arrangements.');
  };

  // Instant Lead Status Update: Reject Lead
  const handleRejectLead = async (bookingId: string) => {
    Alert.alert(
      'Decline Booking Lead',
      'Are you sure you want to decline this inquiry? The client will be notified immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setActionLoadingId(bookingId);
            const res = await updateBookingStatus(bookingId, 'cancelled');
            setActionLoadingId(null);

            if (res.error) {
              Alert.alert('Update Failed', res.error);
              return;
            }

            setLeads((prev) =>
              prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
            );
          },
        },
      ]
    );
  };

  const filteredLeads = leads.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const renderLeadCard = ({ item }: { item: Booking }) => {
    const isActionLoading = actionLoadingId === item.id;
    const clientName = item.client?.full_name || 'Client Lead';
    const clientPhone = item.client?.phone || 'Not shared';

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eventType}>{item.event_type}</Text>
            <Text style={styles.clientMeta}>
              👤 {clientName} • 📞 {clientPhone}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        {/* Lead Specs */}
        <View style={styles.specsRow}>
          <View style={styles.specBox}>
            <Text style={styles.specLabel}>Event Date</Text>
            <Text style={styles.specValue}>📅 {item.event_date}</Text>
          </View>
          <View style={styles.specBox}>
            <Text style={styles.specLabel}>Guest Count</Text>
            <Text style={styles.specValue}>👥 {item.guest_count} persons</Text>
          </View>
          <View style={styles.specBox}>
            <Text style={styles.specLabel}>Est. Revenue</Text>
            <Text style={styles.specPrice}>
              ₹{item.total_estimated_amount ? item.total_estimated_amount.toLocaleString('en-IN') : 'Quote'}
            </Text>
          </View>
        </View>

        {item.special_notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Client Requirements:</Text>
            <Text style={styles.notesText}>{item.special_notes}</Text>
          </View>
        ) : null}

        {/* Action Row */}
        <View style={styles.actionsRow}>
          {item.status === 'pending' ? (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isActionLoading}
                onPress={() => handleAcceptLead(item.id)}
                style={[styles.acceptBtn, isActionLoading && { opacity: 0.5 }]}
              >
                <Text style={styles.acceptBtnText}>✓ Accept Lead</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isActionLoading}
                onPress={() => handleRejectLead(item.id)}
                style={[styles.rejectBtn, isActionLoading && { opacity: 0.5 }]}
              >
                <Text style={styles.rejectBtnText}>✕ Decline</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('Chat', {
                  bookingId: item.id,
                  counterpartyName: clientName,
                })
              }
              style={styles.chatBtn}
            >
              <Text style={styles.chatBtnText}>💬 Chat with Client</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('Chat', {
                bookingId: item.id,
                counterpartyName: clientName,
              })
            }
            style={styles.smallChatBtn}
          >
            <Text style={styles.smallChatIcon}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Lead Manager" subtitle="Real-time Client Booking Requests" />

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        {['all', 'pending', 'confirmed', 'cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => item.id}
        renderItem={renderLeadCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📬</Text>
              <Text style={styles.emptyTitle}>No leads in this view</Text>
              <Text style={styles.emptySub}>
                New client booking inquiries will appear here automatically in real time.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: 6,
    backgroundColor: '#F1F5F9',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  eventType: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  clientMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm + 2,
  },
  specBox: {
    flex: 1,
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  specPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.sm,
    padding: 8,
    marginVertical: 4,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.sm + 4,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.success,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  rejectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 12,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  chatBtnText: {
    color: COLORS.primaryDark,
    fontWeight: '800',
    fontSize: 12,
  },
  smallChatBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
  },
  smallChatIcon: {
    fontSize: 16,
  },
  centerBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
