'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  role: string;
  isVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
  twoFactorEnabled: boolean;
}

export interface Profile {
  id: string;
  gender?: 'Bride' | 'Groom';
  dob?: string;
  maritalStatus?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  religion?: string;
  caste?: string;
  subCaste?: string;
  motherTongue?: string;
  gothra?: string;
  highestQualification?: string;
  college?: string;
  occupation?: string;
  annualIncome?: number;
  fatherOccupation?: string;
  motherOccupation?: string;
  brothers?: number;
  sisters?: number;
  familyType?: string;
  familyStatus?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  hobbies?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  profilePhoto?: string;
  galleryPhotos?: string;
  horoscope?: string;
  idProof?: string;
  prefAgeFrom?: number;
  prefAgeTo?: number;
  prefHeightFrom?: string;
  prefHeightTo?: string;
  prefReligion?: string;
  prefCaste?: string;
  prefEducation?: string;
  prefOccupation?: string;
  prefLocation?: string;
  bio?: string;
  voiceBio?: string;
  videoIntroduction?: string;
  photoPrivacy: 'PUBLIC' | 'HIDDEN' | 'PREMIUM_ONLY';
  completionPercent: number;
  viewsCount: number;
  profileBoost: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (body: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  switchRole: (role: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshMe = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error("Auth check error", err);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        await refreshMe();
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: data.error || 'Failed to login' };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: 'Connection failed' };
    }
  };

  const register = async (body: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        await refreshMe();
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: data.error || 'Failed to register' };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: 'Connection failed' };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
      router.push('/');
    }
  };

  const switchRole = async (newRole: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        await refreshMe();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to switch role", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshMe, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
