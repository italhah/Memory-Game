import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from './supabaseClient';
import { fetchProfile, createProfile } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileFetchRef = useRef(false);

  const loadProfile = useCallback(async (userId) => {
    try {
      let p = await fetchProfile(userId);
      if (!p) {
        p = await createProfile(userId, 'Player', '#3b82f6');
      }
      setProfile(p);
      return p;
    } catch (err) {
      console.error('Failed to load profile:', err);
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);
      if (initialSession?.user) {
        loadProfile(initialSession.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);

      if (event === 'SIGNED_OUT' || !newSession) {
        setProfile(null);
        profileFetchRef.current = false;
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (!profileFetchRef.current) {
          profileFetchRef.current = true;
          (async () => {
            await loadProfile(newSession.user.id);
            if (mounted) setLoading(false);
          })();
        } else {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signUp = useCallback(async (email, password, displayName, avatarColor) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, avatar_color: avatarColor },
      },
    });
    if (error) throw error;

    if (data.user && data.session) {
      try {
        const p = await createProfile(data.user.id, displayName, avatarColor);
        setProfile(p);
      } catch (e) {
        console.error('Profile creation failed:', e);
      }
    }
    return data;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    profileFetchRef.current = false;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      return loadProfile(session.user.id);
    }
    return null;
  }, [session, loadProfile]);

  const updateLocalProfile = useCallback((updates) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const value = {
    session,
    user: session?.user || null,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    updateLocalProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
