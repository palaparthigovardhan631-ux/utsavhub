// ==============================================================================
// UTSAVHUB VENDOR BUSINESS DASHBOARD
// Subscription Gate Monitor, Performance Metrics, and Quick Actions
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getVendorBookings } from '../../services/bookingService';
import { Booking } from '../../types';
import { SubscriptionModal } from './SubscriptionModal';
import { StatusBadge, VerifiedBadge } from '../../components/Badge';
import { Header } from '../../components/Header';
import { ConfigBanner } from '../../components/ConfigBanner';

interface VendorDashboardProps {
  navigation: any;
}

export const VendorDashboardScreen: React.FC<VendorDashboardProps> = ({ navigation }) => {
  const { vendor, refreshSession } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(typeof window !== 'undefined' && Boolean(window.location?.search?.includes('sub=1')));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const vendorId = vendor?.id || 'v1_royal_rasoi';

  const loadData = async () => {
    setIsLoading(true);
    const res = await getVendorBookings(vendorId);
    setBookings(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [vendor]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSession();
    await loadData();
    setRefreshing(false);
  };

  const isSubscribed = Boolean(vendor?.is_subscribed);
  const expiryDate = vendor?.subscription_expires_at
    ? new Date(vendor.subscription_expires_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  // Compute metrics
  const totalLeads = bookings.length;
  const pendingLeads = bookings.filter((b) => b.status === 'pending').length;
  const confirmedLeads = bookings.filter((b) => b.status === 'confirmed').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_estimated_amount || 0), 0);

  return (
    <View style={styles.container}>
      <Header title="Vendor Partner Hub" subtitle={vendor?.business_name || 'Business Manager'} />
      <ConfigBanner />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* SUBSCRIPTION GATE STATUS BANNER */}
        {!isSubscribed ? (
          <View style={styles.gateAlertCard}>
            <View style={styles.gateAlertHeader}>
              <Text style={styles.gateAlertIcon}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.gateAlertTitle}>Subscription Inactive / Expired</Text>
                <Text style={styles.gateAlertSub}>
                  Your catalog is hidden from public client searches and you cannot accept new booking inquiries.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsSubscriptionModalOpen(true)}
              style={styles.renewBtn}
            >
              <Text style={styles.renewBtnText}>⚡ Activate Pro Subscription (₹499/mo)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activeSubCard}>
            <View style={styles.activeSubRow}>
              <View>
                <View style={styles.verifiedRow}>
                  <VerifiedBadge size="md" />
                  <Text style={styles.activeSubTitle}>Active Partner Membership</Text>
                </View>
                <Text style={styles.activeSubExpiry}>
                  Valid until: <Text style={{ fontWeight: '800' }}>{expiryDate || 'Active'}</Text>
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsSubscriptionModalOpen(true)}
                style={styles.extendBtn}
              >
                <Text style={styles.extendBtnText}>Renew / Extend</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Business Overview Header */}
        <View style={styles.bizHeader}>
          <Text style={styles.bizName}>{vendor?.business_name || 'Your Event Business'}</Text>
          <Text style={styles.bizCategory}>
            {vendor?.category || 'Catering'} • {vendor?.city || 'Delhi NCR'}
          </Text>
        </View>

        {/* Key Metrics Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Leads</Text>
            <Text style={styles.metricValue}>{totalLeads}</Text>
            <Text style={styles.metricFoot}>{pendingLeads} pending review</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Confirmed</Text>
            <Text style={[styles.metricValue, { color: COLORS.success }]}>{confirmedLeads}</Text>
            <Text style={styles.metricFoot}>Active contracts</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Booked Pipeline</Text>
            <Text style={[styles.metricValue, { color: COLORS.primaryDark, fontSize: 18 }]}>
              ₹{(totalRevenue / 1000).toFixed(1)}k
            </Text>
            <Text style={styles.metricFoot}>Confirmed revenue</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Client Rating</Text>
            <Text style={[styles.metricValue, { color: '#D97706' }]}>
              ★ {vendor?.rating || 4.8}
            </Text>
            <Text style={styles.metricFoot}>{vendor?.review_count || 12} reviews</Text>
          </View>
        </View>

        {/* Quick Management Nav Cards */}
        <Text style={styles.sectionTitle}>Dashboard Quick Actions</Text>
        <View style={styles.actionsColumn}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('VendorLeads')}
            style={styles.actionCard}
          >
            <View style={styles.actionIconBox}>
              <Text style={styles.actionIcon}>📬</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionCardTitle}>Manage Incoming Booking Leads</Text>
              <Text style={styles.actionCardSub}>
                Review client inquiries, accept/reject leads, and chat with clients.
              </Text>
            </View>
            <Text style={styles.chevron}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('VendorProfileEdit')}
            style={styles.actionCard}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.actionIcon}>🛠️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionCardTitle}>Catalog, Pricing & Bank Details</Text>
              <Text style={styles.actionCardSub}>
                Edit packages, upload photos to cloud storage, and configure settlement bank account.
              </Text>
            </View>
            <Text style={styles.chevron}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Leads Preview */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Inquiries</Text>
            <TouchableOpacity onPress={() => navigation.navigate('VendorLeads')}>
              <Text style={styles.viewAllText}>View All ({bookings.length})</Text>
            </TouchableOpacity>
          </View>

          {bookings.slice(0, 3).map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('VendorLeads')}
              style={styles.leadItem}
            >
              <View style={styles.leadTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.leadEvent}>{item.event_type}</Text>
                  <Text style={styles.leadClient}>
                    👤 {item.client?.full_name || 'Client Inquiry'} • {item.guest_count} guests
                  </Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <View style={styles.leadBottom}>
                <Text style={styles.leadDate}>📅 Event: {item.event_date}</Text>
                <Text style={styles.leadAmount}>
                  ₹{item.total_estimated_amount ? item.total_estimated_amount.toLocaleString('en-IN') : '0'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Subscription Renewal Modal */}
      <SubscriptionModal
        visible={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSuccess={() => {
          setIsSubscriptionModalOpen(false);
          refreshSession();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  gateAlertCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  gateAlertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  gateAlertIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  gateAlertTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#991B1B',
  },
  gateAlertSub: {
    fontSize: 12,
    color: '#7F1D1D',
    marginTop: 2,
    lineHeight: 16,
  },
  renewBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 12,
  },
  renewBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  activeSubCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  activeSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeSubTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
    marginLeft: 6,
  },
  activeSubExpiry: {
    fontSize: 11,
    color: '#047857',
  },
  extendBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  extendBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bizHeader: {
    marginBottom: SPACING.md,
  },
  bizName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  bizCategory: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  metricFoot: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  actionsColumn: {
    gap: 10,
    marginBottom: SPACING.lg,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  actionCardSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  chevron: {
    fontSize: 18,
    color: COLORS.textMuted,
    fontWeight: '800',
    marginLeft: 6,
  },
  recentSection: {
    marginTop: 4,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  leadItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  leadTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leadEvent: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  leadClient: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  leadBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  leadDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  leadAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
});
