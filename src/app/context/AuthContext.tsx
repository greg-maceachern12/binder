'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Extended User type with subscription properties
export interface AppUser extends User {
  subscription_id?: string;
  trial_active?: boolean;
  polar_id?: string;
}

// Subscription status type
type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'loading';

type AuthContextType = {
  user: User | null;
  appUser: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  subscriptionStatus: SubscriptionStatus;
  hasAccess: boolean;
  hasPremium: boolean;
  signIn: (email: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('loading');

  // Fetch user's subscription data from your custom table - wrap in useCallback without user dependency
  const fetchUserSubscription = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_id, trial_active, polar_id')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user subscription:', error);
        return;
      }

      // Use a functional update to avoid dependency on user
      setAppUser(currentAppUser => {
        if (!currentAppUser) return null;
        
        // Create extended user object based on the current appUser
        return {
          ...currentAppUser,
          subscription_id: data.subscription_id,
          trial_active: data.trial_active,
          polar_id: data.polar_id
        };
      });

      // Determine subscription status
      if (data.subscription_id) {
        // Verify subscription with API
        const response = await fetch('/api/subscription/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });

        const result = await response.json();
        // console.log('result', result);
        if (result.status === 'active') {
          setSubscriptionStatus('active');
        } else if (result.userData.trial_active) {
          setSubscriptionStatus('trial');
        } else {
          setSubscriptionStatus('inactive');
        }
      } else if (data.trial_active) {
        setSubscriptionStatus('trial');
      } else {
        setSubscriptionStatus('inactive');
      }
    } catch (error) {
      console.error('Error in fetchUserSubscription:', error);
      setSubscriptionStatus('inactive');
    }
  }, []); // Remove user from dependencies

  // Function to refresh subscription status
  const refreshSubscription = async () => {
    if (user?.id) {
      await fetchUserSubscription(user.id);
    }
  };

  useEffect(() => {
    // When user changes, update the appUser state
    if (user) {
      // Initialize appUser when user is available
      setAppUser(prevAppUser => {
        // If we already have an appUser with the same ID, keep it
        if (prevAppUser && prevAppUser.id === user.id) {
          return prevAppUser;
        }
        // Otherwise create a new basic appUser from user
        return {
          ...user,
          subscription_id: undefined,
          trial_active: undefined,
          polar_id: undefined
        };
      });
    } else {
      // Reset appUser when user is null
      setAppUser(null);
    }
  }, [user]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Fetch subscription data if user is logged in
      if (currentUser?.id) {
        fetchUserSubscription(currentUser.id);
      } else {
        setSubscriptionStatus('inactive');
      }
      
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Fetch subscription data if user is logged in
      if (currentUser?.id) {
        fetchUserSubscription(currentUser.id);
      } else {
        setAppUser(null);
        setSubscriptionStatus('inactive');
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserSubscription]); // Only depend on fetchUserSubscription

  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Check your email for the login link'
      };
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send the login link'
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setAppUser(null);
      setSubscriptionStatus('inactive');
    } catch (error: unknown) {
      console.error('Error signing out:', error);
    }
  };

  // Derived values
  const hasAccess = subscriptionStatus === 'active' || subscriptionStatus === 'trial';
  const hasPremium = subscriptionStatus === 'active';

  return (
    <AuthContext.Provider value={{
      user,
      appUser,
      isLoading,
      isAuthenticated: !!user,
      subscriptionStatus,
      hasAccess,
      hasPremium,
      signIn,
      signOut,
      refreshSubscription
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