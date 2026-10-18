// ==============================================================================
// UTSAVHUB VENDOR PROFILE & BUSINESS CRUD MANAGER
// Business Details, Cloud Portfolio Uploads, Pricing Packages, and Settlement Bank Info
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import { VendorCategory, PricingPackage } from '../../types';
import { updateVendorProfile, uploadPortfolioImage } from '../../services/vendorService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Header } from '../../components/Header';

export const VendorProfileEditScreen: React.FC = () => {
  const { vendor, updateVendorState } = useAuth();

  // Basic Business Details
  const [businessName, setBusinessName] = useState(vendor?.business_name || '');
  const [category, setCategory] = useState<VendorCategory>(vendor?.category || 'Catering');
  const [phone, setPhone] = useState(vendor?.phone || '');
  const [address, setAddress] = useState(vendor?.address || '');
  const [city, setCity] = useState(vendor?.city || 'Delhi NCR');
  const [description, setDescription] = useState(vendor?.description || '');

  // Vendor Bank Settlement Details (For payouts & client advances)
  const [bankName, setBankName] = useState(vendor?.bank_name || '');
  const [bankAccountHolder, setBankAccountHolder] = useState(vendor?.bank_account_holder || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(vendor?.bank_account_number || '');
  const [bankIfsc, setBankIfsc] = useState(vendor?.bank_ifsc || '');
  const [upiId, setUpiId] = useState(vendor?.upi_id || '');

  // Pricing Packages JSON
  const [packages, setPackages] = useState<PricingPackage[]>(
    vendor?.pricing_packages || []
  );

  // Portfolio Images
  const [images, setImages] = useState<string[]>(vendor?.images || []);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState<boolean>(false);

  // Package Modal
  const [isPkgModalOpen, setIsPkgModalOpen] = useState<boolean>(false);
  const [pkgTitle, setPkgTitle] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgUnit, setPkgUnit] = useState('per plate');
  const [pkgDescription, setPkgDescription] = useState('');
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);

  // Loading state
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const vendorId = vendor?.id || 'v1_royal_rasoi';

  // Handle Save All Profile Details
  const handleSaveProfile = async () => {
    if (!businessName.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please enter your business name and contact phone number.');
      return;
    }

    setIsSaving(true);

    const updates = {
      business_name: businessName.trim(),
      category,
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      description: description.trim(),
      bank_name: bankName.trim(),
      bank_account_holder: bankAccountHolder.trim(),
      bank_account_number: bankAccountNumber.trim(),
      bank_ifsc: bankIfsc.trim().toUpperCase(),
      upi_id: upiId.trim(),
      pricing_packages: packages,
      images,
    };

    const res = await updateVendorProfile(vendorId, updates);
    setIsSaving(false);

    if (res.error) {
      Alert.alert('Save Failed', res.error);
      return;
    }

    if (res.data) {
      updateVendorState(res.data);
    }
    Alert.alert('Profile Updated! ✅', 'Your business details, packages, and bank credentials have been saved.');
  };

  // Add Portfolio Image
  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      Alert.alert('URL Required', 'Please enter a valid image web URL.');
      return;
    }
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
    setIsAddImageModalOpen(false);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Package Management
  const handleOpenAddPkg = () => {
    setEditingPkgId(null);
    setPkgTitle('');
    setPkgPrice('');
    setPkgUnit('per plate');
    setPkgDescription('');
    setIsPkgModalOpen(true);
  };

  const handleOpenEditPkg = (pkg: PricingPackage) => {
    setEditingPkgId(pkg.id);
    setPkgTitle(pkg.title);
    setPkgPrice(pkg.price.toString());
    setPkgUnit(pkg.unit);
    setPkgDescription(pkg.description);
    setIsPkgModalOpen(true);
  };

  const handleSavePkg = () => {
    const priceNum = parseFloat(pkgPrice);
    if (!pkgTitle.trim() || isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Input', 'Please provide a package title and valid price.');
      return;
    }

    if (editingPkgId) {
      setPackages((prev) =>
        prev.map((p) =>
          p.id === editingPkgId
            ? {
                ...p,
                title: pkgTitle.trim(),
                price: priceNum,
                unit: pkgUnit.trim(),
                description: pkgDescription.trim(),
              }
            : p
        )
      );
    } else {
      const newPkg: PricingPackage = {
        id: 'pkg_' + Date.now(),
        title: pkgTitle.trim(),
        price: priceNum,
        unit: pkgUnit.trim(),
        description: pkgDescription.trim(),
      };
      setPackages((prev) => [...prev, newPkg]);
    }

    setIsPkgModalOpen(false);
  };

  const handleDeletePkg = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <View style={styles.container}>
      <Header title="Profile & Catalog" subtitle="Manage Business, Pricing & Bank Details" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Section 1: Business Identity */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏢 Business Identity & Contact</Text>

          <Input
            label="Business / Catering Company Name"
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="e.g. Royal Rasoi Gourmet Caterers"
          />

          <Text style={styles.fieldLabel}>Primary Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[styles.categoryChip, category === cat.id && styles.categoryChipActive]}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catText, category === cat.id && styles.catTextActive]}>
                  {cat.id}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            label="Direct Phone (Connected to tel: dialer)"
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
          />

          <Input
            label="Street Address / Operating Office"
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. 42, Ring Road, South Extension Part II"
          />

          <Input
            label="City / Region"
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Delhi NCR"
          />

          <Input
            label="Business Bio & Specialties"
            value={description}
            onChangeText={setDescription}
            placeholder="Tell clients about your catering heritage, awards, cuisines, and capacity..."
            multiline
          />
        </View>

        {/* Section 2: Portfolio Images (Cloud Storage) */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>📸 Cloud Portfolio Showcase</Text>
            <TouchableOpacity onPress={() => setIsAddImageModalOpen(true)} style={styles.addSmallBtn}>
              <Text style={styles.addSmallBtnText}>+ Add Photo</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardSub}>
            Showcase real event photos to attract clients on the marketplace feed.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
            {images.map((imgUrl, idx) => (
              <View key={idx} style={styles.imageCard}>
                <Image source={{ uri: imgUrl }} style={styles.portfolioImg} />
                <TouchableOpacity
                  onPress={() => handleRemoveImage(idx)}
                  style={styles.deleteImgBtn}
                >
                  <Text style={styles.deleteImgText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Section 3: Pricing Packages (JSON) */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>🍽️ Pricing Packages & Menus</Text>
            <TouchableOpacity onPress={handleOpenAddPkg} style={styles.addSmallBtn}>
              <Text style={styles.addSmallBtnText}>+ New Package</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardSub}>
            Define your service tiers (e.g. Silver, Gold, VIP Banquet) with price & menu inclusions.
          </Text>

          {packages.map((pkg) => (
            <View key={pkg.id} style={styles.pkgBox}>
              <View style={styles.pkgTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pkgTitle}>{pkg.title}</Text>
                  <Text style={styles.pkgPrice}>
                    ₹{pkg.price.toLocaleString('en-IN')}{' '}
                    <Text style={{ fontSize: 11, color: COLORS.textMuted }}>/ {pkg.unit}</Text>
                  </Text>
                </View>

                <View style={styles.pkgBtnGroup}>
                  <TouchableOpacity
                    onPress={() => handleOpenEditPkg(pkg)}
                    style={styles.editPkgBtn}
                  >
                    <Text style={styles.editPkgText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeletePkg(pkg.id)}
                    style={styles.deletePkgBtn}
                  >
                    <Text style={styles.deletePkgText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.pkgDesc}>{pkg.description}</Text>
            </View>
          ))}
        </View>

        {/* Section 4: Settlement Bank Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏦 Vendor Settlement Bank Details</Text>
          <Text style={styles.cardSub}>
            Your registered bank credentials for receiving client advance payouts & marketplace settlements.
          </Text>

          <Input
            label="Bank Name"
            value={bankName}
            onChangeText={setBankName}
            placeholder="e.g. State Bank of India, HDFC Bank"
          />

          <Input
            label="Account Beneficiary Holder Name"
            value={bankAccountHolder}
            onChangeText={setBankAccountHolder}
            placeholder="e.g. Royal Rasoi Catering LLP"
          />

          <Input
            label="Bank Account Number"
            value={bankAccountNumber}
            onChangeText={setBankAccountNumber}
            placeholder="e.g. 50200012345678"
            keyboardType="numeric"
          />

          <Input
            label="Bank IFSC Code"
            value={bankIfsc}
            onChangeText={setBankIfsc}
            placeholder="e.g. SBIN0001234"
            autoCapitalize="characters"
          />

          <Input
            label="Business UPI ID (for QR / UPI Payouts)"
            value={upiId}
            onChangeText={setUpiId}
            placeholder="e.g. royalrasoi@oksbi"
          />
        </View>

        <Button
          title="Save Business Profile & Bank Details"
          onPress={handleSaveProfile}
          loading={isSaving}
          style={styles.saveMainBtn}
        />
      </ScrollView>

      {/* Add Image Modal */}
      <Modal visible={isAddImageModalOpen} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>Add Portfolio Image</Text>
            <Input
              label="Image Web URL (CDN / Unsplash / Storage)"
              placeholder="https://images.unsplash.com/photo-..."
              value={newImageUrl}
              onChangeText={setNewImageUrl}
            />
            <View style={styles.modalBtns}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsAddImageModalOpen(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button title="Add Image" onPress={handleAddImage} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add / Edit Package Modal */}
      <Modal visible={isPkgModalOpen} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>
              {editingPkgId ? 'Edit Package' : 'Create Pricing Package'}
            </Text>

            <Input
              label="Package Title"
              placeholder="e.g. Gold Shahi Feast"
              value={pkgTitle}
              onChangeText={setPkgTitle}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Price (₹)"
                  placeholder="e.g. 750"
                  value={pkgPrice}
                  onChangeText={setPkgPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Pricing Unit"
                  placeholder="per plate / event"
                  value={pkgUnit}
                  onChangeText={setPkgUnit}
                />
              </View>
            </View>

            <Input
              label="Menu & Inclusions Description"
              placeholder="Detail out 5 starters, live counters, main courses..."
              value={pkgDescription}
              onChangeText={setPkgDescription}
              multiline
            />

            <View style={styles.modalBtns}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsPkgModalOpen(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button title="Save Package" onPress={handleSavePkg} style={{ flex: 1 }} />
            </View>
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
  scrollContent: {
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
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  catEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  catTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  addSmallBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  addSmallBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  imageGallery: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  imageCard: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  portfolioImg: {
    width: '100%',
    height: '100%',
  },
  deleteImgBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteImgText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  pkgBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 10,
  },
  pkgTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pkgTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  pkgPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  pkgBtnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  editPkgBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E0F2FE',
    borderRadius: RADIUS.sm,
  },
  editPkgText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  deletePkgBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.sm,
  },
  deletePkgText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },
  pkgDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
  saveMainBtn: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.lg,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  modalBtns: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
});
