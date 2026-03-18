import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: () => boolean;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,

  setSession: (session) => set({ session, user: session?.user ?? null }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  signInWithGoogle: async () => {
    if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  },

  signOut: async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    set({ user: null, session: null });
  },

  isAuthenticated: () => !!get().session,

  initialize: async () => {
    if (!supabase) {
      set({ loading: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, loading: false });

      supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
        set({ session, user: session?.user ?? null });
      });
    } catch {
      set({ loading: false });
    }
  },
}));
