import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are available
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create and export a singleton client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      // Specify localStorage with clear key name to avoid conflicts
      storage: {
        getItem: (key) => {
          if (typeof window === 'undefined') {
            return null;
          }
          return window.localStorage.getItem(key);
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, value);
          }
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
          }
        },
      },
      // Set a consistent storage key
      storageKey: 'primer-auth-session',
      // Disable debug logging
      debug: false,
    },
    // Improve reliability of data queries
    global: {
      fetch: (...args) => fetch(...args),
      headers: {
        'x-client-info': `@supabase/js-v2-${process.env.NODE_ENV}`
      }
    },
  }
);