// ==============================================================================
// UTSAVHUB CLIENT BOOKINGS & LEAD STATUS SCREEN
// Tracks client bookings, statuses, and provides direct chat launcher
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
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Booking, BookingStatus } from '../../types';
import { getClientBookings } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/Badge';
import { Header } from '../../components/Header';

interface ClientBookingsScreenProps {
  navigation: any;
}

export const ClientBookingsScreen: React.FC<ClientBookingsScreenProps> = ({ navigation }) => {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    const clientId = user?.id || profile?.id || 'client_user_123';
    const res = await getClientBookings(clientId);
    setBookings(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'all') return true;
    return b.status === activeFilter;
  });

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const vendorName = item.vendor?.business_name || 'Event Vendor';

    return (
      <View style={styles.card}>
        {/* Top Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eventType}>{item.event_type}</Text>
            <Text style={styles.vendorName}>{vendorName}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Event Date</Text>
            <Text style={styles.detailValue}>📅 {item.event_date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Guests</Text>
            <Text style={styles.detailValue}>👥 {item.guest_count} attendees</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Est. Quote</Text>
            <Text style={styles.detailValue}>
              ₹{item.total_estimated_amount ? item.total_estimated_amount.toLocaleString('en-IN') : 'Quote on Call'}
            </Text>
          </View>
        </View>

        {item.special_notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notes / Inclusions:</Text>
            <Text style={styles.notesText}>{item.special_notes}</Text>
          </View>
        ) : null}

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('Chat', {
                bookingId: item.id,
                counterpartyName: vendorName,
              })
            }
            style={styles.chatButton}
          >
            <Text style={styles.chatButtonText}>💬 Open Live Chat</Text>
          </TouchableOpacity>

          {item.vendor && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('VendorDetail', { vendorId: item.vendor_id })
              }
              style={styles.detailsButton}
            >
              <Text style={styles.detailsButtonText}>View Vendor</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="My Bookings" subtitle="Live Event Service Requests" />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'pending', 'confirmed', 'completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveFilter(tab)}
            style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === tab && styles.filterTabTextActive,
              ]}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
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
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptySub}>
                Browse caterers and event services on the home feed and submit your first lead request.
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: 6,
    backgroundColor: '#F1F5F9',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  eventType: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  vendorName: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm + 2,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '700',
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
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.sm + 4,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  chatButton: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  detailsButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  centerBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
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
