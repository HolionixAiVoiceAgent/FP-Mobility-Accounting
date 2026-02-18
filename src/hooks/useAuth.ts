import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Demo credentials for testing HRM functionality
export const DEMO_CREDENTIALS = {
  owner: {
    email: 'admin@fp-mobility.com',
    password: 'admin123456',
    role: 'owner' as const,
    description: 'Full access - Can manage employees, attendance, leaves, payroll',
  },
  employee: {
    email: 'employee@fp-mobility.com',
    password: 'employee123',
    role: 'employee' as const,
    description: 'Limited access - Can view but not manage employees',
  },
  // Fallback/Dummy credential - always works as backup
  fallback: {
    email: 'demo@fp-mobility.com',
    password: 'demo123456',
    role: 'owner' as const,
    description: 'Fallback demo - Full access backup account',
  },
};

// Support both 'owner', 'admin', and 'employee' roles
export type UserRole = 'owner' | 'admin' | 'employee' | null;

// Keys for localStorage persistence
const DEMO_SESSION_KEY = 'fp_demo_session';

interface DemoSession {
  userId: string;
  email: string;
  role: string;
  token: string;
}

// Helper to save demo session to localStorage
const saveDemoSession = (session: DemoSession | null) => {
  try {
    if (session) {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(DEMO_SESSION_KEY);
    }
  } catch (e) {
    console.error('Error saving demo session:', e);
  }
};

// Helper to get demo session from localStorage
const getDemoSession = (): DemoSession | null => {
  try {
    const stored = localStorage.getItem(DEMO_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('Error getting demo session:', e);
    return null;
  }
};

export const useAuth = () => {
  // Initialize state from localStorage if available (for demo sessions that persist across navigation)
  const storedDemoSession = getDemoSession();
  
  const [user, setUser] = useState<User | null>(() => {
    if (storedDemoSession) {
      // Restore demo session from localStorage
      return {
        id: storedDemoSession.userId,
        email: storedDemoSession.email,
        role: storedDemoSession.role,
      } as User;
    }
    return null;
  });
  
  const [session, setSession] = useState<Session | null>(() => {
    if (storedDemoSession) {
      return {
        access_token: storedDemoSession.token,
        refresh_token: 'demo-refresh',
        user: {
          id: storedDemoSession.userId,
          email: storedDemoSession.email,
          role: storedDemoSession.role,
        } as User,
      } as Session;
    }
    return null;
  });
  
  const [role, setRole] = useState<UserRole>(() => {
    if (storedDemoSession) {
      return storedDemoSession.role as UserRole;
    }
    return null;
  });
  
  const [loading, setLoading] = useState(() => {
    // If we have a stored demo session, don't show loading
    return storedDemoSession ? false : true;
  });
  
  const [isDemoMode, setIsDemoMode] = useState(() => !!storedDemoSession);

  useEffect(() => {
    console.log('[useAuth] Setting up auth listener');
    
    // Track if we have a demo session to preserve
    const hasDemoSession = !!storedDemoSession;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[useAuth] onAuthStateChange event:', event, 'session:', session?.user?.id);
        
        // If we have a demo session stored, preserve it - don't let Supabase overwrite it
        if (hasDemoSession) {
          console.log('[useAuth] Preserving demo session - ignoring Supabase auth state');
          // Re-apply the demo session state to ensure it persists
          const demoSession = getDemoSession();
          if (demoSession) {
            setSession({
              access_token: demoSession.token,
              refresh_token: 'demo-refresh',
              user: {
                id: demoSession.userId,
                email: demoSession.email,
                role: demoSession.role,
              } as User,
            } as Session);
            setUser({
              id: demoSession.userId,
              email: demoSession.email,
              role: demoSession.role,
            } as User);
            setRole(demoSession.role as UserRole);
            setIsDemoMode(true);
            setLoading(false);
          }
          return;
        }
        
        // Normal Supabase auth flow (no demo session)
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if demo mode - owner
          if (session.user.email === DEMO_CREDENTIALS.owner.email) {
            console.log('[useAuth] Demo owner detected in listener');
            setRole(DEMO_CREDENTIALS.owner.role);
            setIsDemoMode(true);
            setLoading(false);
            return;
          }
          // Check if demo mode - employee
          if (session.user.email === DEMO_CREDENTIALS.employee.email) {
            console.log('[useAuth] Demo employee detected in listener');
            setRole(DEMO_CREDENTIALS.employee.role);
            setIsDemoMode(true);
            setLoading(false);
            return;
          }
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

    // THEN check for existing session (only if no demo session)
    if (!hasDemoSession) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('[useAuth] getSession result:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if demo mode
          if (session.user.email === DEMO_CREDENTIALS.owner.email) {
            setRole(DEMO_CREDENTIALS.owner.role);
            setIsDemoMode(true);
          } else if (session.user.email === DEMO_CREDENTIALS.employee.email) {
            setRole(DEMO_CREDENTIALS.employee.role);
            setIsDemoMode(true);
          } else {
            fetchUserRole(session.user.id);
          }
        } else {
          setLoading(false);
        }
      });
    } else {
      // We have a demo session - ensure loading is false
      setLoading(false);
    }

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    console.log('[useAuth] fetchUserRole called for:', userId);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setRole(data?.role as UserRole);
    } catch (error) {
      console.error('[useAuth] Error fetching user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('[useAuth] signIn called with:', email);
    
    // Check for fallback/demo credential FIRST - always works as backup
    if (email === DEMO_CREDENTIALS.fallback.email && password === DEMO_CREDENTIALS.fallback.password) {
      console.log('[useAuth] Fallback demo login - setting state');
      setIsDemoMode(true);
      setRole(DEMO_CREDENTIALS.fallback.role);
      const mockSession = {
        access_token: 'demo-fallback-token',
        refresh_token: 'demo-refresh',
        user: {
          id: 'demo-fallback-id',
          email: DEMO_CREDENTIALS.fallback.email,
          role: DEMO_CREDENTIALS.fallback.role,
        } as User,
      } as Session;
      setSession(mockSession);
      setUser(mockSession.user);
      setLoading(false);
      
      // Save to localStorage for persistence across navigation
      saveDemoSession({
        userId: 'demo-fallback-id',
        email: DEMO_CREDENTIALS.fallback.email,
        role: DEMO_CREDENTIALS.fallback.role,
        token: 'demo-fallback-token',
      });
      
      console.log('[useAuth] Fallback demo - state set, user:', mockSession.user.id);
      return { error: null };
    }

    // Check for demo credentials - Admin/Owner
    if (email === DEMO_CREDENTIALS.owner.email && password === DEMO_CREDENTIALS.owner.password) {
      console.log('[useAuth] Demo admin login - setting state');
      setIsDemoMode(true);
      setRole(DEMO_CREDENTIALS.owner.role);
      const mockSession = {
        access_token: 'demo-admin-token',
        refresh_token: 'demo-refresh',
        user: {
          id: 'demo-admin-id',
          email: DEMO_CREDENTIALS.owner.email,
          role: DEMO_CREDENTIALS.owner.role,
        } as User,
      } as Session;
      setSession(mockSession);
      setUser(mockSession.user);
      setLoading(false);
      
      // Save to localStorage for persistence across navigation
      saveDemoSession({
        userId: 'demo-admin-id',
        email: DEMO_CREDENTIALS.owner.email,
        role: DEMO_CREDENTIALS.owner.role,
        token: 'demo-admin-token',
      });
      
      console.log('[useAuth] Demo admin - state set, user:', mockSession.user.id);
      return { error: null };
    }

    // Check for demo credentials - Employee
    if (email === DEMO_CREDENTIALS.employee.email && password === DEMO_CREDENTIALS.employee.password) {
      console.log('[useAuth] Demo employee login - setting state');
      setIsDemoMode(true);
      setRole(DEMO_CREDENTIALS.employee.role);
      const mockSession = {
        access_token: 'demo-employee-token',
        refresh_token: 'demo-refresh',
        user: {
          id: 'demo-employee-id',
          email: DEMO_CREDENTIALS.employee.email,
          role: DEMO_CREDENTIALS.employee.role,
        } as User,
      } as Session;
      setSession(mockSession);
      setUser(mockSession.user);
      setLoading(false);
      
      // Save to localStorage for persistence across navigation
      saveDemoSession({
        userId: 'demo-employee-id',
        email: DEMO_CREDENTIALS.employee.email,
        role: DEMO_CREDENTIALS.employee.role,
        token: 'demo-employee-token',
      });
      
      console.log('[useAuth] Demo employee - state set, user:', mockSession.user.id);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    // Clear localStorage demo session
    saveDemoSession(null);
    
    setIsDemoMode(false);
    setRole(null);
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  console.log('[useAuth] Current state:', { user: user?.id, loading, role, isDemoMode });

  return {
    user,
    session,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: role === 'owner' || role === 'admin',
    isEmployee: role === 'employee',
    isDemoMode,
  };
};

// Export demo credentials for use in UI
export const getDemoCredentials = () => DEMO_CREDENTIALS;

