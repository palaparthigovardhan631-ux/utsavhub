// ==============================================================================
// UTSAVHUB ROOT & ROLE-BASED NAVIGATION ARCHITECTURE
// Protected Role Routing: Client Marketplace vs. Vendor Business Dashboard
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, ClientTabParamList, VendorTabParamList } from '../types';

// Screens
import { AuthScreen } from '../screens/auth/AuthScreen';
import { HomeScreen } from '../screens/client/HomeScreen';
import { VendorDetailScreen } from '../screens/client/VendorDetailScreen';
import { ClientBookingsScreen } from '../screens/client/ClientBookingsScreen';
import { VendorDashboardScreen } from '../screens/vendor/VendorDashboardScreen';
import { VendorLeadsScreen } from '../screens/vendor/VendorLeadsScreen';
import { VendorProfileEditScreen } from '../screens/vendor/VendorProfileEditScreen';
import { ChatScreen } from '../screens/common/ChatScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const ClientTabs = createBottomTabNavigator<ClientTabParamList>();
const VendorTabs = createBottomTabNavigator<VendorTabParamList>();

// 1. Client Bottom Tabs
const ClientTabNavigator = () => {
  return (
    <ClientTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <ClientTabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Marketplace',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>🎪</Text>
          ),
        }}
      />
      <ClientTabs.Screen
        name="MyBookings"
        component={ClientBookingsScreen}
        options={{
          tabBarLabel: 'My Bookings',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>📋</Text>
          ),
        }}
      />
    </ClientTabs.Navigator>
  );
};

// 2. Vendor Bottom Tabs
const VendorTabNavigator = () => {
  return (
    <VendorTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <VendorTabs.Screen
        name="VendorDashboard"
        component={VendorDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>📊</Text>
          ),
        }}
      />
      <VendorTabs.Screen
        name="VendorLeads"
        component={VendorLeadsScreen}
        options={{
          tabBarLabel: 'Leads & Inquiries',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>📬</Text>
          ),
        }}
      />
      <VendorTabs.Screen
        name="VendorProfileEdit"
        component={VendorProfileEditScreen}
        options={{
          tabBarLabel: 'Catalog & Bank',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>🛠️</Text>
          ),
        }}
      />
    </VendorTabs.Navigator>
  );
};

// 3. Root Role-Based Navigator
export const RootNavigator = () => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing UtsavHub...</Text>
      </View>
    );
  }

  // Not signed in -> Auth Screen
  if (!user || !profile) {
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Auth" component={AuthScreen} />
      </RootStack.Navigator>
    );
  }

  const role = profile.role || 'client';

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {role === 'vendor' ? (
        // Protected Vendor Flow
        <>
          <RootStack.Screen name="VendorTabs" component={VendorTabNavigator} />
          <RootStack.Screen name="Chat" component={ChatScreen} />
        </>
      ) : (
        // Protected Client Flow
        <>
          <RootStack.Screen name="ClientTabs" component={ClientTabNavigator} />
          <RootStack.Screen name="VendorDetail" component={VendorDetailScreen} />
          <RootStack.Screen name="Chat" component={ChatScreen} />
        </>
      )}
    </RootStack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
