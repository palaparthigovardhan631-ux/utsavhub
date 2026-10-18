// ==============================================================================
// UTSAVHUB VENDOR DETAIL VIEW & BOOKING CHECKOUT MODAL
// Dynamic portfolio, packages, Click-to-Call tel: dialer, and live DB booking submission
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Vendor, PricingPackage } from '../../types';
import { getVendorById } from '../../services/vendorService';
import { createBooking } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { VerifiedBadge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

interface VendorDetailScreenProps {
  route: any;
  navigation: any;
}

export const VendorDetailScreen: React.FC<VendorDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { vendorId } = route.params;
  const { user, profile } = useAuth();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedPackage, setSelectedPackage] = useState<PricingPackage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Booking Checkout Modal States
  const [isBookingModalVisible, setIsBookingModalVisible] = useState<boolean>(false);
  const [eventType, setEventType] = useState<string>('Wedding Reception');
  const [eventDate, setEventDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [guestCount, setGuestCount] = useState<string>('350');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadVendor = async () => {
      setIsLoading(true);
      const res = await getVendorById(vendorId);
      if (res.data) {
        setVendor(res.data);
        if (res.data.pricing_packages && res.data.pricing_packages.length > 0) {
          setSelectedPackage(res.data.pricing_packages[0]);
        }
      }
      setIsLoading(false);
    };

    loadVendor();
  }, [vendorId]);

  // Click-to-Call Native Dialer via tel: protocol
  const handleCallVendor = () => {
    if (!vendor?.phone) {
      Alert.alert('Phone Unavailable', 'No phone number is registered for this vendor.');
      return;
    }
    const cleanPhone = vendor.phone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleanPhone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported || Platform.OS === 'web') {
          Linking.openURL(url);
        } else {
          Alert.alert('Calling Not Supported', `Please dial: ${vendor.phone}`);
        }
      })
      .catch(() => {
        Alert.alert('Error', `Could not initiate call to ${vendor.phone}`);
      });
  };

  // Submit Lead Directly to Supabase bookings Table
  const handleConfirmBooking = async () => {
    if (!user || !profile) {
      Alert.alert('Sign In Required', 'Please sign in to submit a booking inquiry.');
      navigation.navigate('Auth');
      return;
    }

    const count = parseInt(guestCount, 10);
    if (isNaN(count) || count <= 0) {
      Alert.alert('Invalid Guest Count', 'Please specify a valid number of guests.');
      return;
    }

    if (!eventDate) {
      Alert.alert('Date Required', 'Please provide your event date.');
      return;
    }

    setIsSubmittingBooking(true);

    const pricePerUnit = selectedPackage ? selectedPackage.price : 500;
    // For per plate: guest_count * price. For per event/setup: price.
    const isPerPlate = selectedPackage?.unit.toLowerCase().includes('plate');
    const totalEstimate = isPerPlate ? count * pricePerUnit : pricePerUnit;

    const res = await createBooking({
      client_id: user.id || profile.id,
      vendor_id: vendorId,
      event_type: eventType,
      event_date: eventDate,
      guest_count: count,
      special_notes: `${selectedPackage ? `[Package: ${selectedPackage.title}] ` : ''}${specialNotes}`,
      total_estimated_amount: totalEstimate,
    });

    setIsSubmittingBooking(false);

    if (res.error) {
      Alert.alert('Booking Error', res.error);
      return;
    }

    setBookingSuccessMsg('Your booking request has been submitted to the vendor!');
    setTimeout(() => {
      setIsBookingModalVisible(false);
      setBookingSuccessMsg(null);
      navigation.navigate('ClientTabs', { screen: 'MyBookings' });
    }, 1500);
  };

  if (isLoading || !vendor) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading vendor details...</Text>
      </View>
    );
  }

  const images = vendor.images && vendor.images.length > 0 ? vendor.images : ['https://images.unsplash.com/photo-1555244162-803834f70033?w=800'];

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.topNavbar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {vendor.business_name}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Photo Gallery */}
        <View style={styles.galleryContainer}>
          <Image
            source={{ uri: images[selectedImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          {vendor.is_subscribed && (
            <View style={styles.verifiedFloating}>
              <VerifiedBadge size="md" />
            </View>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailRow}
            >
              {images.map((imgUrl, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => setSelectedImageIndex(idx)}
                  style={[
                    styles.thumbnailWrapper,
                    selectedImageIndex === idx && styles.thumbnailActive,
                  ]}
                >
                  <Image source={{ uri: imgUrl }} style={styles.thumbnail} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Business Summary Header */}
        <View style={styles.businessHeader}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{vendor.category}</Text>
          </View>

          <Text style={styles.businessTitle}>{vendor.business_name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingStar}>★</Text>
              <Text style={styles.ratingScore}>{vendor.rating}</Text>
              <Text style={styles.ratingReviews}>({vendor.review_count} reviews)</Text>
            </View>
            <Text style={styles.locationMeta}>
              📍 {vendor.address}, {vendor.city}
            </Text>
          </View>

          {/* Direct Communication Buttons */}
          <View style={styles.communicationRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCallVendor}
              style={styles.callButton}
            >
              <Text style={styles.callButtonIcon}>📞</Text>
              <Text style={styles.callButtonText}>Call {vendor.phone}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsBookingModalVisible(true)}
              style={styles.bookNowHeaderBtn}
            >
              <Text style={styles.bookNowText}>⚡ Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>About Service Provider</Text>
          <Text style={styles.descriptionContent}>
            {vendor.description ||
              'Professional verified vendor with specialized catering and event management services on UtsavHub.'}
          </Text>
        </View>

        {/* Pricing Packages JSON List */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Pricing Packages & Menus</Text>
          <Text style={styles.sectionSub}>
            Select a package to request a lead quotation or tailor for your event.
          </Text>

          {vendor.pricing_packages && vendor.pricing_packages.map((pkg) => {
            const isSelected = selectedPackage?.id === pkg.id;
            return (
              <TouchableOpacity
                key={pkg.id}
                activeOpacity={0.8}
                onPress={() => setSelectedPackage(pkg)}
                style={[
                  styles.packageCard,
                  isSelected && styles.packageCardSelected,
                ]}
              >
                <View style={styles.packageHeader}>
                  <View style={styles.pkgTitleWrap}>
                    <Text style={styles.pkgTitle}>{pkg.title}</Text>
                    {isSelected && (
                      <View style={styles.selectedPill}>
                        <Text style={styles.selectedPillText}>SELECTED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.pkgPrice}>
                    ₹{pkg.price.toLocaleString('en-IN')}
                    <Text style={styles.pkgUnit}> / {pkg.unit}</Text>
                  </Text>
                </View>

                <Text style={styles.pkgDesc}>{pkg.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Bottom Booking Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Selected Package</Text>
          <Text style={styles.bottomPackageName}>
            {selectedPackage?.title || 'Custom Request'}
          </Text>
          <Text style={styles.bottomPrice}>
            ₹{selectedPackage?.price.toLocaleString('en-IN') || '500'}{' '}
            <Text style={{ fontSize: 11, color: COLORS.textMuted }}>
              / {selectedPackage?.unit || 'plate'}
            </Text>
          </Text>
        </View>

        <Button
          title="Proceed to Book →"
          onPress={() => setIsBookingModalVisible(true)}
          style={styles.bottomBookBtn}
        />
      </View>

      {/* Booking Checkout Modal */}
      <Modal
        visible={isBookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Book Event Service</Text>
                <Text style={styles.modalVendorName}>{vendor.business_name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsBookingModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {bookingSuccessMsg ? (
              <View style={styles.successContainer}>
                <Text style={styles.successEmoji}>🎉</Text>
                <Text style={styles.successTitle}>Lead Sent Successfully!</Text>
                <Text style={styles.successSub}>{bookingSuccessMsg}</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                {/* Event Type Options */}
                <Text style={styles.modalFieldLabel}>Select Occasion / Event Type</Text>
                <View style={styles.eventTypeGrid}>
                  {[
                    'Wedding Reception',
                    'Sangeet & Cocktail',
                    'Mehendi & Haldi',
                    'Corporate Gala',
                    'Birthday / Anniversary',
                  ].map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setEventType(type)}
                      style={[
                        styles.eventTypeChip,
                        eventType === type && styles.eventTypeChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.eventTypeChipText,
                          eventType === type && styles.eventTypeChipTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Event Date Input */}
                <Input
                  label="Event Date (YYYY-MM-DD)"
                  value={eventDate}
                  onChangeText={setEventDate}
                  placeholder="YYYY-MM-DD"
                />

                {/* Guest Count */}
                <Input
                  label="Expected Guest Count"
                  value={guestCount}
                  onChangeText={setGuestCount}
                  keyboardType="numeric"
                  placeholder="e.g. 350"
                />

                {/* Special Instructions */}
                <Input
                  label="Special Notes or Menu Customizations"
                  value={specialNotes}
                  onChangeText={setSpecialNotes}
                  placeholder="e.g. Need Jain live counter, specific colors for mandap, etc."
                  multiline
                />

                {/* Price Breakdown Calculation */}
                <View style={styles.calculationBox}>
                  <Text style={styles.calcTitle}>Estimated Quotation Summary</Text>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>Package ({selectedPackage?.title})</Text>
                    <Text style={styles.calcValue}>₹{selectedPackage?.price} / {selectedPackage?.unit}</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>Guests / Units</Text>
                    <Text style={styles.calcValue}>{guestCount || '0'}</Text>
                  </View>
                  <View style={[styles.calcRow, styles.calcTotalRow]}>
                    <Text style={styles.calcTotalLabel}>Total Estimated Cost</Text>
                    <Text style={styles.calcTotalValue}>
                      ₹{(
                        (selectedPackage?.unit.includes('plate')
                          ? (parseInt(guestCount, 10) || 0) * (selectedPackage?.price || 500)
                          : selectedPackage?.price || 500)
                      ).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                <Button
                  title="Confirm & Submit Booking Lead"
                  onPress={handleConfirmBooking}
                  loading={isSubmittingBooking}
                  style={{ marginVertical: SPACING.md }}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textMuted,
  },
  topNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  galleryContainer: {
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  verifiedFloating: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  thumbnailRow: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  thumbnailWrapper: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  thumbnailActive: {
    borderColor: COLORS.primary,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  businessHeader: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginBottom: 6,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  businessTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginRight: 10,
  },
  ratingStar: {
    fontSize: 12,
    color: '#D97706',
    marginRight: 3,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  ratingReviews: {
    fontSize: 11,
    color: '#B45309',
    marginLeft: 3,
  },
  locationMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  communicationRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.md,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  callButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  callButtonText: {
    color: '#065F46',
    fontWeight: '800',
    fontSize: 13,
  },
  bookNowHeaderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  descriptionContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginTop: 8,
  },
  packageCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 10,
  },
  packageCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF7ED',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pkgTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pkgTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  selectedPill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginLeft: 8,
  },
  selectedPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pkgPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  pkgUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  pkgDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.lg,
  },
  bottomLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bottomPackageName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  bottomPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  bottomBookBtn: {
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '90%',
    padding: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  modalVendorName: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  modalBody: {
    marginTop: SPACING.md,
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  eventTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.md,
  },
  eventTypeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  eventTypeChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  eventTypeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  eventTypeChipTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  calculationBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 10,
  },
  calcTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  calcLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  calcValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  calcTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
    marginTop: 6,
  },
  calcTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  calcTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  successContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 54,
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.success,
  },
  successSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
});
