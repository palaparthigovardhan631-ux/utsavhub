// ==============================================================================
// UTSAVHUB AUTHENTICATION & ROLE CONTEXT
// Dual-Role State Provider: Client vs. Vendor routing protection
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole, Vendor } from '../types';
import {
  getCurrentSession,
  signInUser,
  signUpUser,
  signOutUser,
} from '../services/authService';
import { isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  vendor: Vendor | null;
  role: UserRole | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    pass: string,
    fullName: string,
    role: UserRole,
    phone: string,
    businessName?: string,
    category?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateVendorState: (vendor: Vendor) => void;
  demoLoginAs: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  const initSession = async () => {
    setIsLoading(true);
    setIsConfigured(isSupabaseConfigured());
    try {
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        const demo = urlParams.get('demo');
        if (demo === 'client') {
          const res = await signInUser('aarav.client@utsavhub.com', 'ClientPassword123');
          setUser(res.user);
          setProfile(res.profile);
          setVendor(res.vendor || null);
          return;
        } else if (demo === 'vendor') {
          const res = await signInUser('royal.rasoi@utsavhub.com', 'VendorPassword123');
          setUser(res.user);
          setProfile(res.profile);
          setVendor(res.vendor || null);
          return;
        }
      }
      const res = await getCurrentSession();
      setUser(res.user);
      setProfile(res.profile);
      setVendor(res.vendor || null);
    } catch {
      setUser(null);
      setProfile(null);
      setVendor(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initSession();
  }, []);

  const handleSignIn = async (email: string, pass: string) => {
    setIsLoading(true);
    const res = await signInUser(email, pass);
    setIsLoading(false);
    if (res.error) {
      return { success: false, error: res.error };
    }
    setUser(res.user);
    setProfile(res.profile);
    setVendor(res.vendor || null);
    return { success: true };
  };

  const handleSignUp = async (
    email: string,
    pass: string,
    fullName: string,
    role: UserRole,
    phone: string,
    businessName?: string,
    category?: string
  ) => {
    setIsLoading(true);
    const res = await signUpUser(email, pass, fullName, role, phone, businessName, category);
    setIsLoading(false);
    if (res.error) {
      return { success: false, error: res.error };
    }
    setUser(res.user);
    setProfile(res.profile);
    setVendor(res.vendor || null);
    return { success: true };
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOutUser();
    setUser(null);
    setProfile(null);
    setVendor(null);
    setIsLoading(false);
  };

  const updateVendorState = (newVendor: Vendor) => {
    setVendor(newVendor);
  };

  const demoLoginAs = async (targetRole: UserRole) => {
    if (targetRole === 'vendor') {
      await handleSignIn('royal.rasoi@utsavhub.com', 'VendorPassword123');
    } else {
      await handleSignIn('aarav.client@utsavhub.com', 'ClientPassword123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        vendor,
        role: profile?.role || null,
        isLoading,
        isConfigured,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        refreshSession: initSession,
        updateVendorState,
        demoLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
