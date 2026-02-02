import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getDemoConfig, getStoredBypass, clearBypass } from '@/lib/demo-auth';

export type UserRole = 'admin' | 'employee' | null;

function makeDemoUser(email: string): User {
  return {
    id: 'demo-user-id',
    email: email ?? 'admin@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const demo = getDemoConfig();
    const bypass = demo.enabled && demo.bypassAuth ? getStoredBypass() : null;
    if (bypass) {
      setUser(makeDemoUser(bypass.email));
      setSession(null);
      setRole(bypass.role);
      setLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer the role fetch to avoid deadlock
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setRole(data?.role as UserRole);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email?.trim() ?? '',
      password: password ?? '',
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Use dedicated callback URL so Supabase redirects there after email confirm.
    // Add this exact URL to Supabase: Authentication → URL Configuration → Redirect URLs
    const baseUrl =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL) ||
      (typeof window !== 'undefined' ? window.location.origin : '');
    const redirectUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}/auth/callback` : undefined;
    const { error } = await supabase.auth.signUp({
      email: email?.trim() ?? '',
      password: password ?? '',
      options: {
        ...(redirectUrl && { emailRedirectTo: redirectUrl }),
        data: {
          full_name: (fullName ?? '').trim() || undefined,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    clearBypass();
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: role === 'admin',
    isEmployee: role === 'employee',
  };
};
