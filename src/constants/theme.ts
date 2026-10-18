// ==============================================================================
// UTSAVHUB THEME & DESIGN TOKENS
// ==============================================================================

export const COLORS = {
  primary: '#FF5722',       // Festive Saffron / Sunset Flame
  primaryDark: '#D84315',
  primaryLight: '#FBE9E7',
  primaryGradientStart: '#FF5722',
  primaryGradientEnd: '#FF8A65',

  royalGold: '#D97706',     // Traditional Gold Accent
  royalGoldLight: '#FEF3C7',

  royalPurple: '#6D28D9',   // Royal Festive Purple
  royalPurpleLight: '#EDE9FE',

  // Status Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Neutrals
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F1F5F9',
  border: '#E2E8F0',
  borderFocused: '#FF5722',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
};
