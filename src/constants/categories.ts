// ==============================================================================
// UTSAVHUB SERVICE CATEGORIES
// ==============================================================================

import { VendorCategory } from '../types';

export interface CategoryItem {
  id: VendorCategory;
  name: string;
  tagline: string;
  iconName: string;
  emoji: string;
  bgTint: string;
  accentColor: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'Catering',
    name: 'Catering & Food',
    tagline: '5-Star Buffets, Live Chaat & Gourmet Menus',
    iconName: 'utensils',
    emoji: '🍲',
    bgTint: '#FFF7ED',
    accentColor: '#EA580C',
  },
  {
    id: 'Band Mela',
    name: 'Band Mela & Dhol',
    tagline: 'Royal Baraat Brass Band, Shenai & Bagghi',
    iconName: 'music',
    emoji: '🎺',
    bgTint: '#FAF5FF',
    accentColor: '#9333EA',
  },
  {
    id: 'Tent House',
    name: 'Tent & Hangars',
    tagline: 'German Hangars, AC Marquees & Staging',
    iconName: 'tent',
    emoji: '🎪',
    bgTint: '#ECFDF5',
    accentColor: '#059669',
  },
  {
    id: 'Shamiana',
    name: 'Shamiana & Drapes',
    tagline: 'Royal Sheesh Mahal Draping & Traditional Canopies',
    iconName: 'sparkles',
    emoji: '🏛️',
    bgTint: '#FEF2F2',
    accentColor: '#DC2626',
  },
  {
    id: 'Lighting',
    name: 'Stage & Ambient Lights',
    tagline: 'Sharpy Beams, Fairy Canopies & Architectural Glow',
    iconName: 'zap',
    emoji: '✨',
    bgTint: '#FEFCE8',
    accentColor: '#CA8A04',
  },
  {
    id: 'Decoration',
    name: 'Floral & Mandap Decor',
    tagline: 'Exotic Fresh Flowers, Royal Mandap & Entrance',
    iconName: 'flower',
    emoji: '💐',
    bgTint: '#FDF2F8',
    accentColor: '#DB2777',
  },
  {
    id: 'Sound & DJ',
    name: 'Sound Systems & DJ',
    tagline: 'Concert JBL Line Array, Sangeet Console & Bass',
    iconName: 'volume-2',
    emoji: '🎧',
    bgTint: '#EFF6FF',
    accentColor: '#2563EB',
  },
  {
    id: 'Photography',
    name: 'Photography & Cinema',
    tagline: '4K Cinematic Pre-Wedding, Candid & Drone Shoots',
    iconName: 'camera',
    emoji: '📸',
    bgTint: '#F0FDF4',
    accentColor: '#16A34A',
  },
];
