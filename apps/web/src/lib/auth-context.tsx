'use client';

// Fix Node 25 experimental localStorage bug on server-side SSR
if (typeof window === 'undefined' && globalThis.localStorage && typeof globalThis.localStorage.getItem !== 'function') {
  delete (globalThis as Record<string, unknown>).localStorage;
}

import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AppUser {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
}

interface AuthContextType {
  supabaseUser: SupabaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  supabaseUser: null,
  appUser: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef<boolean>(false);
  const supabase = createClient();

  const fetchAppUser = useCallback(async (token?: string) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const result = await api<AppUser>('/users/me', { token });
      if (result.success && result.data) {
        setAppUser(result.data);
      }
    } catch (err) {
      console.error('Error fetching app user:', err);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchAppUser();
  }, [fetchAppUser]);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const currentSupabaseUser = session?.user ?? null;
      setSupabaseUser(currentSupabaseUser);

      if (currentSupabaseUser && session?.access_token) {
        // Only fetch app user if we don't have it or user changed
        if (!appUser || appUser.id !== currentSupabaseUser.id) {
          await fetchAppUser(session.access_token);
        }
      } else {
        setAppUser(null);
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchAppUser, supabase.auth, appUser]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setAppUser(null);
  };

  return (
    <AuthContext.Provider value={{ supabaseUser, appUser, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
