// ==============================================================================
// UTSAVHUB BADGE COMPONENT
// Verified Vendor & Booking Status Badges
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { BookingStatus } from '../types';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 'sm' }) => {
  return (
    <View style={[styles.verifiedBadge, size === 'sm' ? styles.sm : styles.md]}>
      <Text style={styles.verifiedIcon}>✓</Text>
      <Text style={[styles.verifiedText, size === 'md' && { fontSize: 13 }]}>VERIFIED PARTNER</Text>
    </View>
  );
};

interface StatusBadgeProps {
  status: BookingStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bg = COLORS.warningLight;
  let text = COLORS.warning;
  let label = 'PENDING';

  if (status === 'confirmed') {
    bg = COLORS.successLight;
    text = COLORS.success;
    label = 'CONFIRMED';
  } else if (status === 'cancelled') {
    bg = COLORS.dangerLight;
    text = COLORS.danger;
    label = 'CANCELLED';
  } else if (status === 'completed') {
    bg = COLORS.infoLight;
    text = COLORS.info;
    label = 'COMPLETED';
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verifiedIcon: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B45309',
    marginRight: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
