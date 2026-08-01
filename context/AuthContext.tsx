'use client';

import { createContext, useContext, useEffect, useState } from 'react';
// ✨ NEW UPDATE: Changed import from '@supabase/supabase-js' to '@supabase/ssr' 
// This forces the client to read from Cookies (where the server put the token) instead of Local Storage!
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';

// Initialize the browser-side Supabase client using native default persistence
// ✨ BUG FIX: We added 'export' here. This allows your dashboard/page.tsx 
// to import this exact client so they share the same authentication token!
// ✨ REVISED BUG FIX: Reverted to native default persistence options to fix the login redirect loop 
// and allow Supabase to handle default browser token storage correctly without dropping or misrouting headers.
// ✨ NEW UPDATE: Swapped createClient for createBrowserClient so the client shares the cookie jar with the server.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active sessions on page mount
    const bootstrapAuth = async () => {
      // ✨ BUG FIX: Added error handling to the local storage check
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // ✨ BUG FIX: Added server-side token validation. 
      // getSession() only checks local storage (which causes ghost sessions). 
      // getUser() makes a network request to verify the token is actually still alive.
      const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser();

      if (userError || !verifiedUser) {
        console.warn("Auth token invalid or expired. Wiping stale session.");
        await supabase.auth.signOut(); // Force clear the broken local storage
        setUser(null);
        setProfile(null);
      } else {
        setUser(verifiedUser);
        await fetchUserProfile(verifiedUser.id);
      }
      setLoading(false);
    };

    bootstrapAuth();

    // 2. Listen for auth changes (Sign-ins, sign-outs, token refreshes)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // ✨ BUG FIX: Explicitly intercept sign-out events to guarantee state clears.
      // (Removed 'USER_DELETED' to fix TypeScript AuthChangeEvent strict typing error)
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchUserProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to fetch the public profile data row we created in Step 1
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Auth Action: Sign Out
  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  // Auth Action: Sign In With Google OAuth Flow
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Auth Action: Sign In With Apple OAuth Flow
  const signInWithApple = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, signInWithGoogle, signInWithApple }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access auth details across any component easily
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}