// ==============================================================================
// UTSAVHUB CLIENT HOME MARKETPLACE FEED
// Dynamic category filters, live vendor listings, search by service & location
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import { Vendor, VendorCategory } from '../../types';
import { getPublicVendors } from '../../services/vendorService';
import { VerifiedBadge } from '../../components/Badge';
import { ConfigBanner } from '../../components/ConfigBanner';
import { Header } from '../../components/Header';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchVendors = async () => {
    setIsLoading(true);
    const res = await getPublicVendors(
      selectedCategory === 'All' ? undefined : (selectedCategory as VendorCategory),
      searchQuery
    );
    setVendors(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, [selectedCategory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVendors();
    setRefreshing(false);
  };

  const handleSearchSubmit = () => {
    fetchVendors();
  };

  const renderVendorCard = ({ item }: { item: Vendor }) => {
    const startingPkg = item.pricing_packages && item.pricing_packages[0];

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('VendorDetail', { vendorId: item.id })}
        style={styles.vendorCard}
      >
        {/* Cover Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                item.images && item.images.length > 0
                  ? item.images[0]
                  : 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
            }}
            style={styles.vendorImage}
            resizeMode="cover"
          />
          <View style={styles.categoryBadgeOverlay}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
          {item.is_subscribed && (
            <View style={styles.verifiedBadgeOverlay}>
              <VerifiedBadge size="sm" />
            </View>
          )}
        </View>

        {/* Info Content */}
        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.businessName} numberOfLines={1}>
              {item.business_name}
            </Text>
            <View style={styles.ratingBox}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.review_count})</Text>
            </View>
          </View>

          <Text style={styles.locationText} numberOfLines={1}>
            📍 {item.address}, {item.city}
          </Text>

          {item.description ? (
            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {/* Pricing & CTA */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.priceLabel}>Starting from</Text>
              <Text style={styles.priceValue}>
                ₹{startingPkg ? startingPkg.price.toLocaleString('en-IN') : '500'}
                <Text style={styles.priceUnit}> / {startingPkg?.unit || 'package'}</Text>
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('VendorDetail', { vendorId: item.id })}
              style={styles.viewButton}
            >
              <Text style={styles.viewButtonText}>View Packages →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="UtsavHub" subtitle="Live Catering & Event Marketplace" />
      <ConfigBanner />

      {/* Main List */}
      <FlatList
        data={vendors}
        keyExtractor={(item) => item.id}
        renderItem={renderVendorCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          <>
            {/* Hero Search Section */}
            <View style={styles.heroSection}>
              <Text style={styles.heroGreeting}>Plan Your Big Celebration 🎉</Text>
              <Text style={styles.heroSub}>
                Book verified caterers, band mela, shamiana, and tent houses across India.
              </Text>

              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  placeholder="Search caterer, band, lighting, location..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearchSubmit}
                  returnKeyType="search"
                  style={styles.searchInput}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery('');
                      getPublicVendors(selectedCategory === 'All' ? undefined : (selectedCategory as VendorCategory), '').then(
                        (res) => setVendors(res.data)
                      );
                    }}
                    style={styles.clearSearch}
                  >
                    <Text style={styles.clearText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Category Filter Pills */}
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>Browse by Service</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[{ id: 'All', name: 'All Services', emoji: '✨' }, ...CATEGORIES]}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.categoryList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setSelectedCategory(item.id)}
                    style={[
                      styles.categoryPill,
                      selectedCategory === item.id && styles.categoryPillActive,
                    ]}
                  >
                    <Text style={styles.catPillEmoji}>{item.emoji}</Text>
                    <Text
                      style={[
                        styles.catPillText,
                        selectedCategory === item.id && styles.catPillTextActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                Showing <Text style={{ fontWeight: '800' }}>{vendors.length}</Text> verified partners
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Fetching live verified partners...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🎪</Text>
              <Text style={styles.emptyTitle}>No service providers found</Text>
              <Text style={styles.emptySub}>
                Try searching for a different service category or city location.
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
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  heroGreeting: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  clearSearch: {
    padding: 6,
  },
  clearText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  categorySection: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  categoryList: {
    paddingBottom: 4,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catPillEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  catPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: 6,
  },
  resultsCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  vendorCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  vendorImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  verifiedBadgeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  cardContent: {
    padding: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  businessName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  starIcon: {
    fontSize: 12,
    color: '#D97706',
    marginRight: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  reviewCount: {
    fontSize: 10,
    color: '#B45309',
    marginLeft: 2,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm + 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  priceUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  loadingContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: SPACING.xxl,
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
    maxWidth: 260,
  },
});
