'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { User, AuthError } from '@supabase/supabase-js';

type BasicUser = {
  id: string;
  email: string | null;
};

type AuthContextType = {
  user: BasicUser | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BasicUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up auth state listener
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || null
          });
          
          // Ensure user exists in the users table (handles signup case)
          await ensureUserInDatabase(session.user);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || null
          });
          
          // Ensure user exists in the users table (handles signup case)
          await ensureUserInDatabase(session.user);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Ensure user exists in database
  const ensureUserInDatabase = async (user: User) => {
    try {
      // Check if user exists in the users table
      const { error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      // Only create user if they don't exist
      if (fetchError && fetchError.code === 'PGRST116') { // No rows returned
        // Create new user record
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          trial_active: true
        });
      }
    } catch (error) {
      console.error('Error ensuring user in database:', error);
    }
  };
  
  // Sign in with magic link
  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`
        }
      });
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: 'Check your email for the login link'
      };
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      const message = error instanceof AuthError ? error.message : 'Failed to send the login link';
      return {
        success: false,
        message
      };
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signOut
    }}>
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